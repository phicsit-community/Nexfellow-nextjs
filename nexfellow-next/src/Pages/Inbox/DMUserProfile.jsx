// DMUserProfile.jsx
import React, { useEffect, useRef, useState } from "react";
import {
    IoClose,
    IoBan,
    IoChatbubblesOutline,
    IoTrashOutline,
    IoLinkOutline,
    IoLocationOutline,
    IoPersonCircleOutline,
    IoCopyOutline,
    IoCheckmarkOutline,
    IoInformationCircleOutline,
    IoEyeOutline,
    IoLockClosedOutline,
    IoNotificationsOutline,
    IoColorPaletteOutline,
    IoBrushOutline,
    IoChevronForwardOutline,
    IoSettingsOutline,
    IoTimeOutline,
    IoPricetagOutline,
    IoCheckmarkCircle,
} from "react-icons/io5";
import styles from "./DMUserProfile.module.css";

// Badge assets
import communityBadge from "./assets/badge3.svg";
import verificationBadge from "./assets/badge2.svg";

// Utils
const safe = (v, d = "") => (v == null ? d : v);
const ensureHttp = (url) => {
    if (!url) return "";
    const u = String(url).trim();
    if (!u) return "";
    if (u.startsWith("http://") || u.startsWith("https://")) return u;
    return `https://${u}`;
};
const formatRelative = (iso) => {
    if (!iso) return "";
    try {
        const date = new Date(iso);
        const now = new Date();
        const diff = (now - date) / 1000;
        if (diff < 60) return "just now";
        if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
        return date.toLocaleDateString();
    } catch {
        return "";
    }
};

const Initials = ({ name = "" }) => {
    const parts = String(name).trim().split(" ");
    const initials = parts
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase() || "")
        .join("");
    return <div className={styles.initials}>{initials || "U"}</div>;
};

const TabEmpty = ({ title, hint }) => (
    <div className={styles.emptyTab}>
        <h4>{title}</h4>
        <p className={styles.subtle}>{hint}</p>
    </div>
);

