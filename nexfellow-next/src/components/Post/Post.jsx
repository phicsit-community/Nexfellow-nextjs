"use client";

import { useEffect, useState, useRef } from "react";
import { marked } from "marked";
import { formatDistanceToNow } from "date-fns";
import { debounce } from "lodash";
import { parseContent } from "../../utils/urlUtils";
import LikesSummary from "./LikesSummary";
import Comment from "./Comment";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSwipeable } from "react-swipeable";
import FeedImageGrid from "./FeedImageGrid";
import { LinkPreview } from "../../components/ui/link-preview";
import { useMediaQuery } from "react-responsive";
import CommunityInfoPopover from "./CommunityInfoPopover";
import Modal from "../ShareModal/MoreModal";
import styles from "./Post.module.css";

//icons
import { BsHeartFill, BsThreeDotsVertical } from "react-icons/bs";
import { PiHeartStraightDuotone, PiHeartStraightFill } from "react-icons/pi";
import { PiChatCircleDuotone } from "react-icons/pi";
import { PiShareNetworkDuotone } from "react-icons/pi";
import { PiBookmarkSimpleDuotone, PiBookmarkSimpleFill } from "react-icons/pi";
import { FaThumbtack } from "react-icons/fa";
import VERIFY from "./assets/Verify.svg";
import communityBadge from "./assets/badge3.svg";
import axios from "axios";
import ShareIcon from "../ShareIcon/ShareIcon";
import { Bookmark, BookMarked, Heart, MessageCircle } from "lucide-react";

