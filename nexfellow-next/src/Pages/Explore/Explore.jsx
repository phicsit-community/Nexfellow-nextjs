"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import Link from "next/link";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { debounce } from "lodash";
import countryCodeMap from "../../components/Constants/Country";
import { toast } from "sonner";
import styles from "./Explore.module.css";

// Assets
import CardBanner from "./assets/CardBanner.svg";
import ProfileImage from "./assets/profile.png";
import tr from "./assets/tr.svg";
import FireFlameImage from "./assets/fireFlame.png";

// Icons
import { IoIosArrowDown } from "react-icons/io";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { FiTag } from "react-icons/fi";
import { IoBanOutline, IoLockOpenOutline } from "react-icons/io5";
import { FaBookmark, FaRegBookmark } from "react-icons/fa6";
import { FaFire } from "react-icons/fa";

import exploreBannerDesktop from "./assets/explorebanner.svg";
import exploreBannerTablet from "./assets/explorebanner-tablet.svg";
import exploreBannerMobile from "./assets/explorebanner-mobile.svg";
import { motion, AnimatePresence } from "framer-motion";

const Explore = () => {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBannerVisible, setBannerVisible] = useState(false);
  const [page, setPage] = useState(1); // Pagination
  const [selectedCategories, setSelectedCategories] = useState([]);
  const bannerRef = useRef(null);
  const observerRef = useRef(null);
  const categoryRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [bookmarkedCommunities, setBookmarkedCommunities] = useState([]);

  const isMobile = typeof window !== "undefined" ? window.innerWidth <= 768 : false;
  const categoryOptions = [
    "All",
    "Trending",
    "Technology",
    "Business",
    "Finance",
    "Science",
    "Fiction",
    "Health & Wellness",
    "Design",
    "Education",
    "Personal Blog",
    "Web3",
    "Philosophy",
    "History",
    "Music",
  ];

  const fetchCommunities = useCallback(
    debounce(async () => {
      try {
        setLoading(true);
        const response = await axios.get("/community/");

        const communityDataWithReputation = await Promise.all(
          response.data.map(async (community) => {
            try {
              const repRes = await axios.get(
                `/analytics/${community._id}/reputation`
              );
              return {
                ...community,
                reputationScore: repRes.data.reputationScore || 0,
              };
            } catch (err) {
              console.error("Failed to fetch reputation for", community._id);
              return { ...community, reputationScore: 0 };
            }
          })
        );

        setCommunities((prev) => {
          const newData = communityDataWithReputation.filter(
            (newItem) =>
              !prev.some((existingItem) => existingItem._id === newItem._id)
          );
          return [...prev, ...newData];
        });

        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    }, 500),
    []
  );

  const countries = Object.entries(countryCodeMap).map(([name, code]) => ({
    name,
    code,
  }));

  const scrollLeft = () => {
    if (categoryRef.current) {
      categoryRef.current.scrollBy({ left: -150, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (categoryRef.current) {
      categoryRef.current.scrollBy({ left: 150, behavior: "smooth" });
    }
  };

  const checkScrollPosition = () => {
    if (categoryRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = categoryRef.current;

      const canScrollLeft = scrollLeft > 0;
      const canScrollRight = scrollLeft + clientWidth < scrollWidth - 1;

      setCanScrollLeft(canScrollLeft);
      setCanScrollRight(canScrollRight);

      categoryRef.current.style.setProperty(
        "--fade-left",
        canScrollLeft ? 0 : 1
      );
      categoryRef.current.style.setProperty(
        "--fade-right",
        canScrollRight ? 0 : 1
      );
    }
  };

  useEffect(() => {
    if (categoryRef.current) {
      checkScrollPosition(); // Initial state check
      categoryRef.current.addEventListener("scroll", checkScrollPosition);
    }

    return () => {
      if (categoryRef.current) {
        categoryRef.current.removeEventListener("scroll", checkScrollPosition);
      }
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setBannerVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (bannerRef.current) observer.observe(bannerRef.current);

    return () => observer.disconnect();
  }, []);

  const fetchAllTabCommunities = useCallback(
    debounce(async () => {
      try {
        setLoading(true);
        const response = await axios.get("/explore/all-communities");
        // Optionally fetch reputation for each community as before
        const communityDataWithReputation = await Promise.all(
          response.data.map(async (community) => {
            try {
              const repRes = await axios.get(
                `/analytics/${community._id}/reputation`
              );
              return {
                ...community,
                reputationScore: repRes.data.reputationScore || 0,
              };
            } catch (err) {
              console.error("Failed to fetch reputation for", community._id);
              return { ...community, reputationScore: 0 };
            }
          })
        );
        setCommunities(communityDataWithReputation);
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    }, 500),
    []
  );

  useEffect(() => {
    if (selectedCategories.length === 0 || selectedCategories.includes("All")) {
      fetchAllTabCommunities();
    } else {
      fetchCommunities(page);
    }
  }, [selectedCategories, page]);

  const filteredCommunities = (() => {
    if (selectedCategories.includes("Trending")) {
      return [...communities]
        .sort((a, b) => (b.reputationScore || 0) - (a.reputationScore || 0))
        .slice(0, 15);
    }

    if (selectedCategories.length === 0 || selectedCategories.includes("All")) {
      // Already ordered by admin, just show all
      return communities;
    }

    const filtered = communities.filter((community) =>
      community.category.some((cat) => selectedCategories.includes(cat))
    );

    return filtered.slice(0, 15);
  })();

  useEffect(() => {
    const fetchBookmarkedCommunities = async () => {
      try {
        const res = await axios.get("/bookmarks/user?itemType=Community");
        setBookmarkedCommunities(
          (res.data.bookmarks || []).map(
            (b) => b.bookmarkItem?._id || b.bookmarkItem
          )
        );
      } catch (err) {
        setBookmarkedCommunities([]);
      }
    };
    fetchBookmarkedCommunities();
  }, []);

  if (error) {
    return <div>Error loading communities: {error.message}</div>;
  }

  return (
    <div className={styles.exploreContainer}>
      <motion.div
        ref={bannerRef}
        className={styles.exploreBanner}
        initial={{ opacity: 0 }}
        animate={{ opacity: isBannerVisible ? 1 : 0 }}
        transition={{ duration: 0.5 }}
      >
        <img
          src={exploreBannerDesktop}
          alt="Explore Banner"
          className={styles.exploreBannerImage}
        />
      </motion.div>
      <div className={styles.exploreBody}>
        <div className={styles.categoryFilterWrapper}>
          <div style={{ position: "relative", top: "-17px" }}>
            <AnimatePresence>
              {canScrollLeft && !isMobile && (
                <motion.button
                  className={`${styles.scrollButton} h-full ${styles.left}`}
                  onClick={scrollLeft}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <IoIosArrowBack />
                </motion.button>
              )}
            </AnimatePresence>

            {canScrollLeft && (
              <motion.div
                className={styles.gradientOverlay}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: "100px",
                  pointerEvents: "none",
                  background:
                    "linear-gradient(90deg, rgba(0,0,0,0.1) 0%, rgba(255,255,255,0) 100%)",
                  zIndex: 2,
                }}
              />
            )}
          </div>

          <div className={styles.categoryFilterBar} ref={categoryRef}>
            {categoryOptions.map((category) => (
              <motion.button
                key={category}
                className={`${styles.categoryButton} ${selectedCategories.includes(category) ||
                  (category === "All" && selectedCategories.length === 0)
                  ? styles.selected
                  : ""
                  }`}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (category === "All") {
                    setSelectedCategories([]);
                  } else if (category === "Trending") {
                    setSelectedCategories(["Trending"]);
                  } else if (selectedCategories.includes(category)) {
                    setSelectedCategories(
                      selectedCategories.filter((c) => c !== category)
                    );
                  } else {
                    setSelectedCategories(
                      selectedCategories
                        .filter((c) => c !== "Trending")
                        .concat(category)
                    );
                  }
                }}
              >
                {category}
              </motion.button>
            ))}
          </div>

          <div style={{ position: "relative", top: "-17px" }}>
            <AnimatePresence>
              {canScrollRight && !isMobile && (
                <motion.button
                  className={`${styles.scrollButton} h-full ${styles.right}`}
                  onClick={scrollRight}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <IoIosArrowForward />
                </motion.button>
              )}
            </AnimatePresence>

            {canScrollRight && (
              <motion.div
                className={styles.gradientOverlay}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  position: "absolute",
                  right: 0,
                  top: 0,
                  bottom: 0,
                  width: "100px",
                  pointerEvents: "none",
                  background:
                    "linear-gradient(270deg, rgba(0,0,0,0.1) 0%, rgba(255,255,255,0) 100%)",
                  zIndex: 2,
                }}
              />
            )}
          </div>
        </div>
      </div>

      <motion.div
        className={styles.communityGrid}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, staggerChildren: 0.1 }}
      >
        {loading
          ? Array.from({ length: 6 }).map((_, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <ExploreCardSkeleton />
            </motion.div>
          ))
          : filteredCommunities.map((community, index) => (
            <motion.div
              key={community._id?.$oid || community._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <MemoizedExploreCard
                community={community}
                isBookmarked={bookmarkedCommunities.includes(community._id)}
              />
            </motion.div>
          ))}
      </motion.div>

      {!loading && communities.length === 0 && (
        <motion.div
          className={styles.noCommunities}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h3>Oops! No Communities Yet</h3>
          <p>
            It looks like there aren&apos;t any active communities at the
            moment. But don&apos;t worry—new ones will appear here as soon as
            they&apos;re created!
          </p>
          <p>
            Be a pioneer! Start your own community, connect with like-minded
            people, and lead the way. Who knows? Yours could be the next big
            thing!
          </p>
        </motion.div>
      )}
    </div>
  );
};

