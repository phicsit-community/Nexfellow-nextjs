import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import api from "../../lib/axios";
import styles from "./Suggestions.module.css";
import Footerlink from "../FooterLink/Footerlink";

import fallbackTop from "./assets/Advertisement-1.png";

import SuggestionCard from "./SuggestionCard";
import { Button } from "../ui/button";
import SearchCommand from "../SearchBar/search-command";
import ProfileDropdown from "../ProfileDropdown/ProfileDropdown";

// Skeleton loading component
const SkeletonCard = () => (
  <div className={styles.skeletonCard}>
    <div className={styles.skeletonLeft}>
      <div className={`${styles.skeletonAvatar} ${styles.shimmer}`}></div>
      <div className={styles.skeletonInfo}>
        <div className={`${styles.skeletonName} ${styles.shimmer}`}></div>
        <div className={`${styles.skeletonUsername} ${styles.shimmer}`}></div>
      </div>
    </div>
    <div className={styles.skeletonRight}>
      <div className={`${styles.skeletonButton} ${styles.shimmer}`}></div>
    </div>
  </div>
);

// Community Card component
const CommunityCard = ({ community }) => (
  <div className={styles.communityCard}>
    <div className={styles.communityInfo}>
      <span className={styles.communityName}>{community.name}</span>
      <span className={styles.communityFollowers}>
        {community.followersCount?.toLocaleString() || 0} Followers
      </span>
    </div>
    <Button className={styles.followBtn} size="sm">
      Follow
    </Button>
  </div>
);

const Suggestions = ({ hideSearch = false }) => {
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const user = useSelector((state) => state.auth.user);
  const [expandedMembers, setExpandedMembers] = useState(false);
  const [expandedCommunities, setExpandedCommunities] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingCommunities, setLoadingCommunities] = useState(true);
  const [error, setError] = useState(null);

  const [topAds, setTopAds] = useState([]);
  const [topIndex, setTopIndex] = useState(0);

  // Fetch advertisements
  useEffect(() => {
    const fetchAds = async () => {
      try {
        const topRes = await api.get("/advertisements/?position=top");
        setTopAds(topRes.data || []);
      } catch (err) {
        console.error("Failed to load advertisements", err);
      }
    };

    fetchAds();
  }, []);

  // Carousel logic for single ad
  useEffect(() => {
    const topTimer = setInterval(() => {
      setTopIndex((prev) => (prev + 1) % Math.max(topAds.length || 1, 1));
    }, 5000);

    return () => {
      clearInterval(topTimer);
    };
  }, [topAds.length]);

  // Fetch popular communities
  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const response = await api.get("/explore/all-communities");
        setCommunities(response.data?.communities || response.data || []);
        setLoadingCommunities(false);
      } catch (error) {
        console.error("Failed to load popular communities:", error);
        setLoadingCommunities(false);
      }
    };

    fetchCommunities();
  }, []);

  // Fetch suggestions (top members)
  useEffect(() => {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }

    const fetchSuggestions = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("user"));
        const userId = userData?.id || userData?._id;

        if (!userId) {
          setError("User ID is required.");
          setLoading(false);
          return;
        }

        const response = await api.get(`/suggestions/?userId=${userId}`);
        setSuggestions(response.data);
        setLoading(false);
      } catch (error) {
        setError("Failed to load suggestions.");
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, [isLoggedIn]);

  const toggleShowMoreMembers = () => setExpandedMembers(!expandedMembers);
  const toggleShowMoreCommunities = () => setExpandedCommunities(!expandedCommunities);

  return (
    <div className={styles.suggestions}>
      {/* Search Bar and Profile Dropdown at Top */}
      {!hideSearch && (
        <div className={styles.searchContainer}>
          <SearchCommand />
          <ProfileDropdown />
        </div>
      )}

      {/* Single Advertisement Banner */}
      <div className={styles.imgContainer}>
        <img
          className={styles.image}
          src={
            topAds.length > 0
              ? topAds[topIndex]?.imageUrl
              : (fallbackTop.src || fallbackTop)
          }
          alt="Advertisement"
        />
      </div>

      {/* Popular Communities Section */}
      <div className={styles.suggestion}>
        <h3 className={styles.suggestionTitle}>Popular Communities</h3>

        {loadingCommunities ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : communities.length === 0 ? (
          <p className={styles.noData}>No communities found</p>
        ) : (
          communities
            .slice(0, expandedCommunities ? communities.length : 3)
            .map((community) => (
              <CommunityCard key={community._id} community={community} />
            ))
        )}

        {!loadingCommunities && communities.length > 3 && (
          <Button
            className={styles.footer}
            onClick={toggleShowMoreCommunities}
            variant="outline"
          >
            {expandedCommunities ? "Show Less" : "Show More"}
          </Button>
        )}
      </div>

      {/* Top Members Section */}
      <div className={styles.suggestion}>
        <h3 className={styles.suggestionTitle}>Top Members</h3>

        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : error ? (
          <p className={styles.error}>{error}</p>
        ) : (
          suggestions
            .slice(0, expandedMembers ? suggestions.length : 3)
            .map((user) => <SuggestionCard key={user._id} user={user} />)
        )}

        {!loading && !error && suggestions.length > 3 && (
          <Button
            className={styles.footer}
            onClick={toggleShowMoreMembers}
            variant="outline"
          >
            {expandedMembers ? "Show Less" : "Show More"}
          </Button>
        )}
      </div>

      <Footerlink />
    </div>
  );
};

export default Suggestions;
