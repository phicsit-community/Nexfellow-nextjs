"use client";
// DMUserProfile.jsx — pixel-perfect Figma replication
import React, { useEffect, useRef } from "react";
import {
    IoClose,
    IoBookmarkOutline,
    IoLocationOutline,
    IoTimeOutline,
    IoShareSocialOutline,
    IoMailOutline,
    IoCalendarOutline,
    IoPeopleOutline,
    IoChevronForwardOutline,
    IoDocumentOutline,
    IoLinkOutline,
    IoNotificationsOutline,
    IoSearchOutline,
    IoArchiveOutline,
    IoPersonRemoveOutline,
    IoWarningOutline,
    IoTrashOutline,
} from "react-icons/io5";
import styles from "./DMUserProfile.module.css";

import communityBadge from "./assets/badge3.svg";
import verificationBadge from "./assets/badge2.svg";

const safe = (v, d = "") => (v == null ? d : v);

const formatJoinDate = (iso) => {
    if (!iso) return "";
    try {
        return new Date(iso).toLocaleDateString("en-US", { month: "long", year: "numeric" });
    } catch { return ""; }
};

const getLocalTime = () => {
    try {
        return new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    } catch { return ""; }
};

const Initials = ({ name = "" }) => {
    const parts = String(name).trim().split(" ");
    const initials = parts.slice(0, 2).map((p) => p[0]?.toUpperCase() || "").join("");
    return <div className={styles.initials}>{initials || "U"}</div>;
};