// Skeleton loading component for ExploreCard
const ExploreCardSkeleton = () => {
  return (
    <div className={`${styles.communityCardContainer} ${styles.shimmer}`}>
      <div className={styles.communityCard}>
        <div className={styles.communityImageContainer}>
          <Skeleton
            height={118}
            className={`${styles.communityImage} ${styles.shimmer} ${styles.communityCardBlackSkeleton}`}
            borderRadius={8}
          />
          <Skeleton
            height={40}
            width={40}
            className={`${styles.profileImage} ${styles.shimmer} ${styles.communityCardBlackSkeleton}`}
            style={{
              position: "absolute",
              left: "15px",
              bottom: "6%",
              borderRadius: "10px",
            }}
          />
        </div>

        <div>
          <Skeleton
            height={28}
            className={`${styles.shimmer} ${styles.communityCardBlackSkeleton}`}
          />
          {/* <Skeleton count={2} height={14} className={`${styles.shimmer}`} /> */}
        </div>
      </div>
      <div className={styles.communityFooter}>
        <Skeleton
          height={18}
          width={60}
          className={`${styles.shimmer} ${styles.communityCardBlackSkeleton}`}
          borderRadius={999}
        />
        <Skeleton
          height={18}
          width={80}
          className={`${styles.shimmer} ${styles.communityCardBlackSkeleton}`}
        />
        <Skeleton
          height={18}
          width={90}
          className={`${styles.shimmer} ${styles.communityCardBlackSkeleton}`}
        />
      </div>
    </div>
  );
};

