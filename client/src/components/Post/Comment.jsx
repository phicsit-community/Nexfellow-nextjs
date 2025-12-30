import { useState, useEffect, useRef } from "react";
import axios from "axios";
import styles from "./Comment.module.css";
import { FaHeart, FaSpinner } from "react-icons/fa";
import Modal from "../ShareModal/MoreModal";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { BsThreeDots } from "react-icons/bs";

const Comment = ({
  comment,
  isReply,
  showReplyLine,
  parentId,
  postId,
  setComments,
  author,
  className,
  nestLevel = 0, // Track the nesting level for indentation
  currentUserId,
  myCommunityRole,
  isModeratorView = false,
}) => {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user")) || {};
  const [isReplyOpen, setIsReplyOpen] = useState(false);
  const [isViewReplies, setIsViewReplies] = useState(false);
  const [replyComment, setReplyComment] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedComment, setEditedComment] = useState(comment.text);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const threeDotRef = useRef(null);
  const [isReplyFocused, setIsReplyFocused] = useState(false);

  // Mention states for reply input
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionSuggestions, setMentionSuggestions] = useState([]);
  const [mentions, setMentions] = useState([]);

  // Loading states for async buttons
  const [loadingReply, setLoadingReply] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [loadingLike, setLoadingLike] = useState(false);

  // Safely initialize liked and likesCount
  const [liked, setLiked] = useState(
    Array.isArray(comment.likes) && currentUserId
      ? comment.likes.includes(currentUserId)
      : false
  );
  const [likesCount, setLikesCount] = useState(
    Array.isArray(comment.likes) ? comment.likes.length : 0
  );

  // Ownership check: assuming comment.user is username
  const isOwner = comment.user === currentUser.username;

  // Permission Logic
  const canEdit = isOwner;
  const canDelete =
    isOwner ||
    (isModeratorView &&
      (myCommunityRole === "creator" || myCommunityRole === "content-admin"));

  const handleReply = () => {
    setIsReplyOpen((prev) => {
      if (prev) setReplyComment("");
      return !prev;
    });
  };

  const handleEditComment = () => {
    setIsEditing(true);
    setIsModalOpen(false);
  };

  const handleDeleteComment = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete this comment? This action cannot be undone."
      )
    )
      return;
    setLoadingDelete(true);
    try {
      await axios.delete(`/comment/comments/${comment.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      setComments((prevComments) =>
        removeCommentFromState(prevComments, comment.id)
      );
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error deleting comment:", error);
      alert(
        error.response?.status === 403
          ? "You are not authorized to delete this comment."
          : "Failed to delete comment."
      );
    } finally {
      setLoadingDelete(false);
    }
  };

  const removeCommentFromState = (comments, commentIdToRemove) =>
    comments.filter((c) => {
      if (c.id === commentIdToRemove) return false;
      if (c.replies && c.replies.length > 0) {
        c.replies = removeCommentFromState(c.replies, commentIdToRemove);
      }
      return true;
    });

  const handleSaveEdit = async () => {
    if (!editedComment.trim()) {
      alert("Comment cannot be empty.");
      return;
    }
    setLoadingEdit(true);
    try {
      await axios.put(
        `/comment/comments/${comment.id}`,
        { content: editedComment },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );
      setComments((prevComments) =>
        updateCommentInState(prevComments, comment.id, editedComment)
      );
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating comment:", error);
      alert("Failed to update comment.");
    } finally {
      setLoadingEdit(false);
    }
  };

  const updateCommentInState = (comments, commentId, newContent) =>
    comments.map((c) => {
      if (c.id === commentId) return { ...c, text: newContent };
      if (c.replies && c.replies.length > 0) {
        c.replies = updateCommentInState(c.replies, commentId, newContent);
      }
      return c;
    });

  const handleReportComment = async () => {
    setLoadingDelete(true);
    try {
      await axios.put(
        `/comment/comments/${comment.id}/report`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );
      alert("Comment has been reported for moderation");
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error reporting comment:", error);
      alert("Failed to report comment.");
    } finally {
      setLoadingDelete(false);
    }
  };

  const formatDateToAbbreviation = (date) => {
    try {
      const distance = formatDistanceToNow(new Date(date), { addSuffix: false });
      if (distance.startsWith("less than a minute")) return "just now";

      const unitAbbreviationMap = {
        seconds: "s",
        second: "s",
        minutes: "m",
        minute: "m",
        hours: "h",
        hour: "h",
        days: "d",
        day: "d",
        months: "mo",
        month: "mo",
        years: "y",
        year: "y",
      };

      const cleanedDistance = distance.replace(/^about /, "");
      const [value, unit] = cleanedDistance.split(" ");
      if (!value || !unit) throw new Error("Unexpected distance format");

      return `${value}${unitAbbreviationMap[unit.toLowerCase()] || unit}`;
    } catch (error) {
      console.error("Error formatting date:", error.message);
      return "unknown";
    }
  };

  const handleOpenModal = (e) => {
    e.stopPropagation();
    if (threeDotRef.current) {
      const rect = threeDotRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
      });
    }
    setIsModalOpen(true);
  };

  // Recursive add reply
  const addReplyToNestedComments = (comments, parentId, newReply) =>
    comments.map((c) => {
      if (c.id === parentId) {
        return {
          ...c,
          replies: [
            {
              id: newReply._id,
              text: newReply.content,
              community: currentUser.name,
              user: currentUser.username,
              img: currentUser.picture,
              time: formatDateToAbbreviation(newReply.createdAt),
              replies: [],
              likes: [],
              mentions: newReply.mentions || [],
            },
            ...(c.replies || []),
          ],
        };
      }
      if (c.replies && c.replies.length > 0) {
        return {
          ...c,
          replies: addReplyToNestedComments(c.replies, parentId, newReply),
        };
      }
      return c;
    });

  const handleLikeComment = async () => {
    if (loadingLike) return;
    setLoadingLike(true);
    try {
      const response = await axios.put(
        `/comment/comments/${comment.id}/like`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
        }
      );

      setLiked(!liked);
      setLikesCount(response.data.likes);
    } catch (error) {
      console.error("Error liking the comment:", error);
      alert("Failed to like comment.");
    } finally {
      setLoadingLike(false);
    }
  };

  const handleProfileClick = () => {
    if (comment.isCommunityAccount && comment.createdCommunity) {
      navigate(`/community/${comment.user}`);
    } else {
      navigate(`/user/${comment.user}`);
    }
  };

  const replyStyle = isReply
    ? { marginLeft: nestLevel > 0 ? `${nestLevel * 40}px` : "40px" }
    : {};

  // Mention helpers for reply input --------------------------------
  const fetchMentionSuggestions = async (query) => {
    if (!query || query.length === 0) {
      setMentionSuggestions([]);
      return;
    }
    try {
      const res = await axios.get(`/comment/comments/users/search?query=${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
      });
      setMentionSuggestions(res.data || []);
    } catch (err) {
      console.error("Error fetching mention suggestions: ", err);
      setMentionSuggestions([]);
    }
  };

  const handleReplyChange = (e) => {
    const val = e.target.value;
    setReplyComment(val);

    const cursorPos = e.target.selectionStart;
    const textUntilCursor = val.slice(0, cursorPos);
    const mentionMatch = textUntilCursor.match(/(?:^|\s)@([\w.@-]*)$/);
    if (mentionMatch) {
      const query = mentionMatch[1];
      setMentionQuery(query);
      fetchMentionSuggestions(query);
    } else {
      setMentionQuery("");
      setMentionSuggestions([]);
    }
  };

  const addMentionToReply = (user) => {
    const lastAtIndex = replyComment.lastIndexOf("@" + mentionQuery);
    const before = replyComment.slice(0, lastAtIndex);
    const after = replyComment.slice(lastAtIndex + mentionQuery.length + 1);
    const space = before && !before.endsWith(" ") ? " " : "";
    const newText = `${before}${space}@${user.username} ${after}`;
    setReplyComment(newText);
    setMentionQuery("");
    setMentionSuggestions([]);
    if (!mentions.find((m) => m._id === user._id)) {
      setMentions((prev) => [...prev, user]);
    }
  };

  const handleAddReplyComment = async () => {
    if (!replyComment.trim() || loadingReply) return;
    setLoadingReply(true);
    try {
      const response = await axios.post(
        `/comment/posts/${postId}/comments`,
        {
          content: replyComment,
          parentCommentId: parentId,
          mentions: mentions.map((m) => m._id),
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
        }
      );
      setComments((prevComments) =>
        addReplyToNestedComments(prevComments, parentId, response.data.comment)
      );
      setReplyComment("");
      setMentionQuery("");
      setMentionSuggestions([]);
      setMentions([]);
      setIsReplyOpen(false);
      setIsViewReplies(true);
    } catch (error) {
      console.error("Error adding comment", error);
      alert("Failed to add reply.");
    } finally {
      setLoadingReply(false);
    }
  };

  const renderCommentWithMentions = (text, mentions) => {
    if (!mentions || mentions.length === 0) {
      return text;
    }
    const mentionMap = {};
    mentions.forEach((m) => {
      if (m.username) mentionMap[m.username.toLowerCase()] = m;
    });
    const parts = text.split(/(@\w+)/g);

    // Helper function to navigate based on mention type
    const handleMentionClick = (mention) => {
      if (mention.isCommunityAccount && mention.createdCommunity) {
        navigate(`/community/${mention.username}`);
      } else {
        navigate(`/user/${mention.username}`);
      }
    };

    return parts.map((part, index) => {
      if (part.startsWith("@")) {
        const username = part.slice(1).toLowerCase();
        const mention = mentionMap[username];
        if (mention) {
          return (
            <span
              key={index}
              className={styles.mentionHighlight}
              tabIndex={0} // Make focusable
              role="link"
              aria-label={`Go to ${mention.username} profile`}
              onClick={() => handleMentionClick(mention)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handleMentionClick(mention);
                }
              }}
              title={`Go to ${mention.username} profile`}
              style={{ cursor: "pointer" }}
            >
              {part}
            </span>
          );
        }
      }
      return <span key={index}>{part}</span>;
    });
  };

  const prefixRegex = /^replying to\s+@?(\w+)\s*/i;
  const prefixMatch = comment.text.match(prefixRegex);

  let prefixPart = null;
  let mainText = comment.text;

  if (prefixMatch) {
    prefixPart = prefixMatch[1];
    mainText = comment.text.replace(prefixRegex, "");
  }
  return (
    <>
      <div
        className={`${styles.commentContainer} ${isReply ? styles.reply : ""}`}
        style={replyStyle}
      >
        {showReplyLine && isViewReplies && !isReplyOpen && (
          <div className={styles.replyLine}></div>
        )}
        <img
          src={comment.img || "https://via.placeholder.com/40"}
          alt="User"
          className={styles.userImage}
          onClick={handleProfileClick}
        />
        <div className={styles.commentContent}>
          <div className={styles.commentHeader}>
            <span className={styles.Name}>
              <div className={styles.communityName} onClick={handleProfileClick}>
                {comment.community}
              </div>
              <div className={styles.userName} onClick={handleProfileClick}>
                @{comment.user}
              </div>
            </span>
            <span className={styles.timestamp}>{comment.time}</span>
            <div className={styles.moreOptions}>
              <div
                className={styles.threeDot}
                ref={threeDotRef}
                onClick={handleOpenModal}
              >
                {loadingDelete ? (
                  <FaSpinner className={styles.spinner} />
                ) : (
                  <BsThreeDots className={styles.moreIcon} />
                )}
              </div>
              {isModalOpen && (
                <Modal
                  options={
                    canEdit
                      ? [
                        {
                          label: loadingEdit ? (
                            <>
                              <FaSpinner className={styles.spinner} />
                            </>
                          ) : (
                            "Edit"
                          ),
                          action: handleEditComment,
                          disabled: loadingEdit,
                        },
                        ...(canDelete
                          ? [
                            {
                              label: loadingDelete ? (
                                <>
                                  <FaSpinner className={styles.spinner} />
                                </>
                              ) : (
                                "Delete"
                              ),
                              action: handleDeleteComment,
                              disabled: loadingDelete,
                            },
                          ]
                          : []),
                        { label: "Reply", action: handleReply },
                      ]
                      : canDelete
                        ? [
                          {
                            label: loadingDelete ? (
                              <>
                                <FaSpinner className={styles.spinner} />
                              </>
                            ) : (
                              "Delete"
                            ),
                            action: handleDeleteComment,
                            disabled: loadingDelete,
                          },
                          { label: "Reply", action: handleReply },
                        ]
                        : [
                          { label: "Reply", action: handleReply },
                          {
                            label: loadingDelete ? (
                              <>
                                <FaSpinner className={styles.spinner} />
                              </>
                            ) : (
                              "Report"
                            ),
                            action: handleReportComment,
                            disabled: loadingDelete,
                          },
                        ]
                  }
                  onClose={() => setIsModalOpen(false)}
                  position={position}
                />
              )}
            </div>
          </div>

          {isEditing ? (
            <div className={styles.editCommentContainer}>
              <input
                type="text"
                value={editedComment}
                onChange={(e) => setEditedComment(e.target.value)}
                className={styles.commentInput}
                autoFocus
                disabled={loadingEdit}
              />
              <div className={styles.editButtons}>
                <button
                  onClick={() => setIsEditing(false)}
                  className={styles.cancelButton}
                  disabled={loadingEdit}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className={styles.postButton}
                  disabled={loadingEdit}
                >
                  {loadingEdit ? (
                    <>
                      <FaSpinner className={styles.spinner} />
                    </>
                  ) : (
                    "Save"
                  )}
                </button>
              </div>
            </div>
          ) : (
            <p className={styles.commentText}>
              {prefixPart && (
                <>
                  <span
                    style={{
                      color: "#6c757d", // muted gray
                      fontStyle: "italic",
                      marginRight: "6px",
                      userSelect: "none",
                    }}
                  >
                    replying to
                  </span>
                  <span
                    className={styles.mentionHighlight}
                    onClick={() => navigate(`/user/${prefixPart}`)}
                    style={{ cursor: "pointer" }}
                    title={`Go to ${prefixPart}'s profile`}
                    tabIndex={0}
                    role="link"
                    aria-label={`Go to ${prefixPart}'s profile`}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        navigate(`/user/${prefixPart}`);
                      }
                    }}
                  >
                    {prefixPart}
                  </span>
                  {" "}
                </>
              )}
              {renderCommentWithMentions(mainText, comment.mentions)}
            </p>
          )}

          <div className={styles.actions}>
            <button
              onClick={handleLikeComment}
              className={styles.heartButton}
              disabled={loadingLike}
            >
              {loadingLike ? (
                <FaSpinner className={styles.spinner} />
              ) : (
                <FaHeart
                  className={`${liked ? styles.heartIconFill : styles.heartIcon}`}
                />
              )}
              {likesCount > 0 && !loadingLike && (
                <span className={styles.likeCount}>{likesCount}</span>
              )}
            </button>
            <button onClick={handleReply}>{isReplyOpen ? "Cancel" : "Reply"}</button>
            {comment.replies && comment.replies.length > 0 && (
              <button onClick={() => setIsViewReplies(!isViewReplies)}>
                {isViewReplies
                  ? "Hide replies"
                  : `View replies (${comment.replies.length})`}
              </button>
            )}
          </div>
        </div>
      </div>

      {isReplyOpen && (
        <div
          className={`${styles.commentContainer} ${isReply ? styles.reply : ""}`}
          style={{
            alignItems: "center",
            ...replyStyle,
            position: "relative",
          }}
        >
          <div className={styles.commentContent} style={{ width: "100%" }}>
            <div className={styles.addCommentContainer} style={{ position: "relative" }}>
              <img
                src={currentUser.picture || "https://via.placeholder.com/40"}
                alt="User"
                className={styles.userImage}
              />
              <div className={styles.inputWrapper}>
                <textarea
                  placeholder="Add a reply..."
                  value={replyComment}
                  onFocus={() => setIsReplyFocused(true)}
                  onBlur={() => {
                    if (!replyComment.trim()) setIsReplyFocused(false);
                  }}
                  onChange={handleReplyChange}
                  className={`${styles.commentInput} ${isReplyFocused || replyComment ? styles.expanded : ""
                    }`}
                  disabled={loadingReply}
                />
                {(isReplyFocused || replyComment) && (
                  <button
                    onClick={handleAddReplyComment}
                    className={styles.sendInside}
                    disabled={loadingReply || !replyComment.trim()}
                  >
                    {loadingReply ? <FaSpinner className={styles.spinner} /> : "Comment"}
                  </button>
                )}
                {mentionQuery && mentionSuggestions.length > 0 && (
                  <ul className={styles.mentionSuggestions}>
                    {mentionSuggestions.map((user) => (
                      <li key={user._id} onClick={() => addMentionToReply(user)}>
                        <img
                          src={user.picture || "/default-profile.png"}
                          alt={user.name || user.username || "User"}
                          className={styles.mentionAvatar}
                        />
                        <span>{user.username || user.name}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {isViewReplies && comment.replies && comment.replies.length > 0 && (
        <div className={styles.repliesContainer}>
          {comment.replies.map((reply) => (
            <Comment
              key={reply.id}
              comment={reply}
              isReply={true}
              showReplyLine={reply.replies && reply.replies.length > 0}
              parentId={comment.id} // pass parent's id, NOT reply.id
              postId={postId}
              setComments={setComments}
              nestLevel={nestLevel + 1}
              currentUserId={currentUserId}
              myCommunityRole={myCommunityRole}
              isModeratorView={isModeratorView}
              author={author}
              className={className}
            />
          ))}
        </div>
      )}
    </>
  );
};

const CommentSection = ({ postId, author, className, isModeratorView = false }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [myCommunityRole, setMyCommunityRole] = useState(null);
  const navigate = useNavigate();
  const [isFocused, setIsFocused] = useState(false);

  // Mention states for new comment input
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionSuggestions, setMentionSuggestions] = useState([]);
  const [mentions, setMentions] = useState([]);

  const currentUser = JSON.parse(localStorage.getItem("user")) || {};
  const currentUserId = currentUser.id || currentUser._id || null;

  // Fetch user role for mod permissions
  useEffect(() => {
    if (!currentUserId) return;
    async function fetchUserRole() {
      try {
        const res = await axios.get(`/comment/${postId}/myRole`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        });
        setMyCommunityRole(res.data.role || null);
      } catch (error) {
        console.error("Failed to fetch community role", error);
        setMyCommunityRole(null);
      }
    }
    fetchUserRole();
  }, [postId, currentUserId]);

  // Fetch comments on mount/postId change
  useEffect(() => {
    axios
      .get(`/comment/posts/${postId}/comments`)
      .then((response) => {
        const formatComments = (comments) =>
          comments.map((val) => ({
            id: val._id,
            text: val.content,
            community: val.author.name,
            user: val.author.username,
            img: val.author.picture,
            time: formatDateToAbbreviation(val.createdAt),
            replies: val.reply ? formatComments(val.reply) : [],
            likes: val.likes || [],
            mentions: val.mentions || [],
            isCommunityAccount: val.author.isCommunityAccount || false,
            createdCommunity: val.author.createdCommunity || false,
          }));

        const data = response.data.comments;
        setComments(formatComments(data));
      })
      .catch((error) => {
        console.error("Error fetching comments", error);
      });
  }, [postId]);

  // Mention helpers for new comment input -----------------------------
  const fetchMentionSuggestionsNewComment = async (query) => {
    if (!query || query.length === 0) {
      setMentionSuggestions([]);
      return;
    }
    try {
      const res = await axios.get(`/comment/comments/users/search?query=${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
      });
      setMentionSuggestions(res.data || []);
    } catch (err) {
      console.error("Error fetching mention suggestions: ", err);
      setMentionSuggestions([]);
    }
  };

  const handleNewCommentChange = (e) => {
    const val = e.target.value;
    setNewComment(val);

    const cursorPos = e.target.selectionStart;
    const textUntilCursor = val.slice(0, cursorPos);
    const mentionMatch = textUntilCursor.match(/(?:^|\s)@([\w.@-]*)$/);
    if (mentionMatch) {
      const query = mentionMatch[1];
      setMentionQuery(query);
      fetchMentionSuggestionsNewComment(query);
    } else {
      setMentionQuery("");
      setMentionSuggestions([]);
    }
  };

  const addMentionToNewComment = (user) => {
    const lastAtIndex = newComment.lastIndexOf("@" + mentionQuery);
    const before = newComment.slice(0, lastAtIndex);
    const after = newComment.slice(lastAtIndex + mentionQuery.length + 1);
    const space = before && !before.endsWith(" ") ? " " : "";
    const newText = `${before}${space}@${user.username} ${after}`;
    setNewComment(newText);
    setMentionQuery("");
    setMentionSuggestions([]);
    if (!mentions.find((m) => m._id === user._id)) {
      setMentions((prev) => [...prev, user]);
    }
  };

  const handleAddComment = () => {
    if (!newComment.trim() || loading) return;
    setLoading(true);
    axios
      .post(
        `/comment/posts/${postId}/comments`,
        { content: newComment, mentions: mentions.map((m) => m._id) },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
        }
      )
      .then((response) => {
        if (!response.data.comment) {
          alert("Failed to add comment");
          return;
        }
        const newData = {
          id: response.data.comment._id,
          text: response.data.comment.content,
          community: currentUser.name,
          user: currentUser.username,
          img: currentUser.picture,
          time: formatDateToAbbreviation(response.data.comment.createdAt),
          replies: [],
          likes: [],
          mentions: response.data.comment.mentions || [],
        };
        setComments((prevComments) => [newData, ...prevComments]);
        setNewComment("");
        setMentionQuery("");
        setMentionSuggestions([]);
        setMentions([]);
      })
      .catch((error) => {
        console.error("Error adding comment", error);
        alert("Failed to add comment.");
      })
      .finally(() => {
        setLoading(false);
      });
  };
  // -------------------------------------------------------------------

  const formatDateToAbbreviation = (date) => {
    try {
      const distance = formatDistanceToNow(new Date(date), { addSuffix: false });
      if (distance.startsWith("less than a minute")) return "just now";

      const unitAbbreviationMap = {
        seconds: "s",
        second: "s",
        minutes: "m",
        minute: "m",
        hours: "h",
        hour: "h",
        days: "d",
        day: "d",
        months: "mo",
        month: "mo",
        years: "y",
        year: "y",
      };

      const cleanedDistance = distance.replace(/^about /, "");
      const [value, unit] = cleanedDistance.split(" ");
      if (!value || !unit) throw new Error("Unexpected distance format");

      return `${value}${unitAbbreviationMap[unit.toLowerCase()] || unit}`;
    } catch (error) {
      console.error("Error formatting date:", error.message);
      return "unknown";
    }
  };

  return (
    <div className={`${styles.commentSection} ${className || ""}`}>
      <div className={styles.addCommentContainer} style={{ position: "relative" }}>
        <img
          src={currentUser.picture || "https://via.placeholder.com/40"}
          alt="User"
          className={styles.userImage}
        />
        <div className={styles.inputWrapper}>
          <textarea
            placeholder="Add a comment..."
            value={newComment}
            onFocus={() => setIsFocused(true)}
            onBlur={() => {
              if (!newComment.trim()) setIsFocused(false);
            }}
            onChange={handleNewCommentChange}
            className={`${styles.commentInput} ${isFocused || newComment ? styles.expanded : ""}`}
            disabled={loading}
          />
          {(isFocused || newComment) && (
            <button
              onClick={handleAddComment}
              className={styles.sendInside}
              disabled={loading || !newComment.trim()}
            >
              {loading ? <FaSpinner className={styles.spinner} /> : "Comment"}
            </button>
          )}
          {mentionQuery && mentionSuggestions.length > 0 && (
            <ul className={styles.mentionSuggestions}>
              {mentionSuggestions.map((user) => (
                <li key={user._id} onClick={() => addMentionToNewComment(user)}>
                  <img
                    src={user.picture || "/default-profile.png"}
                    alt={user.name || user.username || "User"}
                    className={styles.mentionAvatar}
                  />
                  <span>{user.username || user.name}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {comments?.map((comment) => (
        <div key={comment.id} className={styles.commentThread}>
          <Comment
            comment={comment}
            showReplyLine={comment.replies && comment.replies.length > 0}
            parentId={comment.id}
            postId={postId}
            setComments={setComments}
            nestLevel={0} // Root level comments start at 0
            currentUserId={currentUserId}
            myCommunityRole={myCommunityRole}
            isModeratorView={isModeratorView}
            author={author}
            className={className}
          />
        </div>
      ))}
    </div>
  );
};

export default CommentSection;
