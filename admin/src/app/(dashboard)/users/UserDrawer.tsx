'use client';

import { useEffect, useRef, useState } from "react";
import { FiX, FiMail, FiTrash2, FiCopy, FiCheck, FiExternalLink } from "react-icons/fi";
import { authFetch } from "@/hooks/useAuth";
import { Avatar, PLAN_META, formatDate, formatDateTime, timeAgo, type Plan, type User } from "./userShared";

interface UserDetails {
    stats: {
        credits: number;
        products: number;
        reviewsGiven: number;
        posts: number;
        followers: number;
        following: number;
    };
    account: {
        signInMethods: string[];
        isOnboarded: boolean;
        isCommunityAccount: boolean;
        verified: boolean;
        accountType: "individual" | "community" | null;
    };
    profile: {
        bio: string;
        location: string;
        skills: string[];
        productStage: string | null;
        cofounderAvailability: string | null;
        cofounderLookingFor: string[];
        reviewInterests: string[];
        socialLinks: Partial<Record<"twitter" | "github" | "linkedin" | "portfolio", string>>;
        completedAt: string | null;
    } | null;
    activity: {
        referralCode: string | null;
        referralsMade: number;
        currentStreak: number;
        longestStreak: number;
        creditsEarned: number;
        creditsSpent: number;
        communitiesFollowed: number;
    };
    products: { _id: string; name: string; status: string; createdAt: string }[];
    recentCredits: { _id: string; eventCode: string; delta: number; balanceAfter: number; adminNote?: string; createdAt: string }[];
    subscriptions: {
        _id: string;
        plan: Plan;
        interval?: "monthly" | "annual";
        amountPaid?: number;
        currency?: string;
        status: string;
        startsAt?: string;
        expiresAt?: string;
    }[];
}

interface UserDrawerProps {
    user: User;
    isOnline: boolean;
    now: number;
    apiUrl: string | undefined;
    token: string | null;
    onClose: () => void;
    onDelete: (id: string) => void;
}

// "20 Jul 2026 (3d ago)", or just the date once timeAgo itself falls back to one
const dateWithAgo = (date: string | null | undefined, now: number) => {
    if (!date) return "—";
    const ago = timeAgo(date, now);
    const formatted = formatDate(date);
    return ago === formatted ? formatted : `${formatted} (${ago})`;
};

// "FREE_PLAN_CREDIT_GRANT" -> "Free plan credit grant"
const humanize = (code: string) => {
    const words = code.replace(/[_-]+/g, " ").toLowerCase().trim();
    return words.charAt(0).toUpperCase() + words.slice(1);
};

const PRODUCT_STATUS_STYLES: Record<string, string> = {
    launched: "bg-emerald-50 text-emerald-700",
    in_review: "bg-amber-50 text-amber-700",
    draft: "bg-gray-100 text-gray-600",
    archived: "bg-gray-100 text-gray-400",
};

const SUBSCRIPTION_STATUS_STYLES: Record<string, string> = {
    active: "bg-emerald-50 text-emerald-700",
    on_hold: "bg-amber-50 text-amber-700",
    cancelled: "bg-red-50 text-red-600",
    expired: "bg-gray-100 text-gray-500",
};

// Social links are saved either as full URLs or bare handles
const SOCIAL_LINK_BASES: Record<string, string> = {
    twitter: "https://x.com/",
    github: "https://github.com/",
    linkedin: "https://www.linkedin.com/in/",
    portfolio: "https://",
};

const SOCIAL_LABELS: Record<string, string> = {
    twitter: "X / Twitter",
    github: "GitHub",
    linkedin: "LinkedIn",
    portfolio: "Portfolio",
};

const socialUrl = (platform: string, value: string) =>
    /^https?:\/\//i.test(value) ? value : `${SOCIAL_LINK_BASES[platform] ?? "https://"}${value.replace(/^@/, "")}`;

