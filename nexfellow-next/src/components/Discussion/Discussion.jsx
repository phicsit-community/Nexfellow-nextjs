// Discussion.jsx
"use client";

import { useEffect, useState, useRef, forwardRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { getSocket } from "../../utils/socket";
import axios from "axios";
import styles from "./Discussion.module.css";
import SendIcon from "./assets/send.svg";
import {
  FaTrash,
  FaArrowDown,
  FaReply,
  FaRegSmile,
  FaPaperclip,
  FaImage,
  FaCode,
} from "react-icons/fa";
import { useSelector } from "react-redux";
import { useSwipeable } from "react-swipeable";

// Emoji picker (emoji-mart)
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";

const OrganizerBadge = () => (
  <span className={styles.roleBadge}>Organizer</span>
);

// Dynamic ReactionBar with quick reacts + emoji picker
const ReactionBar = ({ message, onReact }) => {
  const [open, setOpen] = useState(false);
  const reactions = message.reactions || {}; // { "👍": 5, "❤️": 2, "🎉": 1 }
  const keys = Object.keys(reactions);
  const base = ["👍", "❤️", "🎉"];
  const show = keys.length ? keys : base;

  return (
    <div className={styles.reactionBar} style={{ position: "relative" }}>
      {show.map((r) => (
        <button
          key={r}
          className={styles.reactionChip}
          type="button"
          onClick={() => onReact(message._id, r)}
          aria-label={`React ${r}`}
        >
          <span>{r}</span>
          {reactions[r] ? <span className={styles.reactionCount}>{reactions[r]}</span> : null}
        </button>
      ))}
      <button
        type="button"
        className={styles.reactionAddBtn}
        onClick={() => setOpen((v) => !v)}
        aria-label="Add reaction"
        title="Add reaction"
      >
        +
      </button>
      {open && (
        <div className={styles.emojiPopoverSmall}>
          <Picker
            data={data}
            onEmojiSelect={(emoji) => {
              onReact(message._id, emoji.native);
              setOpen(false);
            }}
            theme={document.documentElement.classList.contains("dark") ? "dark" : "light"}
            previewPosition="none"
          />
        </div>
      )}
      <button
        type="button"
        className={styles.replyInlineBtn}
        onClick={() => message.onReply?.(message)}
      >
        Reply
      </button>
    </div>
  );
};

const MessageItem = forwardRef(
  (
    {
      message,
      currentUserId,
      isOwner,
      isModerator,
      onDelete,
      onReply,
      setHoveredMessageId,
      hoveredMessageId,
      onReplyClick,
      depth = 0,
    },
    ref
  ) => {
    const router = useRouter();

    const userInfo = message.author || {};
    const userPicture =
      userInfo?.picture || userInfo?.profile?.profilePhoto || "/default-profile.png";

    const handleMentionClick = (mention) => {
      if (!mention || !mention.username) return;
      if (mention.isCommunityAccount || mention.isCommunity) {
        router.push(`/community/${mention.username}`);
      } else {
        router.push(`/user/${mention.username}`);
      }
    };

    const renderMessageWithMentions = (text, mentions) => {
      if (!mentions || mentions.length === 0) return text;
      const map = {};
      mentions.forEach((m) => {
        if (m.username) map[m.username.toLowerCase()] = m;
      });
      const parts = text.split(/(@[\w.-]+)/g);
      return parts.map((part, idx) => {
        if (part.startsWith("@")) {
          const username = part.slice(1).toLowerCase();
          const mention = map[username];
          if (mention) {
            return (
              <span
                key={idx}
                className={styles.mention}
                onClick={() => handleMentionClick(mention)}
                title={`Go to ${mention.username} profile`}
              >
                {part}
              </span>
            );
          }
        }
        return <span key={idx}>{part}</span>;
      });
    };

    const swipeHandlers = useSwipeable({
      onSwipedRight: () => onReply(message),
      preventDefaultTouchmoveEvent: true,
      trackMouse: true,
    });

    const isCurrentUser = currentUserId === message.author?._id;
    const formatTime = (date) =>
      new Date(date)
        .toLocaleTimeString("en-US", { hour: "numeric", minute: "numeric", hour12: true })
        .toLowerCase();

    return (
      <>
        {message.showDate && (
          <div className={styles.dateDivider}>
            {new Date(message.createdAt).toLocaleDateString("en-US", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </div>
        )}

        <div
          {...swipeHandlers}
          className={`${styles.messageRow} ${depth > 0 ? styles.isReplyRow : ""}`}
          ref={ref}
        >
          {depth > 0 && <div className={styles.replyConnector} aria-hidden="true" />}

          <div
            className={[
              styles.messageCard,
              isCurrentUser ? styles.ownMessageCard : "",
              depth > 0 ? styles.replyMessageCard : "",
            ].join(" ")}
            onMouseEnter={() => setHoveredMessageId(message._id)}
            onMouseLeave={() => setHoveredMessageId(null)}
          >
            <div className={styles.headerLine}>
              <img
                src={userPicture}
                alt={userInfo?.username || "User"}
                className={styles.avatar}
              />
              <div className={styles.nameTime}>
                <div className={styles.nameRow}>
                  <span className={styles.userName}>
                    {userInfo?.name || userInfo?.username || "User"}
                  </span>
                  {userInfo?.role === "organizer" && <OrganizerBadge />}
                </div>
                <span className={styles.timeText}>
                  {formatTime(message.createdAt || new Date())}
                </span>
              </div>

              {(isCurrentUser || isOwner || isModerator) && (
                <button
                  className={styles.iconBtn}
                  onClick={() => onDelete(message._id)}
                  title="Delete message"
                >
                  <FaTrash />
                </button>
              )}
              {hoveredMessageId === message._id && (
                <button
                  className={styles.iconBtn}
                  title="Reply"
                  onClick={() => onReply(message)}
                >
                  <FaReply />
                </button>
              )}
            </div>

            {message.replyTo?.content && (
              <div
                className={styles.replySnippet}
                onClick={() => onReplyClick(message.replyTo._id)}
                title="Jump to replied message"
                role="button"
              >
                <span className={styles.replyUser}>
                  @{message.replyTo.author?.username || "Unknown"}:
                </span>
                <span className={styles.replyContent}>
                  {message.replyTo.content.length > 32
                    ? message.replyTo.content.substring(0, 32) + "…"
                    : message.replyTo.content}
                </span>
              </div>
            )}

            <div className={styles.messageText}>
              {renderMessageWithMentions(message.content, message.mentions)}
            </div>

            <ReactionBar
              message={{ ...message, onReply }}
              onReact={(id, emoji) => message.onReact?.(id, emoji)}
            />
          </div>
        </div>
      </>
    );
  }
);
MessageItem.displayName = "MessageItem";

const Discussion = ({ communityId, messageIdToScroll, isModeratorView }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [mentions, setMentions] = useState([]);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionSuggestions, setMentionSuggestions] = useState([]);
  const [hoveredMessageId, setHoveredMessageId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState([]);
  const [community, setCommunity] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isModerator, setIsModerator] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [isFirstRender, setIsFirstRender] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);

  // live count
  const [liveCount, setLiveCount] = useState(0);

  // composer emoji
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // auto-scroll control
  const [shouldAutoScroll, setShouldAutoScroll] = useState(false);

  const socket = getSocket();
  const messageEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const typingTimeouts = useRef({});
  const messagesContainerRef = useRef(null);
  const currentUser = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token);
  const currentUserId = currentUser?.id;
  const messageRefs = useRef({});
  const [collapsedThreads, setCollapsedThreads] = useState({});
  const inputRef = useRef(null);

  const setMessageRef = (id, el) => {
    if (el) messageRefs.current[id] = el;
  };

  const scrollToMessage = (id) => {
    const el = messageRefs.current[id];
    if (!el) return;
    const container = messagesContainerRef.current || el.parentElement;
    if (!container) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    const target =
      el.offsetTop - container.offsetTop - container.clientHeight / 2 + el.clientHeight / 2;

    const start = container.scrollTop;
    const change = target - start;
    const duration = 100;
    let currentTime = 0;
    const increment = 15;

    const easeInOutQuad = function (t, b, c, d) {
      t /= d / 2;
      if (t < 1) return (c / 2) * t * t + b;
      t--;
      return (-c / 2) * (t * (t - 2) - 1) + b;
    };

    const animateScroll = () => {
      currentTime += increment;
      const val = easeInOutQuad(currentTime, start, change, duration);
      container.scrollTop = val;
      if (currentTime < duration) setTimeout(animateScroll, increment);
    };

    animateScroll();
  };

  // helper: is user near bottom
  const isUserNearBottom = (el, threshold = 120) => {
    if (!el) return false;
    const dist = el.scrollHeight - el.scrollTop - el.clientHeight;
    return dist <= threshold;
  };

  useEffect(() => {
    if (messageIdToScroll) scrollToMessage(messageIdToScroll);
  }, [messageIdToScroll]);

  useEffect(() => {
    if (!communityId || !currentUserId) return;

    const fetchCommunityInfo = async () => {
      try {
        const { data } = await axios.get(`/community/id/${communityId}`);
        setCommunity(data.community);
        setIsOwner(data.community.owner._id === currentUserId);
        if (isModeratorView) {
          setIsModerator(
            (data.community.moderators || []).some(
              (m) =>
                ((m.user?._id || m.user) === currentUserId) &&
                ["moderator", "event-admin", "content-admin"].includes(m.role)
            )
          );
        } else {
          setIsModerator(false);
        }
      } catch (err) {
        console.error("Error fetching community info:", err);
      }
    };

    fetchCommunityInfo();
  }, [communityId, currentUserId, isModeratorView]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data } = await axios.get(`/discussions/${communityId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const messagesWithDates = data.map((msg, idx, arr) => {
          const currentDate = new Date(msg.createdAt).toDateString();
          const previousDate =
            idx > 0 ? new Date(arr[idx - 1].createdAt).toDateString() : null;
          return { ...msg, showDate: currentDate !== previousDate };
        });
        setMessages(messagesWithDates);
        setIsLoading(false);
        setInitialLoadComplete(true);
      } catch (err) {
        console.error("Error fetching messages:", err);
        setIsLoading(false);
        setInitialLoadComplete(true);
      }
    };
    fetchMessages();
  }, [communityId, token]);

  // Socket listeners: community room events + live count + reactions
  useEffect(() => {
    if (!socket || !communityId) return;

    // bind listeners first
    const handleNewMessage = (message) => {
      if (message.community === communityId) {
        const container = messagesContainerRef.current;
        const nearBottom = isUserNearBottom(container, 120);

        setMessages((prev) => {
          const last = prev[prev.length - 1];
          const showDate =
            !last ||
            new Date(message.createdAt).toDateString() !==
            new Date(last?.createdAt).toDateString();
          return [...prev, { ...message, showDate }];
        });

        // auto-scroll only if user is already near bottom or sender is self
        if (nearBottom || message.author?._id === currentUserId) {
          setShouldAutoScroll(true);
        }
      }
    };

    const handleDeletedMessage = (messageId) => {
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
      // do not set shouldAutoScroll here
    };

    const handleTyping = ({ userId, typingStatus, name, username, picture }) => {
      if (userId === currentUserId) return;
      setTypingUsers((prev) => {
        if (!typingStatus) {
          if (typingTimeouts.current[userId]) clearTimeout(typingTimeouts.current[userId]);
          return prev.filter((u) => u.userId !== userId);
        }
        if (typingTimeouts.current[userId]) clearTimeout(typingTimeouts.current[userId]);
        typingTimeouts.current[userId] = setTimeout(() => {
          setTypingUsers((users) => users.filter((u) => u.userId !== userId));
        }, 3000);
        const exists = prev.find((u) => u.userId === userId);
        if (exists)
          return prev.map((u) =>
            u.userId === userId ? { userId, name, username, picture } : u
          );
        return [...prev, { userId, name, username, picture }];
      });
    };

    const handleUpdatedMessage = (updatedMsg) => {
      setMessages((prev) => prev.map((m) => (m._id === updatedMsg._id ? updatedMsg : m)));
      // do not auto-scroll on edits
    };

    const handleReactedMessage = ({ messageId, emoji, countMap }) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === messageId ? { ...m, reactions: countMap } : m))
      );
      // do not auto-scroll on reactions
    };

    const handleUserCountUpdate = ({ count }) => {
      setLiveCount(count);
    };

    socket.on("community:newMessage", handleNewMessage);
    socket.on("community:deletedMessage", handleDeletedMessage);
    socket.on("community:typing", handleTyping);
    socket.on("community:updatedMessage", handleUpdatedMessage);
    socket.on("community:reactedMessage", handleReactedMessage);
    socket.on("community:userCountUpdate", handleUserCountUpdate);

    // join after binding to get initial count
    socket.emit("joinCommunity", communityId);

    return () => {
      socket.emit("leaveCommunity", communityId);
      socket.off("community:newMessage", handleNewMessage);
      socket.off("community:deletedMessage", handleDeletedMessage);
      socket.off("community:typing", handleTyping);
      socket.off("community:updatedMessage", handleUpdatedMessage);
      socket.off("community:reactedMessage", handleReactedMessage);
      socket.off("community:userCountUpdate", handleUserCountUpdate);
      Object.values(typingTimeouts.current).forEach(clearTimeout);
    };
  }, [socket, communityId, currentUserId]);

  // Initial and gated auto-scroll
  useEffect(() => {
    if (!messages.length) return;

    if (isFirstRender && initialLoadComplete) {
      messageEndRef.current?.scrollIntoView({ behavior: "auto" });
      setIsFirstRender(false);
      return;
    }

    if (shouldAutoScroll) {
      messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setShouldAutoScroll(false);
    }
  }, [messages, initialLoadComplete, isFirstRender, shouldAutoScroll]);

  // Show/hide FAB based on scroll pos
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const handleScroll = () => {
      const isUp =
        container.scrollHeight - container.scrollTop - container.clientHeight > 100;
      setShowScrollButton(isUp);
    };
    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Only scroll during typing if already near bottom
  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    if (typingUsers.length > 0 && isUserNearBottom(el, 120)) {
      el.scrollTo({
        top: el.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [typingUsers]);

  const handleTyping = (communityId, userId, typingStatus) => {
    if (!userId) return;
    socket.emit("community:typing", {
      communityId,
      userId,
      typingStatus,
      username: currentUser?.username,
      name: currentUser?.name,
      picture: currentUser?.picture,
    });
    if (typingStatus) {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("community:typing", {
          communityId,
          userId,
          typingStatus: false,
          username: currentUser?.username,
          name: currentUser?.name,
          picture: currentUser?.picture,
        });
      }, 2000);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    try {
      await axios.post(
        `/discussions`,
        {
          communityId,
          content: newMessage,
          replyTo: replyingTo?._id || null,
          mentions: mentions.map((u) => u._id),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewMessage("");
      setReplyingTo(null);
      setMentions([]);
      setMentionQuery("");
      setMentionSuggestions([]);
      socket.emit("community:typing", {
        communityId,
        userId: currentUserId,
        typingStatus: false,
      });
      // ensure immediate scroll after own send
      setShouldAutoScroll(true);
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await axios.delete(`/discussions/${messageId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error("Error deleting message:", err);
    }
  };

  const handleReact = async (messageId, emoji) => {
    try {
      await axios.post(
        `/discussions/${messageId}/react`,
        { emoji },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // server emits "community:reactedMessage"
      // no auto-scroll here
    } catch (err) {
      console.error("Error reacting:", err);
    }
  };

  // Allow empty query so tapping @ shows initial suggestions
  const fetchUserSuggestions = async (query) => {
    try {
      const { data } = await axios.get(
        `/discussions/users/search?query=${encodeURIComponent(query || "")}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMentionSuggestions(data);
    } catch (error) {
      console.error("Error fetching mention suggestions:", error);
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setNewMessage(val);
    const cursorPos = e.target.selectionStart;
    const textUntilCursor = val.slice(0, cursorPos);
    const mentionMatch = textUntilCursor.match(/(?:^|\s)@([\w.@-]*)$/);
    if (mentionMatch) {
      const query = mentionMatch[1] ?? "";
      setMentionQuery(query);
      fetchUserSuggestions(query);
    } else {
      setMentionQuery("");
      setMentionSuggestions([]);
    }
    handleTyping(communityId, currentUserId, true);
  };

  const insertAtCaret = (text) => {
    const input = inputRef.current;
    if (!input) return;
    const start = input.selectionStart ?? newMessage.length;
    const end = input.selectionEnd ?? newMessage.length;
    const next = newMessage.slice(0, start) + text + newMessage.slice(end);
    setNewMessage(next);
    requestAnimationFrame(() => {
      input.focus();
      const pos = start + text.length;
      input.setSelectionRange(pos, pos);
    });
  };

  const handleInsertAt = () => {
    insertAtCaret("@");
    setMentionQuery("");
    fetchUserSuggestions("");
  };

  const handleToolbarAction = (kind) => {
    if (kind === "mention") handleInsertAt();
  };

  // Build thread map
  const { roots, childrenMap, replyCountMap } = useMemo(() => {
    const map = new Map(); // parentId -> replies[]
    const count = new Map();
    messages.forEach((m) => {
      const pid = m.replyTo?._id;
      if (pid) {
        if (!map.has(pid)) map.set(pid, []);
        map.get(pid).push(m);
        count.set(pid, (count.get(pid) || 0) + 1);
      }
    });
    const rootsArr = messages.filter((m) => !m.replyTo?._id);
    return { roots: rootsArr, childrenMap: map, replyCountMap: count };
  }, [messages]);

  const toggleThread = (parentId) =>
    setCollapsedThreads((s) => ({ ...s, [parentId]: !s[parentId] }));

  return (
    <div className={styles.discussionSection}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.hash}>#</span>
          <h2 className={styles.title}>discussion</h2>
          <span className={styles.metaOne}>{messages.length} messages</span>
        </div>
        <div className={styles.headerRight}>
          <span className={styles.metaSep}>•</span>
          <span className={styles.metaTwo} title="Currently online in this room">
            {liveCount} online
          </span>
        </div>
      </div>

      <div className={styles.messagesContainer} ref={messagesContainerRef} aria-live="polite">
        {isLoading && <div className={styles.loadingRow}>Loading…</div>}

        {!isLoading &&
          roots.map((m) => {
            const replies = childrenMap.get(m._id) || [];
            const collapsed = !!collapsedThreads[m._id];
            return (
              <div key={m._id}>
                <MessageItem
                  message={{ ...m, onReact: handleReact }}
                  currentUserId={currentUserId}
                  isOwner={isOwner}
                  isModerator={isModerator}
                  onDelete={handleDeleteMessage}
                  onReply={setReplyingTo}
                  setHoveredMessageId={setHoveredMessageId}
                  hoveredMessageId={hoveredMessageId}
                  onReplyClick={scrollToMessage}
                  ref={(el) => setMessageRef(m._id, el)}
                />

                {replies.length > 0 && (
                  <div className={styles.repliesBlock}>
                    <button
                      type="button"
                      className={styles.repliesToggle}
                      onClick={() => toggleThread(m._id)}
                    >
                      {collapsed
                        ? `Show ${replyCountMap.get(m._id) || replies.length} replies`
                        : `Hide ${replyCountMap.get(m._id) || replies.length} replies`}
                    </button>

                    {!collapsed &&
                      replies.map((r) => (
                        <MessageItem
                          key={r._id}
                          message={{ ...r, onReact: handleReact }}
                          currentUserId={currentUserId}
                          isOwner={isOwner}
                          isModerator={isModerator}
                          onDelete={handleDeleteMessage}
                          onReply={setReplyingTo}
                          setHoveredMessageId={setHoveredMessageId}
                          hoveredMessageId={hoveredMessageId}
                          onReplyClick={scrollToMessage}
                          ref={(el) => setMessageRef(r._id, el)}
                          depth={1}
                        />
                      ))}
                  </div>
                )}
              </div>
            );
          })}

        {typingUsers.length > 0 && (
          <div className={styles.typingIndicatorWrapper} aria-live="assertive">
            <div className={styles.typingIndicatorBubble}>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                {typingUsers.slice(0, 3).map((u) => (
                  <div className={styles.typingUserAvatar} key={u.userId}>
                    <img
                      src={u.picture || "/default-profile.png"}
                      alt={u.username || "User"}
                      className={styles.typingUserImage}
                    />
                  </div>
                ))}
                {typingUsers.length > 3 && (
                  <span className={styles.moreTyping}>+{typingUsers.length - 3} more</span>
                )}
              </div>
              <div className={styles.typingText}>
                {typingUsers.length === 1
                  ? `${typingUsers[0].username || "Someone"} is typing…`
                  : typingUsers.length <= 3
                    ? `${typingUsers.map((u) => u.username || "Someone").join(", ")} are typing…`
                    : `${typingUsers
                      .slice(0, 3)
                      .map((u) => u.username || "Someone")
                      .join(", ")} and ${typingUsers.length - 3} others are typing…`}
              </div>
              <div className={styles.typingDots}>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messageEndRef} />
      </div>

      <div
        className={`${styles.scrollToBottom} ${showScrollButton ? styles.scrollToBottomVisible : ""} ${replyingTo ? styles.scrollToBottomWithReply : ""}`}
        onClick={scrollToBottom}
        title="Scroll to bottom"
        role="button"
      >
        <FaArrowDown />
      </div>

      {replyingTo && replyingTo.content && (
        <div className={styles.replyPreview}>
          Replying to&nbsp;<strong>{replyingTo.author?.username || "User"}</strong>:
          <span>
            {replyingTo.content.length > 25
              ? replyingTo.content.substring(0, 25) + "…"
              : replyingTo.content}
          </span>
          <button
            className={styles.cancelReplyButton}
            onClick={() => setReplyingTo(null)}
            title="Cancel reply"
          >
            ×
          </button>
        </div>
      )}

      {/* Composer: single row with end-adornment icons inside input */}
      <div className={styles.inputBar} style={{ position: "relative" }}>
        <form onSubmit={handleSendMessage} className={styles.messageFormRow} autoComplete="off">
          <div className={styles.inputFieldWrap} style={{ position: "relative" }}>
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={handleInputChange}
              placeholder="Message #discussion"
              className={styles.messageInput}
              aria-autocomplete="list"
              aria-expanded={mentionQuery && mentionSuggestions.length > 0 ? "true" : "false"}
              aria-haspopup="listbox"
              aria-controls="mentions-listbox"
              role="combobox"
            />

            <div className={styles.endActions}>
              <button
                type="button"
                className={styles.endBtn}
                title="Mention"
                onClick={() => handleToolbarAction("mention")}
              >
                @
              </button>
              <button
                type="button"
                className={styles.endBtn}
                title="Emoji"
                onClick={() => setShowEmojiPicker((v) => !v)}
              >
                <FaRegSmile />
              </button>
              {/* You can re-enable other buttons as needed */}
              {/* <button type="button" className={styles.endBtn} title="Attach file" onClick={() => handleToolbarAction("attach")}><FaPaperclip /></button>
              <button type="button" className={styles.endBtn} title="Image" onClick={() => handleToolbarAction("image")}><FaImage /></button>
              <button type="button" className={styles.endBtn} title="Code" onClick={() => handleToolbarAction("code")}><FaCode /></button> */}
            </div>

            {/* Emoji picker popover for composer */}
            {showEmojiPicker && (
              <div className={styles.emojiPopover}>
                <Picker
                  data={data}
                  onEmojiSelect={(emoji) => {
                    const native = emoji.native || "";
                    if (native) {
                      const input = inputRef.current;
                      const start = input?.selectionStart ?? newMessage.length;
                      const end = input?.selectionEnd ?? newMessage.length;
                      const next = newMessage.slice(0, start) + native + newMessage.slice(end);
                      setNewMessage(next);
                      requestAnimationFrame(() => {
                        if (input) {
                          input.focus();
                          const pos = start + native.length;
                          input.setSelectionRange(pos, pos);
                        }
                      });
                    }
                    setShowEmojiPicker(false);
                  }}
                  theme={document.documentElement.classList.contains("dark") ? "dark" : "light"}
                />
              </div>
            )}

            {mentionSuggestions.length > 0 && (
              <ul id="mentions-listbox" role="listbox" className={styles.mentionSuggestions}>
                {mentionSuggestions.map((user) => (
                  <li
                    key={user._id}
                    role="option"
                    aria-selected={false}
                    onClick={() => addMention(user)}
                  >
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

          <button type="submit" className={styles.sendButton} title="Send" aria-label="Send message">
            <img src={SendIcon} alt="send" height={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Discussion;
