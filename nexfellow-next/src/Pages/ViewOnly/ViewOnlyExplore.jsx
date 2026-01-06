"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "../../lib/axios";
import styles from "./ViewOnlyExplore.module.css";
import { toast } from "sonner";
import MetaTags from "../../components/MetaTags/MetaTags";
import { FaFire, FaUsers, FaCalendarAlt, FaCheckCircle } from "react-icons/fa";
import verificationBadge from "./assets/badge2.svg";


const ViewOnlyExplore = () => {
  const params = useParams();
  const username = params?.username;
  const router = useRouter();
  const [community, setCommunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reputationScore, setReputationScore] = useState(0);
  const [loadingReputation, setLoadingReputation] = useState(true);

  useEffect(() => {
    const fetchCommunity = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/community/username/${username}`);
        setCommunity(response.data);
        console.log("Fetched community data:", response.data);
      } catch (err) {
        console.error("Error fetching community:", err);
        if (err.response && err.response.status === 404) {
          setError("Community not found");
          toast.error("This community doesn't exist");
        } else {
          setError("Failed to load community data");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCommunity();
  }, [username]);

  console.log("Community data:", community);

  useEffect(() => {
    if (!community || !community._id) return;
    setLoadingReputation(true);
    api.get(`/analytics/${community._id}/reputation`)
      .then(res => {
        setReputationScore(res.data.reputationScore || 0);
      })
      .catch(err => {
        console.error("Failed to fetch reputation for", community._id);
        setReputationScore(0);
      })
      .finally(() => setLoadingReputation(false));
  }, [community]);

  const handleLogin = () => {
    router.push(`/login?returnUrl=${typeof window !== "undefined" ? window.location.pathname : ""}`);
  };

  if (loading) {
    return <div className={styles.loading}>Loading community data...</div>;
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>{error}</div>
      </div>
    );
  }

  // If the community is private, show a message
  if (community?.isPrivate) {
    return (
      <div className={styles.container}>
        {community && (
          <MetaTags
            title={`${community.owner?.name || "Community"} | NexFellow`}
            description="This is a private community. Login to request to join."
            contentId={community._id}
            contentType="community"
            type="profile"
          />
        )}
        <div className={styles.privateMessage}>
          <h2>This is a private community</h2>
          <p>You need to log in and request to join to view this content.</p>
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

  // Example: fallback for featured/verified
  const isFeatured = community?.isFeatured ?? true;
  const isVerified = community?.isVerified ?? true;

  return (
    <div className={styles.mainContainer}>
      <div className={styles.container}>
        {community && (
          <MetaTags
            title={`${community.owner?.name || "Community"} | NexFellow`}
            description={
              community.description ||
              `Join ${community.owner?.name} on NexFellow`
            }
            contentId={community._id}
            contentType="community"
            type="profile"
          />
        )}

        {/* Banner */}
        <div className={styles.bannerSection}>
          <div className={styles.bannerImgContainer}>
            <img
              src={community?.owner?.banner || "/default-banner.png"}
              alt="Community Banner"
              className={styles.bannerImage}
            />
          </div>
          {/* Profile image overlaps banner */}
          <div className={styles.profileImageWrapper}>
            <img
              src={community?.owner?.picture || "/default-profile.png"}
              alt="Profile"
              className={styles.profileImage}
            />
            {/* HF logo circle (optional, if you have it) */}
            {community?.logo && (
              <img
                src={community.logo}
                alt="Community Logo"
                className={styles.logoCircle}
              />
            )}
          </div>
        </div>

        {/* Main Card */}
        <div className={styles.profileCard}>
          <div className={styles.headerRow}>
            <div>
              <h2 className={styles.communityName}>
                {community?.owner?.name || "Community"}
              </h2>
              <span className={styles.username}>
                @{community?.owner?.username || "username"}
              </span>
            </div>
            <div className={styles.badges}>
              {isFeatured && (
                <span className={styles.featuredBadge}>Featured</span>
              )}
              {isVerified && (
                <span className={styles.verifiedBadge}>
                  Verified
                  <img
                    src={verificationBadge?.src || verificationBadge}
                    alt="Verification Badge"
                    className={styles.badge}
                  />
                </span>
              )}
            </div>
          </div>
          <p className={styles.description}>
            {community?.description || "No description available."}
          </p>

          {/* Stats */}
          <div className={styles.statsRow}>
            <div className={styles.statCard}>
              <div className={styles.statIconBox}>
                <FaUsers className={styles.statIcon} />
              </div>
              <div>
                <div className={styles.statLabel}>Members</div>
                <div className={styles.statValue}>
                  {formatNumber(community?.owner.followers.length || 0)}
                </div>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIconBox}>
                <FaFire className={styles.statIcon} style={{ color: "#ff3030" }} />
              </div>
              <div>
                <div className={styles.statLabel}>Reputation</div>
                <div className={styles.statValue}>
                  {loadingReputation ? (
                    <span>Loading...</span>
                  ) : (
                    <span> {Math.round(reputationScore || 0)}+ </span>
                  )}
                </div>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIconBox}>
                <FaCalendarAlt className={styles.statIcon} />
              </div>
              <div>
                <div className={styles.statLabel}>Events</div>
                <div className={styles.statValue}>
                  {formatNumber(community?.events.length || 0)}
                </div>
              </div>
            </div>
          </div>

          {/* View Community Button */}
          <button className={styles.viewCommunityButton} onClick={handleLogin}>
            View Community
          </button>

          {/* Login Prompt */}
          <div className={styles.loginPrompt}>
            {/* <span>
              Log in to follow this community and see more content!
            </span> */}
            <button className={styles.loginButton} onClick={handleLogin}>
              Log in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewOnlyExplore;
