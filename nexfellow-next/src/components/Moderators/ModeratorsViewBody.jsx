"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import no_posts from "./assets/no_posts.png";
import pinIcon from "./assets/pin.svg";
import ProfileImage from "./assets/profile_image.svg";
import { useRouter } from "next/navigation";
import {
  FaThumbtack,
  FaBellSlash,
  FaEyeSlash,
  FaExclamationCircle,
  FaEdit, FaTrash,
} from "react-icons/fa";

// styles
import styles from "./ModeratorsView.module.css";

// components
import Post from "../Post/Post";
import MemberItemSkeleton from "./MemberItemSkeleton";
import { toast } from "sonner";
import ReportModal from "../ReportModal/ReportModal";
import MuteUserModal from "../MuteUserModal/MuteUserModal";
import HidePostModal from "../Modals/HidePostModal";
import PinPostModal from "../PinPostModal/PinPostModal";
import Discussion from "../Discussion/Discussion";
import PostDialog from "../Dashboard/PostDialog"; // Import PostDialog from dashboard to reuse
import PostSkeleton from "../Post/PostSkeleton";
import ModeratorsAnalytics from "./ModeratorsAnalytics";

// Helper to get current user's role in the community moderators list or owner
function getMyCommunityRole(community, userId) {
  if (!community) return null;
  if (
    community.owner &&
    (community.owner._id === userId || community.owner === userId)
  )
    return "creator";

  const mod = (community.moderators || []).find((m) =>
    (typeof m.user === "string" ? m.user : m.user?._id) === userId
  );
  return mod?.role || null;
}