const DMUserProfile = ({
    open,
    onClose,
    user,
    conversation,
    currentUserId,
    conversationStatus,
    blockedBy,
    onViewProfile,
    onAcceptRequest,
    onRejectRequest,
    onBlock,
    onUnblock,
    onDeleteChat,
    onReport,
    isMuted,
    onToggleMute,
    mediaPreviews = [],
    onOpenMediaGallery,
    sharedGroups = [],
    onOpenSharedGroup,
    mutualConnections = [],
    filesCount = 0,
    linksCount = 0,
    messagesCount: propMessagesCount,
}) => {
    const closeBtnRef = useRef(null);

    const name     = safe(user?.name, user?.username || "User");
    const picture  = user?.picture || "";
    const isCommunity        = !!user?.isCommunityAccount;
    const community          = user?.community || null;
    const hasCommunityBadge  = !!user?.communityBadge && isCommunity && !!community;
    const hasVerificationBadge = !hasCommunityBadge && !!user?.verificationBadge;

    const country       = safe(user?.country);
    const followers     = user?.followersCount;
    const following     = user?.followingCount;
    const messagesCount = propMessagesCount ?? user?.messagesCount;
    const joinedAt      = user?.joinedAt;
    const bio           = safe(user?.bio);
    const email         = safe(user?.email);
    const localTime     = getLocalTime();

    const status           = String(conversationStatus || conversation?.status || "");
    const isBlocked        = status === "blocked";
    const iBlocked         = isBlocked && blockedBy && String(blockedBy) === String(currentUserId);
    const canAcceptReject  = !!conversation?._id && !!status && status !== "accepted" && !isBlocked;

    useEffect(() => {
        const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
        document.addEventListener("keydown", onKey);
        if (open) setTimeout(() => closeBtnRef.current?.focus(), 0);
        return () => document.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    if (!open) return null;

    const groupColors     = ["#e0f5f5", "#e8eaff", "#ffeaea", "#e8ffe8", "#fff3e0"];
    const groupTextColors = ["#1ab99a", "#5c6bc0", "#e53935", "#2e7d32", "#f57c00"];

    return (
        <div className={styles.panel}>

            {/* ══ HERO — gradient bg, top-bar buttons, avatar ══ */}
            <div className={styles.hero}>
                {/* floating top-bar buttons sit on the gradient */}
                <div className={styles.heroBar}>
                    <button className={styles.heroIconBtn} aria-label="Bookmark">
                        <IoBookmarkOutline size={17} />
                    </button>
                    <button
                        ref={closeBtnRef}
                        className={styles.heroIconBtn}
                        onClick={onClose}
                        aria-label="Close"
                    >
                        <IoClose size={17} />
                    </button>
                </div>

                {/* avatar sits at the bottom of the gradient */}
                <div className={styles.avatarRing}>
                    <div className={styles.avatarWrap}>
                        {picture
                            ? <img src={picture} alt={name} className={styles.avatar} />
                            : <Initials name={name} />
                        }
                    </div>
                    {(user?.isOnline || user?.online) && <span className={styles.onlineDot} />}
                </div>
            </div>

            {/* ══ Scrollable body below hero ══ */}
            <div className={styles.body}>

                {/* name + badge + location + time + share */}
                <div className={styles.profileInfo}>
                    <div className={styles.nameRow}>
                        <span className={styles.nameText}>{name}</span>
                        {hasCommunityBadge
                            ? <img src={communityBadge?.src  || communityBadge}  alt="badge"    className={styles.badgeIcon} />
                            : hasVerificationBadge
                                ? <img src={verificationBadge?.src || verificationBadge} alt="verified" className={styles.badgeIcon} />
                                : null
                        }
                    </div>

                    {country && (
                        <span className={styles.metaLine}>
                            <IoLocationOutline size={13} className={styles.metaIcon} />
                            {country}
                        </span>
                    )}
                    {localTime && (
                        <span className={styles.metaLine}>
                            <IoTimeOutline size={13} className={styles.metaIcon} />
                            Local time: {localTime}
                        </span>
                    )}

                    <button className={styles.shareBtn} onClick={onViewProfile}>
                        <IoShareSocialOutline size={15} />
                        Share
                    </button>
                </div>

                {/* ── About ── */}
                {bio && (
                    <div className={styles.section}>
                        <p className={styles.sectionLabel}>About</p>
                        <p className={styles.bioText}>{bio}</p>
                    </div>
                )}

                {/* ── Contact Information ── */}
                {(email || joinedAt) && (
                    <div className={styles.section}>
                        <p className={styles.sectionLabel}>Contact Information</p>
                        <div className={styles.contactList}>
                            {email && (
                                <div className={styles.contactRow}>
                                    <div className={styles.contactIcon}>
                                        <IoMailOutline size={15} />
                                    </div>
                                    <div>
                                        <p className={styles.contactLabelText}>Email</p>
                                        <p className={styles.contactValue}>{email}</p>
                                    </div>
                                </div>
                            )}
                            {joinedAt && (
                                <div className={styles.contactRow}>
                                    <div className={styles.contactIcon} style={{ background: "#e0f5f5" }}>
                                        <IoCalendarOutline size={15} style={{ color: "#1ab99a" }} />
                                    </div>
                                    <div>
                                        <p className={styles.contactLabelText}>Joined</p>
                                        <p className={styles.contactValue}>{formatJoinDate(joinedAt)}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ── Stats (3 separate cards) ── */}
                {(followers != null || following != null || messagesCount != null) && (
                    <div className={styles.statsRow}>
                        {followers != null && (
                            <div className={styles.statCard}>
                                <span className={styles.statNum}>{followers}</span>
                                <span className={styles.statLabel}>Followers</span>
                            </div>
                        )}
                        {following != null && (
                            <div className={styles.statCard}>
                                <span className={styles.statNum}>{following}</span>
                                <span className={styles.statLabel}>Following</span>
                            </div>
                        )}
                        {messagesCount != null && (
                            <div className={styles.statCard}>
                                <span className={styles.statNum}>{messagesCount}</span>
                                <span className={styles.statLabel}>Messages</span>
                            </div>
                        )}
                    </div>
                )}

                {/* ── Mutual Connections ── */}
                {mutualConnections.length > 0 && (
                    <div className={styles.section}>
                        <div className={styles.mutualCard}>
                            <div className={styles.mutualHeaderRow}>
                                <IoPeopleOutline size={16} className={styles.mutualIcon} />
                                <span className={styles.mutualTitle}>Mutual Connections</span>
                                <IoChevronForwardOutline size={15} className={styles.mutualChevron} />
                            </div>
                            <div className={styles.mutualAvatarRow}>
                                {mutualConnections.slice(0, 4).map((m, i) => (
                                    <div
                                        key={i}
                                        className={styles.mutualAvatar}
                                        style={{ marginLeft: i === 0 ? 0 : "-8px", zIndex: 10 - i }}
                                    >
                                        {m.picture
                                            ? <img src={m.picture} alt={m.name || ""} />
                                            : <span>{(m.name || "U")[0].toUpperCase()}</span>
                                        }
                                    </div>
                                ))}
                                <span className={styles.mutualCountText}>
                                    {mutualConnections.length} mutual connection{mutualConnections.length !== 1 ? "s" : ""}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Common Groups ── */}
                {sharedGroups.length > 0 && (
                    <div className={styles.section}>
                        <div className={styles.sectionHeaderRow}>
                            <p className={styles.sectionLabel} style={{ margin: 0 }}>Common Groups</p>
                            <button className={styles.viewAllBtn} onClick={onOpenMediaGallery}>View All</button>
                        </div>
                        <div className={styles.groupList}>
                            {sharedGroups.slice(0, 3).map((g, i) => (
                                <button
                                    key={g._id || i}
                                    className={styles.groupRow}
                                    onClick={() => onOpenSharedGroup?.(g._id)}
                                >
                                    <div
                                        className={styles.groupAvatar}
                                        style={{ background: g.color || groupColors[i % groupColors.length] }}
                                    >
                                        {g.avatar
                                            ? <img src={g.avatar} alt={g.name} className={styles.groupAvatarImg} />
                                            : <span style={{ color: groupTextColors[i % groupTextColors.length] }}>
                                                {(g.name || "G")[0].toUpperCase()}
                                              </span>
                                        }
                                    </div>
                                    <div className={styles.groupInfo}>
                                        <span className={styles.groupName}>{g.name}</span>
                                        {g.membersCount != null && (
                                            <span className={styles.groupSub}>{g.membersCount} members</span>
                                        )}
                                    </div>
                                    <IoChevronForwardOutline size={14} className={styles.rowChevron} />
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Shared Media ── */}
                {(mediaPreviews.length > 0 || filesCount > 0 || linksCount > 0) && (
                    <div className={styles.section}>
                        <div className={styles.sectionHeaderRow}>
                            <p className={styles.sectionLabel} style={{ margin: 0 }}>Shared Media</p>
                            <button className={styles.viewAllBtn} onClick={onOpenMediaGallery}>View All ↗</button>
                        </div>
                        {mediaPreviews.length > 0 && (
                            <div className={styles.mediaGrid}>
                                {mediaPreviews.slice(0, 6).map((m, i) => (
                                    <div key={i} className={styles.mediaCell}>
                                        <img src={m.thumb || m.url} alt="" className={styles.mediaImg} loading="lazy" />
                                    </div>
                                ))}
                            </div>
                        )}
                        {(filesCount > 0 || linksCount > 0) && (
                            <div className={styles.mediaCountRow}>
                                {filesCount > 0 && (
                                    <span className={styles.mediaChip}>
                                        <IoDocumentOutline size={13} />Files ({filesCount})
                                    </span>
                                )}
                                {linksCount > 0 && (
                                    <span className={styles.mediaChip}>
                                        <IoLinkOutline size={13} />Links ({linksCount})
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* ── Privacy & Settings ── */}
                <div className={styles.section}>
                    <p className={styles.sectionLabel}>Privacy &amp; Settings</p>

                    {/* Notifications — card box */}
                    {typeof onToggleMute === "function" && (
                        <div className={styles.settingCard}>
                            <div className={styles.settingIcon} style={{ background: "#e6f9f4" }}>
                                <IoNotificationsOutline size={16} style={{ color: "#1ab99a" }} />
                            </div>
                            <div className={styles.settingInfo}>
                                <span className={styles.settingTitle}>Notifications</span>
                                <span className={styles.settingHint}>{isMuted ? "Disabled" : "Enabled"}</span>
                            </div>
                            <label className={styles.toggle}>
                                <input type="checkbox" checked={!isMuted} onChange={onToggleMute} />
                                <span className={styles.slider} />
                            </label>
                        </div>
                    )}

                    {/* Search in Conversation — card box */}
                    <button className={styles.settingCard}>
                        <div className={styles.settingIcon} style={{ background: "#e8f0ff" }}>
                            <IoSearchOutline size={16} style={{ color: "#4a7bf7" }} />
                        </div>
                        <div className={styles.settingInfo}>
                            <span className={styles.settingTitle}>Search in Conversation</span>
                            <span className={styles.settingHint}>Find messages</span>
                        </div>
                        <IoChevronForwardOutline size={15} className={styles.rowChevron} />
                    </button>

                    {/* divider before plain rows */}
                    <div className={styles.settingDivider} />

                    {canAcceptReject && (
                        <div className={styles.plainRow}>
                            <span className={styles.settingTitle}>Message request</span>
                            <div className={styles.reqBtns}>
                                {onAcceptRequest && <button className={styles.acceptBtn} onClick={onAcceptRequest}>Accept</button>}
                                {onRejectRequest && <button className={styles.rejectBtn} onClick={onRejectRequest}>Reject</button>}
                            </div>
                        </div>
                    )}

                    {/* Archive — plain row */}
                    <button className={styles.plainRow}>
                        <div className={styles.plainIcon}>
                            <IoArchiveOutline size={16} style={{ color: "#6b7280" }} />
                        </div>
                        <span className={styles.settingTitle}>Archive conversation</span>
                    </button>

                    {/* Block / Unblock — plain row */}
                    {isBlocked ? (
                        iBlocked ? (
                            <button className={styles.plainRow} onClick={onUnblock}>
                                <div className={styles.plainIcon}>
                                    <IoPersonRemoveOutline size={16} style={{ color: "#6b7280" }} />
                                </div>
                                <span className={styles.settingTitle}>Unblock user</span>
                            </button>
                        ) : (
                            <div className={styles.plainRow}>
                                <div className={styles.plainIcon}>
                                    <IoPersonRemoveOutline size={16} style={{ color: "#6b7280" }} />
                                </div>
                                <span className={styles.settingTitleMuted}>You&apos;re blocked</span>
                            </div>
                        )
                    ) : onBlock && (
                        <button className={styles.plainRow} onClick={onBlock}>
                            <div className={styles.plainIcon}>
                                <IoPersonRemoveOutline size={16} style={{ color: "#6b7280" }} />
                            </div>
                            <span className={styles.settingTitle}>Block user</span>
                        </button>
                    )}

                    {/* Report — plain row, red text */}
                    {onReport && (
                        <button className={styles.plainRow} onClick={onReport}>
                            <div className={styles.plainIcon}>
                                <IoWarningOutline size={16} style={{ color: "#e53935" }} />
                            </div>
                            <span className={styles.settingTitleDanger}>Report user</span>
                        </button>
                    )}

                    {/* Delete — plain row */}
                    {onDeleteChat && (
                        <button className={styles.plainRow} onClick={onDeleteChat}>
                            <div className={styles.plainIcon}>
                                <IoTrashOutline size={16} style={{ color: "#6b7280" }} />
                            </div>
                            <span className={styles.settingTitle}>Delete conversation</span>
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
};

export default DMUserProfile;
