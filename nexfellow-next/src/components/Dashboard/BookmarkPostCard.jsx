import React, { useState } from "react";
import styles from "./BookmarkPostCard.module.css";
import { FaRegFileAlt } from "react-icons/fa";
import {
    FiExternalLink,
    FiBookmark,
    FiCheckCircle,
    FiShare2,
} from "react-icons/fi";
import {
    PiHeartStraightDuotone,
    PiHeartStraightFill,
    PiChatCircleDuotone,
    PiBookmarkSimpleDuotone,
    PiBookmarkSimpleFill,
} from "react-icons/pi";

import verify from "./assets/badge1.svg";
import communityBadge from "./assets/badge2.svg";

const unitAbbreviationMap = {
    seconds: "s",
    second: "s",
    minutes: "m",
    minute: "m",
    hours: "h",
    hour: "h",
    days: "d",
    day: "d",
    weeks: "w",
    week: "w",
    months: "mo",
    month: "mo",
    years: "y",
    year: "y",
};

function timeAgo(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return `${diff}${unitAbbreviationMap.seconds} ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}${unitAbbreviationMap.minutes} ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}${unitAbbreviationMap.hours} ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}${unitAbbreviationMap.days} ago`;
    if (diff < 2592000) return `${Math.floor(diff / 604800)}${unitAbbreviationMap.weeks} ago`;
    if (diff < 31536000) return `${Math.floor(diff / 2592000)}${unitAbbreviationMap.months} ago`;
    return `${Math.floor(diff / 31536000)}${unitAbbreviationMap.years} ago`;
}

const BookmarkPostCard = ({ data, bookmark, path = "post" }) => {
    const [expanded, setExpanded] = useState(false);
    const isLongContent = data.content && data.content.length > 120;

    return (
        <div className={styles.bookmarkFeedCard}>
            <div className={styles.feedCardHeader}>
                <div className={styles.feedAvatar}>
                    {data.author?.picture ? (
                        <img
                            src={data.author.picture}
                            alt={data.author.name || "Author"}
                            className={styles.feedAvatarImg}
                        />
                    ) : (
                        <FaRegFileAlt />
                    )}
                </div>
                <div className={styles.feedHeaderMain}>
                    <div className={styles.feedHeaderLeft}>
                        <div className={styles.feedAuthorDetails}>
                            <span className={styles.feedAuthor}>
                                {data.author?.name || "Unknown"}
                                <div className={styles.feedAuthorBadges}>
                                    {data.author?.isCommunityAccount && data.author?.createdCommunity ? (
                                        data.author?.communityBadge ? (
                                            <img
                                                src={communityBadge}
                                                alt="Community Badge"
                                                className={styles.badge}
                                            />
                                        ) : data.author?.verificationBadge ? (
                                            <img
                                                src={verify}
                                                alt="Verification Badge"
                                                className={styles.badge}
                                            />
                                        ) : null
                                    ) : data.author?.verificationBadge ? (
                                        <img
                                            src={verify}
                                            alt="Verification Badge"
                                            className={styles.verified}
                                        />
                                    ) : null}
                                </div>
                                <span className={styles.feedDot}>·</span>
                                <span className={styles.feedTime}>{timeAgo(data.createdAt)}</span>
                            </span>
                            <span className={styles.feedHandle}>@{data.author?.username || "user"}</span>
                        </div>
                    </div>
                </div>
                <PiBookmarkSimpleDuotone className={styles.feedBookmarkIcon} />
            </div>

            <div className={styles.feedContent}>
                <div className={styles.feedText}>
                    {data.content ? (
                        isLongContent ? (
                            expanded ? (
                                <>
                                    {data.content}
                                    <span
                                        className={styles.feedReadMore}
                                        onClick={() => setExpanded(false)}
                                        role="button"
                                        tabIndex={0}
                                        style={{ cursor: "pointer", marginLeft: 6 }}
                                    >
                                        show less
                                    </span>
                                </>
                            ) : (
                                <>
                                    {data.content.slice(0, 120)}
                                    <span
                                        className={styles.feedReadMore}
                                        onClick={() => setExpanded(true)}
                                        role="button"
                                        tabIndex={0}
                                        style={{ cursor: "pointer" }}
                                    >
                                        ...read more
                                    </span>
                                </>
                            )
                        ) : (
                            data.content
                        )
                    ) : (
                        <span className={styles.feedNoContent}>No content</span>
                    )}
                </div>
            </div>

            <div className={styles.feedCardFooter}>
                <div className={styles.feedActions}>
                    <span className={styles.feedAction}>
                        <PiHeartStraightDuotone size={18} />
                        {data.likeCount ?? 0}
                    </span>
                    <span className={styles.feedAction}>
                        <PiChatCircleDuotone size={18} />
                        {Array.isArray(data.comments)
                            ? data.comments.length
                            : data.comments ?? 0}
                    </span>
                    <span className={styles.feedAction}>
                        <FiShare2 size={18} />
                        {data.shares ?? 0}
                    </span>
                </div>
                <a
                    href={`/${path}/${data._id}`}
                    className={styles.feedViewBtn}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <FiExternalLink className={styles.feedViewIcon} />
                    View Post
                </a>
            </div>
        </div>
    );
};

export default BookmarkPostCard;