const ModeratorsViewBody = ({ communityId }) => {
  const [activeTab, setActiveTab] = useState("Feed");
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

  // Post dialog states for create/edit post (content-admin)
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [newPost, setNewPost] = useState(""); // optional - to track input in your create box

  // Modal states for other modals
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [muteModalOpen, setMuteModalOpen] = useState(false);
  const [hidePostModalOpen, setHidePostModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [mutedUsers, setMutedUsers] = useState([]);
  const [hiddenPosts, setHiddenPosts] = useState([]);

  const currentUserId = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user"))?.id : null;

  // Current user's community role
  const [myCommunityRole, setMyCommunityRole] = useState(null);
  const isContentAdmin =
    myCommunityRole === "content-admin" || myCommunityRole === "creator";

  const isModerator = myCommunityRole === "moderator";

  useEffect(() => {
    if (community && currentUserId) {
      setMyCommunityRole(getMyCommunityRole(community, currentUserId));
    }
  }, [community, currentUserId]);

  const isModeratorView = myCommunityRole === "content-admin" || myCommunityRole === "moderator" || myCommunityRole === "creator";

  const isAnalyst = myCommunityRole === "analyst";

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [postsResponse, communityResponse] = await Promise.all([
          axios.get(`/post/community/${communityId}`),
          axios.get(`/community/id/${communityId}`),
        ]);

        const followers =
          communityResponse.data?.community?.owner?.followers || [];

        let followStatusMap = {};
        if (followers.length > 0) {
          const followStatuses = await Promise.all(
            followers.map(async (follower) => {
              try {
                const res = await axios.get(
                  `/user/followStatus/${follower._id}`
                );
                return { id: follower._id, isFollowing: res.data.isFollowing };
              } catch {
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
    if (communityId && community) {
      setPinnedPostId(community.pinnedPost || null);
    }
  }, [communityId, community]);

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  // Pin/unpin functions
  const pinPost = async (postId) => {
    try {
      await axios.post(`/community/${communityId}/pin-post/${postId}`);
      setPinnedPostId(postId);
      toast.success("Post pinned to community successfully!");
      setShowPinModal(false);
    } catch (err) {
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
      toast.error(
        "Failed to unpin post: " + (err.response?.data?.message || err.message)
      );
    }
  };
  const handlePinPost = (post) => {
    setPostToPin(post);
    setShowPinModal(true);
  };

  // Toggle follow
  const toggleFollow = async (targetUserId) => {
    if (loadingFollow[targetUserId]) return;

    const action = followingStatus[targetUserId] ? "unfollow" : "follow";

    setLoadingFollow((prev) => ({ ...prev, [targetUserId]: true }));

    try {
      await axios.post(`/user/toggleFollow/${targetUserId}`, { action });

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

  // Post Dialog handlers (Create/Edit post) — privilege for content-admin/creator only
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
        // Editing existing post
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
        // Creating new post
        response = await axios.post("/post", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        if (
          response.data.shortenedUrls &&
          response.data.shortenedUrls.length > 0
        ) {
          toast.info(
            `${response.data.shortenedUrls.length} URLs have been shortened for tracking`
          );
        }
      }

      // Refresh posts list after create/edit
      const postsResponse = await axios.get(`/post/community/${communityId}`);
      setPosts(postsResponse.data.posts);

      setEditingPost(null);
      setIsDialogOpen(false);
      setNewPost("");
    } catch (err) {
      setError("Error submitting post: " + err.message);
    }
  };

  // Other modals handlers
  const handleReportClick = (post) => {
    setSelectedPost(post);
    setReportModalOpen(true);
  };
  const handleMuteClick = (post) => {
    setSelectedUser(post.author);
    setMuteModalOpen(true);
  };
  const handleHidePostClick = (post) => {
    setSelectedPost(post);
    setHidePostModalOpen(true);
  };
  const handleHidePost = async () => {
    if (!selectedPost) return;
    try {
      await axios.post(`/user/hide-post/${selectedPost._id}`);
      setHiddenPosts([...hiddenPosts, selectedPost]);
      setPosts(posts.filter((p) => p._id !== selectedPost._id));
      toast.success("Post hidden successfully");
    } catch (error) {
      toast.error("Failed to hide post");
    } finally {
      setHidePostModalOpen(false);
    }
  };
  const handleMuteModalClose = (wasMuted) => {
    setMuteModalOpen(false);
    if (wasMuted) {
      axios
        .get("/user/muted-users")
        .then((response) => {
          setMutedUsers(response.data.mutedUsers || []);
        })
        .catch(() => { });
    }
  };

  // Options for posts: mute, hide, report always
  const communityOptions = [
    {
      label: "Mute Notifications",
      icon: <FaBellSlash />,
      action: (post) => handleMuteClick(post),
    },
    {
      label: "Hide Post",
      icon: <FaEyeSlash />,
      action: (post) => handleHidePostClick(post),
    },
    {
      label: "Report Post",
      icon: <FaExclamationCircle />,
      action: (post) => handleReportClick(post),
    },
  ];

  // If content-admin or creator, add pin/unpin option
  if (isContentAdmin) {
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

  const dashboardOptions = [];
  if (isContentAdmin) {
    dashboardOptions.push(
      {
        label: "Edit",
        icon: <FaEdit />,
        action: (post) => {
          setEditingPost(post);
          setIsDialogOpen(true);
        },
      },
      {
        label: "Delete",
        icon: <FaTrash />,
        action: async (post) => {
          try {
            await axios.delete(`/post/${post._id}`);
            toast.success("Post deleted successfully!");
            // Refresh posts after deletion
            const postsResponse = await axios.get(
              `/post/community/${communityId}`
            );
            setPosts(postsResponse.data.posts);
          } catch (error) {
            toast.error("Error deleting post: " + error.message);
          }
        },
      }
    );
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
          className={`${styles.tab} ${activeTab === "Feed" ? styles.activeTab : ""}`}
        >
          Feed
        </button>
        <button
          onClick={() => handleTabClick("Members")}
          className={`${styles.tab} ${activeTab === "Members" ? styles.activeTab : ""}`}
        >
          {isAnalyst ? "Analytics" : "Members"}
        </button>
        <button
          onClick={() => handleTabClick("Discussion")}
          className={`${styles.tab} ${activeTab === "Discussion" ? styles.activeTab : ""}`}
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
            ) : (
              <>
                {isContentAdmin && (
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
                        id="newPostInput"
                        type="text"
                        placeholder="Share a post"
                        className={styles.postInput}
                        value={newPost}
                        onChange={handleNewPostChange}
                        readOnly
                      />
                    </div>
                  </div>
                )}

                <div className={styles.feedContainer}>
                  {organizedPosts.pinnedPost && (
                    <>
                      {/* <div className={styles.pinnedPostHeader}>
                        <img
                          className={styles.pinnedHeaderImage}
                          src={pinIcon}
                          alt="Pinned Post Icon"
                          style={{ width: 15, height: 15, marginRight: 5 }}
                        />
                        <span className={styles.pinnedHeaderText}>Pinned</span>
                      </div> */}
                      <Post
                        key={organizedPosts.pinnedPost._id}
                        post={organizedPosts.pinnedPost}
                        isPinned={true}
                        isModeratorView={isModeratorView}
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
                        <div className={styles.regularPostsDivider} />
                      )}
                    </>
                  )}
                  {organizedPosts.regularPosts.map((post) => (
                    <Post
                      key={post._id}
                      post={post}
                      isModeratorView={isModeratorView}
                      isPinned={false}
                      options={[
                        ...communityOptions,
                        ...(isContentAdmin ? dashboardOptions : []),
                      ].map((option) => ({
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
              </>
            )}
          </div>
        )}

        {activeTab === "Members" && (
          isAnalyst ? (
            // Only show analytics widget for analyst moderators
            <div className={styles.analytics} style={{ width: "100%", padding: "5%" }}>
              <ModeratorsAnalytics
                communityId={communityId}
              />
            </div>
          ) : (
            // Default: Show regular member list for all other roles
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
                  {(isContentAdmin
                    ? community.owner.followers
                    : community.owner.followers.slice(0, 30)
                  ).map((follower) => (
                    <div key={follower._id} className={styles.memberItem}>
                      <div className={styles.memberProfile}>
                        <img
                          src={follower.picture || ProfileImage}
                          alt="Profile"
                          className={styles.profileImage}
                        />
                        <div className={styles.profileDetails}>
                          <h4
                            className={styles.profileName}
                            onClick={() => handleProfileRedirect(follower)}
                            style={{ cursor: "pointer" }}
                          >
                            {follower.name}
                          </h4>
                          <p className={styles.profileUsername}>
                            @{follower.username}
                          </p>
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
                  ))}
                  {!isContentAdmin &&
                    community.owner.followers.length > 30 && (
                      <div className={styles.hiddenMembersMessage}>
                        + {community.owner.followers.length - 30} more members.
                        Only content admins and creators can see all members.
                      </div>
                    )}
                </>
              ) : (
                <p>No followers to display.</p>
              )}
            </div>
          )
        )}

        {activeTab === "Discussion" && (
          <Discussion communityId={communityId} moderator={isModerator} isModeratorView={isModeratorView} loading={loading} />
        )}
      </div>

      {/* PostDialog for create/edit post - only accessible to content-admin */}
      {
        isContentAdmin && (
          <PostDialog
            isOpen={isDialogOpen}
            onClose={() => {
              setIsDialogOpen(false);
              setEditingPost(null);
              setNewPost("");
            }}
            onSubmit={handlePostSubmit}
            community={community}
            post={editingPost}
          />
        )
      }

      <PinPostModal
        isOpen={showPinModal}
        onClose={() => setShowPinModal(false)}
        onPin={pinPost}
        onUnpin={unpinPost}
        post={postToPin}
        isPinned={postToPin && postToPin._id === pinnedPostId}
      />

      {
        reportModalOpen && selectedPost && (
          <ReportModal
            isOpen={reportModalOpen}
            onClose={() => setReportModalOpen(false)}
            postId={selectedPost._id}
            authorId={selectedPost.author._id}
          />
        )
      }

      {
        muteModalOpen && selectedUser && (
          <MuteUserModal
            isOpen={muteModalOpen}
            onClose={handleMuteModalClose}
            user={selectedUser}
          />
        )
      }

      {
        hidePostModalOpen && selectedPost && (
          <HidePostModal
            isOpen={hidePostModalOpen}
            onClose={() => setHidePostModalOpen(false)}
            onConfirm={handleHidePost}
            postAuthor={selectedPost.author.name}
          />
        )
      }
    </div >
  );
};

export default ModeratorsViewBody;
