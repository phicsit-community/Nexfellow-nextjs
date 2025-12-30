import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";

// styles
import styles from "./Dashboard.module.css";

// skeleton loading components
import SkeletonPost from "../Skeletons/SkeletonPost";
import SkeletonAnalytics from "../Skeletons/SkeletonAnalytics";

// icons
import { FaBookmark } from "react-icons/fa";
import { FaEdit, FaTrash, FaThumbtack, FaLink } from "react-icons/fa";
import { FaTrophy, FaUsers, FaBook } from "react-icons/fa";

// components
import Post from "../Post/Post";
import PostDialog from "./PostDialog";
import HeatMapYear from "../HeatMap/HeatMap";
import PinPostModal from "../PinPostModal/PinPostModal";
import LinkAnalyticsModal from "./LinkAnalyticsModal";

// images
import Followers from "./assets/follower.svg";
import partcip from "./assets/partcip.svg";
import likes from "./assets/likes.svg";
import comments from "./assets/comments.svg";
import pageViewsIcon from "./assets/eye.svg";
import linkClicksIcon from "./assets/link.svg";
import rise from "./assets/rise.svg";
import pendingVector from "./assets/pending.svg";
import verifyVector from "./assets/verify.svg";
import no_posts from "./assets/no_posts.png";
import BookmarkList from "./BookmarkList";