const DMUserProfile = ({
    open,
    onClose,
    // User and conversation context
    user,                 // {_id, name, username, picture, verified, country, followersCount, followingCount, joinedAt, isCommunityAccount, community?, verificationBadge?, communityBadge?}
    conversation,         // { _id, status, blockedBy?, ... } optional, used to compute status text
    currentUserId,        // needed to decide block/unblock rendering
    conversationStatus,   // "pending" | "accepted" | "rejected" | "blocked"
    blockedBy,            // userId who blocked this conversation if status === "blocked"
    // Primary actions
    onStartChat,
    onViewProfile,
    onAcceptRequest,
    onRejectRequest,
    onBlock,
    onUnblock,            // new
    onDeleteChat,
    onReport,
    // Optional controls
    isMuted,
    onToggleMute,
    themeColor,
    onChangeThemeColor,
    nickname,
    onChangeNickname,
    onSaveNickname,
    mediaPreviews = [],
    onOpenMediaGallery,
    sharedGroups = [],
    onOpenSharedGroup,
}) => {
    // Hooks first
    const closeBtnRef = useRef(null);
    const [activeTab, setActiveTab] = useState("overview");
    const [copied, setCopied] = useState(false);

    // Derived values
    const name = safe(user?.name, user?.username || "User");
    const username = safe(user?.username);
    const picture = user?.picture || "";
    const verified = !!user?.verified;

    const country = safe(user?.country);
    const followers = user?.followersCount;
    const following = user?.followingCount;
    const joinedAt = user?.joinedAt;

    // Community section
    const isCommunity = !!user?.isCommunityAccount;
    const community = user?.community || null;
    const communityLink = ensureHttp(community?.link);
    const communityDescription = safe(community?.description);
    const communityCategories = Array.isArray(community?.category) ? community.category : [];
    const communityStats = community?.stats || {};
    const communityAccountType = community?.accountType;
    const communityPrivate = community?.isPrivate;
    const communityApproved = community?.isApproved;
    const communityDateCreated = community?.dateCreated;

    // Badge precedence (mirror Dashboard): community > verification
    const hasCommunityBadge = !!user?.communityBadge && isCommunity && !!community;
    const hasVerificationBadge = !hasCommunityBadge && !!user?.verificationBadge;

    // Block state
    const status = String(conversationStatus || conversation?.status || "");
    const isBlocked = status === "blocked";
    const iBlocked = isBlocked && blockedBy && String(blockedBy) === String(currentUserId);
    const theyBlocked = isBlocked && blockedBy && String(blockedBy) !== String(currentUserId);

    // Presence line
    const statusText = (() => {
        if (isBlocked) return theyBlocked ? "You’re blocked" : "Blocked by you";
        const st = status;
        if (st && st !== "accepted") return "Request pending";
        if (user?.isOnline || user?.online) return "Online";
        if (user?.lastSeen) return `Last seen ${formatRelative(user.lastSeen)}`;
        return username ? `@${username}` : "";
    })();

    const canAcceptReject =
        !!conversation?._id &&
        !!status &&
        status !== "accepted" &&
        !isBlocked;

    // Effects
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === "Escape") onClose?.();
        };
        document.addEventListener("keydown", onKey);
        if (open) setTimeout(() => closeBtnRef.current?.focus(), 0);
        return () => document.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    const hasOverview = !!(followers != null || following != null || country);
    const hasInfo = !!(country || joinedAt || (isCommunity && community));
    const hasMedia =
        (Array.isArray(mediaPreviews) && mediaPreviews.length > 0) ||
        (Array.isArray(sharedGroups) && sharedGroups.length > 0);
    const hasNotifications = typeof onToggleMute === "function";
    const hasCustomize =
        typeof onChangeThemeColor === "function" || typeof onSaveNickname === "function";
    const hasPrivacy = true;

    useEffect(() => {
        if (!open) return;
        const order = [
            ["overview", hasOverview],
            ["info", hasInfo],
            ["media", hasMedia],
            ["notifications", hasNotifications],
            ["privacy", hasPrivacy],
            ["customize", hasCustomize],
        ];
        const first = order.find(([, ok]) => ok)?.[0] || "overview";
        setActiveTab(first);
    }, [open, hasOverview, hasInfo, hasMedia, hasNotifications, hasPrivacy, hasCustomize]);

    // Handlers
    const handleCopyUser = async () => {
        try {
            if (!username) return;
            await navigator.clipboard.writeText(`@${username}`);
            setCopied(true);
            setTimeout(() => setCopied(false), 1200);
        } catch {
            // ignore
        }
    };

    if (!open) return null;

    return (
        <div className={styles.overlay} role="dialog" aria-modal="true" onClick={onClose}>
            <div className={styles.panel} onClick={(e) => e.stopPropagation()} aria-label="User profile">
                <button
                    ref={closeBtnRef}
                    className={styles.closeBtn}
                    onClick={onClose}
                    aria-label="Close profile"
                >
                    <IoClose size={18} />
                </button>

                {/* Hero */}
                <div className={styles.hero}>
                    <div className={styles.heroBackdrop} />
                    <div className={styles.heroContent}>
                        <div className={styles.avatarRing}>
                            <div className={styles.avatarWrap}>
                                {picture ? (
                                    <img src={picture} alt={name} className={styles.avatar} />
                                ) : (
                                    <Initials name={name} />
                                )}
                            </div>
                        </div>

                        <div className={styles.nameBlock}>
                            <div className={styles.nameRow}>
                                <span className={styles.name}>{name}</span>

                                {/* Badge precedence: community badge > verification badge */}
                                {hasCommunityBadge ? (
                                    <img src={communityBadge} alt="Community Badge" className={styles.badge} />
                                ) : hasVerificationBadge ? (
                                    <img src={verificationBadge} alt="Verification Badge" className={styles.badge} />
                                ) : null}

                                {isCommunity && communityAccountType && (
                                    <span className={styles.roleChip}>{communityAccountType}</span>
                                )}
                            </div>

                            <div className={styles.metaRow}>
                                {statusText && <span className={styles.statusDot} aria-hidden="true" />}
                                <span className={styles.metaText}>{statusText}</span>
                                {username && (
                                    <button
                                        className={`${styles.copyBtn} ${copied ? styles.copied : ""}`}
                                        onClick={handleCopyUser}
                                        aria-label="Copy username"
                                        title="Copy username"
                                    >
                                        <IoCopyOutline size={14} />
                                        <span className={styles.copyGrow}>
                                            <IoCheckmarkOutline className={styles.copyTick} size={14} aria-hidden="true" />
                                        </span>
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className={styles.quickRow}>
                            <button
                                className={styles.primary}
                                onClick={onStartChat}
                                disabled={theyBlocked || isBlocked}
                                title={theyBlocked ? "You’re blocked" : isBlocked ? "Unblock to continue" : "Message"}
                            >
                                <IoChatbubblesOutline size={18} />
                                <span>Message</span>
                            </button>
                            {typeof onViewProfile === "function" && (
                                <button className={styles.secondary} onClick={onViewProfile}>
                                    <IoEyeOutline size={18} />
                                    <span>View profile</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className={styles.tabBar} role="tablist" aria-label="Profile sections">
                    <button
                        className={`${styles.tabBtn} ${activeTab === "overview" ? styles.active : ""}`}
                        role="tab"
                        aria-selected={activeTab === "overview"}
                        onClick={() => setActiveTab("overview")}
                    >
                        <IoPersonCircleOutline />
                        <span>Overview</span>
                    </button>
                    <button
                        className={`${styles.tabBtn} ${activeTab === "info" ? styles.active : ""}`}
                        role="tab"
                        aria-selected={activeTab === "info"}
                        onClick={() => setActiveTab("info")}
                    >
                        <IoInformationCircleOutline />
                        <span>Info</span>
                    </button>
                    <button
                        className={`${styles.tabBtn} ${activeTab === "media" ? styles.active : ""}`}
                        role="tab"
                        aria-selected={activeTab === "media"}
                        onClick={() => setActiveTab("media")}
                    >
                        <IoSettingsOutline />
                        <span>Media</span>
                    </button>
                    <button
                        className={`${styles.tabBtn} ${activeTab === "notifications" ? styles.active : ""}`}
                        role="tab"
                        aria-selected={activeTab === "notifications"}
                        onClick={() => setActiveTab("notifications")}
                    >
                        <IoNotificationsOutline />
                        <span>Notifications</span>
                    </button>
                    <button
                        className={`${styles.tabBtn} ${activeTab === "privacy" ? styles.active : ""}`}
                        role="tab"
                        aria-selected={activeTab === "privacy"}
                        onClick={() => setActiveTab("privacy")}
                    >
                        <IoLockClosedOutline />
                        <span>Privacy</span>
                    </button>
                    <button
                        className={`${styles.tabBtn} ${activeTab === "customize" ? styles.active : ""}`}
                        role="tab"
                        aria-selected={activeTab === "customize"}
                        onClick={() => setActiveTab("customize")}
                    >
                        <IoColorPaletteOutline />
                        <span>Customize</span>
                    </button>
                </div>

                {/* Content */}
                <div className={styles.content}>
                    {/* Overview */}
                    {activeTab === "overview" && (
                        <>
                            {hasOverview ? (
                                <section className={styles.card}>
                                    <div className={styles.cardHeader}>
                                        <IoPersonCircleOutline size={16} />
                                        <span>About</span>
                                    </div>
                                    {country && <p className={styles.cardText}>Based in {country}</p>}
                                    {(followers != null || following != null) && (
                                        <div className={styles.statsRow}>
                                            {followers != null && (
                                                <div className={styles.stat}>
                                                    <span className={styles.statNum}>{followers}</span>
                                                    <span className={styles.statLabel}>Followers</span>
                                                </div>
                                            )}
                                            {following != null && (
                                                <div className={styles.stat}>
                                                    <span className={styles.statNum}>{following}</span>
                                                    <span className={styles.statLabel}>Following</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </section>
                            ) : (
                                <TabEmpty title="No overview yet" hint="No basic details available." />
                            )}
                        </>
                    )}

                    {/* Info (+ Community) */}
                    {activeTab === "info" && (
                        <>
                            {hasInfo ? (
                                <>
                                    <section className={styles.card}>
                                        <div className={styles.cardHeader}>
                                            <IoInformationCircleOutline size={16} />
                                            <span>Details</span>
                                        </div>
                                        <div className={styles.detailGrid}>
                                            {country && (
                                                <div className={styles.detailItem}>
                                                    <IoLocationOutline className={styles.detailIcon} />
                                                    <span className={styles.detailLabel}>Country</span>
                                                    <span className={styles.detailValue}>{country}</span>
                                                </div>
                                            )}
                                            {joinedAt && (
                                                <div className={styles.detailItem}>
                                                    <IoTimeOutline className={styles.detailIcon} />
                                                    <span className={styles.detailLabel}>Joined</span>
                                                    <span className={styles.detailValue}>
                                                        {new Date(joinedAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </section>

                                    {isCommunity && community && (
                                        <section className={styles.card}>
                                            <div className={styles.cardHeader}>
                                                <IoSettingsOutline size={16} />
                                                <span>Community</span>
                                            </div>

                                            {communityDescription && (
                                                <p className={styles.cardText}>{communityDescription}</p>
                                            )}

                                            <div className={styles.detailGrid}>
                                                {communityLink && (
                                                    <div className={styles.detailItem}>
                                                        <IoLinkOutline className={styles.detailIcon} />
                                                        <span className={styles.detailLabel}>Link</span>
                                                        <a
                                                            className={styles.link}
                                                            href={communityLink}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            {community.link}
                                                        </a>
                                                    </div>
                                                )}

                                                {Array.isArray(communityCategories) &&
                                                    communityCategories.length > 0 && (
                                                        <div className={styles.detailItemFull}>
                                                            <span className={styles.detailLabel}>Categories</span>
                                                            <div className={styles.tagsRow}>
                                                                {communityCategories.slice(0, 12).map((c, i) => (
                                                                    <span key={i} className={styles.tag}>
                                                                        {String(c).trim()}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                {communityAccountType && (
                                                    <div className={styles.detailItem}>
                                                        <IoPricetagOutline className={styles.detailIcon} />
                                                        <span className={styles.detailLabel}>Type</span>
                                                        <span className={styles.detailValue}>{communityAccountType}</span>
                                                    </div>
                                                )}

                                                <div className={styles.detailItem}>
                                                    <IoLockClosedOutline className={styles.detailIcon} />
                                                    <span className={styles.detailLabel}>Privacy</span>
                                                    <span className={styles.detailValue}>
                                                        {communityPrivate ? "Private" : "Public"}
                                                    </span>
                                                </div>

                                                <div className={styles.detailItem}>
                                                    <IoCheckmarkCircle className={styles.detailIcon} />
                                                    <span className={styles.detailLabel}>Approval</span>
                                                    <span className={styles.detailValue}>
                                                        {communityApproved ? "Approved" : "Pending"}
                                                    </span>
                                                </div>

                                                {communityDateCreated && (
                                                    <div className={styles.detailItem}>
                                                        <IoTimeOutline className={styles.detailIcon} />
                                                        <span className={styles.detailLabel}>Created</span>
                                                        <span className={styles.detailValue}>
                                                            {new Date(communityDateCreated).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className={styles.statsRow}>
                                                {typeof communityStats.members === "number" && (
                                                    <div className={styles.stat}>
                                                        <span className={styles.statNum}>{communityStats.members}</span>
                                                        <span className={styles.statLabel}>Members</span>
                                                    </div>
                                                )}
                                                {typeof communityStats.posts === "number" && (
                                                    <div className={styles.stat}>
                                                        <span className={styles.statNum}>{communityStats.posts}</span>
                                                        <span className={styles.statLabel}>Posts</span>
                                                    </div>
                                                )}
                                                {typeof communityStats.events === "number" && (
                                                    <div className={styles.stat}>
                                                        <span className={styles.statNum}>{communityStats.events}</span>
                                                        <span className={styles.statLabel}>Events</span>
                                                    </div>
                                                )}
                                                {typeof communityStats.challenges === "number" && (
                                                    <div className={styles.stat}>
                                                        <span className={styles.statNum}>{communityStats.challenges}</span>
                                                        <span className={styles.statLabel}>Challenges</span>
                                                    </div>
                                                )}
                                                {typeof communityStats.quiz === "number" && (
                                                    <div className={styles.stat}>
                                                        <span className={styles.statNum}>{communityStats.quiz}</span>
                                                        <span className={styles.statLabel}>Quizzes</span>
                                                    </div>
                                                )}
                                                {typeof communityStats.moderators === "number" && (
                                                    <div className={styles.stat}>
                                                        <span className={styles.statNum}>{communityStats.moderators}</span>
                                                        <span className={styles.statLabel}>Moderators</span>
                                                    </div>
                                                )}
                                                {typeof communityStats.topMembers === "number" && (
                                                    <div className={styles.stat}>
                                                        <span className={styles.statNum}>{communityStats.topMembers}</span>
                                                        <span className={styles.statLabel}>Top members</span>
                                                    </div>
                                                )}
                                                {typeof communityStats.appraisals === "number" && (
                                                    <div className={styles.stat}>
                                                        <span className={styles.statNum}>{communityStats.appraisals}</span>
                                                        <span className={styles.statLabel}>Appraisals</span>
                                                    </div>
                                                )}
                                                {typeof communityStats.pageViews === "number" && (
                                                    <div className={styles.stat}>
                                                        <span className={styles.statNum}>{communityStats.pageViews}</span>
                                                        <span className={styles.statLabel}>Page views</span>
                                                    </div>
                                                )}
                                            </div>
                                        </section>
                                    )}
                                </>
                            ) : (
                                <TabEmpty title="No info yet" hint="No additional details are available." />
                            )}
                        </>
                    )}

                    {/* Media */}
                    {activeTab === "media" && (
                        <>
                            {hasMedia ? (
                                <>
                                    {Array.isArray(mediaPreviews) && mediaPreviews.length > 0 && (
                                        <section className={styles.card}>
                                            <div className={styles.cardHeaderRow}>
                                                <div className={styles.cardHeader}>
                                                    <span>Shared media</span>
                                                </div>
                                                {typeof onOpenMediaGallery === "function" && (
                                                    <button className={styles.linkBtn} onClick={onOpenMediaGallery}>
                                                        View all
                                                    </button>
                                                )}
                                            </div>
                                            <div className={styles.mediaGrid}>
                                                {mediaPreviews.slice(0, 12).map((m, i) => (
                                                    <div key={i} className={styles.mediaCell}>
                                                        <img
                                                            src={m.thumb || m.url}
                                                            alt={`Media ${i + 1}`}
                                                            className={styles.mediaThumb}
                                                            loading="lazy"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </section>
                                    )}

                                    {Array.isArray(sharedGroups) && sharedGroups.length > 0 && (
                                        <section className={styles.card}>
                                            <div className={styles.cardHeaderRow}>
                                                <div className={styles.cardHeader}>
                                                    <span>Shared groups</span>
                                                </div>
                                            </div>
                                            <div className={styles.groupList}>
                                                {sharedGroups.slice(0, 6).map((g) => (
                                                    <button
                                                        key={g._id}
                                                        className={styles.groupItem}
                                                        onClick={() => onOpenSharedGroup?.(g._id)}
                                                    >
                                                        <img
                                                            src={g.avatar || "/default-group.png"}
                                                            alt={g.name}
                                                            className={styles.groupAvatar}
                                                        />
                                                        <span className={styles.groupName}>{g.name}</span>
                                                        <IoChevronForwardOutline size={16} className={styles.groupArrow} />
                                                    </button>
                                                ))}
                                            </div>
                                        </section>
                                    )}
                                </>
                            ) : (
                                <TabEmpty title="No media yet" hint="No shared media or common groups to show." />
                            )}
                        </>
                    )}

                    {/* Notifications */}
                    {activeTab === "notifications" && (
                        <>
                            {hasNotifications ? (
                                <section className={styles.cardRow}>
                                    <div className={styles.rowLeft}>
                                        <span className={styles.rowTitle}>Mute notifications</span>
                                        <span className={styles.rowHint}>Silence alerts from this chat</span>
                                    </div>
                                    <label className={styles.switch}>
                                        <input
                                            type="checkbox"
                                            checked={!!isMuted}
                                            onChange={onToggleMute}
                                            aria-label="Mute conversation"
                                        />
                                        <span className={styles.slider} />
                                    </label>
                                </section>
                            ) : (
                                <TabEmpty
                                    title="No controls"
                                    hint="Notification controls aren’t available for this chat."
                                />
                            )}
                        </>
                    )}

                    {/* Privacy */}
                    {activeTab === "privacy" && (
                        <>
                            {canAcceptReject && (
                                <section className={styles.cardRow}>
                                    <div className={styles.rowLeft}>
                                        <span className={styles.rowTitle}>Message request</span>
                                        <span className={styles.rowHint}>Choose how to proceed</span>
                                    </div>
                                    <div className={styles.rowActions}>
                                        {onAcceptRequest && (
                                            <button className={styles.success} onClick={onAcceptRequest}>
                                                Accept
                                            </button>
                                        )}
                                        {onRejectRequest && (
                                            <button className={styles.warning} onClick={onRejectRequest}>
                                                Reject
                                            </button>
                                        )}
                                    </div>
                                </section>
                            )}

                            <section className={styles.cardRow}>
                                <div className={styles.rowLeft}>
                                    <span className={styles.rowTitle}>Privacy & safety</span>
                                    <span className={styles.rowHint}>Manage unwanted behavior</span>
                                </div>
                                <div className={styles.rowActions}>
                                    {onReport && (
                                        <button className={styles.ghost} onClick={onReport}>
                                            Report
                                        </button>
                                    )}

                                    {/* Block / Unblock lives here */}
                                    {isBlocked ? (
                                        iBlocked ? (
                                            <button className={styles.success} onClick={onUnblock}>
                                                <IoCheckmarkCircle size={18} />
                                                <span>Unblock</span>
                                            </button>
                                        ) : (
                                            <span className={styles.subtle} title="You’re blocked">
                                                You’re blocked
                                            </span>
                                        )
                                    ) : (
                                        onBlock && (
                                            <button className={styles.danger} onClick={onBlock}>
                                                <IoBan size={18} />
                                                <span>Block</span>
                                            </button>
                                        )
                                    )}

                                    {onDeleteChat && (
                                        <button className={styles.ghost} onClick={onDeleteChat}>
                                            <IoTrashOutline size={18} />
                                            <span>Delete chat</span>
                                        </button>
                                    )}
                                </div>
                            </section>

                            <section className={styles.card}>
                                <div className={styles.cardHeader}>
                                    <IoLockClosedOutline size={16} />
                                    <span>Security</span>
                                </div>
                                <p className={styles.subtle}>
                                    Messages are stored securely; avoid sharing sensitive information unless
                                    end‑to‑end encryption is explicitly indicated for this conversation.
                                </p>
                            </section>
                        </>
                    )}

                    {/* Customize */}
                    {activeTab === "customize" && (
                        <>
                            {hasCustomize ? (
                                <section className={styles.card}>
                                    <div className={styles.cardHeader}>
                                        <IoBrushOutline size={16} />
                                        <span>Customization</span>
                                    </div>
                                    <div className={styles.customGrid}>
                                        {typeof onChangeThemeColor === "function" && (
                                            <div className={styles.customRow}>
                                                <span className={styles.detailLabel}>Chat color</span>
                                                <input
                                                    type="color"
                                                    value={themeColor || "#24b2b4"}
                                                    onChange={(e) => onChangeThemeColor?.(e.target.value)}
                                                    className={styles.colorInput}
                                                    aria-label="Pick chat color"
                                                />
                                            </div>
                                        )}
                                        {typeof onSaveNickname === "function" && (
                                            <div className={styles.customRow}>
                                                <span className={styles.detailLabel}>Nickname</span>
                                                <div className={styles.nickRow}>
                                                    <input
                                                        type="text"
                                                        value={nickname || ""}
                                                        onChange={(e) => onChangeNickname?.(e.target.value)}
                                                        placeholder="Add a nickname"
                                                        className={styles.nickInput}
                                                    />
                                                    <button className={styles.secondary} onClick={onSaveNickname}>
                                                        Save
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </section>
                            ) : (
                                <TabEmpty title="Nothing to customize" hint="No per-chat customization is available." />
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DMUserProfile;
