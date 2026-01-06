"use client";

import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { useRouter } from "next/navigation";
import { IoSearchOutline } from "react-icons/io5";
import api from "../../lib/axios";
import styles from "./LikesModal.module.css";

const LikesModal = ({ profiles, onClose }) => {
  const modalRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [followStatus, setFollowStatus] = useState({});
  const [buttonLoading, setButtonLoading] = useState({});
  const [errors, setErrors] = useState({});
  const router = useRouter();

  // Fetch follow status for each profile
  useEffect(() => {
    const fetchFollowStatus = async () => {
      try {
        const statusData = {};
        const errorData = {};

        await Promise.all(
          profiles.map(async (profile) => {
            try {
              const response = await api.get(
                `/user/followStatus/${profile._id}`
              );
              statusData[profile._id] = response.data.isFollowing;
            } catch (error) {
              errorData[profile._id] = "Failed to fetch follow status.";
            }
          })
        );

        setFollowStatus(statusData);
        setErrors(errorData);
      } catch (err) {
        // general error
      }
    };

    fetchFollowStatus();
  }, [profiles]);

  // Close the modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Only close if overlay itself (background) is clicked or click outside modal
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target) &&
        event.target.classList.contains(styles.overlay)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  // Filter profiles based on search query
  const filteredProfiles = profiles.filter(
    (member) =>
      (member.name && member.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (member.username && member.username.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Toggle follow/unfollow
  const toggleFollow = async (profileId) => {
    setButtonLoading((prev) => ({ ...prev, [profileId]: true }));
    setErrors((prev) => ({ ...prev, [profileId]: null }));

    const action = followStatus[profileId] ? "unfollow" : "follow";

    try {
      const response = await api.post(`/user/toggleFollow/${profileId}`, {
        action,
      });

      if (response.status === 200) {
        setFollowStatus((prev) => ({
          ...prev,
          [profileId]: !prev[profileId],
        }));
      }
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        [profileId]:
          error.response?.data?.message || "Failed to toggle follow status.",
      }));
    } finally {
      setButtonLoading((prev) => ({ ...prev, [profileId]: false }));
    }
  };

  // Redirect based on account type
  const handleProfileClick = (member) => {
    if (member.isCommunityAccount && member.createdCommunity) {
      router.push(`/community/${member.username}`);
    } else {
      router.push(`/user/${member.username}`);
    }
  };

  // Modal content (to be rendered inside portal)
  const content = (
    <div className={styles.overlay}>
      <div ref={modalRef} className={styles.likesContainer}>
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>Likes</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>
        {/* Search Bar */}
        <div className={styles.searchBar}>
          <IoSearchOutline className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search likes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        {/* Likes List */}
        <div className={styles.membersList}>
          {filteredProfiles.length > 0 ? (
            filteredProfiles.map((member) => (
              <div
                key={member._id}
                className={styles.memberItem}
                onClick={() => handleProfileClick(member)}
              >
                <div className={styles.profileSection}>
                  <img
                    src={member.picture || "/default-profile.png"}
                    alt={member.name || "User"}
                    className={styles.avatar}
                  />
                  <div className={styles.memberInfo}>
                    <div className={styles.memberName}>
                      {member.name || "Unknown User"}
                    </div>
                    <div className={styles.memberUsername}>
                      @{member.username}
                    </div>
                  </div>
                </div>
                {/* Follow Button */}
                <button
                  className={`${styles.followButton} ${followStatus[member._id] ? styles.following : ""
                    }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFollow(member._id);
                  }}
                  disabled={buttonLoading[member._id]}
                >
                  {buttonLoading[member._id]
                    ? "Loading..."
                    : followStatus[member._id]
                      ? "Unfollow"
                      : "Follow"}
                </button>
                {/* Error message */}
                {errors[member._id] && (
                  <div className={styles.errorMessage}>
                    {errors[member._id]}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className={styles.noLikesMessage}>No likes found.</p>
          )}
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(content, document.body);
};

export default LikesModal;