const DashboardBody = ({
  userId,
  communityId,
  isCommunityAccount,
  username,
}) => {
  const [activeTab, setActiveTab] = useState("Post");
  const [posts, setPosts] = useState([]);
  const [community, setCommunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [newPost, setNewPost] = useState("");
  const [analytics, setAnalytics] = useState(null);
  const navigate = useNavigate();
  const [verificationStatus, setVerificationStatus] = useState("");
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [analyticsFilter, setAnalyticsFilter] = useState("all"); // Changed default to "all"
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [postToPin, setPostToPin] = useState(null);
  const [pinnedPostId, setPinnedPostId] = useState(null);
  const [bookmarkCategory, setBookmarkCategory] = useState(null);

  // New state for the Link Analytics Modal
  const [showLinkAnalyticsModal, setShowLinkAnalyticsModal] = useState(false);

  useEffect(() => {
    const fetchVerificationStatus = async () => {
      try {
        setVerificationLoading(true);
        const response = await axios.get(`/requests/status/${userId}`);
        setVerificationStatus(response.data.status);
      } catch (err) {
        console.error("Failed to fetch verification status", err);
        setError("Failed to load data");
      } finally {
        setVerificationLoading(false);
      }
    };

    // ✅ Skip fetching verification status if communityId is present
    if (userId && !communityId) {
      fetchVerificationStatus();
    }
  }, [userId, communityId]);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const handleNewPostChange = (e) => {
    setNewPost(e.target.value);
  };

  const handlePostSubmit = async (postData) => {
    try {
      const formData = new FormData();
      formData.append("title", postData.title);
      formData.append("content", postData.content);
      formData.append("community", communityId);
      formData.append("private", postData.private);

      if (postData.attachments && postData.attachments.length > 0) {
        postData.attachments.forEach((file) => {
          formData.append("files", file);
        });
      }

      if (postData.removeAttachments && postData.removeAttachments.length > 0) {
        formData.append(
          "removeAttachments",
          JSON.stringify(postData.removeAttachments)
        );
      }

      let response;
      if (editingPost) {
        // If editing, send PUT request
        response = await axios.put(
          `/post/update/${editingPost._id}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
      } else {
        // Otherwise, create a new post
        response = await axios.post("/post", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        // If the response contains shortened URLs, we can show a notification
        if (
          response.data.shortenedUrls &&
          response.data.shortenedUrls.length > 0
        ) {
          toast.info(
            `${response.data.shortenedUrls.length} URLs have been shortened for tracking`
          );
        }
      }

      // Fetch updated posts
      const postsResponse = await axios.get(`/post/community/${communityId}`);
      setPosts(postsResponse.data.posts);

      // Reset editing state
      setEditingPost(null);
      setIsDialogOpen(false);
    } catch (err) {
      setError("Error submitting post: " + err.message);
    }
  };

  const pinPost = async (postId) => {
    try {
      await axios.post(`/community/${communityId}/pin-post/${postId}`);
      setPinnedPostId(postId);
      toast.success("Post pinned to community successfully!");
      setShowPinModal(false);
    } catch (err) {
      console.error("Error pinning post:", err.message);
      toast.error(
        "Failed to pin post: " + (err.response?.data?.message || err.message)
      );
    }
  };

  const unpinPost = async () => {
    try {
      await axios.delete(`/community/${communityId}/pin-post`);
      setPinnedPostId(null);
      toast.success("Post unpinned successfully!");
      setShowPinModal(false);
    } catch (err) {
      console.error("Error unpinning post:", err.message);
      toast.error(
        "Failed to unpin post: " + (err.response?.data?.message || err.message)
      );
    }
  };

  const handlePinPost = (post) => {
    setPostToPin(post);
    setShowPinModal(true);
  };

  // Handle analytics filter change
  const handleAnalyticsFilterChange = async (e) => {
    const newFilter = e.target.value;
    setAnalyticsFilter(newFilter);

    if (communityId) {
      try {
        // Show loading state while fetching new analytics data
        setAnalyticsLoading(true);
        const analyticsResponse = await axios.get(
          `/analytics/${communityId}?filter=${newFilter}`
        );
        setAnalytics(analyticsResponse.data);
      } catch (err) {
        console.error("Failed to fetch analytics data:", err);
        setError("Error retrieving analytics data: " + err.message);
      } finally {
        setAnalyticsLoading(false);
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!communityId) {
        setLoading(false); // Prevent further requests if no communityId
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const [postsResponse, communityResponse, analyticsResponse] =
          await Promise.all([
            axios.get(`/post/community/${communityId}`),
            axios.get(`/community/id/${communityId}`),
            axios.get(`/analytics/${communityId}?filter=${analyticsFilter}`), // Use current filter
          ]);

        const fetchedPosts = postsResponse.data.posts || [];
        console.log("Fetched Posts: ", fetchedPosts);
        setPosts(fetchedPosts);

        const pinned = fetchedPosts.find((post) => post.pinned);
        setPinnedPostId(pinned ? pinned._id : null);
        setCommunity(communityResponse.data.community || {});
        setAnalytics(analyticsResponse.data);
        console.log("Fetched Analytics Data: ", analyticsResponse.data);
      } catch (err) {
        setError("Error retrieving data: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [communityId, analyticsFilter]); // Add analyticsFilter as dependency

  const handleVerifyClick = () => {
    navigate(`/verification/${username}`, {
      state: { userId },
    });
  };

  const handleEdit = (post) => {
    setEditingPost(post);
    setIsDialogOpen(true);
  };

  const dashboardOptions = [
    {
      label: "Edit",
      icon: <FaEdit />,
      action: (post) => handleEdit(post),
    },
    {
      label: "Delete",
      icon: <FaTrash />,
      action: async (post) => {
        try {
          await axios.delete(`/post/${post._id}`);
          toast.success("Post deleted successfully!");
          window.location.reload();
        } catch (error) {
          toast.error("Error deleting post: " + error.message);
        }
      },
    },
    {
      label: (post) => (post._id === pinnedPostId ? "Unpin Post" : "Pin Post"),
      icon: <FaThumbtack />,
      action: (post) => handlePinPost(post),
    },
  ];

  // Get time period label based on filter
  const getTimePeriodLabel = () => {
    switch (analyticsFilter) {
      case "day":
        return "Last 24 hours";
      case "week":
        return "Last 7 days";
      case "month":
        return "Last month";
      case "quarter":
        return "Last 3 months";
      case "half":
        return "Last 6 months";
      case "year":
        return "Last year";
      case "all":
        return "All time";
      default:
        return "All time";
    }
  };

  // Format growth percentage with + or - sign
  const formatGrowthPercentage = (value) => {
    if (!value) return "+0%";

    // If value is already a string with % sign
    if (typeof value === "string" && value.includes("%")) {
      const numValue = parseFloat(value);
      return (numValue >= 0 ? "+" : "") + value;
    }

    // If value is a number
    return (value >= 0 ? "+" : "") + value.toFixed(1) + "%";
  };

  // Determine color based on growth (positive = green, negative = red)
  const getGrowthColor = (value) => {
    if (!value) return "#0FDA00"; // Default green

    const numValue = typeof value === "string" ? parseFloat(value) : value;
    return numValue >= 0 ? "#0FDA00" : "#FF4D4D";
  };

  const organizedPosts = useMemo(() => {
    if (!posts.length) return { pinnedPost: null, regularPosts: [] };

    if (!pinnedPostId) return { pinnedPost: null, regularPosts: posts };

    const pinned = posts.find((post) => post._id === pinnedPostId);
    const regular = posts.filter((post) => post._id !== pinnedPostId);

    return {
      pinnedPost: pinned || null,
      regularPosts: regular,
    };
  }, [posts, pinnedPostId]);

  const bookmarkCategories = [
    {
      type: "posts",
      icon: <FaBookmark className={styles.cardIcon} />,
      title: "Posts",
      desc: "See your saved posts",
    },
    // {
    //   type: "generalContests",
    //   icon: <FaTrophy className={styles.cardIcon} />,
    //   title: "General Contests",
    //   desc: "Saved contests & challenges"
    // },
    {
      type: "communityContests",
      icon: <FaTrophy className={styles.cardIcon} />,
      title: "Community Contests",
      desc: "Saved community contests & challenges",
    },
    {
      type: "communities",
      icon: <FaUsers className={styles.cardIcon} />,
      title: "Communities",
      desc: "Your favorite communities",
    },
    {
      type: "resources",
      icon: <FaBook className={styles.cardIcon} />,
      title: "Resources",
      desc: "Saved resources & links",
    },
  ];

  return (
    <div
      style={
        {
          // marginTop: isCommunityAccount ? "-10%" : "-10%",
        }
      }
      className={styles.CommunityBodyContainer}
    >
      <div className={styles.tabs}>
        <button
          onClick={() => handleTabClick("Post")}
          className={`${styles.tab} ${activeTab === "Post" ? styles.activeTab : ""
            }`}
        >
          Post
        </button>
        <button
          onClick={() => handleTabClick("Analytics")}
          className={`${styles.tab} ${activeTab === "Analytics" ? styles.activeTab : ""
            }`}
        >
          Analytics
        </button>
        <button
          onClick={() => handleTabClick("Bookmark")}
          className={`${styles.tab} ${activeTab === "Bookmark" ? styles.activeTab : ""
            }`}
        >
          Bookmark
        </button>
      </div>

      <div className={styles.contentSection}>
        {loading && activeTab === "Post" && <SkeletonPost />}
        {communityId ? (
          <>
            {activeTab === "Post" && !loading && !error && (
              <div className={styles.feedSection}>
                <div
                  className={styles.createPostBox}
                  onClick={() => setIsDialogOpen(true)}
                >
                  <div className={styles.inputBox}>
                    <div className={styles.avatarWrapper}>
                      {community?.owner?.picture ? (
                        <img
                          src={community?.owner?.picture}
                          alt="User Avatar"
                          className={styles.avatar}
                        />
                      ) : (
                        <div className={styles.avatarPlaceholder}>A</div>
                      )}
                    </div>
                    <input
                      type="text"
                      placeholder="Share a post"
                      className={styles.postInput}
                      value={newPost}
                      onChange={handleNewPostChange}
                      readOnly
                    />
                  </div>
                </div>

                {posts.length > 0 ? (
                  <div className={styles.feedContainer}>
                    {organizedPosts.pinnedPost && (
                      <>
                        {/* <div className={styles.pinnedPostHeader}>
                          <FaThumbtack
                            className={styles.pinnedHeaderIcon}
                            style={{
                              width: "15px",
                              height: "15px",
                              marginRight: "5px",
                            }}
                          />
                          <span className={styles.pinnedHeaderText}>
                            Pinned
                          </span>
                        </div> */}
                        <Post
                          key={organizedPosts.pinnedPost._id}
                          post={organizedPosts.pinnedPost}
                          isPinned={true}
                          options={dashboardOptions.map((option) => ({
                            label:
                              typeof option.label === "function"
                                ? option.label(organizedPosts.pinnedPost)
                                : option.label,
                            icon: option.icon,
                            action: () =>
                              option.action(organizedPosts.pinnedPost),
                          }))}
                        />
                        {organizedPosts.regularPosts.length > 0 && (
                          <div className={styles.regularPostsDivider}></div>
                        )}
                      </>
                    )}

                    {organizedPosts.regularPosts.map((post) => (
                      <Post
                        key={post._id}
                        post={post}
                        options={dashboardOptions.map((option) => ({
                          label:
                            typeof option.label === "function"
                              ? option.label(post)
                              : option.label,
                          icon: option.icon,
                          action: () => option.action(post),
                        }))}
                      />
                    ))}
                  </div>
                ) : (
                  <div className={styles.noPostsContainer}>
                    <img className={styles.noPostsImage} src={no_posts} />
                    <p className={styles.noPostsHead}>
                      Oops! Nothing To See Here Yet!
                    </p>
                    <p className={styles.noPostsMessage}>
                      There are no posts to show at the moment.
                    </p>
                    <p className={styles.noPostsMessage}>
                      Check back later to see updates!
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "Analytics" && (
              <div className={styles.analyticsDiv}>
                {/* Header with title and filter */}
                <div className={styles.analyticHeader}>
                  <div className={styles.analyticsTitle}>Analytics</div>

                  <select
                    className={styles.analyticsFilter}
                    value={analyticsFilter}
                    onChange={handleAnalyticsFilterChange}
                  >
                    <option value="day">Last 24 Hours</option>
                    <option value="week">Last 7 Days</option>
                    <option value="month">Last 1 Month</option>
                    <option value="quarter">Last 3 Months</option>
                    <option value="half">Last 6 Months</option>
                    <option value="year">Last 1 Year</option>
                    <option value="all">All Time</option>
                  </select>
                </div>

                {analyticsLoading ? (
                  <SkeletonAnalytics />
                ) : analytics ? (
                  <>
                    <div className={styles.analyticContainer}>
                      {/* Followers */}
                      <div className={styles.analytic}>
                        <img
                          src={Followers}
                          className={styles.analyticMainImg}
                        />
                        <div className={styles.analyticContentHeading}>
                          Followers
                        </div>
                        <div className={styles.analyticContent}>
                          <div className={styles.analyticContentStats}>
                            {analyticsFilter === "all"
                              ? analytics.totalMembers || 0
                              : analytics.newMembers || 0}
                          </div>
                          <div className={styles.analyticContentRight}>
                            <img
                              src={rise}
                              className={styles.analyticRiseImg}
                              style={{
                                transform:
                                  analytics.memberGrowth < 0
                                    ? "rotate(180deg)"
                                    : "rotate(0deg)",
                                filter:
                                  analytics.memberGrowth < 0
                                    ? "invert(40%) sepia(89%) saturate(5268%) hue-rotate(338deg) brightness(100%) contrast(102%)"
                                    : "none",
                              }}
                            />
                            <div
                              className={styles.analyticContentRightPlus}
                              style={{
                                color: getGrowthColor(analytics.memberGrowth),
                              }}
                            >
                              {formatGrowthPercentage(analytics.memberGrowth)}
                            </div>
                            <div>{getTimePeriodLabel()}</div>
                          </div>
                        </div>
                      </div>

                      {/* Participants */}
                      <div className={styles.analytic}>
                        <img src={partcip} className={styles.analyticMainImg} />
                        <div className={styles.analyticContentHeading}>
                          Participants
                        </div>
                        <div className={styles.analyticContent}>
                          <div className={styles.analyticContentStats}>
                            {analyticsFilter === "all"
                              ? analytics.totalParticipants || 0
                              : analytics.newParticipants || 0}
                          </div>
                          <div className={styles.analyticContentRight}>
                            <img
                              src={rise}
                              className={styles.analyticRiseImg}
                              style={{
                                transform:
                                  analytics.participantGrowth < 0
                                    ? "rotate(180deg)"
                                    : "rotate(0deg)",
                                filter:
                                  analytics.participantGrowth < 0
                                    ? "invert(40%) sepia(89%) saturate(5268%) hue-rotate(338deg) brightness(100%) contrast(102%)"
                                    : "none",
                              }}
                            />
                            <div
                              className={styles.analyticContentRightPlus}
                              style={{
                                color: getGrowthColor(
                                  analytics.participantGrowth
                                ),
                              }}
                            >
                              {formatGrowthPercentage(
                                analytics.participantGrowth
                              )}
                            </div>
                            <div>{getTimePeriodLabel()}</div>
                          </div>
                        </div>
                      </div>

                      {/* Likes */}
                      <div className={styles.analytic}>
                        <img src={likes} className={styles.analyticMainImg} />
                        <div className={styles.analyticContentHeading}>
                          Likes
                        </div>
                        <div className={styles.analyticContent}>
                          <div className={styles.analyticContentStats}>
                            {analyticsFilter === "all"
                              ? analytics.totalLikes || 0
                              : analytics.newLikes || 0}
                          </div>
                          <div className={styles.analyticContentRight}>
                            <img
                              src={rise}
                              className={styles.analyticRiseImg}
                              style={{
                                transform:
                                  analytics.likeGrowth < 0
                                    ? "rotate(180deg)"
                                    : "rotate(0deg)",
                                filter:
                                  analytics.likeGrowth < 0
                                    ? "invert(40%) sepia(89%) saturate(5268%) hue-rotate(338deg) brightness(100%) contrast(102%)"
                                    : "none",
                              }}
                            />
                            <div
                              className={styles.analyticContentRightPlus}
                              style={{
                                color: getGrowthColor(analytics.likeGrowth),
                              }}
                            >
                              {formatGrowthPercentage(analytics.likeGrowth)}
                            </div>
                            <div>{getTimePeriodLabel()}</div>
                          </div>
                        </div>
                      </div>

                      {/* Comments */}
                      <div className={styles.analytic}>
                        <img
                          src={comments}
                          className={styles.analyticMainImg}
                        />
                        <div className={styles.analyticContentHeading}>
                          Comments
                        </div>
                        <div className={styles.analyticContent}>
                          <div className={styles.analyticContentStats}>
                            {analyticsFilter === "all"
                              ? analytics.totalComments || 0
                              : analytics.newComments || 0}
                          </div>
                          <div className={styles.analyticContentRight}>
                            <img
                              src={rise}
                              className={styles.analyticRiseImg}
                              style={{
                                transform:
                                  analytics.commentGrowth < 0
                                    ? "rotate(180deg)"
                                    : "rotate(0deg)",
                                filter:
                                  analytics.commentGrowth < 0
                                    ? "invert(40%) sepia(89%) saturate(5268%) hue-rotate(338deg) brightness(100%) contrast(102%)"
                                    : "none",
                              }}
                            />
                            <div
                              className={styles.analyticContentRightPlus}
                              style={{
                                color: getGrowthColor(analytics.commentGrowth),
                              }}
                            >
                              {formatGrowthPercentage(analytics.commentGrowth)}
                            </div>
                            <div>{getTimePeriodLabel()}</div>
                          </div>
                        </div>
                      </div>

                      {/* Page Views */}
                      <div className={styles.analytic}>
                        <img
                          src={pageViewsIcon}
                          className={styles.analyticMainImg}
                        />
                        <div className={styles.analyticContentHeading}>
                          Page Views
                        </div>
                        <div className={styles.analyticContent}>
                          <div className={styles.analyticContentStats}>
                            {analyticsFilter === "all"
                              ? analytics.totalViews || 0
                              : analytics.filteredViews || 0}
                          </div>
                          <div className={styles.analyticContentRight}>
                            <img
                              src={rise}
                              className={styles.analyticRiseImg}
                              style={{
                                transform:
                                  analytics.viewGrowth < 0
                                    ? "rotate(180deg)"
                                    : "rotate(0deg)",
                                filter:
                                  analytics.viewGrowth < 0
                                    ? "invert(40%) sepia(89%) saturate(5268%) hue-rotate(338deg) brightness(100%) contrast(102%)"
                                    : "none",
                              }}
                            />
                            <div
                              className={styles.analyticContentRightPlus}
                              style={{
                                color: getGrowthColor(analytics.viewGrowth),
                              }}
                            >
                              {formatGrowthPercentage(analytics.viewGrowth)}
                            </div>
                            <div>{getTimePeriodLabel()}</div>
                          </div>
                        </div>
                      </div>

                      {/* Link Clicks */}
                      <div
                        className={`${styles.analytic} ${styles.linkClicksAnalytic}`}
                        onClick={() => setShowLinkAnalyticsModal(true)}
                      >
                        <img
                          src={linkClicksIcon}
                          className={styles.analyticMainImg}
                        />
                        <div className={styles.analyticContentHeading}>
                          Link Clicks
                        </div>
                        <div className={styles.analyticContent}>
                          <div className={styles.analyticContentStats}>
                            {analyticsFilter === "all"
                              ? analytics.newShortenedUrlClicks || 0
                              : analytics.shortenedUrls.filteredClicks || 0}
                          </div>
                          <div className={styles.analyticContentRight}>
                            <img
                              src={rise}
                              className={styles.analyticRiseImg}
                              style={{
                                transform:
                                  analytics.linkClickGrowth < 0
                                    ? "rotate(180deg)"
                                    : "rotate(0deg)",
                                filter:
                                  analytics.linkClickGrowth < 0
                                    ? "invert(40%) sepia(89%) saturate(5268%) hue-rotate(338deg) brightness(100%) contrast(102%)"
                                    : "none",
                              }}
                            />
                            <div
                              className={styles.analyticContentRightPlus}
                              style={{
                                color: getGrowthColor(
                                  analytics.linkClickGrowth
                                ),
                              }}
                            >
                              {formatGrowthPercentage(
                                analytics.linkClickGrowth
                              )}
                            </div>
                            <div>{getTimePeriodLabel()}</div>
                          </div>
                        </div>
                        <div className={styles.viewDetailsBtn}>
                          <FaLink className={styles.detailsIcon} /> View Details
                        </div>
                      </div>
                    </div>
                    <div>
                      <HeatMapYear
                        style={{
                          alignItems: "centre",
                          marginTop: "20px",
                        }}
                        year={2025}
                        communityId={communityId}
                        filter={analyticsFilter} // Pass filter to heat map component
                      />
                    </div>
                  </>
                ) : (
                  <div className={styles.noDataMessage}>
                    No analytics data available
                  </div>
                )}
              </div>
            )}

            {activeTab === "Bookmark" && (
              <div className={styles.bookmarksDashboard}>
                <BookmarkList />
              </div>
            )}
          </>
        ) : (
          ["Post", "Analytics", "Bookmark"].includes(activeTab) && (
            <div className={styles.verifyNowMessage}>
              {verificationLoading && <p>Loading verification status...</p>}

              <img
                src={
                  verificationStatus === "Pending"
                    ? pendingVector
                    : verificationStatus === "Rejected"
                      ? pendingVector
                      : verifyVector
                }
                alt={
                  verificationStatus === "Pending"
                    ? "Pending"
                    : verificationStatus === "Rejected"
                      ? "Rejected"
                      : "Verify Now"
                }
              />
              <p className={styles.verifyNowText}>
                {verificationStatus === "Pending"
                  ? "Your request has been sent, Please wait! Our admin will check your request."
                  : verificationStatus === "Rejected"
                    ? "Verification failed. Try again!"
                    : "Unlock Posting Access by Verifying Your Account!"}
              </p>
              {verificationStatus !== "Pending" && (
                <button
                  className={styles.verifyNow}
                  onClick={handleVerifyClick}
                >
                  {verificationStatus === "Rejected" ? "Retry" : "Proceed"}
                </button>
              )}
            </div>
          )
        )}
      </div>

      <PostDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setEditingPost(null);
        }}
        onSubmit={handlePostSubmit}
        community={community}
        post={editingPost}
      />

      <PinPostModal
        isOpen={showPinModal}
        onClose={() => setShowPinModal(false)}
        onPin={pinPost}
        onUnpin={unpinPost}
        post={postToPin}
        isPinned={postToPin && postToPin._id === pinnedPostId}
      />

      <LinkAnalyticsModal
        isOpen={showLinkAnalyticsModal}
        onClose={() => setShowLinkAnalyticsModal(false)}
        communityId={communityId}
        filter={analyticsFilter}
      />
    </div>
  );
};

export default DashboardBody;