function Post({ post, isModeratorView, options, isPinned = false, alwaysPopoverBelow = false, onNavigateToPost }) {
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [isLiked, setIsLiked] = useState(false);
  const [animateLike, setAnimateLike] = useState(false);
  const [showInfoPopover, setShowInfoPopover] = useState(false);
  const [commentBoxActive, setCommentBox] = useState(false);
  const [followers, setFollowers] = useState(0);
  const [followings, setFollowings] = useState(0);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [shareCount, setShareCount] = useState(post.shares);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookmarked, setBookmarked] = useState(post.isBookmarked || false); // Adjust based on your API
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [currentImage, setCurrentImage] = useState(0);
  const [carouselHovered, setCarouselHovered] = useState(false);
  const threeDotRef = useRef(null);
  const popoverRef = useRef(null);
  const postRef = useRef(null);
  const router = useRouter();
  const [loaded, setLoaded] = useState(false);
  const PLACEHOLDER_IMG =
    "https://placehold.co/800x400?text=Image+Not+Available";

  useEffect(() => {
    async function checkIfLiked() {
      try {
        const res = await axios.get(`/like/checkIfPostLiked/${post._id}`);
        setIsLiked(res.data.Switch);
      } catch (error) {
        console.error("Error checking if post is liked:", error);
      }
    }
    checkIfLiked();

    // Check if the user is following this community/author
    async function checkIfFollowing() {
      try {
        if (post?.author?._id) {
          // Use the author's ID or community ID if available
          const communityId = post.author.createdCommunity || post.author._id;
          const res = await axios.get(`/user/checkFollowing/${communityId}`);
          setIsFollowing(res.data.isFollowing);
        }
      } catch (error) {
        console.error("Error checking following status:", error);
        // Set default to false on error
        setIsFollowing(false);
      }
    }
    checkIfFollowing();
  }, []);

  useEffect(() => {
    async function fetchFollowers() {
      try {
        const res = await axios.get(`/user/publicprofile/${post.author._id}`);
        setFollowers(res.data.followers);
        setFollowerCount(res.data.followers.length);
      } catch (error) {
        console.error("Error fetching followers:", error);
      }
    }

    async function fetchFollowings() {
      try {
        const res = await axios.get(`/user/publicprofile/${post.author._id}`);
        setFollowings(res.data.following);
        setFollowingCount(res.data.following.length);
      } catch (error) {
        console.error("Error fetching followings:", error);
      }
    }

    if (post?.author?._id) {
      fetchFollowers();
      fetchFollowings();
    }
  }, [post.author]);

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

  const [isReadMore, setIsReadMore] = useState(true);

  const toggleReadMore = () => {
    setIsReadMore(!isReadMore);
  };

  const handleShareIncrement = async () => {
    try {
      const response = await axios.patch(`/post/increment-shares/${post._id}`);
      setShareCount(response.data.count);
    } catch (error) {
      console.error("Share failed", error);
    }
  };

  const handleLike = async () => {
    if (isLiked) return;

    setIsLiked(true);
    setLikeCount((prev) => prev + 1);
    setAnimateLike(true);
    setTimeout(() => setAnimateLike(false), 500);

    try {
      await axios.post(`/like/posts/${post._id}`);
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
      await axios.delete(`/like/posts/${post._id}`);
    } catch (error) {
      setIsLiked(true);
      setLikeCount((prev) => prev + 1);
      console.error("Unlike failed", error);
    }
  };

  useEffect(() => {
    const fetchBookmarkStatus = async () => {
      try {
        const res = await axios.get("/bookmarks/user?itemType=Post");
        const found = Array.isArray(res.data.bookmarks)
          ? res.data.bookmarks.some(
            (bm) =>
              bm.bookmarkItem &&
              (bm.bookmarkItem._id === post._id ||
                bm.bookmarkItem.id === post._id)
          )
          : false;
        setBookmarked(found);
      } catch (error) {
        console.error("Error fetching bookmark status:", error);
        toast.error("Failed to fetch bookmark status. Please try again.");
      }
    };
    fetchBookmarkStatus();
  }, [post._id]);

  const handleBookmark = async () => {
    if (bookmarkLoading) return;
    setBookmarkLoading(true);
    try {
      if (!bookmarked) {
        await axios.post(`/bookmarks/Post/${post._id}`);
        setBookmarked(true);
        toast.success("Post bookmarked!");
      } else {
        await axios.delete(`/bookmarks/Post/${post._id}`);
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

  const handleMouseOver = () => {
    setShowInfoPopover(true);
  };

  const handleMouseLeave = () => {
    setTimeout(() => {
      if (!popoverRef.current || !popoverRef.current.matches(":hover")) {
        setShowInfoPopover(false);
      }
    }, 200);
  };

  const handleCommentClick = () => {
    setCommentBox(!commentBoxActive);
  };

  const handleOpenModal = () => {
    if (threeDotRef.current) {
      const rect = threeDotRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
      });
    }
    setIsModalOpen(true);
  };

  const handlePrevImage = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    setCurrentImage((prev) =>
      prev === 0 ? post.attachments.length - 1 : prev - 1
    );
  };

  const handleNextImage = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    setCurrentImage((prev) =>
      prev === post.attachments.length - 1 ? 0 : prev + 1
    );
  };

  const handlers = useSwipeable({
    onSwipedLeft: () => handleNextImage(),
    onSwipedRight: () => handlePrevImage(),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  });

  const handleOpenFullScreen = () => {
    if (typeof onNavigateToPost === "function") {
      onNavigateToPost(post._id);
    } else {
      router.push(`/post/${post._id}`);
    }
  };

  const isDesktop = useMediaQuery({ minWidth: 769 });
  function useWindowWidth() {
    const [width, setWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1024);
    useEffect(() => {
      const handleResize = () => setWidth(window.innerWidth);
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);
    return width;
  }

  const width = useWindowWidth();

  let nameMaxLength = 20;
  if (width < 319) {
    nameMaxLength = 8;
  }

  // Track link clicks for analytics
  const trackLinkClick = async (url) => {
    try {
      await axios.post(
        `http://localhost:4000/analytics/67922fda70d29d966dbfa9cf/link-analytics`,
        {
          url,
          postId: post._id,
        }
      );
      console.log("Link click tracked for analytics");
    } catch (error) {
      console.error("Error tracking link click:", error);
    }
  };

  return (
    <div data-post-id={post._id} className={styles.post} ref={postRef}>
      <div className={styles.postHeader}>
        <div className={styles.left}>
          <div className={styles.imgContainer}>
            <img
              src={post.author.picture || "/src/assets/default-profile.jpg"}
              alt="profile"
              className={styles.profilePic}
              loading="lazy"
              onClick={() => router.push(`/explore/${post.author.username}`)}
              onMouseOver={handleMouseOver}
              onMouseLeave={handleMouseLeave}
            />
            {showInfoPopover && (
              <div ref={popoverRef}>
                <CommunityInfoPopover
                  alwaysPopoverBelow={alwaysPopoverBelow}
                  isFollowing={isFollowing}
                  community={{
                    name: post.author.name,
                    username: post.author.username,
                    profilePic: post.author.picture,
                    followers: followerCount,
                    following: followingCount,
                    bio: post.community.description
                      ? post.community.description.length > 60
                        ? `${post.community.description.slice(0, 60)}...`
                        : post.community.description
                      : "",
                    communityId: post.author.createdCommunity,
                    communityOwnerId: post.author._id,
                  }}
                  setShowPopover={setShowInfoPopover}
                  postRef={postRef}
                />
              </div>
            )}
          </div>
          <div className={styles.headerContent}>
            <div className={styles.postedBy}>
              <div
                className={` dark:text-white ${styles.info}`}
                onMouseOver={handleMouseOver}
                onMouseLeave={handleMouseLeave}
              >
                <div className={styles.author}>
                  <div
                    className={styles.name}
                    onClick={() => router.push(`/explore/${post.author.username}`)}
                    title={post.author.name}
                  >
                    <div style={{
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      cursor: "pointer",
                      maxWidth: width < 319 ? 120 : 150,
                    }}>
                      {post.author.name.length > nameMaxLength
                        ? post.author.name.slice(0, nameMaxLength) + "..."
                        : post.author.name}
                    </div>
                    {post.author.isCommunityAccount &&
                      post.author.createdCommunity ? (
                      post.author.communityBadge ? (
                        <img
                          src={communityBadge}
                          alt="Community Badge"
                          className={styles.badge}
                        />
                      ) : post.author.verificationBadge ? (
                        <img
                          src={VERIFY}
                          alt="Verification Badge"
                          className={styles.badge}
                        />
                      ) : null
                    ) : post.author.verificationBadge ? (
                      <img
                        src={VERIFY}
                        alt="Verification Badge"
                        className={styles.verified}
                      />
                    ) : null}
                  </div>
                  {isPinned && (
                    <div className={styles.time}>
                      {isDesktop && <span>·</span>}
                      <FaThumbtack className={styles.pinnedIcon} />
                      {isDesktop && (
                        <span
                          className={styles.pinnedText}
                          style={{ fontSize: "0.9rem" }}
                        >
                          Pinned
                        </span>
                      )}
                    </div>
                  )}
                  <div className={styles.time}>
                    <span>·</span>
                    <p>{formatDateToAbbreviation(new Date(post.createdAt))}</p>
                  </div>
                </div>
                <div className={styles.username}>@{post.author.username}</div>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.right}>
          <div
            className={styles.threeDot}
            ref={threeDotRef}
            onClick={handleOpenModal}
          >
            <BsThreeDotsVertical className={styles.moreIcon} />
          </div>
          {isModalOpen && (
            <Modal
              options={options}
              onClose={() => setIsModalOpen(false)}
              position={position}
            />
          )}
        </div>
      </div>

      <div className={styles.postBody}>
        <div
          className={styles.postView}
          onClick={(e) => {
            if (!e.target.closest("a")) {
              handleOpenFullScreen();
            }
          }}
        >
          <div
            className={
              post.attachments && post.attachments.length > 0
                ? styles.postContent
                : `${styles.postContent} ${styles.noAttachments}`
            }
          >
            {(() => {
              const parts = (post.content || "").split(/\b(https?:\/\/\S+)/g);

              let displayContent = post.content;
              if (post.content.length > 140 && isReadMore) {
                let charCount = 0;
                const truncatedParts = [];

                for (let i = 0; i < parts.length; i++) {
                  const part = parts[i];
                  if (
                    charCount + part.length > 140 &&
                    !part.match(/^https?:\/\//)
                  ) {
                    truncatedParts.push(part.substring(0, 140 - charCount));
                    break;
                  } else {
                    truncatedParts.push(part);
                    charCount += part.length;
                    if (charCount >= 140) break;
                  }
                }

                displayContent = truncatedParts.join("");
              }

              return displayContent
                .split(/\b(https?:\/\/\S+)/g)
                .map((part, index) =>
                  part.match(/^https?:\/\//) ? (
                    <a
                      key={index}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => {
                        e.stopPropagation();
                        trackLinkClick(part);
                        window.open(part, "_blank");
                      }}
                      className="font-medium cursor-pointer"
                      style={{ color: "#3355cc" }}
                    >
                      {/* <LinkPreview url={part} className="font-bold"> */}
                      {part}
                      {/* </LinkPreview> */}
                    </a>
                  ) : (
                    part
                  )
                );
            })()}
            {post.content.length > 140 && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  toggleReadMore();
                }}
                className={styles.readOrHide}
              >
                {isReadMore ? "...read more" : " show less"}
              </span>
            )}
          </div>

          {post.attachments && post.attachments.length > 0 && (
            <FeedImageGrid images={post.attachments} />
          )}
        </div>

        <LikesSummary
          postId={post._id}
          isLiked={isLiked}
          likeCount={likeCount}
        />
      </div>

      <div className={styles.postFooter}>
        <div className={styles.contIcon}>
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
                  className={`${styles.icon}`}
                  color="#fa6c6c"
                  fill="#e15555"
                />
              ) : (
                <Heart className={styles.icon} color="#64748B" />
              )}
            </div>
            <div className={` dark:text-white ${styles.info}`}>{likeCount}</div>
          </div>

          <div
            className={`${styles.iconContainer}`}
            onClick={(e) => {
              e.stopPropagation();
              handleCommentClick();
            }}
          >
            <div className={styles.chatIcon}>
              <MessageCircle className={styles.icon} color="#64748B" />
            </div>
            <div className={` dark:text-white ${styles.info}`}>{post.comments.length}</div>
          </div>

          {/* <div className={styles.iconContainer}>
            <div className={styles.shareIcon}>
              <ShareIcon
                url={`${window.location.origin}/post/${post._id}`}
                shareCount={shareCount}
                incrementShareCount={handleShareIncrement}
              />
            </div>
            <div className={styles.info}>{shareCount}</div>
          </div> */}
          <ShareIcon
            url={`${window.location.origin}/post/${post._id}`}
            shareCount={shareCount}
            incrementShareCount={handleShareIncrement}
          />
        </div>

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
                className={styles.icon}
                style={{ color: "#24b2b4" }}
                fill="#24b2b4"
              />
            ) : (
              <Bookmark className={styles.icon} />
            )}
          </div>
        </div>
      </div>
      {commentBoxActive && (
        <Comment
          commentsData={post.comments}
          postId={post._id}
          author={post.author}
          isModeratorView={isModeratorView}
        />
      )}
    </div>
  );
}

export default Post;
