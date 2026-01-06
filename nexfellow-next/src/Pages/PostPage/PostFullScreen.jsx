"use client";

/* eslint-disable react/no-unknown-property */
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import {
  PiHeartStraightDuotone,
  PiHeartStraightFill,
  PiChatCircleDuotone,
  PiShareNetworkDuotone,
  PiBookmarkSimpleDuotone,
  PiBookmarkSimpleFill,
} from "react-icons/pi";
import api from "../../lib/axios";
import Comment from "../../components/Post/Comment";
import styles from "./PostFullScreen.module.css";
import VERIFY from "./assets/Verify.svg";
import communityBadge from "./assets/badge3.svg";
import BackButton from "../../components/BackButton/BackButton";
import { BsThreeDotsVertical } from "react-icons/bs";
import ShareIcon from "../../components/ShareIcon/ShareIcon";
import {
  IoBanOutline,
  IoLockOpenOutline,
  IoEyeOffOutline,
  IoVolumeMuteOutline,
} from "react-icons/io5";
import { AiOutlineExclamationCircle } from "react-icons/ai";
import HidePostModal from "../../components/Modals/HidePostModal";
import ReportModal from "../../components/ReportModal/ReportModal";
import MuteUserModal from "../../components/MuteUserModal/MuteUserModal";
import BlockUserModal from "../../components/BlockUserModal/BlockUserModal";
import { toast } from "sonner";
import { useSwipeable } from "react-swipeable";
import { Bookmark, Heart, MessageCircle } from "lucide-react";

