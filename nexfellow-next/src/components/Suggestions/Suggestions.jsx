import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./Suggestions.module.css";
import Footerlink from "../FooterLink/Footerlink";

import fallbackTop from "./assets/Advertisement-1.png";
import fallbackBottom from "./assets/Advertisement-2.png";

import SuggestionCard from "./SuggestionCard";
import { Button } from "../ui/button";

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

const Suggestions = () => {
  const [expanded, setExpanded] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [topAds, setTopAds] = useState([]);
  const [bottomAds, setBottomAds] = useState([]);
  const [topIndex, setTopIndex] = useState(0);
  const [bottomIndex, setBottomIndex] = useState(0);

  // Fetch advertisements
  useEffect(() => {
    const fetchAds = async () => {
      try {
        console.log("Fetching advertisements...");

        const [topRes, bottomRes] = await Promise.all([
          axios.get("/advertisements/?position=top"),
          axios.get("/advertisements/?position=bottom"),
        ]);

        console.log("Top Ads Response:", topRes);
        console.log("Bottom Ads Response:", bottomRes);

        console.log("Top Ads Data:", topRes.data);
        console.log("Bottom Ads Data:", bottomRes.data);

        setTopAds(topRes.data || []);
        setBottomAds(bottomRes.data || []);
      } catch (err) {
        console.error("Failed to load advertisements", err);
      }
    };

    fetchAds();
  }, []);

  // Carousel logic
  useEffect(() => {
    const topTimer = setInterval(() => {
      setTopIndex((prev) => (prev + 1) % Math.max(topAds.length || 1, 1));
    }, 5000);

    const bottomTimer = setInterval(() => {
      setBottomIndex((prev) => (prev + 1) % Math.max(bottomAds.length || 1, 1));
    }, 5000);

    return () => {
      clearInterval(topTimer);
      clearInterval(bottomTimer);
    };
  }, [topAds.length, bottomAds.length]);

  // Fetch suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("user"));
        const userId = userData?.id || userData?._id;

        if (!userId) {
          setError("User ID is required.");
          setLoading(false);
          return;
        }

        const response = await axios.get(`/suggestions/?userId=${userId}`);
        setSuggestions(response.data);
        setLoading(false);
      } catch (error) {
        setError("Failed to load suggestions.");
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, []);

  const toggleShowMore = () => setExpanded(!expanded);

  return (
    <div className={styles.suggestions}>
      {/* Top and Bottom Banners */}
      <div className={styles.imgContainer}>
        <img
          className={styles.image}
          src={
            topAds.length > 0
              ? topAds[topIndex]?.imageUrl
              : fallbackTop
          }
          alt="Top Advertisement"
        />

        <img
          className={styles.image}
          src={
            bottomAds.length > 0
              ? bottomAds[bottomIndex]?.imageUrl
              : fallbackBottom
          }
          alt="Bottom Advertisement"
        />
      </div>

      {/* Suggestions List */}
      <div className={styles.suggestion}>
        <h3 className={styles.suggestionTitle}>Suggestions For You</h3>

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
            .slice(0, expanded ? suggestions.length : 3)
            .map((user) => <SuggestionCard key={user._id} user={user} />)
        )}

        {!loading && !error && (
          <Button
            className={styles.footer}
            onClick={toggleShowMore}
            variant="outline"
          >
            {expanded ? "Show Less" : "Show More"}
          </Button>
        )}
      </div>

      <Footerlink />
    </div>
  );
};

export default Suggestions;
