"use client";

import React, { useEffect, useRef, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { IoSearchOutline } from "react-icons/io5";
import api from "../../lib/axios";
import styles from "./FollowersModal.module.css";
import ProfileImage from "./assets/profile_image.svg";
import { useRouter } from "next/navigation";
import Skeleton from "../common/Skeleton";

const FollowersModal = ({ isOpen, onClose, communityId, userId }) => {
  const [followers, setFollowers] = useState([]);
  const [followStatus, setFollowStatus] = useState({});
  const [buttonLoading, setButtonLoading] = useState({});
  const [errors, setErrors] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const modalRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      fetchFollowers();
    }
  }, [isOpen]);

  const fetchFollowers = async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`/user/profile/${userId}`);
      const followersList = response.data.followers || []; // Ensure followers exist
      setFollowers(followersList);
      fetchFollowStatus(followersList);
    } catch (err) {
      console.error("Error fetching followers:", err);
      setError("Failed to fetch followers.");
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowStatus = async (members) => {
    try {
      const statusData = {};
      const errorData = {};

      await Promise.all(
        members.map(async (member) => {
          try {
            const res = await api.get(`/user/followStatus/${member._id}`);
            statusData[member._id] = res.data.isFollowing;
          } catch (err) {
            console.error(
              `Error fetching follow status for ${member._id}:`,
              err
            );
            errorData[member._id] = "Failed to fetch follow status.";
          }
        })
      );

      setFollowStatus(statusData);
      setErrors(errorData);
    } catch (err) {
      console.error("Error fetching follow statuses:", err);
    }
  };

  const toggleFollow = async (followerId) => {
    setButtonLoading((prev) => ({ ...prev, [followerId]: true }));
    setErrors((prev) => ({ ...prev, [followerId]: null }));

    const action = followStatus[followerId] ? "unfollow" : "follow";

    try {
      const res = await api.post(`/user/toggleFollow/${followerId}`, {
        action,
      });

      if (res.status === 200) {
        setFollowStatus((prev) => ({
          ...prev,
          [followerId]: !prev[followerId],
        }));
      }
    } catch (err) {
      console.error("Error toggling follow status:", err);
      setErrors((prev) => ({
        ...prev,
        [followerId]:
          err.response?.data?.message || "Failed to toggle follow status.",
      }));
    } finally {
      setButtonLoading((prev) => ({ ...prev, [followerId]: false }));
    }
  };

  const handleProfileClick = (follower) => {
    if (follower.isCommunityAccount && follower.createdCommunity) {
      router.push(`/community/${follower.username}`);
    } else {
      router.push(`/user/${follower.username}`);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const filteredFollowers = followers.filter(
    (follower) =>
      (follower.name &&
        follower.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (follower.username &&
        follower.username.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const renderSkeletonLoader = () => {
    return (
      <div className={styles.skeletonContainer}>
        {/* Skeleton for search bar */}
        <Skeleton type="search" />

        {/* Skeleton items for followers */}
        {[...Array(5)].map((_, index) => (
          <div key={index} className={styles.skeletonFollowerItem}>
            <div className={styles.profileSection}>
              <Skeleton type="avatar" />
              <div className={styles.memberInfo}>
                <Skeleton type="text-md" />
                <Skeleton type="text-sm" />
              </div>
            </div>
            <Skeleton type="button" />
          </div>
        ))}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.modalContainer}
        onClick={(e) => e.stopPropagation()}
        ref={modalRef}
      >
        <div className={styles.modalHeader}>
          <h2 className={styles.title}>Followers</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.searchBar}>
          <IoSearchOutline className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search followers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {error && (
          <div className={styles.errorMessage}>
            {error}
            <button className={styles.retryButton} onClick={fetchFollowers}>
              Retry
            </button>
          </div>
        )}

        {loading ? (
          renderSkeletonLoader()
        ) : (
          <div className={styles.membersList}>
            {filteredFollowers.length > 0 ? (
              filteredFollowers.map((follower) => (
                <div
                  key={follower._id}
                  className={styles.memberItem}
                  onClick={() => handleProfileClick(follower)}
                >
                  <div className={styles.profileSection}>
                    <img
                      src={follower.picture || ProfileImage}
                      alt={follower.name || "User"}
                      className={styles.avatar}
                    />
                    <div className={styles.memberInfo}>
                      <div className={styles.memberName}>
                        {follower.name || "Unknown User"}
                      </div>
                      <div className={styles.memberUsername}>
                        @{follower.username}
                      </div>
                    </div>
                  </div>

                  {/* Follow Button */}
                  <button
                    className={`${styles.followButton} ${followStatus[follower._id] ? styles.following : ""
                      }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFollow(follower._id);
                    }}
                    disabled={buttonLoading[follower._id]}
                  >
                    {buttonLoading[follower._id]
                      ? "Loading..."
                      : followStatus[follower._id]
                        ? "Unfollow"
                        : "Follow"}
                  </button>

                  {/* Error message */}
                  {errors[follower._id] && (
                    <div className={styles.errorMessage}>
                      {errors[follower._id]}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className={styles.noFollowersMessage}>No followers found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FollowersModal;
