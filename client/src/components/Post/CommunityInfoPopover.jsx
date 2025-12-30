import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./CommunityInfoPopover.module.css";
import profile from "../../assets/profile.jpg";
import axios from "axios";

const Spinner = ({ variant }) => (
  <div className={`${styles.spinner} ${styles[variant]}`} />
);

const CommunityInfoPopover = ({
  community,
  setShowPopover,
  postRef,
  alwaysPopoverBelow = false,
  isFollowing = false,
}) => {
  const popoverRef = useRef(null);
  const [position, setPosition] = useState({ top: "50px", left: "0px" });
  const [visible, setVisible] = useState(true);
  const [followStatus, setFollowStatus] = useState(isFollowing);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [error, setError] = useState(null);
  console.log("User ID:", user?.id);
  console.log("Community Owner ID:", community.communityOwnerId);
  console.log("Community:", community);

  useEffect(() => {
    setFollowStatus(isFollowing);
  }, [isFollowing]);

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
            newTop = "60px"; // fallback
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
    navigate(`/explore/${community.username}`);
  };

  useEffect(() => {
    const fetchFollowStatus = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("user"));
        if (!userData || !userData.id) {
          setError("User ID missing");
          return;
        }

        if (community.communityOwnerId) {
          const response = await axios.get(
            `/user/followStatus/${community.communityOwnerId}`
          );
          setFollowStatus(response.data.isFollowing);
        }
      } catch (err) {
        setError("Failed to fetch follow status.");
        console.error(err);
      }
    };

    fetchFollowStatus();
  }, [community.communityOwnerId]);

  const toggleFollow = async () => {
    setIsButtonLoading(true);
    try {
      const action = followStatus ? "unfollow" : "follow";

      if (community.communityOwnerId) {
        await axios.post(`/user/toggleFollow/${community.communityOwnerId}`, {
          action,
        });

        // Fetch updated follow status
        const response = await axios.get(
          `/user/followStatus/${community.communityOwnerId}`
        );
        setFollowStatus(response.data.isFollowing);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error toggling follow status.");
      console.error(err);
    } finally {
      setIsButtonLoading(false);
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
        <img
          src={community.profilePic || profile}
          alt="Community Profile"
          className={styles.profilePic}
          loading="lazy"
        />
        <div className={styles.right}>
          {community.communityOwnerId && (
            <>
              <div
                className={followStatus ? styles.unfollowBtn : styles.followBtn}
                onClick={!isButtonLoading ? toggleFollow : undefined}
              >
                {isButtonLoading ? (
                  <Spinner variant={followStatus ? "unfollow" : "follow"} />
                ) : followStatus ? (
                  "Unfollow"
                ) : (
                  "Follow"
                )}
              </div>
            </>
          )}
        </div>
      </div>
      <div className={styles.communityName}>{community.name}</div>
      <div className={styles.username}>@{community.username}</div>
      <div className={styles.stats}>
        <div>
          {community.followers}{" "}
          <span className={styles.followNo}>Followers</span>
        </div>
        <div>
          {community.following}{" "}
          <span className={styles.followNo}>Following</span>
        </div>
      </div>
      <p className={styles.bio}>{community.bio || "No bio available."}</p>
      <button className={styles.viewProfileButton} onClick={handleViewProfile}>
        View full profile
      </button>
    </div>
  );
};

export default CommunityInfoPopover;