const PostFullScreen = () => {
  const params = useParams();
  const postId = params?.postId;
  const router = useRouter();
  const [post, setPost] = useState(null);
  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [animateLike, setAnimateLike] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shareCount, setShareCount] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isUnblocking, setIsUnblocking] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [hidePostModalOpen, setHidePostModalOpen] = useState(false);
  const [optionsMenuOpen, setOptionsMenuOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [muteModalOpen, setMuteModalOpen] = useState(false);
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [carouselHovered, setCarouselHovered] = useState(false);

  useEffect(() => {
    async function fetchPost() {
      try {
        const res = await api.get(`/post/${postId}`);
        const post = res.data.post;
        setPost(post);
        setLikeCount(post.likeCount);
        setShareCount(post.shares);
        checkIfLiked(post._id);
        checkIfHidden(post._id);

        // Check if the post author is blocked
        if (post.author && post.author._id) {
          const blockedResponse = await api.get("/user/blocked-users");
          const blockedUsers = blockedResponse.data.blockedUsers || [];
          const isAuthorBlocked = blockedUsers.some(
            (user) => user._id === post.author._id
          );
          setIsBlocked(isAuthorBlocked);
        }
      } catch (error) {
        console.error("Error fetching post:", error);
      } finally {
        setLoading(false); // ✅ Ensure loading stops even if there's an error
      }
    }

    async function checkIfLiked(postId) {
      if (!postId) return;
      try {
        const res = await api.get(`/like/checkIfPostLiked/${postId}`);
        setIsLiked(res.data.Switch);
      } catch (error) {
        console.error("Error checking if liked:", error);
      }
    }

    async function checkIfHidden(postId) {
      if (!postId) return;
      try {
        const res = await api.get(`/user/is-post-hidden/${postId}`);
        setIsHidden(res.data.isHidden);
      } catch (error) {
        console.error("Error checking if post is hidden:", error);
      }
    }

    fetchPost();
  }, [postId]);

  const handleShareIncrement = async () => {
    try {
      const response = await api.patch(`/post/increment-shares/${post._id}`);
      setShareCount(response.data.count);
      console.log(response.data.message);
    } catch (error) {
      console.error("Share failed", error);
    }
  };

  const formatDateToAbbreviation = (date) => {
    try {
      if (!(date instanceof Date) || isNaN(date.getTime())) {
        throw new Error("Invalid date provided");
      }

      const distance = formatDistanceToNow(date, { addSuffix: false });

      if (distance.startsWith("less than a minute")) {
        return "now";
      }

      const unitAbbreviationMap = {
        seconds: "s",
        second: "s",
        minutes: "m",
        minute: "m",
        hours: "h",
        hour: "h",
        days: "d",
        day: "d",
        weeks: "w",
        week: "w",
        months: "mo",
        month: "mo",
        years: "y",
        year: "y",
      };

      const parts = distance.split(" ");
      const value = parts.length === 3 ? parts[1] : parts[0];
      const unit = parts.length === 3 ? parts[2] : parts[1];

      if (!value || !unit || isNaN(value)) {
        throw new Error("Unexpected distance format");
      }

      const abbreviatedUnit = unitAbbreviationMap[unit.toLowerCase()] || unit;

      return `${value}${abbreviatedUnit}`;
    } catch (error) {
      console.error("Error formatting date:", error.message);
      return "unknown";
    }
  };

  const handleLike = async () => {
    if (isLiked) return;

    setIsLiked(true);
    setLikeCount((prev) => prev + 1);
    setAnimateLike(true);
    setTimeout(() => setAnimateLike(false), 500);

    try {
      await api.post(`/like/posts/${post._id}`);
    } catch (error) {
      setIsLiked(false);
      setLikeCount((prev) => prev - 1);
      console.error("Like failed", error);
    }
  };

  const handleUnlike = async () => {
    if (!isLiked) return;

    setIsLiked(false);
    setLikeCount((prev) => prev - 1);
    setAnimateLike(true);
    setTimeout(() => setAnimateLike(false), 500);

    try {
      await api.delete(`/like/posts/${post._id}`);
    } catch (error) {
      setIsLiked(true);
      setLikeCount((prev) => prev + 1);
      console.error("Unlike failed", error);
    }
  };

  useEffect(() => {
    const fetchBookmarkStatus = async () => {
      try {
        const res = await api.get("/bookmarks/user?itemType=Post");
        const found = Array.isArray(res.data.bookmarks)
          ? res.data.bookmarks.some(
            (bm) =>
              bm.bookmarkItem &&
              (bm.bookmarkItem._id === postId ||
                bm.bookmarkItem.id === postId)
          )
          : false;
        setBookmarked(found);
      } catch (error) {
        console.error("Error fetching bookmark status:", error);
        toast.error("Failed to fetch bookmark status. Please try again.");
      }
    };
    fetchBookmarkStatus();
  }, [postId]);

  const handleBookmark = async () => {
    if (bookmarkLoading) return;
    setBookmarkLoading(true);
    try {
      if (!bookmarked) {
        await api.post(`/bookmarks/Post/${post._id}`);
        setBookmarked(true);
        toast.success("Post bookmarked!");
      } else {
        await api.delete(`/bookmarks/Post/${post._id}`);
        setBookmarked(false);
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

  const handleUnblock = async () => {
    if (!post?.author?._id) return;

    setIsUnblocking(true);
    try {
      await api.post(`/user/unblock/${post.author._id}`);
      setIsBlocked(false);
      toast.success(`${post.author.name} has been unblocked`);
    } catch (error) {
      console.error("Failed to unblock user:", error);
      toast.error("Failed to unblock user");
    } finally {
      setIsUnblocking(false);
    }
  };

  const handleHidePost = async () => {
    try {
      await api.post(`/user/hide-post/${post._id}`);
      setIsHidden(true);
      toast.success("Post hidden successfully");
      // Navigate back after hiding
      setTimeout(() => router.push("/feed"), 1000);
    } catch (error) {
      console.error("Error hiding post:", error);
      toast.error("Failed to hide post");
    } finally {
      setHidePostModalOpen(false);
    }
  };

  const handleUnhidePost = async () => {
    try {
      await api.post(`/user/unhide-post/${post._id}`);
      setIsHidden(false);
      toast.success("Post unhidden successfully");
    } catch (error) {
      console.error("Error unhiding post:", error);
      toast.error("Failed to unhide post");
    }
  };

  const handleMuteUser = async () => {
    setOptionsMenuOpen(false);
    setMuteModalOpen(true);
  };

  const handleBlockUser = async () => {
    setOptionsMenuOpen(false);
    setBlockModalOpen(true);
  };

  const handleReportPost = async () => {
    setOptionsMenuOpen(false);
    setReportModalOpen(true);
  };

  const handleMuteModalClose = (wasMuted) => {
    setMuteModalOpen(false);
    if (wasMuted) {
      toast.success(`${post.author.name} has been muted`);
      router.push("/feed");
    }
  };

  const handleBlockModalClose = (wasBlocked) => {
    setBlockModalOpen(false);
    if (wasBlocked) {
      toast.success(`${post.author.name} has been blocked`);
      router.push("/feed");
    }
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? post.attachments.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === post.attachments.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handlers = useSwipeable({
    onSwipedLeft: handleNext,
    onSwipedRight: handlePrev,
    trackMouse: true,
  });

  const toggleOptionsMenu = () => {
    setOptionsMenuOpen(!optionsMenuOpen);
  };

  const renderOptionsMenu = () => {
    if (!optionsMenuOpen) return null;

    return (
      <div className={styles.optionsMenu}>
        <button
          className={styles.optionItem}
          onClick={() => {
            setOptionsMenuOpen(false);
            setHidePostModalOpen(true);
          }}
        >
          <IoEyeOffOutline />
          <span>{isHidden ? "Unhide this post" : "Hide this post"}</span>
        </button>
        <button className={styles.optionItem} onClick={handleMuteUser}>
          <IoVolumeMuteOutline />
          <span>Mute {post?.author?.name}</span>
        </button>
        <button className={styles.optionItem} onClick={handleBlockUser}>
          <IoBanOutline />
          <span>Block {post?.author?.name}</span>
        </button>
        <button className={styles.optionItem} onClick={handleReportPost}>
          <AiOutlineExclamationCircle />
          <span>Report post</span>
        </button>
      </div>
    );
  };

  const [isReadMore, setIsReadMore] = useState(true);

  const toggleReadMore = () => {
    setIsReadMore(!isReadMore);
  };

  const renderPostWithImageSkeleton = () => (
    <div className={styles.skeletonContainer}>
      <div className={`${styles.skeletonLeftSection}`}>
        <div className={styles.skeletonHeader}>
          <div className={`${styles.skeletonBackBtn} ${styles.skeleton}`}></div>
          <div className={`${styles.skeletonMoreBtn} ${styles.skeleton}`}></div>
        </div>

        <div className={`${styles.skeletonImage} ${styles.skeleton}`}></div>

        <div className={styles.skeletonFooter}>
          <div className={`${styles.skeletonIcon} ${styles.skeleton}`}></div>
          <div className={`${styles.skeletonIcon} ${styles.skeleton}`}></div>
          <div className={`${styles.skeletonIcon} ${styles.skeleton}`}></div>
          <div className={`${styles.skeletonIcon} ${styles.skeleton}`}></div>
        </div>
      </div>

      <div className={styles.skeletonRightSection}>
        <div className={styles.skeletonAuthor}>
          <div
            className={`${styles.skeletonProfilePic} ${styles.skeleton}`}
          ></div>
          <div className={styles.skeletonInfo}>
            <div className={`${styles.skeletonName} ${styles.skeleton}`}></div>
            <div
              className={`${styles.skeletonUsername} ${styles.skeleton}`}
            ></div>
          </div>
        </div>

        <div className={`${styles.skeletonContent} ${styles.skeleton}`}></div>

        <div className={styles.skeletonComments}>
          {[1, 2, 3].map((item) => (
            <div className={styles.skeletonComment} key={item}>
              <div
                className={`${styles.skeletonProfilePic} ${styles.skeleton}`}
              ></div>
              <div
                className={`${styles.skeletonCommentContent} ${styles.skeleton}`}
              ></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTextOnlySkeleton = () => (
    <div className={styles.skeletonTextOnly}>
      <div className={`${styles.skeletonBackBtn} ${styles.skeleton}`}></div>

      <div className={styles.skeletonAuthor}>
        <div
          className={`${styles.skeletonProfilePic} ${styles.skeleton}`}
        ></div>
        <div className={styles.skeletonInfo}>
          <div className={`${styles.skeletonName} ${styles.skeleton}`}></div>
          <div
            className={`${styles.skeletonUsername} ${styles.skeleton}`}
          ></div>
        </div>
        <div className={`${styles.skeletonIcon} ${styles.skeleton}`}></div>
      </div>

      <div className={`${styles.skeletonContent} ${styles.skeleton}`}></div>

      <div className={styles.skeletonFooter}>
        <div className={`${styles.skeletonIcon} ${styles.skeleton}`}></div>
        <div className={`${styles.skeletonIcon} ${styles.skeleton}`}></div>
        <div className={`${styles.skeletonIcon} ${styles.skeleton}`}></div>
        <div className={`${styles.skeletonIcon} ${styles.skeleton}`}></div>
      </div>

      {[1, 2, 3].map((item) => (
        <div className={styles.skeletonComment} key={item}>
          <div
            className={`${styles.skeletonProfilePic} ${styles.skeleton}`}
          ></div>
          <div
            className={`${styles.skeletonCommentContent} ${styles.skeleton}`}
          ></div>
        </div>
      ))}
    </div>
  );

  // If post is hidden, show a message with option to unhide
  if (isHidden && !loading && post) {
    return (
      <div className={styles.hiddenPostContainer}>
        <div className={styles.hiddenPostMessage}>
          <IoEyeOffOutline size={32} />
          <h2>This post is hidden</h2>
          <p>You&apos;ve chosen to hide this post from your feed.</p>
          <button className={styles.unhideButton} onClick={handleUnhidePost}>
            Unhide this post
          </button>
          <button
            className={styles.backButton}
            onClick={() => router.push("/feed")}
          >
            Back to feed
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          width: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "8px",
          }}
        >
          <span
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              backgroundColor: "#3498db",
              display: "inline-block",
              animation: "dotPulse 1.4s infinite ease-in-out",
              animationDelay: "0s",
            }}
          ></span>
          <span
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              backgroundColor: "#3498db",
              display: "inline-block",
              animation: "dotPulse 1.4s infinite ease-in-out",
              animationDelay: "0.2s",
            }}
          ></span>
          <span
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              backgroundColor: "#3498db",
              display: "inline-block",
              animation: "dotPulse 1.4s infinite ease-in-out",
              animationDelay: "0.4s",
            }}
          ></span>
        </div>
        <style jsx>{`
          @keyframes dotPulse {
            0%,
            80%,
            100% {
              transform: scale(0);
              opacity: 0.5;
            }
            40% {
              transform: scale(1);
              opacity: 1;
            }
          }
        `}</style>
      </div>
    );
  }

  if (!post) return <div>Post not found.</div>;

  return (
    <div className={styles.container}>
      {post?.attachments?.length > 0 ? (
        // 🖼️ Regular layout (image-based)
        <>
          <div className={styles.leftSection}>
            <div className={styles.leftContainer}>
              <div className={styles.header}>
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
                <div className="relative">
                  <button
                    className={`${styles.moreButton}`}
                    onClick={toggleOptionsMenu}
                  >
                    <BsThreeDotsVertical />
                  </button>
                  {renderOptionsMenu()}
                </div>
              </div>

              <div
                {...handlers}
                className={styles.carouselContainer}
                onMouseEnter={() => setCarouselHovered(true)}
                onMouseLeave={() => setCarouselHovered(false)}
              >
                <div className={styles.carouselImageWrapper}>
                  <img
                    src={post.attachments[currentIndex].fileUrl}
                    alt={`Post image ${currentIndex + 1}`}
                    className={styles.carouselImage}
                    loading="lazy"
                    draggable={false}
                  />
                  {post.attachments.length > 1 && (
                    <>
                      <button
                        className={`${styles.carouselArrow} ${styles.leftArrow
                          } ${carouselHovered ? styles.visible : ""}`}
                        onClick={handlePrev}
                        aria-label="Previous image"
                        tabIndex={-1}
                      >
                        {/* SVG chevron left */}
                        <svg
                          width="32"
                          height="32"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <circle
                            cx="12"
                            cy="12"
                            r="12"
                            fill="white"
                            opacity="0.85"
                          />
                          <path
                            d="M14.5 17L10.5 12L14.5 7"
                            stroke="#222"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                      <button
                        className={`${styles.carouselArrow} ${styles.rightArrow
                          } ${carouselHovered ? styles.visible : ""}`}
                        onClick={handleNext}
                        aria-label="Next image"
                        tabIndex={-1}
                      >
                        {/* SVG chevron right */}
                        <svg
                          width="32"
                          height="32"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <circle
                            cx="12"
                            cy="12"
                            r="12"
                            fill="white"
                            opacity="0.85"
                          />
                          <path
                            d="M9.5 7L13.5 12L9.5 17"
                            stroke="#222"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </>
                  )}
                  {post.attachments.length > 1 && (
                    <div className={styles.carouselIndicators}>
                      {post.attachments.map((_, idx) => (
                        <span
                          key={idx}
                          className={
                            idx === currentIndex
                              ? styles.carouselDotActive
                              : styles.carouselDot
                          }
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentIndex(idx);
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.footer}>
                <div
                  onClick={isLiked ? handleUnlike : handleLike}
                  className={styles.iconContainer}
                >
                  <Heart
                    className={`${styles.icon} ${isLiked ? styles.liked : ""}`}
                  />
                  <span>{likeCount}</span>
                </div>
                <div className={styles.iconContainer}>
                  <MessageCircle className={styles.icon} />
                  <span>{post?.comments?.length}</span>
                </div>
                <ShareIcon
                  url={`${window.location.origin}/post/${post._id}`}
                  shareCount={shareCount}
                  incrementShareCount={handleShareIncrement}
                  position="top"
                />
                <div className={styles.iconContainer}>
                  <Bookmark className={styles.icon} />
                </div>
              </div>
            </div>
          </div>

          <div className={styles.rightSection}>
            {/* Author Info */}
            <div className={styles.postContentContainer}>
              <div className={styles.postHeader}>
                <div className={styles.left}>
                  <div className={styles.imgContainer}>
                    <img
                      src={
                        post.author.picture || "/src/assets/default-profile.jpg"
                      }
                      alt="profile"
                      className={styles.profilePic}
                      loading="lazy"
                    />
                  </div>
                  <div className={styles.headerContent}>
                    <div className={styles.postedBy}>
                      <div className={styles.info}>
                        <div className={styles.author}>
                          <div
                            className={styles.name}
                            onClick={() =>
                              router.push(`/explore/${post.author.username}`)
                            }
                          >
                            {post.author.name}
                            {post.author.isCommunityAccount &&
                              post.author.createdCommunity ? (
                              post.community?.accountType === "Organization" ? (
                                <img
                                  src={communityBadge?.src || communityBadge}
                                  alt="Community Badge"
                                  className={styles.badge}
                                />
                              ) : (
                                <img
                                  src={VERIFY?.src || VERIFY}
                                  alt="Verification Badge"
                                  className={styles.badge}
                                />
                              )
                            ) : (
                              post.author.verificationBadge && (
                                <img
                                  src={VERIFY?.src || VERIFY}
                                  alt="Verification Badge"
                                  className={styles.verified}
                                />
                              )
                            )}
                          </div>
                          <div className={styles.time}>
                            <span>·</span>
                            <p>
                              {formatDateToAbbreviation(
                                new Date(post.createdAt)
                              )}
                            </p>
                          </div>
                        </div>
                        <div className={styles.username}>
                          @{post.author.username}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className={`${styles.postContent} whitespace-pre-wrap cursor-default tracking-wide`}
              >
                {post.content && post.content.length > 140 ? (
                  isReadMore ? (
                    <>
                      {(() => {
                        // First split content into parts (text and links)
                        const parts = (post.content || "").split(
                          /\b(https?:\/\/\S+)/g
                        );

                        // Get the first 140 characters, making sure to not cut in the middle of a link
                        let charCount = 0;
                        const truncatedParts = [];

                        for (let i = 0; i < parts.length; i++) {
                          const part = parts[i];
                          // If adding this part exceeds our limit and it's not a link
                          if (
                            charCount + part.length > 137 &&
                            !part.match(/^https?:\/\//)
                          ) {
                            // Add truncated text part
                            truncatedParts.push(
                              part.substring(0, 137 - charCount) + "..."
                            );
                            break;
                          } else {
                            // Add the whole part (text or link)
                            truncatedParts.push(part);
                            charCount += part.length;
                            if (charCount >= 137) break;
                          }
                        }

                        const displayContent = truncatedParts.join("");
                        // Now render with the properly truncated content
                        const remainingChars = 137 - displayContent.length;
                        return displayContent
                          .split(/\b(https?:\/\/\S+)/g)
                          .map((part, index) =>
                            part.match(/^https?:\/\//) ? (
                              <a
                                key={index}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => {
                                  e.stopPropagation(); // Stop event propagation to prevent opening fullscreen
                                  window.open(part, "_blank");
                                }}
                                className="font-medium cursor-pointer"
                                style={{ color: "#3355cc" }}
                              >
                                {part.length > Math.max(10, remainingChars)
                                  ? part.substring(
                                    0,
                                    Math.max(10, remainingChars)
                                  ) + "..."
                                  : part}
                              </a>
                            ) : (
                              part
                            )
                          );
                      })()}
                      <span
                        onClick={toggleReadMore}
                        className={`cursor-pointer ${styles.readOrHide}`}
                      >
                        read more
                      </span>
                    </>
                  ) : (
                    <>
                      {post.content
                        .split(/\b(https?:\/\/\S+)/g)
                        .map((part, index) =>
                          part.match(/^https?:\/\//) ? (
                            <a
                              key={index}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(part, "_blank");
                              }}
                              className="font-medium cursor-pointer"
                              style={{ color: "#3355cc" }}
                            >
                              {part}
                            </a>
                          ) : (
                            part
                          )
                        )}
                      <p
                        onClick={toggleReadMore}
                        className={`cursor-pointer ${styles.readOrHide}`}
                      >
                        show less
                      </p>
                    </>
                  )
                ) : (
                  <>
                    {/* For short content, just display it without read more/less */}
                    {post.content
                      .split(/\b(https?:\/\/\S+)/g)
                      .map((part, index) =>
                        part.match(/^https?:\/\//) ? (
                          <a
                            key={index}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(part, "_blank");
                            }}
                            className="font-medium cursor-pointer"
                            style={{ color: "#3355cc" }}
                          >
                            {part}
                          </a>
                        ) : (
                          part
                        )
                      )}
                  </>
                )}
              </div>
            </div>

            {/* Comments */}
            <Comment
              className={styles.commentSection}
              commentsData={post?.comments}
              postId={post?._id}
              author={post?.author}
            />
          </div>
        </>
      ) : (
        // 📝 Centered layout (text-only post)
        <div className={styles.textOnlyContainer}>
          <div
            className="flex items-center justify-between"
            style={{ width: "100%" }}
          >
            <div className={styles.backButtonRow}>
              <div
                className="border rounded-lg hover:bg-accent text-sm w-fit"
                style={{ padding: "3px 10px" }}
              >
                <BackButton
                  onClick={() => router.back()}
                  showText={true}
                  smallText={true}
                />
              </div>            </div>
            <div className={styles.optionsContainer}>
              <button className={styles.moreButton} onClick={toggleOptionsMenu}>
                <BsThreeDotsVertical />
              </button>
              {renderOptionsMenu()}
            </div>
          </div>
          <div className={styles.authorInfoTOC}>
            <img
              src={post.author.picture || "/src/assets/default-profile.jpg"}
              alt="profile"
              className={styles.profilePic}
              loading="lazy"
            />
            <div className={styles.authorDetails}>
              <div
                className={styles.name}
                onClick={() => router.push(`/explore/${post.author.username}`)}
              >
                {post.author.name}
                {post.author.isCommunityAccount &&
                  post.author.createdCommunity ? (
                  post.community?.accountType === "Organization" ? (
                    <img
                      src={communityBadge?.src || communityBadge}
                      alt="Community Badge"
                      className={styles.badge}
                    />
                  ) : (
                    <img
                      src={VERIFY?.src || VERIFY}
                      alt="Verification Badge"
                      className={styles.badge}
                    />
                  )
                ) : (
                  post.author.verificationBadge && (
                    <img
                      src={VERIFY?.src || VERIFY}
                      alt="Verification Badge"
                      className={styles.verified}
                    />
                  )
                )}
              </div>
              <div className={styles.username}>@{post.author.username}</div>
            </div>
            <div className={styles.time}>
              {formatDateToAbbreviation(new Date(post.createdAt))}
            </div>
          </div>{" "}
          <div className={styles.textOnlyContent}>
            {post.content && post.content.length > 150 ? (
              isReadMore ? (
                <>
                  {(() => {
                    // First split content into parts (text and links)
                    const parts = (post.content || "").split(
                      /\b(https?:\/\/\S+)/g
                    );

                    // Get the first 150 characters, making sure to not cut in the middle of a link
                    let charCount = 0;
                    const truncatedParts = [];

                    for (let i = 0; i < parts.length; i++) {
                      const part = parts[i];
                      // If adding this part exceeds our limit and it's not a link
                      if (
                        charCount + part.length > 147 &&
                        !part.match(/^https?:\/\//)
                      ) {
                        // Add truncated text part
                        truncatedParts.push(
                          part.substring(0, 147 - charCount) + "..."
                        );
                        break;
                      } else {
                        // Add the whole part (text or link)
                        truncatedParts.push(part);
                        charCount += part.length;
                        if (charCount >= 147) break;
                      }
                    }

                    const displayContent = truncatedParts.join("");
                    // Now render with the properly truncated content
                    const remainingChars = 147 - displayContent.length;
                    return displayContent
                      .split(/\b(https?:\/\/\S+)/g)
                      .map((part, index) =>
                        part.match(/^https?:\/\//) ? (
                          <a
                            key={index}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => {
                              e.stopPropagation(); // Stop event propagation to prevent opening fullscreen
                              window.open(part, "_blank");
                            }}
                            className="font-medium cursor-pointer"
                            style={{ color: "#3355cc" }}
                          >
                            {part.length > Math.max(10, remainingChars)
                              ? part.substring(
                                0,
                                Math.max(10, remainingChars)
                              ) + "..."
                              : part}
                          </a>
                        ) : (
                          part
                        )
                      );
                  })()}
                  <span onClick={toggleReadMore} className={styles.readOrHide}>
                    read more
                  </span>
                </>
              ) : (
                <>
                  {post.content
                    .split(/\b(https?:\/\/\S+)/g)
                    .map((part, index) =>
                      part.match(/^https?:\/\//) ? (
                        <a
                          key={index}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(part, "_blank");
                          }}
                          className="font-medium cursor-pointer"
                          style={{ color: "#3355cc" }}
                        >
                          {part}
                        </a>
                      ) : (
                        part
                      )
                    )}
                  <span onClick={toggleReadMore} className={styles.readOrHide}>
                    show less
                  </span>
                </>
              )
            ) : (
              // For short content, just display it without read more/less buttons
              <>
                {post.content.split(/\b(https?:\/\/\S+)/g).map((part, index) =>
                  part.match(/^https?:\/\//) ? (
                    <a
                      key={index}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(part, "_blank");
                      }}
                      className="font-medium cursor-pointer"
                      style={{ color: "#3355cc" }}
                    >
                      {part}
                    </a>
                  ) : (
                    part
                  )
                )}
              </>
            )}
          </div>
          <div className={styles.footer}>
            <div className={styles.iconContainer}>
              <div
                className={`${styles.heartIcon} ${animateLike ? styles.likeAnimation : ""
                  }`}
                onClick={(e) => {
                  e.stopPropagation();
                  isLiked ? handleUnlike() : handleLike();
                }}
              >
                {isLiked ? (
                  <Heart
                    fill="#fa6c6c"
                    color="#fa6c6c"
                    className={`${styles.icon} ${styles.liked}`}
                  />
                ) : (
                  <Heart className={styles.icon} />
                )}
              </div>
              <div className={styles.info}>{likeCount}</div>
            </div>

            <div className={styles.iconContainer}>
              <MessageCircle className={styles.icon} />
              <span>{post?.comments?.length}</span>
            </div>

            <ShareIcon
              url={`${window.location.origin}/post/${post._id}`}
              shareCount={shareCount}
              incrementShareCount={handleShareIncrement}
            />
            <div
              className={styles.bookmarkContainer}
              onClick={(e) => {
                e.stopPropagation();
                if (!bookmarkLoading) handleBookmark();
              }}
              style={{ cursor: bookmarkLoading ? "not-allowed" : "pointer" }}
            >
              <div className={styles.bookmark}>
                {bookmarked ? (
                  <Bookmark
                    fill="#24b2b4"
                    className={styles.icon}
                    style={{ color: "#24b2b4" }}
                  />
                ) : (
                  <Bookmark className={styles.icon} />
                )}
              </div>
            </div>
          </div>
          <Comment
            className={styles.commentSection}
            commentsData={post?.comments}
            postId={post?._id}
            author={post?.author}
          />
        </div>
      )}

      {isBlocked && (
        <div className={styles.blockedPostOverlay}>
          <div className={styles.blockedContent}>
            <IoBanOutline size={42} />
            <h2>You&apos;ve blocked this author</h2>
            <p>
              This post is from a user you&apos;ve blocked. You won&apos;t see
              their content in your feed.
            </p>
            <button
              className={styles.unblockButton}
              onClick={handleUnblock}
              disabled={isUnblocking}
            >
              <IoLockOpenOutline size={18} />
              {isUnblocking ? "Unblocking..." : "Unblock to view content"}
            </button>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {reportModalOpen && post && (
        <ReportModal
          isOpen={reportModalOpen}
          onClose={() => setReportModalOpen(false)}
          postId={post._id}
          authorId={post.author._id}
        />
      )}

      {/* Mute User Modal */}
      {muteModalOpen && post?.author && (
        <MuteUserModal
          isOpen={muteModalOpen}
          onClose={handleMuteModalClose}
          user={post.author}
        />
      )}

      {/* Block User Modal */}
      {blockModalOpen && post?.author && (
        <BlockUserModal
          isOpen={blockModalOpen}
          onClose={handleBlockModalClose}
          user={post.author}
        />
      )}

      {/* Hide Post Modal */}
      {hidePostModalOpen && (
        <HidePostModal
          isOpen={hidePostModalOpen}
          onClose={() => setHidePostModalOpen(false)}
          onConfirm={handleHidePost}
          postAuthor={post?.author?.name}
        />
      )}
    </div>
  );
};

export default PostFullScreen;
