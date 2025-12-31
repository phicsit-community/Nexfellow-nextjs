"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import styles from "./ViewOnlyUser.module.css"; // Copy/adapt from ViewOnlyExplore.module.css
import { FaUsers, FaUserPlus, FaCalendarAlt } from "react-icons/fa";
import verificationBadge from "./assets/badge2.svg"; // Optional: if you show verified users

const ViewOnlyUser = () => {
  const params = useParams();
  const username = params?.username;
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`/user/publicprofile/username/${username}`);
        setUser(response.data);
        console.log("User data:", response.data);
      } catch (err) {
        setError("Failed to load user profile");
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [username]);

  const handleLogin = () => {
    router.push(`/login?returnUrl=${typeof window !== "undefined" ? window.location.pathname : ""}`);
  };

  if (loading) {
    return <div className={styles.loading}>Loading user data...</div>;
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>{error}</div>
      </div>
    );
  }

  if (user?.isPrivate) {
    return (
      <div className={styles.container}>
        <div className={styles.privateMessage}>
          <h2>This is a private profile</h2>
          <p>You need to log in to view this user's profile.</p>
          <button className={styles.loginButton} onClick={handleLogin}>
            Log in
          </button>
        </div>
      </div>
    );
  }

  // Helper: format numbers for display
  const formatNumber = (num, suffix = "+") =>
    typeof num === "number" ? `${num}${suffix}` : num;

  // Optional: add user badges
  const isVerified = user?.isVerified ?? false;

  return (
    <div className={styles.mainContainer}>
      <div className={styles.container}>
        {/* Banner */}
        <div className={styles.bannerSection}>
          <img
            src={user?.banner || "/default-banner.png"}
            alt="User Banner"
            className={styles.bannerImage}
          />
          <div className={styles.profileImageWrapper}>
            <img
              src={user?.picture || "/default-profile.png"}
              alt="Profile"
              className={styles.profileImage}
            />
          </div>
        </div>

        {/* Main Card */}
        <div className={styles.profileCard}>
          <div className={styles.headerRow}>
            <div>
              <h2 className={styles.communityName}>
                {user?.name || "User"}
              </h2>
              <span className={styles.username}>
                @{user?.username || "username"}
              </span>
            </div>
            <div className={styles.badges}>
              {isVerified && (
                <span className={styles.verifiedBadge}>
                  Verified
                  <img
                    src={verificationBadge}
                    alt="Verification Badge"
                    className={styles.badge}
                  />
                </span>
              )}
            </div>
          </div>
          <p className={styles.description}>
            {user?.bio || "No bio available."}
          </p>

          {/* Stats */}
          <div className={styles.statsRow}>
            <div className={styles.statCard}>
              <div className={styles.statIconBox}>
                <FaUsers className={styles.statIcon} />
              </div>
              <div>
                <div className={styles.statLabel}>Followers</div>
                <div className={styles.statValue}>
                  {formatNumber(user?.followers?.length || 0)}
                </div>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIconBox}>
                <FaUserPlus className={styles.statIcon} />
              </div>
              <div>
                <div className={styles.statLabel}>Following</div>
                <div className={styles.statValue}>
                  {formatNumber(user?.following?.length || 0)}
                </div>
              </div>
            </div>
            {/* Add more stats if needed */}
          </div>

          {/* View Profile Button */}
          <button className={styles.viewCommunityButton} onClick={handleLogin}>
            View Profile
          </button>

          {/* Login Prompt */}
          <div className={styles.loginPrompt}>
            <span>
              Log in to follow this user and see more content!
            </span>
            <button className={styles.loginButton} onClick={handleLogin}>
              Log in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewOnlyUser;
