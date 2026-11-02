"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import styles from "./CommunityInfoPopover.module.css";
import UserAvatar from "../UserAvatar/UserAvatar";
import VERIFY from "./assets/Verify.svg";
import VERIFY_ORANGE from "./assets/VerifyOrange.svg";
import communityBadgeIcon from "./assets/badge3.svg";
import { getProfilePath } from "../../utils/profilePath";
import { isSelf } from "../../utils/currentUser";
import useFollow from "../../hooks/useFollow";

const Spinner = ({ variant }) => (
  <div className={`${styles.spinner} ${styles[variant]}`} />
);

const CommunityInfoPopover = ({
  community,
  setShowPopover,
  postRef,
  alwaysPopoverBelow = false,
  onFollowChange,
}) => {
  const popoverRef = useRef(null);
  const [position, setPosition] = useState({ top: "50px", left: "0px" });
  const [visible, setVisible] = useState(true);
  const follow = useFollow(community.communityOwnerId, { onChange: onFollowChange });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user")) : null;
  const [error, setError] = useState(null);
  console.log("User ID:", user?.id);
  console.log("Community Owner ID:", community.communityOwnerId);
  console.log("Community:", community);

  useEffect(() => {
    if (!postRef?.current || !popoverRef?.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const visiblePercentage = entry.intersectionRatio * 100;

        if (visiblePercentage < 10) {
          setShowPopover(false);
          return;
        }

        // Calculate position (above or below)
        const postRect = postRef.current.getBoundingClientRect();
        const popoverHeight = popoverRef.current.offsetHeight;
        const spaceBelow = window.innerHeight - postRect.bottom;
        const spaceAbove = postRect.top;

        let newTop = "60px";
        if (!alwaysPopoverBelow) {
          if (spaceBelow > popoverHeight) {
            newTop = "60px"; // show below
          } else if (spaceAbove > popoverHeight + 200) {
            newTop = -popoverHeight - 10 + "px"; // show above
          } else {
            // Neither side is confirmed to fully fit (spaceBelow/spaceAbove
            // are only approximate — postRect spans the whole post card,
            // not just the avatar anchor). Default to below and let the
            // popover's own max-height/overflow-y handle any overflow,
            // rather than guessing "above" and clipping the header instead.
            newTop = "60px";
          }
        }

        setPosition((prev) => {
          if (prev.top !== newTop) {
            return { ...prev, top: newTop };
          }
          return prev;
        });
      },
      {
        root: null,
        threshold: Array.from({ length: 11 }, (_, i) => i / 10), // 0 to 1
      }
    );

    observer.observe(postRef.current);

    return () => {
      observer.disconnect();
    };
  }, [postRef, setShowPopover]);

  const handleMouseLeave = () => {
    setTimeout(() => {
      if (popoverRef.current && !popoverRef.current.matches(":hover")) {
        setShowPopover(false);
      }
    }, 200);
  };

  const handleViewProfile = () => {
    router.push(
      getProfilePath({
        username: community.username,
        isCommunityAccount: community.isCommunityAccount,
        createdCommunity: community.communityId,
      })
    );
  };

  const getBadgeIcon = () => {
    if (community.planBadge === "orange") return VERIFY_ORANGE;
    if (community.planBadge === "blue") return VERIFY;
    if (community.verificationBadge) return VERIFY;
    return null;
  };
  const badgeIcon = getBadgeIcon();

  const toggleFollow = async () => {
    try {
      await follow.toggle();
    } catch (err) {
      setError(err.response?.data?.message || "Error toggling follow status.");
      console.error(err);
    }
  };

  return (
    <div
      ref={popoverRef}
      className={styles.popover}
      onMouseLeave={handleMouseLeave}
      style={{
        zIndex: 1000,
        top: position.top,
        left: position.left,
        // transition: "top 0.3s ease-in-out",
      }}
    >
      <div className={styles.header}>
        <UserAvatar
          user={{ picture: community.profilePic, name: community.name, username: community.username }}
          className={styles.profilePic}
          loading="lazy"
        />
        <div className={styles.right}>
          {community.communityOwnerId && !isSelf(community.communityOwnerId) && (
            <>
              <div
                className={follow.isFollowing ? styles.unfollowBtn : styles.followBtn}
                onClick={!follow.loading ? toggleFollow : undefined}
              >
                {follow.loading ? (
                  <Spinner variant={follow.isFollowing ? "unfollow" : "follow"} />
                ) : (
                  follow.label
                )}
              </div>
            </>
          )}
        </div>
      </div>
      <div className={styles.communityName}>
        {community.name}
        {badgeIcon && (
          <img
            src={badgeIcon?.src || badgeIcon}
            alt="Verified Badge"
            className={styles.badge}
          />
        )}
      </div>
      <div className={styles.username}>@{community.username}</div>
      <div className={styles.stats}>
        {/* null: the owner hides that list */}
        {community.followers != null && (
          <div>
            {community.followers}{" "}
            <span className={styles.followNo}>Followers</span>
          </div>
        )}
        {community.following != null && (
          <div>
            {community.following}{" "}
            <span className={styles.followNo}>Following</span>
          </div>
        )}
      </div>
      <p className={styles.bio}>{community.bio || "No bio available."}</p>
      <button className={styles.viewProfileButton} onClick={handleViewProfile}>
        View full profile
      </button>
    </div>
  );
};

export default CommunityInfoPopover;