// Dodo reports amounts in the currency's minor unit (cents, paise)
const formatAmount = (amount?: number, currency?: string) => {
    if (amount == null) return null;
    try {
        return new Intl.NumberFormat("en-IN", { style: "currency", currency: currency || "USD" }).format(amount / 100);
    } catch {
        return `${(amount / 100).toFixed(2)} ${currency ?? ""}`.trim();
    }
};

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-400 mb-2">{children}</h3>
);

const Card = ({ children }: { children: React.ReactNode }) => (
    <div className="rounded-xl border border-gray-200 bg-gray-50/60 divide-y divide-gray-200/70">{children}</div>
);

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="flex items-start gap-4 px-4 py-2.5">
        <dt className="w-28 sm:w-32 shrink-0 text-sm text-gray-500">{label}</dt>
        <dd className="min-w-0 flex-1 text-sm text-gray-900 break-words">{children}</dd>
    </div>
);

const Chips = ({ items }: { items: string[] }) =>
    items.length ? (
        <div className="flex flex-wrap gap-1.5">
            {items.map(item => (
                <span key={item} className="px-2 py-0.5 rounded-md bg-white border border-gray-200 text-xs text-gray-700">
                    {item}
                </span>
            ))}
        </div>
    ) : (
        <span className="text-gray-400">—</span>
    );

const StatTile = ({ label, value, accent }: { label: string; value: React.ReactNode; accent?: string }) => (
    <div className="rounded-xl border border-gray-200 px-3 py-3">
        <p className={`text-xl font-bold leading-tight ${accent ?? "text-gray-900"}`}>{value}</p>
        <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
);

const Skeleton = () => (
    <div className="space-y-6 animate-pulse" aria-hidden>
        <div className="grid grid-cols-3 gap-2.5">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-[68px] rounded-xl bg-gray-100" />)}
        </div>
        {[5, 4, 3].map((rows, i) => (
            <div key={i} className="space-y-2">
                <div className="h-3 w-28 rounded bg-gray-100" />
                <div className="rounded-xl bg-gray-100" style={{ height: rows * 42 }} />
            </div>
        ))}
    </div>
);