export default Explore;

export const ExploreCard = ({
  community,
  reputationScore: propReputation,
  isBookmarked: initialBookmarked,
}) => {
  const [isBlocked, setIsBlocked] = useState(false);
  const [isUnblocking, setIsUnblocking] = useState(false);
  const ownerName = community.owner?.name || "Unknown Owner";
  const headerImage = community.owner?.banner || CardBanner;
  const profilePic = community.owner?.picture || ProfileImage;
  const tag = community.category.length > 0 ? community.category[0] : "No Tag";
  const membersCount = community.owner?.followers?.length || 0;
  const communityUsername = community.owner?.username;
  const communityLink = `/explore/${communityUsername}`;
  const communityOwnerId = community.owner?._id;
  const [reputationScore, setReputationScore] = useState(
    propReputation !== undefined
      ? propReputation
      : community.reputationScore || 0
  );
  const [loadingReputation, setLoadingReputation] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(
    initialBookmarked !== undefined ? initialBookmarked : false
  );
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [bookmarkChecked, setBookmarkChecked] = useState(false);

  useEffect(() => {
    // Check if this community is blocked
    const checkIfBlocked = async () => {
      try {
        const response = await axios.get("/user/blocked-users");
        const blockedUsers = response.data.blockedUsers || [];
        setIsBlocked(
          blockedUsers.some((user) => user._id === communityOwnerId)
        );
      } catch (error) {
        console.error("Failed to check if community is blocked:", error);
      }
    };

    if (communityOwnerId) {
      checkIfBlocked();
    }
  }, [communityOwnerId]);

  useEffect(() => {
    // Fetch reputation if not provided
    if (
      propReputation === undefined &&
      community.reputationScore === undefined
    ) {
      setLoadingReputation(true);
      axios
        .get(`/analytics/${community._id}/reputation`)
        .then((res) => {
          setReputationScore(res.data.reputationScore || 0);
        })
        .catch((err) => {
          console.error("Failed to fetch reputation for", community._id);
          setReputationScore(0);
        })
        .finally(() => setLoadingReputation(false));
    }
  }, [community._id, propReputation]);

  useEffect(() => {
    // Fetch bookmark state if not provided
    if (initialBookmarked === undefined && !bookmarkChecked) {
      setBookmarkChecked(true);
      axios
        .get(`/bookmarks/check/Community/${community._id}`)
        .then((res) => {
          setIsBookmarked(res.data.isBookmarked || false);
        })
        .catch((err) => {
          console.error("Failed to check bookmark for", community._id);
          setIsBookmarked(false);
        });
    }
  }, [community._id, initialBookmarked, bookmarkChecked]);

  const handleUnblock = async (e) => {
    e.preventDefault(); // Prevent navigating to the community page
    e.stopPropagation();

    if (!communityOwnerId) return;

    setIsUnblocking(true);
    try {
      await axios.post(`/user/unblock/${communityOwnerId}`);
      setIsBlocked(false);
      toast.success(`${ownerName} has been unblocked`);
    } catch (error) {
      console.error("Failed to unblock community:", error);
      toast.error("Failed to unblock community");
    } finally {
      setIsUnblocking(false);
    }
  };

  const displayDescription =
    community.description?.length > 60
      ? `${community.description.slice(0, 60)} ...`
      : community.description || "No description available.";

  const handleBookmark = async (e) => {
    e.stopPropagation();
    if (bookmarkLoading) return;
    setBookmarkLoading(true);
    try {
      if (!isBookmarked) {
        await axios.post(`/bookmarks/Community/${community._id}`);
        setIsBookmarked(true);
        toast.success("Community bookmarked!");
      } else {
        await axios.delete(`/bookmarks/Community/${community._id}`);
        setIsBookmarked(false);
        toast.info("Bookmark removed!");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        "Something went wrong. Please try again."
      );
    } finally {
      setBookmarkLoading(false);
    }
  };

  return (
    <Link
      href={isBlocked ? "#" : communityLink}
      className={styles.communityCardLink}
    >
      <div
        className={`${styles.communityCardContainer} communityCardContainer`}
      >
        <div className={styles.communityCard}>
          <div className={styles.communityImageContainer}>
            {headerImage ? (
              <img
                src={headerImage}
                alt="Community Banner"
                className={styles.communityImage}
                loading="lazy"
              />
            ) : (
              <Skeleton height={100} />
            )}
            {profilePic ? (
              <img
                src={profilePic}
                alt="Community Profile"
                className={styles.profileImage}
                loading="lazy"
              />
            ) : (
              <Skeleton circle height={50} width={50} />
            )}
          </div>

          <div className={styles.communityContent}>
            <div className={styles.communityHeader}>
              <h4 className={styles.communityName}>{ownerName}</h4>
              {/* <div
                className={styles.bookmarkIcon}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleBookmark(e);
                }}
                style={{ cursor: bookmarkLoading ? "not-allowed" : "pointer" }}
                title={isBookmarked ? "Remove Bookmark" : "Bookmark Community"}
              >
                {isBookmarked ? (
                  <FaBookmark size={18} color="#24b2b4" />
                ) : (
                  <FaRegBookmark size={18} color="#24b2b4" />
                )}
              </div> */}
            </div>
            <p className={styles.communityDescription}>{displayDescription}</p>
          </div>
        </div>
        <div className={styles.communityFooter}>
          <span className={styles.communityTag}>
            <FiTag /> {tag}
          </span>
          <div className={styles.popularity}>
            {/* <img
              src={FireFlameImage}
              alt="fireFlame"
              className={styles.fireFlameImage}
            /> */}
            <FaFire
              className={styles.fireFlameImage}
              style={{ color: "#ff3030" }}
            />

            <span>{Math.round(reputationScore)} Reputation</span>
          </div>
          <span className={styles.communityFollowers}>
            <img
              className={styles.followersIcon}
              src={tr}
              alt="Followers Icon"
              style={{ marginRight: "5px" }}
            />
            {membersCount} Members
          </span>
        </div>

        {isBlocked && (
          <div className={styles.blockedOverlay}>
            <div className={styles.blockedContent}>
              <IoBanOutline size={24} />
              <p>You have blocked this community</p>
              <button
                onClick={handleUnblock}
                disabled={isUnblocking}
                className={styles.unblockButton}
              >
                <IoLockOpenOutline size={16} />
                {isUnblocking ? "Unblocking..." : "Unblock to see content"}
              </button>
            </div>
          </div>
        )}
      </div>
    </Link>
  );
};

const MemoizedExploreCard = React.memo(ExploreCard);
