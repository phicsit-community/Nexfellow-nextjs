import React from "react";
import styles from "./HiddenPostItem.module.css";
import { formatDistanceToNow } from "date-fns";
import { FaEyeSlash, FaEye } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const HiddenPostItem = ({ post, onUnhide }) => {
  const navigate = useNavigate();

  const formatDateToAbbreviation = (date) => {
    try {
      if (!(date instanceof Date) || isNaN(date.getTime())) {
        throw new Error("Invalid date provided");
      }

      const distance = formatDistanceToNow(new Date(date), {
        addSuffix: false,
      });

      if (distance.startsWith("less than a minute")) {
        return "now";
      }

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

      const parts = distance.split(" ");
      const value = parts.length === 3 ? parts[1] : parts[0];
      const unit = parts.length === 3 ? parts[2] : parts[1];

      if (!value || !unit || isNaN(value)) {
        throw new Error("Unexpected distance format");
      }

      const abbreviatedUnit = unitAbbreviationMap[unit.toLowerCase()] || unit;

      return `${value}${abbreviatedUnit}`;
    } catch (error) {
      console.error("Error formatting date:", error);
      return "unknown";
    }
  };

  const handlePostClick = () => {
    navigate(`/post/${post._id}`);
  };

  const handleUnhideClick = (e) => {
    e.stopPropagation();
    onUnhide();
  };

  return (
    <div className={styles.hiddenPostItem} onClick={handlePostClick}>
      <div className={styles.postContent}>
        <div className={styles.authorInfo}>
          <img
            src={post.author?.picture || "/src/assets/default-profile.jpg"}
            alt={post.author?.name || "Author"}
            className={styles.authorAvatar}
          />
          <div className={styles.authorDetails}>
            <span className={styles.authorName}>
              {post.author?.name || "Unknown Author"}
            </span>
            <span className={styles.authorUsername}>
              @{post.author?.username || "unknown"}
            </span>
          </div>
          <span className={styles.postDate}>
            {formatDateToAbbreviation(post.createdAt)}
          </span>
        </div>
        <div className={styles.postText}>
          {post.content.length > 150
            ? `${post.content.substring(0, 150)}...`
            : post.content}
        </div>
        {post.attachments && post.attachments.length > 0 && (
          <div className={styles.postMediaInfo}>
            <span className={styles.mediaIcon}>🖼️</span>
            <span>
              {post.attachments.length}{" "}
              {post.attachments.length === 1 ? "image" : "images"}
            </span>
          </div>
        )}
      </div>
      <div className={styles.hiddenStatus}>
        <FaEyeSlash size={16} />
        <span>Hidden from feed</span>
      </div>
      <button
        className={styles.unhideButton}
        onClick={handleUnhideClick}
        aria-label="Unhide post"
      >
        <FaEye size={16} />
        <span>Unhide</span>
      </button>
    </div>
  );
};

export default HiddenPostItem;
