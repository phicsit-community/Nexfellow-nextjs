import { useState } from "react";

export type Plan = "free" | "builder_pro" | "founder";

export interface User {
    _id: string;
    name: string;
    username: string;
    email: string;
    phoneNumber?: string;
    picture?: string;
    createdAt?: string;
    country?: string | null;
    occupation?: string;
    verificationBadge?: boolean;
    premiumBadge?: boolean;
    communityBadge?: boolean;
    planBadge?: "blue" | "orange" | null;
    subscriptionTier?: string;
    plan?: Plan;
    subscriptionInterval?: "monthly" | "annual" | null;
    subscriptionExpiresAt?: string | null;
    isOnline?: boolean;
    lastLoginAt?: string | null;
    lastSeenAt?: string | null;
    coins?: number;
    createdCommunity?: {
        accountType?: string;
    };
}

export const PLAN_META: Record<Plan, { label: string; className: string }> = {
    free: { label: "Free", className: "bg-gray-100 text-gray-600 ring-gray-200" },
    builder_pro: { label: "Builder Pro", className: "bg-blue-50 text-blue-700 ring-blue-200" },
    founder: { label: "Founder", className: "bg-orange-50 text-orange-700 ring-orange-200" },
};

export const time = (date?: string | null) => (date ? new Date(date).getTime() : 0);

export const formatDate = (date?: string | null) =>
    date
        ? new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
        : "—";

export const formatDateTime = (date?: string | null) =>
    date
        ? new Date(date).toLocaleString("en-IN", {
            day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
        })
        : undefined;

export const timeAgo = (date: string | null | undefined, now: number) => {
    if (!date) return null;
    const seconds = Math.max(0, (now - new Date(date).getTime()) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return formatDate(date);
};

export const Avatar = ({ user, isOnline, size = "md" }: { user: User; isOnline: boolean; size?: "md" | "lg" }) => {
    const [imgFailed, setImgFailed] = useState(false);
    return (
        <div className="relative shrink-0">
            <div className={`${size === "lg" ? "w-14 h-14 text-xl" : "w-10 h-10"} rounded-full overflow-hidden bg-teal-100`}>
                {user.picture && !imgFailed ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={user.picture}
                        alt={user.name || "User"}
                        referrerPolicy="no-referrer"
                        onError={() => setImgFailed(true)}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-teal-700 font-semibold">
                        {user.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                )}
            </div>
            <span
                className={`absolute -bottom-0.5 -right-0.5 ${size === "lg" ? "w-4 h-4" : "w-3.5 h-3.5"} rounded-full border-2 border-white ${isOnline ? "bg-emerald-500" : "bg-gray-300"}`}
                title={isOnline ? "Online" : "Offline"}
            />
        </div>
    );
};