const UserDrawer = ({ user, isOnline, now, apiUrl, token, onClose, onDelete }: UserDrawerProps) => {
    const [details, setDetails] = useState<UserDetails | null>(null);
    const [detailsFor, setDetailsFor] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const closeButtonRef = useRef<HTMLButtonElement>(null);

    // Refetch when the live row changes (credits, plan, profile) so the drawer
    // stays in sync without a refresh. Older responses are discarded.
    useEffect(() => {
        const controller = new AbortController();
        (async () => {
            try {
                const res = await authFetch(`${apiUrl}/admin/users/${user._id}/details`, token, {
                    method: "GET",
                    signal: controller.signal,
                });
                if (!res.ok) throw new Error(res.status === 404 ? "This user no longer exists." : "Couldn't load details.");
                setDetails(await res.json());
                setDetailsFor(user._id);
                setError(null);
            } catch (err) {
                if (controller.signal.aborted) return;
                setError(err instanceof Error ? err.message : "Couldn't load details.");
            }
        })();
        return () => controller.abort();
    }, [apiUrl, token, user]);

    useEffect(() => {
        closeButtonRef.current?.focus();
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [onClose]);

    const copyEmail = async () => {
        try {
            await navigator.clipboard.writeText(user.email);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch {
            // Clipboard can be blocked (e.g. insecure context); the email is still selectable
        }
    };

    // Only show details that belong to the user currently open
    const d = detailsFor === user._id ? details : null;
    const plan = PLAN_META[user.plan || "free"];
    const socialLinks = Object.entries(d?.profile?.socialLinks ?? {}).filter(([, v]) => v);

    return (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby="user-drawer-title">
            <div
                className="absolute inset-0 bg-gray-900/40 transition-opacity duration-200 starting:opacity-0"
                onClick={onClose}
                data-testid="drawer-overlay"
            />

            <aside className="absolute inset-y-0 right-0 flex w-full sm:w-[480px] flex-col bg-white shadow-2xl transition-transform duration-200 ease-out starting:translate-x-full">
                {/* Header */}
                <header className="flex items-start gap-4 px-6 pt-6 pb-5 border-b border-gray-100">
                    <Avatar user={user} isOnline={isOnline} size="lg" />
                    <div className="min-w-0 flex-1">
                        <h2 id="user-drawer-title" className="text-lg font-semibold text-gray-900 truncate">
                            {user.name || "Unknown"}
                        </h2>
                        <p className="text-sm text-gray-500 truncate">@{user.username || "username"}</p>
                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${plan.className}`}>
                                {plan.label}
                            </span>
                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${isOnline ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-gray-100 text-gray-600 ring-gray-200"}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? "bg-emerald-500" : "bg-gray-400"}`} />
                                {isOnline ? "Online" : "Offline"}
                            </span>
                            {d?.account.verified && (
                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-teal-50 text-teal-700 ring-1 ring-inset ring-teal-200">Verified</span>
                            )}
                        </div>
                    </div>
                    <button
                        ref={closeButtonRef}
                        onClick={onClose}
                        className="w-9 h-9 shrink-0 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
                        aria-label="Close"
                    >
                        <FiX />
                    </button>
                </header>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
                    {error && !d ? (
                        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
                    ) : !d ? (
                        <Skeleton />
                    ) : (
                        <>
                            <div className="grid grid-cols-3 gap-2.5" data-testid="drawer-stats">
                                <StatTile label="Credits" value={`${d.stats.credits.toLocaleString()} cr`} accent="text-teal-600" />
                                <StatTile label="Products" value={d.stats.products} />
                                <StatTile label="Reviews given" value={d.stats.reviewsGiven} />
                                <StatTile label="Posts" value={d.stats.posts} />
                                <StatTile label="Followers" value={d.stats.followers} />
                                <StatTile label="Following" value={d.stats.following} />
                            </div>

                            <section>
                                <SectionTitle>Account details</SectionTitle>
                                <Card>
                                    <dl>
                                        <Row label="Plan">
                                            {plan.label}
                                            {user.subscriptionInterval && <span className="text-gray-500"> · {user.subscriptionInterval}</span>}
                                            {user.subscriptionExpiresAt && (
                                                <p className="text-xs text-gray-500">Renews / expires {formatDate(user.subscriptionExpiresAt)}</p>
                                            )}
                                        </Row>
                                        <Row label="Status">
                                            {isOnline ? (
                                                <span className="text-emerald-600 font-medium">Online now</span>
                                            ) : (
                                                <span className="text-gray-700">
                                                    Offline
                                                    {user.lastSeenAt && <span className="text-gray-500"> · seen {timeAgo(user.lastSeenAt, now)}</span>}
                                                </span>
                                            )}
                                        </Row>
                                        <Row label="Email">
                                            <span className="inline-flex items-start gap-2 max-w-full">
                                                <span className="font-mono text-[13px] break-all">{user.email || "—"}</span>
                                                {user.email && (
                                                    <button
                                                        onClick={copyEmail}
                                                        className="shrink-0 mt-0.5 text-gray-400 hover:text-teal-600 transition-colors"
                                                        title="Copy email"
                                                        aria-label="Copy email"
                                                    >
                                                        {copied ? <FiCheck className="text-teal-600" /> : <FiCopy />}
                                                    </button>
                                                )}
                                            </span>
                                        </Row>
                                        {user.phoneNumber && <Row label="Phone">{user.phoneNumber}</Row>}
                                        <Row label="Location">{d.profile?.location || user.country || "—"}</Row>
                                        <Row label="Joined">{formatDate(user.createdAt)}</Row>
                                        <Row label="Last login">
                                            <span title={formatDateTime(user.lastLoginAt)}>
                                                {dateWithAgo(user.lastLoginAt, now)}
                                            </span>
                                        </Row>
                                        <Row label="Last active">
                                            <span title={formatDateTime(user.lastSeenAt)}>
                                                {isOnline ? "Now" : dateWithAgo(user.lastSeenAt, now)}
                                            </span>
                                        </Row>
                                        <Row label="Signs in with">
                                            {d.account.signInMethods.length ? d.account.signInMethods.join(", ") : "—"}
                                        </Row>
                                        <Row label="Account type">
                                            {d.account.isCommunityAccount || d.account.accountType === "community" ? "Community" : "Individual"}
                                        </Row>
                                        <Row label="Onboarding">
                                            {d.account.isOnboarded ? (
                                                <span>Completed{d.profile?.completedAt && <span className="text-gray-500"> · {formatDate(d.profile.completedAt)}</span>}</span>
                                            ) : (
                                                <span className="text-amber-600">Not completed</span>
                                            )}
                                        </Row>
                                    </dl>
                                </Card>
                            </section>

                            {d.profile && (
                                <section>
                                    <SectionTitle>Profile</SectionTitle>
                                    <Card>
                                        <dl>
                                            {d.profile.bio && <Row label="Bio"><p className="whitespace-pre-line">{d.profile.bio}</p></Row>}
                                            <Row label="Skills"><Chips items={d.profile.skills} /></Row>
                                            <Row label="Product stage">{d.profile.productStage || "—"}</Row>
                                            <Row label="Co-founder">{d.profile.cofounderAvailability ? humanize(d.profile.cofounderAvailability) : "—"}</Row>
                                            {d.profile.cofounderLookingFor.length > 0 && (
                                                <Row label="Looking for"><Chips items={d.profile.cofounderLookingFor} /></Row>
                                            )}
                                            <Row label="Review interests"><Chips items={d.profile.reviewInterests} /></Row>
                                            {socialLinks.length > 0 && (
                                                <Row label="Links">
                                                    <div className="flex flex-col gap-1">
                                                        {socialLinks.map(([platform, value]) => (
                                                            <a
                                                                key={platform}
                                                                href={socialUrl(platform, value as string)}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center gap-1.5 text-teal-700 hover:underline"
                                                            >
                                                                <span>{SOCIAL_LABELS[platform] ?? platform}</span>
                                                                <span className="text-gray-500 truncate">{value}</span>
                                                                <FiExternalLink className="shrink-0 text-xs" />
                                                            </a>
                                                        ))}
                                                    </div>
                                                </Row>
                                            )}
                                        </dl>
                                    </Card>
                                </section>
                            )}

                            <section>
                                <SectionTitle>Activity snapshot</SectionTitle>
                                <Card>
                                    <dl>
                                        <Row label="Referrals made">{d.activity.referralsMade}</Row>
                                        <Row label="Referral code">
                                            {d.activity.referralCode ? <span className="font-mono text-[13px]">{d.activity.referralCode}</span> : "—"}
                                        </Row>
                                        <Row label="Review streak">
                                            {d.activity.currentStreak} day{d.activity.currentStreak === 1 ? "" : "s"}
                                            <span className="text-gray-500"> · best {d.activity.longestStreak}</span>
                                        </Row>
                                        <Row label="Credits">
                                            <span className="text-emerald-600">+{d.activity.creditsEarned.toLocaleString()} earned</span>
                                            <span className="text-gray-400"> · </span>
                                            <span className={d.activity.creditsSpent ? "text-red-500" : "text-gray-500"}>
                                                {d.activity.creditsSpent ? "−" : ""}{d.activity.creditsSpent.toLocaleString()} spent
                                            </span>
                                        </Row>
                                        <Row label="Communities">{d.activity.communitiesFollowed} followed</Row>
                                    </dl>
                                </Card>
                            </section>

                            <section>
                                <SectionTitle>Recent credit activity</SectionTitle>
                                {d.recentCredits.length ? (
                                    <Card>
                                        <ul>
                                            {d.recentCredits.map(tx => (
                                                <li key={tx._id} className="flex items-center gap-3 px-4 py-2.5">
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm text-gray-900 truncate" title={tx.adminNote || undefined}>{humanize(tx.eventCode)}</p>
                                                        <p className="text-xs text-gray-500">{formatDateTime(tx.createdAt)}</p>
                                                    </div>
                                                    <div className="text-right shrink-0">
                                                        <p className={`text-sm font-semibold font-mono ${tx.delta >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                                                            {tx.delta >= 0 ? "+" : "−"}{Math.abs(tx.delta)}
                                                        </p>
                                                        <p className="text-xs text-gray-400">bal {tx.balanceAfter}</p>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </Card>
                                ) : (
                                    <p className="text-sm text-gray-400">No credit activity yet.</p>
                                )}
                            </section>

                            <section>
                                <SectionTitle>Products ({d.stats.products})</SectionTitle>
                                {d.products.length ? (
                                    <Card>
                                        <ul>
                                            {d.products.map(p => (
                                                <li key={p._id} className="flex items-center gap-3 px-4 py-2.5">
                                                    <p className="min-w-0 flex-1 text-sm text-gray-900 truncate">{p.name}</p>
                                                    <span className={`shrink-0 px-2 py-0.5 rounded-md text-xs font-medium ${PRODUCT_STATUS_STYLES[p.status] ?? "bg-gray-100 text-gray-600"}`}>
                                                        {humanize(p.status)}
                                                    </span>
                                                    <span className="shrink-0 w-24 text-right text-xs text-gray-500">{formatDate(p.createdAt)}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </Card>
                                ) : (
                                    <p className="text-sm text-gray-400">No products yet.</p>
                                )}
                            </section>

                            <section>
                                <SectionTitle>Subscription history</SectionTitle>
                                {d.subscriptions.length ? (
                                    <Card>
                                        <ul>
                                            {d.subscriptions.map(sub => (
                                                <li key={sub._id} className="flex items-center gap-3 px-4 py-2.5">
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm text-gray-900">
                                                            {PLAN_META[sub.plan]?.label ?? sub.plan}
                                                            {sub.interval && <span className="text-gray-500"> · {sub.interval}</span>}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {formatDate(sub.startsAt)} → {formatDate(sub.expiresAt)}
                                                        </p>
                                                    </div>
                                                    {formatAmount(sub.amountPaid, sub.currency) && (
                                                        <span className="shrink-0 text-sm font-mono text-gray-700">{formatAmount(sub.amountPaid, sub.currency)}</span>
                                                    )}
                                                    <span className={`shrink-0 px-2 py-0.5 rounded-md text-xs font-medium ${SUBSCRIPTION_STATUS_STYLES[sub.status] ?? "bg-gray-100 text-gray-600"}`}>
                                                        {humanize(sub.status)}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </Card>
                                ) : (
                                    <p className="text-sm text-gray-400">Never subscribed.</p>
                                )}
                            </section>
                        </>
                    )}
                </div>

                {/* Footer */}
                <footer className="flex gap-3 px-6 py-4 border-t border-gray-100 bg-white">
                    <a
                        href={user.email ? `mailto:${user.email}` : undefined}
                        aria-disabled={!user.email}
                        className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${user.email ? "bg-teal-600 text-white hover:bg-teal-700" : "bg-gray-100 text-gray-400 pointer-events-none"}`}
                    >
                        <FiMail />
                        Send email
                    </a>
                    <button
                        onClick={() => onDelete(user._id)}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                    >
                        <FiTrash2 />
                        Delete user
                    </button>
                </footer>
            </aside>
        </div>
    );
};

export default UserDrawer;
