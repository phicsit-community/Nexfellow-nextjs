"use client";

import React, { useState, useEffect } from "react";
import api from "../../lib/axios";
import styles from "./Suggestions.module.css";
import { useRouter } from "next/navigation";
import avatar from "../../../assets/avatar.svg";

// Skeleton button component for loading state
const SkeletonButton = () => {
  return <div className={`${styles.skeletonButton} ${styles.shimmer}`}></div>;
};

const SuggestionCard = ({ user }) => {
  const [followStatus, setFollowStatus] = useState(false);
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchFollowStatus = async () => {
      try {
        const userData = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user")) : null;
        if (!userData || !userData.id) {
          setError("User ID missing");
          return;
        }

        if (user._id) {
          const response = await api.get(`/user/followStatus/${user._id}`);
          setFollowStatus(response.data.isFollowing);
        }
      } catch (err) {
        setError("Failed to fetch follow status.");
        console.error(err);
      }
    };

    fetchFollowStatus();
  }, [user._id]);

  const toggleFollow = async () => {
    setIsButtonLoading(true);
    try {
      const action = followStatus ? "unfollow" : "follow";

      if (user._id) {
        await api.post(`/user/toggleFollow/${user._id}`, { action });

        // Fetch updated follow status
        const response = await api.get(`/user/followStatus/${user._id}`);
        setFollowStatus(response.data.isFollowing);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error toggling follow status.");
      console.error(err);
    } finally {
      setIsButtonLoading(false);
    }
  };

  const handleProfileRedirect = () => {
    if (user.isCommunityAccount && user.createdCommunity) {
      router.push(`/explore/${user.username}`);
    } else {
      router.push(`/user/${user.username}`);
    }
  };

  const truncateText = (text, maxLength) => {
    if (!text) return "";
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  };


  return (
    <div className={styles.suggestionCard}>
      <div className={styles.left}>
        <img
          src={user.picture || avatar}
          alt={user.name}
          className={styles.suggestionCardImg}
          onClick={handleProfileRedirect}
          style={{ cursor: "pointer" }}
          title={user.name || "User Avatar"}
          loading="lazy"
        />
        <div className={styles.suggestionCardInfo}>
          <h4
            className={styles.suggestionCardName}
            onClick={handleProfileRedirect}
            style={{ cursor: "pointer" }}
            title={user.name}
          >
            {truncateText(user.name, 12)}
          </h4>

          <p
            className={styles.suggestionCardUsername}
            style={{ cursor: "pointer" }}
            onClick={handleProfileRedirect}
            title={user.username}
          >
            @{truncateText(user.username, 10)}
          </p>
        </div>
      </div>
      <div className={styles.right}>
        {user._id && (
          <>
            {isButtonLoading ? (
              <SkeletonButton />
            ) : (
              <div
                className={
                  followStatus
                    ? styles.unfollowSuggestionCardBtn
                    : styles.suggestionCardBtn
                }
                onClick={toggleFollow}
              >
                {followStatus ? "Unfollow" : "Follow"}
              </div>
            )}
          </>
        )}
      </div>
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
};

export default SuggestionCard;
