"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import api from "../../lib/axios";
import no_posts from "./assets/no_posts.png";
import pinIcon from "./assets/pin.svg";
import ProfileImage from "./assets/profile_image.svg";
import { useRouter } from "next/navigation";
import { FaThumbtack } from "react-icons/fa";

// styles
import styles from "./Community.module.css";

// components
import Post from "../Post/Post";
import MemberItemSkeleton from "./MemberItemSkeleton";
import { toast } from "sonner";
import ReportModal from "../ReportModal/ReportModal";
import MuteUserModal from "../MuteUserModal/MuteUserModal";
import HidePostModal from "../Modals/HidePostModal";
import PinPostModal from "../PinPostModal/PinPostModal";
import PostSkeleton from "../Skeletons/SkeletonPost";

// Icons
import { FaBellSlash, FaEyeSlash, FaExclamationCircle } from "react-icons/fa";
import Discussion from "../Discussion/Discussion";
import communityBadge from "./assets/badge3.svg";
import verificationBadge from "./assets/badge2.svg";

const CommunityBody = ({ communityId, messageIdToScroll }) => {
  const [activeTab, setActiveTab] = useState(() => {
    return messageIdToScroll ? "Discussion" : "Feed";
  });
  const [posts, setPosts] = useState([]);
  const [community, setCommunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([]);
  const messageEndRef = useRef(null);
  const [followingStatus, setFollowingStatus] = useState({});
  const [loadingFollow, setLoadingFollow] = useState({});
  const router = useRouter();
  const [showPinModal, setShowPinModal] = useState(false);
  const [postToPin, setPostToPin] = useState(null);
  const [pinnedPostId, setPinnedPostId] = useState(null);
  const [isUserModOrOwner, setIsUserModOrOwner] = useState(false);

  // New state variables for modals
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [muteModalOpen, setMuteModalOpen] = useState(false);
  const [hidePostModalOpen, setHidePostModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [mutedUsers, setMutedUsers] = useState([]);
  const [hiddenPosts, setHiddenPosts] = useState([]);

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  useEffect(() => {
    if (messageIdToScroll) {
      setActiveTab("Discussion");
    }
  }, [messageIdToScroll]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [postsResponse, communityResponse] = await Promise.all([
          api.get(`/post/community/${communityId}`),
          api.get(`/community/id/${communityId}`),
        ]);

        const followers =
          communityResponse.data?.community?.owner?.followers || [];

        let followStatusMap = {};
        if (followers.length > 0) {
          const followStatuses = await Promise.all(
            followers.map(async (follower) => {
              try {
                const res = await api.get(
                  `/user/followStatus/${follower._id}`
                );
                return { id: follower._id, isFollowing: res.data.isFollowing };
              } catch (err) {
                console.error(
                  `Error fetching follow status for ${follower._id}:`,
                  err
                );
                return { id: follower._id, isFollowing: false };
              }
            })
          );

          followStatusMap = followStatuses.reduce((acc, curr) => {
            acc[curr.id] = curr.isFollowing;
            return acc;
          }, {});
        }

        setFollowingStatus(followStatusMap);
        setPosts(postsResponse.data.posts || []);
        setCommunity(communityResponse.data.community || {});
      } catch (err) {
        setError("Error retrieving data: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [communityId]);

  useEffect(() => {
    const checkUserPermissions = async () => {
      try {
        if (community) {
          const userId = JSON.parse(localStorage.getItem("user"))?.id;
          const isOwner = community.owner?._id === userId;
          const isModerator = community.moderators?.some(
            (mod) => mod._id === userId
          );
          setIsUserModOrOwner(isOwner || isModerator);
        }
      } catch (err) {
        console.error("Error checking user permissions:", err);
      }
    };

    checkUserPermissions();
  }, [community]);

  useEffect(() => {
    if (communityId && community) {
      setPinnedPostId(community.pinnedPost || null);
    }
  }, [communityId, community]);

  const pinPost = async (postId) => {
    try {
      await api.post(`/community/${communityId}/pin-post/${postId}`);
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
      await api.delete(`/community/${communityId}/pin-post`);
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

  const toggleFollow = async (targetUserId) => {
    if (loadingFollow[targetUserId]) return;

    const action = followingStatus[targetUserId] ? "unfollow" : "follow";

    setLoadingFollow((prev) => ({ ...prev, [targetUserId]: true }));

    try {
      await api.post(`/user/toggleFollow/${targetUserId}`, { action });

      setFollowingStatus((prev) => ({
        ...prev,
        [targetUserId]: !prev[targetUserId],
      }));
    } catch (err) {
      console.error("Error following/unfollowing:", err.message);
    } finally {
      setLoadingFollow((prev) => ({ ...prev, [targetUserId]: false }));
    }
  };

  const handleProfileRedirect = (user) => {
    if (user.isCommunityAccount && user.createdCommunity) {
      router.push(`/explore/${user.username}`);
    } else {
      router.push(`/user/${user.username}`);
    }
  };

  // Handle report click
  const handleReportClick = (post) => {
    setSelectedPost(post);
    setReportModalOpen(true);
  };

  // Handle mute click
  const handleMuteClick = (post) => {
    setSelectedUser(post.author);
    setMuteModalOpen(true);
  };

  // Handle hide post click
  const handleHidePostClick = (post) => {
    setSelectedPost(post);
    setHidePostModalOpen(true);
  };

  // Handle hiding a post
  const handleHidePost = async () => {
    if (!selectedPost) return;

    try {
      await api.post(`/user/hide-post/${selectedPost._id}`);
      // Update local state to hide the post immediately
      setHiddenPosts([...hiddenPosts, selectedPost]);
      setPosts(posts.filter((p) => p._id !== selectedPost._id));
      toast.success("Post hidden successfully");
    } catch (error) {
      console.error("Error hiding post:", error);
      toast.error("Failed to hide post");
    } finally {
      setHidePostModalOpen(false);
    }
  };

  // Handle mute modal close
  const handleMuteModalClose = (wasMuted) => {
    setMuteModalOpen(false);
    // If user was muted, refresh the muted users list
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

  const communityOptions = [
    {
      label: "Mute Notifications",
      icon: <FaBellSlash />,
      action: (post) => {
        handleMuteClick(post);
      },
    },
    {
      label: "Hide Post",
      icon: <FaEyeSlash />,
      action: (post) => {
        handleHidePostClick(post);
      },
    },
    {
      label: "Report Post",
      icon: <FaExclamationCircle />,
      action: (post) => {
        handleReportClick(post);
      },
    },
  ];

  if (isUserModOrOwner) {
    communityOptions.push({
      label: (post) =>
        post._id === pinnedPostId ? "Unpin from Community" : "Pin to Community",
      icon: <FaThumbtack />,
      action: (post) => {
        if (post._id === pinnedPostId) {
          handlePinPost(post);
        } else {
          handlePinPost(post);
        }
      },
    });
  }

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

  return (
    <div className={styles.CommunityBodyContainer}>
      <div className={styles.tabs}>
        <button
          onClick={() => handleTabClick("Feed")}
          className={`${styles.tab} ${activeTab === "Feed" ? styles.activeTab : ""
            }`}
        >
          Feed
        </button>
        <button
          onClick={() => handleTabClick("Members")}
          className={`${styles.tab} ${activeTab === "Members" ? styles.activeTab : ""
            }`}
        >
          Members
        </button>
        <button
          onClick={() => handleTabClick("Discussion")}
          className={`${styles.tab} ${activeTab === "Discussion" ? styles.activeTab : ""
            }`}
        >
          Discussion
        </button>
      </div>
      <div className={styles.contentSection}>
        {activeTab === "Feed" && (
          <div className={styles.feedSection}>
            {loading ? (
              <div className={styles.feedContainer}>
                <PostSkeleton />
              </div>
            ) : error ? (
              <p className={styles.errorBox}>
                <span className={styles.errorIcon}>⚠️</span>
                No posts found for this community. Please check back later.
              </p>
            ) : posts.length > 0 ? (
              <div className={styles.feedContainer}>
                {organizedPosts.pinnedPost && (
                  <>
                    {/* <div className={styles.pinnedPostHeader}>
                      <img
                        className={styles.pinnedHeaderImage}
                        src={pinIcon}
                        alt="Pinned Post Icon"
                        style={{
                          width: "15px",
                          height: "15px",
                          marginRight: "5px",
                        }}
                      />
                      <span className={styles.pinnedHeaderText}>Pinned</span>
                    </div> */}
                    <Post
                      alwaysPopoverBelow={true}
                      key={organizedPosts.pinnedPost._id}
                      post={organizedPosts.pinnedPost}
                      isPinned={true}
                      options={communityOptions.map((option) => ({
                        label:
                          typeof option.label === "function"
                            ? option.label(organizedPosts.pinnedPost)
                            : option.label,
                        icon: option.icon,
                        action: () => option.action(organizedPosts.pinnedPost),
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
                    isPinned={false}
                    options={communityOptions.map((option) => ({
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
                <img
                  className={styles.noPostsImage}
                  src={no_posts}
                  alt="No posts"
                />
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

        {activeTab === "Members" && (
          <div className={styles.membersList}>
            {loading ? (
              <MemberItemSkeleton count={5} />
            ) : error ? (
              <p className={styles.errorBox}>
                <span className={styles.errorIcon}>⚠️</span>
                Failed to load members. Please try again later.
              </p>
            ) : community?.owner?.followers?.length > 0 ? (
              <>
                {/* Display all members for owner/mods or limit to 30 for others */}
                {(isUserModOrOwner
                  ? community.owner.followers
                  : community.owner.followers.slice(0, 30)
                ).map((follower) => {
                  const badgeSrc = follower?.communityBadge
                    ? communityBadge
                    : follower?.verificationBadge
                      ? verificationBadge
                      : null;

                  return (
                    <div key={follower._id} className={styles.memberItem}>
                      <div className={styles.memberProfile}>
                        <img
                          src={follower.picture || ProfileImage}
                          alt="Profile"
                          className={styles.profileImage}
                        />

                        <div className={styles.profileDetails}>
                          <div
                            className={styles.inlineRow}
                            onClick={() => handleProfileRedirect(follower)}
                            style={{ cursor: "pointer" }}
                          >
                            <h4 className={styles.profileName}>{follower.name}</h4>
                            {badgeSrc && (
                              <img
                                src={badgeSrc}
                                alt=""
                                aria-hidden="true"
                                className={styles.badgeIcon}
                              />
                            )}
                          </div>

                          <div className={styles.inlineRow}>
                            <p className={styles.profileUsername}>@{follower.username}</p>
                            {/* {badgeSrc && (
                              <img
                                src={badgeSrc}
                                alt=""
                                aria-hidden="true"
                                className={styles.badgeIcon}
                              />
                            )} */}
                          </div>
                        </div>
                      </div>

                      <button
                        className={
                          !followingStatus[follower._id]
                            ? styles.followButton
                            : styles.unFollowButton
                        }
                        onClick={() => toggleFollow(follower._id)}
                        disabled={loadingFollow[follower._id]}
                      >
                        {loadingFollow[follower._id]
                          ? "Loading..."
                          : followingStatus[follower._id]
                            ? "Unfollow"
                            : "Follow"}
                      </button>
                    </div>
                  );
                })}

                {/* Show message about hidden members for non-owner/mod users */}
                {!isUserModOrOwner && community.owner.followers.length > 30 && (
                  <div className={styles.hiddenMembersMessage}>
                    + {community.owner.followers.length - 30} more members. Only
                    community owners and moderators can see all members.
                  </div>
                )}
              </>
            ) : (
              <p>No followers to display.</p>
            )}
          </div>
        )}

        {activeTab === "Discussion" && (
          <Discussion communityId={communityId} messageIdToScroll={messageIdToScroll} loading={loading} />
        )}
      </div>

      {/* <Dialog open={showPinModal} onOpenChange={setShowPinModal}>
        <DialogContent className={styles.dialogContent}>
          <DialogTitle>
            {postToPin && postToPin._id === pinnedPostId
              ? "Unpin Post from Community"
              : "Pin Post to Community"}
          </DialogTitle>

          <div className={styles.dialogDescription}>
            {postToPin && postToPin._id === pinnedPostId ? (
              <p>
                Are you sure you want to unpin this post from the community?
              </p>
            ) : pinnedPostId ? (
              <div>
                <p>Another post is currently pinned to this community.</p>
                <p>Pinning this post will unpin the current pinned post.</p>
                <p>Do you want to continue?</p>
              </div>
            ) : (
              <p>
                This post will appear at the top of the community feed. Only one
                post can be pinned at a time.
              </p>
            )}
          </div>

          <Button variant="outline" onClick={() => setShowPinModal(false)}>
            Cancel
          </Button>

          <Button
            variant={
              postToPin && postToPin._id === pinnedPostId
                ? "destructive"
                : "default"
            }
            onClick={() => {
              if (postToPin && postToPin._id === pinnedPostId) {
                unpinPost();
              } else {
                pinPost(postToPin._id);
              }
            }}
          >
            {postToPin && postToPin._id === pinnedPostId ? "Unpin" : "Pin Post"}
          </Button>
        </DialogContent>
      </Dialog> */}

      <PinPostModal
        isOpen={showPinModal}
        onClose={() => setShowPinModal(false)}
        onPin={pinPost}
        onUnpin={unpinPost}
        post={postToPin}
        isPinned={postToPin && postToPin._id === pinnedPostId}
      />

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

      {/* Hide Post Modal */}
      {hidePostModalOpen && selectedPost && (
        <HidePostModal
          isOpen={hidePostModalOpen}
          onClose={() => setHidePostModalOpen(false)}
          onConfirm={handleHidePost}
          postAuthor={selectedPost.author.name}
        />
      )}
    </div>
  );
};

export default CommunityBody;
