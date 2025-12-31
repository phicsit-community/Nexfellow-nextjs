"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import styles from "./JoinedCommunity.module.css";
import Post from "../Post/Post";
import CommunityCardSkeleton from "./CommunityCardSkeleton";
import CommunityBanner from "./assets/community_image.svg";
import axios from "axios";
import { IoArrowBack, IoArrowForward } from "react-icons/io5";

import CommunitySidebar from "./JoinedCommunitySidebar";
import BackButton from "../../components/BackButton/BackButton";
import PostSkeleton from "../Skeletons/SkeletonPost";
import {
  IoVolumeMuteOutline,
  IoEyeOffOutline,
  IoBanOutline,
} from "react-icons/io5";
import { AiOutlineExclamationCircle } from "react-icons/ai";

import ReportModal from "../../components/ReportModal/ReportModal";
import MuteUserModal from "../../components/MuteUserModal/MuteUserModal";
import BlockUserModal from "../../components/BlockUserModal/BlockUserModal";

const JoinedCommunityPage = ({ communityData }) => {
  console.log("Community Data:", communityData);

  const [post, setPost] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [error, setError] = useState(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1024);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [muteModalOpen, setMuteModalOpen] = useState(false);
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [mutedUsers, setMutedUsers] = useState([]);
  const [blockedUsers, setBlockedUsers] = useState([]);

  const router = useRouter();
  const scrollContainerRef = useRef(null);

  const handleBackButtonClick = () => {
    router.back();
  };

  const handleViewAllClick = () => {
    router.push("/community/all-communities");
  };

  const handleCardClick = (community) => {
    router.push(`/community/${community.owner?.username}`);
  };

  const scrollLeft = () => {
    scrollContainerRef.current.scrollBy({ left: -300, behavior: "smooth" });
  };

  const scrollRight = () => {
    scrollContainerRef.current.scrollBy({ left: 300, behavior: "smooth" });
  };

  const updateArrowsVisibility = () => {
    const container = scrollContainerRef.current;
    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(
      container.scrollWidth > container.clientWidth + container.scrollLeft
    );
  };

  useEffect(() => {
    const fetchPosts = async () => {
      setLoadingPosts(true);
      setError(null);

      try {
        // Fetch muted users first
        const mutedResponse = await axios.get("/user/muted-users");
        setMutedUsers(mutedResponse.data.mutedUsers || []);

        // Fetch blocked users
        const blockedResponse = await axios.get("/user/blocked-users");
        setBlockedUsers(blockedResponse.data.blockedUsers || []);

        // Then fetch posts
        const response = await axios.get("/post/");
        setPost(response.data.posts);
      } catch (err) {
        setError("Error fetching posts: " + err.message);
      } finally {
        setLoadingPosts(false);
      }
    };

    fetchPosts();

    // Simulate community data loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Update arrow visibility on scroll
    const handleScroll = () => {
      updateArrowsVisibility();
    };

    container.addEventListener("scroll", handleScroll);

    // Initial check for arrows
    updateArrowsVisibility();

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [loading]);

  const handleReportClick = (post) => {
    setSelectedPost(post);
    setReportModalOpen(true);
  };

  const handleMuteClick = (post) => {
    setSelectedUser(post.author);
    setMuteModalOpen(true);
  };

  const handleMuteModalClose = (wasMuted) => {
    setMuteModalOpen(false);
    // If user was muted, refresh the muted users list and filter posts
    if (wasMuted) {
      axios
        .get("/user/muted-users")
        .then((response) => {
          setMutedUsers(response.data.mutedUsers || []);
        })
        .catch((error) => {
          console.error("Error fetching muted users:", error);
        });
    }
  };

  const feedOptions = [
    {
      label: "Mute",
      icon: <IoVolumeMuteOutline />,
      action: (post) => {
        console.log("Muting user:", post.author.username);
        handleMuteClick(post);
      },
    },
    {
      label: "Hide",
      icon: <IoEyeOffOutline />,
      action: (post) => {
        console.log("Post hidden:", post._id);
        // Implement logic to hide post from the feed
      },
    },
    {
      label: "Block",
      icon: <IoBanOutline />,
      action: (post) => {
        console.log("Blocking user:", post.author.username);
        setSelectedUser(post.author);
        setBlockModalOpen(true);
      },
    },
    {
      label: "Report",
      icon: <AiOutlineExclamationCircle />,
      action: (post) => {
        console.log("Reporting post:", post._id);
        handleReportClick(post);
      },
    },
  ];

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Filter out posts from muted users and blocked users
  const filteredPosts = post.filter(
    (p) =>
      !mutedUsers.some((user) => user._id === p.author._id) &&
      !blockedUsers.some((user) => user._id === p.author._id)
  );

  return (
    <div className={styles.pageContainer}>
      <div className={styles.layoutContainer}>
        <div className={styles.mainContentContainer}>
          <div className={styles.backButtonContainer}>
            <div className={styles.backButton} onClick={handleBackButtonClick}>
              <div
                className="border rounded-lg hover:bg-accent text-sm w-fit"
                style={{ padding: "3px 10px" }}
              >
                <BackButton
                  onClick={() => router.back()}
                  showText={true}
                  smallText={true}
                />
              </div>
            </div>
          </div>
          <div className={styles.topSection}>
            <div className={styles.header}>
              <div className={styles.headerName}>
                <div
                  className={styles.backIconMobile}
                  onClick={handleBackButtonClick}
                >
                  <IoArrowBack />
                </div>
                <h1 className={styles.title}>Communities</h1>
              </div>
              <button
                className={styles.viewAllButton}
                onClick={handleViewAllClick}
              >
                View All
              </button>
            </div>

            <div className={styles.communityCardsWrapper}>
              {canScrollLeft && (
                <button
                  className={`${styles.scrollButton} ${styles.left}`}
                  onClick={scrollLeft}
                  aria-label="Scroll Left"
                >
                  <IoArrowBack />
                </button>
              )}

              <div className={styles.communityCards} ref={scrollContainerRef}>
                {loading ? (
                  <CommunityCardSkeleton count={5} />
                ) : communityData && communityData.length > 0 ? (
                  communityData.map((item) => {
                    const community = item.community;

                    return (
                      <div
                        key={community._id}
                        className={styles.card}
                        onClick={() => handleCardClick(community)}
                        style={{ cursor: "pointer" }}
                      >
                        <img
                          src={community.owner?.banner || CommunityBanner}
                          alt="Community Banner"
                          className={styles.cardImage}
                        />
                        <div className={styles.cardDetails}>
                          <h2 className={styles.communityName}>
                            {community.owner?.name || "Unnamed Community"}
                          </h2>
                          <p className={styles.communityOwner}>
                            @{community.owner?.username || "Unknown Owner"}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className={styles.noCommunitiesMessage}>
                    No communities found.
                  </div>
                )}
              </div>

              {canScrollRight && (
                <button
                  className={`${styles.scrollButton} ${styles.right}`}
                  onClick={scrollRight}
                  aria-label="Scroll Right"
                >
                  <IoArrowForward />
                </button>
              )}
            </div>
          </div>

          <div className={styles.feedSection}>
            {loadingPosts ? (
              <div className={styles.feedContainer}>
                <PostSkeleton />
              </div>
            ) : error ? (
              <p className={styles.errorBox}>{error}</p>
            ) : post.length > 0 ? (
              <div className={styles.feedContainer}>
                {filteredPosts.map((post) => (
                  <Post
                    key={post._id}
                    post={post}
                    options={feedOptions.map((option) => ({
                      label: option.label,
                      icon: option.icon,
                      action: () => option.action(post),
                    }))}
                  />
                ))}
              </div>
            ) : (
              <p>No posts found.</p>
            )}
          </div>
        </div>
        {windowWidth > 768 && <CommunitySidebar />}
      </div>
      {/* Report Modal */}
      {reportModalOpen && selectedPost && (
        <ReportModal
          isOpen={reportModalOpen}
          onClose={() => setReportModalOpen(false)}
          postId={selectedPost._id}
          authorId={selectedPost.author._id}
        />
      )}

      {/* Mute User Modal */}
      {muteModalOpen && selectedUser && (
        <MuteUserModal
          isOpen={muteModalOpen}
          onClose={handleMuteModalClose}
          user={selectedUser}
        />
      )}

      {/* Block User Modal */}
      {blockModalOpen && selectedUser && (
        <BlockUserModal
          isOpen={blockModalOpen}
          onClose={(wasBlocked) => {
            setBlockModalOpen(false);
            // If user was blocked, refresh the blocked users list and filter posts
            if (wasBlocked) {
              axios
                .get("/user/blocked-users")
                .then((response) => {
                  setBlockedUsers(response.data.blockedUsers || []);
                })
                .catch((error) => {
                  console.error("Error fetching blocked users:", error);
                });
            }
          }}
          user={selectedUser}
        />
      )}
    </div>
  );
};

export default JoinedCommunityPage;
