"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import api from "../../lib/axios";
import { getSocket } from "../../utils/socket";
import { toast } from "sonner";
import {
  IoSearch,
  IoCheckmarkDone,
  IoClose,
  IoAdd,
  IoMenu,
  IoChevronBack,
} from "react-icons/io5";
import { AiOutlineSend } from "react-icons/ai";
import styles from "./Inbox.module.css";
import { BiTrashAlt } from "react-icons/bi";
import { IoCheckmarkCircle, IoCloseCircle, IoBan } from "react-icons/io5";
import messageIcon from "./assets/message.svg";
import searchIcon from "./assets/searchIcon.svg";
import newConvImg from "./assets/Overlay.svg";
import DMUserProfile from "./DMUserProfile.jsx";
import useProfileRedirect from "../../hooks/useProfileRedirect.js";

const str = (v) => (v != null ? String(v) : v);

const Inbox = () => {
  const socket = getSocket();
  const router = useRouter();
  const pathname = usePathname();
  const redirectToProfile = useProfileRedirect();
  const [conversations, setConversations] = useState([]);
  const [fixedConversations, setFixedConversations] = useState([]);
  const [messageRequests, setMessageRequests] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("conversations");
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConversationId, setDeleteConversationId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchQueryforChat, setsearchQueryforChat] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});
  const [isSending, setIsSending] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" ? window.innerWidth <= 768 : false);
  const [profileOpen, setProfileOpen] = useState(false);

  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Current user
  const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user")) || {} : {};
  const currentUserId = user.id || null;

  // Refs to avoid stale closures in socket handlers
  const conversationsRef = useRef(conversations);
  const selectedConversationRef = useRef(selectedConversation);
  const messagesRef = useRef(messages);
  const messageRequestsRef = useRef(messageRequests);
  const currentUserIdRef = useRef(currentUserId);

  const searchParams = useSearchParams();
  const handledDeepLinkRef = useRef(false);

  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);
  useEffect(() => {
    selectedConversationRef.current = selectedConversation;
  }, [selectedConversation]);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);
  useEffect(() => {
    messageRequestsRef.current = messageRequests;
  }, [messageRequests]);
  useEffect(() => {
    currentUserIdRef.current = currentUserId;
  }, [currentUserId]);

  // Detect mobile screen size
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Initial load + single-time socket registration
  useEffect(() => {
    if (!currentUserId) return;

    socket.emit("joinDirectMessages", currentUserId);

    // Initial data
    fetchConversations();
    fetchMessageRequests();

    // Socket handlers (stable closures using refs)
    const onNewDirectMessage = (data) => {
      const { message, conversation } = data || {};
      if (!message || !conversation) return;

      const me = str(currentUserIdRef.current);
      const msgId = str(message._id);
      const msgSenderId = str(message?.sender?._id || message?.sender);
      const convId = str(conversation._id);

      // Get participant IDs
      const participants = (conversation.participants || []).map(str);
      const otherId = participants.find((id) => id !== me);

      const selConv = selectedConversationRef.current;
      const msgs = messagesRef.current;
      const convs = conversationsRef.current;

      // Determine if this is the active conversation
      const isActive =
        selConv &&
        ((selConv._id && str(selConv._id) === convId) ||
          (!selConv._id &&
            selConv.otherUser &&
            str(selConv.otherUser._id) === (msgSenderId !== me ? msgSenderId : otherId)));

      // If active conversation, update messages with deduplication logic
      if (isActive) {
        // Check if message already exists by exact ID
        let exists = msgs.some((m) => str(m._id) === msgId);

        // Additionally check if there is an optimistic message matching this content & sender (pending)
        if (!exists) {
          const optimisticIndex = msgs.findIndex(
            (m) =>
              m.pending &&
              m.content === message.content &&
              str(m.sender?._id) === me
          );

          if (optimisticIndex >= 0) {
            // Replace optimistic message with confirmed message from server
            const updatedMsgs = [...msgs];
            updatedMsgs[optimisticIndex] = message;
            setMessages(updatedMsgs);
            exists = true;
          }
        }

        // If no duplicate found, append the new message
        if (!exists) {
          setMessages((prev) => [...prev, message]);
        }

        // Mark messages as read on the server if received from other user
        if (msgSenderId !== me) {
          api.patch(`/api/your-endpoint/messages/${convId}/read`).catch(() => { });
        }
      }

      // Update conversations list with latest message preview and timestamp
      setConversations((prev) => {
        const idx = prev.findIndex((c) => str(c._id) === convId);
        let next;
        if (idx >= 0) {
          next = [...prev];
          next[idx] = {
            ...next[idx],
            lastMessage: message,
            lastUpdated: message.createdAt || message.timestamp || new Date().toISOString(),
            isRead: msgSenderId === me,
          };
        } else {
          // Build minimal "otherUser" object if not available
          const otherUser = msgSenderId === me
            ? selConv?.otherUser || prev.find((c) => str(c._id) === convId)?.otherUser || { _id: otherId }
            : message.sender;

          next = [
            {
              _id: convId,
              otherUser,
              lastMessage: message,
              isRead: msgSenderId === me,
              lastUpdated: message.createdAt || message.timestamp || new Date().toISOString(),
              createdAt: conversation.createdAt || new Date().toISOString(),
            },
            ...prev,
          ];
        }
        // Sort conversations by last updated descending
        next.sort(
          (a, b) =>
            new Date(b.lastUpdated || b.createdAt) -
            new Date(a.lastUpdated || a.createdAt)
        );
        return next;
      });

      // For conversations that had no ID initially (optimistic, temporary), assign real ID on first server message
      if (
        isActive &&
        selConv &&
        !selConv._id // temp conversation before server response
      ) {
        setSelectedConversation((prev) => ({
          ...prev,
          _id: convId,
          status: conversation.status || "active",
        }));
      }

      // Notification for inbound message on other conversations (not active)
      if (msgSenderId !== me) {
        const sel = selConv;
        if (!sel || str(sel._id) !== convId) {
          toast(`New message from ${message.sender?.name || "Someone"}`, {
            description:
              message.content.length > 30
                ? message.content.substring(0, 30) + "..."
                : message.content,
            action: {
              label: "View",
              onClick: () => {
                const conv = convs.find((c) => str(c._id) === convId);
                if (conv) {
                  setSelectedConversation(conv);
                  setActiveTab("conversations");
                }
              },
            },
          });
        }
      }
    };

    const onDirectMessageTyping = (data) => {
      const { senderId, typingStatus, name, picture } = data || {};
      if (!senderId || typingStatus === undefined) return;

      setTypingUsers(prev => {
        if (typingStatus) {
          return { ...prev, [str(senderId)]: { name, picture, timestamp: Date.now() } };
        }
        const next = { ...prev };
        delete next[str(senderId)];
        return next;
      });
    };

    const onNewMessageRequest = (newRequest) => {
      if (!newRequest?._id) return;
      setMessageRequests((prev) => {
        const exists = prev.some((r) => str(r._id) === str(newRequest._id));
        if (exists) return prev;
        return [newRequest, ...prev];
      });
    };

    const onMessageRequestUpdated = (data) => {
      const { conversationId, status, conversation: convMeta } = data || {};
      const cid = str(conversationId);
      if (!cid || !status) return;

      if (status === "accepted") {
        // Remove from requests
        setMessageRequests((prev) => prev.filter((r) => str(r._id) !== cid));

        // Add/Upsert to conversations using enriched payload if provided
        setConversations((prev) => {
          const exists = prev.some((c) => str(c._id) === cid);
          if (exists && !convMeta) return prev;

          const newConv = convMeta
            ? {
              _id: str(convMeta._id),
              otherUser: (() => {
                const me = str(currentUserIdRef.current);
                const otherId =
                  (convMeta.participants || [])
                    .map(str)
                    .find((id) => id !== me) || null;
                // Optionally include more user info here if available in convMeta
                return { _id: otherId };
              })(),
              lastMessage: convMeta.lastMessage || null,
              status: convMeta.status,
              isRead: false,
              lastUpdatedAt: convMeta.lastUpdatedAt || new Date().toISOString(),
              createdAt: convMeta.createdAt || new Date().toISOString(),
            }
            : {
              _id: cid,
              otherUser: null,
              lastMessage: null,
              status: "accepted",
              isRead: false,
              lastUpdatedAt: new Date().toISOString(),
              createdAt: new Date().toISOString(),
            };

          const next = exists
            ? prev.map((c) => (str(c._id) === cid ? { ...c, ...newConv } : c))
            : [newConv, ...prev];

          next.sort(
            (a, b) =>
              new Date(b.lastUpdatedAt || b.createdAt) -
              new Date(a.lastUpdatedAt || a.createdAt)
          );
          return next;
        });

        // --- New part: Update selectedConversation if it matches updated conv ---
        setSelectedConversation((prev) => {
          if (prev && str(prev._id) === cid) {
            return {
              ...prev,
              status: convMeta?.status || "accepted",
              lastMessage: convMeta?.lastMessage || prev.lastMessage,
              lastUpdatedAt: convMeta?.lastUpdatedAt || prev.lastUpdatedAt,
              requestSentBy: convMeta?.requestSentBy ? String(convMeta.requestSentBy) : prev.requestSentBy || null,
            };
          }
          return prev;
        });

        toast.success("Message request accepted");
      } else if (status === "rejected" || status === "blocked") {
        setMessageRequests((prev) => prev.filter((r) => str(r._id) !== cid));
        toast.info(`Message request ${status}`);
      }
    };

    const onMessagesRead = (data) => {
      const { conversationId, readBy } = data || {};
      const sel = selectedConversationRef.current;
      if (!sel || str(sel._id) !== str(conversationId)) return;

      setMessages(prev =>
        prev.map(m =>
          str(m.sender?._id) === str(currentUserIdRef.current) && !m.isRead
            ? { ...m, isRead: true, readAt: new Date() }
            : m
        )
      );
    };

    socket.on("dm:newMessage", onNewDirectMessage);
    socket.on("dm:typing", onDirectMessageTyping);
    socket.on("messageRequestUpdated", onMessageRequestUpdated);
    socket.on("dm:messageRead", onMessagesRead);
    socket.on("newMessageRequest", onNewMessageRequest);

    return () => {
      socket.off("dm:newMessage", onNewDirectMessage);
      socket.off("dm:typing", onDirectMessageTyping);
      socket.off("messageRequestUpdated", onMessageRequestUpdated);
      socket.off("dm:messageRead", onMessagesRead);
      socket.off("newMessageRequest", onNewMessageRequest);
    };
    // Mount-only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId]);

  // Scroll to bottom on messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch messages when selected conversation changes
  useEffect(() => {
    if (selectedConversation && selectedConversation._id) {
      fetchMessages(selectedConversation._id);
    } else {
      setMessages([]);
    }
  }, [selectedConversation]);

  // Filter conversations by search
  useEffect(() => {
    handleSearchUsersForChat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQueryforChat]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchConversations = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/direct-messages/conversations");
      const sorted = (response.data.conversations || []).sort(
        (a, b) =>
          new Date(b.lastUpdatedAt || b.createdAt) -
          new Date(a.lastUpdatedAt || a.createdAt)
      );
      setConversations(sorted);
      setFixedConversations(sorted);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      toast.error("Failed to load conversations");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessageRequests = async () => {
    try {
      const response = await api.get("/direct-messages/requests");
      setMessageRequests(response.data.requests || []);
    } catch (error) {
      console.error("Error fetching message requests:", error);
      toast.error("Failed to load message requests");
    }
  };

  const findConversationByOtherUserId = (userId) => {
    const uid = String(userId);
    return (conversationsRef.current || []).find(
      (c) => c?.otherUser && String(c.otherUser._id) === uid
    );
  };

  const openDMTarget = (target) => {
    if (!target?._id) return;

    const existing = findConversationByOtherUserId(target._id);
    if (existing) {
      setSelectedConversation(existing);
      setActiveTab("conversations");
      if (isMobile) setSidebarVisible(false);
      return;
    }

    // Build a temporary “request” conversation; first send will create it server-side
    const tempConversation = {
      _id: null,
      otherUser: {
        _id: target._id,
        name: target.name || target.username || "User",
        username: target.username || "",
        picture: target.picture || null,
      },
      status: "new",
      messages: [],
    };

    setSelectedConversation(tempConversation);
    setMessages([]);
    setActiveTab("conversations");
    if (isMobile) setSidebarVisible(false);
  };

  useEffect(() => {
    if (handledDeepLinkRef.current) return;
    if (isLoading) return; // wait until conversations fetched

    // Prefer history state
    const stateTarget = location?.state?.dmTarget;

    // Fallback to query params if needed
    const qpUserId = searchParams.get("userId");
    const qpName = searchParams.get("name") || "";
    const qpUsername = searchParams.get("username") || "";
    const qpPicture = searchParams.get("picture") || "";

    const target = stateTarget
      ? stateTarget
      : qpUserId
        ? { _id: qpUserId, name: qpName, username: qpUsername, picture: qpPicture }
        : null;

    if (target?._id) {
      handledDeepLinkRef.current = true;
      openDMTarget(target);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, conversations, location?.state]);

  const fetchMessages = async (conversationId) => {
    if (!conversationId) return;
    try {
      const response = await api.get(
        `/direct-messages/conversations/${conversationId}`
      );
      setMessages(response.data.messages || []);

      // Mark as read server-side
      await api.patch(`/direct-messages/conversations/${conversationId}/read`);

      // Locally mark conversation as read
      setConversations((prev) =>
        prev.map((conv) =>
          str(conv._id) === str(conversationId) ? { ...conv, isRead: true } : conv
        )
      );

      // Emit read receipt to the other participant (server will forward as messagesRead)
      const conv = conversationsRef.current.find(
        (c) => str(c._id) === str(conversationId)
      );
      if (conv && conv.otherUser) {
        socket.emit("dm:messageRead", {
          conversationId,
          userId: currentUserIdRef.current,
          recipientId: conv.otherUser._id,
        });
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to load messages");
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (isSending) return;
    if (!newMessage.trim()) return;

    const sel = selectedConversationRef.current;
    if (!sel || !sel.otherUser?._id) {
      toast.error("No conversation selected");
      return;
    }

    setIsSending(true);

    // Optimistic message
    const tempId = `temp-${Date.now()}`;
    const optimisticMsg = {
      _id: tempId,
      content: newMessage,
      createdAt: new Date().toISOString(),
      sender: { _id: currentUserIdRef.current },
      isRead: false,
      pending: true,
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    const contentToSend = newMessage;
    setNewMessage("");
    handleTyping(false);

    try {
      const response = await api.post("/direct-messages/send", {
        recipientId: sel.otherUser._id,
        content: contentToSend,
      });

      // Reconcile: prefer socket echo; fallback replace after short timeout
      setTimeout(() => {
        setMessages((prev) => {
          const hasReal = prev.some(
            (m) =>
              str(m._id) !== tempId &&
              str(m.sender?._id) === str(currentUserIdRef.current) &&
              m.content === contentToSend
          );
          if (hasReal) {
            return prev.filter((m) => str(m._id) !== tempId);
          }
          // fallback replace if socket echo missed
          return prev.map((m) =>
            str(m._id) === tempId ? { ...response.data.message } : m
          );
        });
      }, 800);

      // New conversation id assignment
      if (response.data.conversation?.isNewConversation) {
        setSelectedConversation((prev) => ({
          ...prev,
          _id: response.data.conversation._id,
          status: response.data.conversation.status,
        }));
        // Minimal refresh to include the new conversation if not inserted by socket yet
        fetchConversations();
      } else {
        // Update lastMessage locally (socket will also do this, but harmless)
        setConversations((prev) => {
          const next = prev.map((conv) =>
            str(conv._id) === str(selectedConversationRef.current?._id)
              ? {
                ...conv,
                lastMessage: response.data.message,
                lastUpdatedAt: response.data.message.createdAt,
              }
              : conv
          );
          next.sort(
            (a, b) =>
              new Date(b.lastUpdatedAt || b.createdAt) -
              new Date(a.lastUpdatedAt || a.createdAt)
          );
          return next;
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error(error.response?.data?.message || "Failed to send message");
      // Mark optimistic as failed
      setMessages((prev) =>
        prev.map((m) =>
          str(m._id) === tempId ? { ...m, pending: false, failed: true } : m
        )
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleTyping = (isTyping) => {
    const sel = selectedConversationRef.current;
    if (!sel || !sel.otherUser?._id) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    socket.emit("dm:typing", {
      senderId: currentUserIdRef.current,
      recipientId: sel.otherUser._id,
      typingStatus: isTyping,
      name: user.name,
      picture: user?.picture || user.profile?.profilePhoto,
    });

    if (isTyping) {
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("dm:typing", {
          senderId: currentUserIdRef.current,
          recipientId: sel.otherUser._id,
          typingStatus: false,
          name: user.name,
          picture: user.picture || user.profile?.profilePhoto,
        });
      }, 3000);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      await api.post("/direct-messages/requests/handle", {
        conversationId: requestId,
        action: "accept",
      });
      // Controllers now emit enriched socket event to upsert; no heavy refetch needed
      fetchConversations(); // optional light refresh
      fetchMessageRequests(); // optional
    } catch (error) {
      console.error("Error accepting request:", error);
      toast.error("Failed to accept request");
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await api.post("/direct-messages/requests/handle", {
        conversationId: requestId,
        action: "reject",
      });
      fetchMessageRequests();
      toast.success("Request rejected");
    } catch (error) {
      console.error("Error rejecting request:", error);
      toast.error("Failed to reject request");
    }
  };

  const handleBlockRequest = async (requestId) => {
    try {
      await api.post("/direct-messages/requests/handle", {
        conversationId: requestId,
        action: "block",
      });
      fetchMessageRequests();
      toast.success("User blocked");
    } catch (error) {
      console.error("Error blocking user:", error);
      toast.error("Failed to block user");
    }
  };

  const handleSearchUsers = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await api.get(
        `/direct-messages/search-users?query=${encodeURIComponent(searchQuery)}`
      );
      setSearchResults(response.data.users || []);
    } catch (error) {
      console.error("Error searching users:", error);
      toast.error("Failed to search users");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchUsersForChat = () => {
    const q = (searchQueryforChat || "").toLowerCase().trim();
    if (!q) {
      setConversations(fixedConversations);
      return;
    }
    setConversations(() => {
      return (fixedConversations || []).filter((chat) => {
        const name =
          chat?.otherUser?.name ||
          chat?.otherUser?.username ||
          "";
        return name.toLowerCase().includes(q);
      });
    });
  };

  const startNewConversation = (user) => {
    if (user.conversationId) {
      const existingConversation = conversationsRef.current.find(
        (c) => str(c._id) === str(user.conversationId)
      );
      if (existingConversation) {
        setSelectedConversation(existingConversation);
        setActiveTab("conversations");
        setShowNewMessageModal(false);
        if (isMobile) setSidebarVisible(false);
        return;
      }
    }

    const tempConversation = {
      _id: null,
      otherUser: {
        _id: user._id,
        name: user.name,
        username: user.username,
        picture: user?.picture,
        verified: user.verified,
        profile: user.profile,
      },
      status: "new",
      messages: [],
    };

    setSelectedConversation(tempConversation);
    setMessages([]);
    setActiveTab("conversations");
    setShowNewMessageModal(false);
    if (isMobile) setSidebarVisible(false);
  };

  const deleteConversation = async (conversationId, e) => {
    e.stopPropagation();
    setDeleteConversationId(conversationId);
    setShowDeleteModal(true);
  };

  const confirmDeleteConversation = async () => {
    if (!deleteConversationId) return;
    try {
      await api.delete(`/direct-messages/conversations/${deleteConversationId}`);
      // Remove locally
      setConversations((prev) =>
        prev.filter((c) => str(c._id) !== str(deleteConversationId))
      );
      if (selectedConversationRef.current && str(selectedConversationRef.current._id) === str(deleteConversationId)) {
        setSelectedConversation(null);
        setMessages([]);
      }
      toast.success("Conversation deleted");
    } catch (error) {
      console.error("Error deleting conversation:", error);
      toast.error("Failed to delete conversation");
    } finally {
      setShowDeleteModal(false);
      setDeleteConversationId(null);
    }
  };

  // Add leading slash and use absolute endpoint
  const blockUser = async (targetUserId) => {
    if (!targetUserId) {
      toast.error("No user selected to block");
      return;
    }
    try {
      await api.post("/direct-messages/block", { targetId: targetUserId });
      toast.success("User blocked");
      // optionally refresh conversations
      fetchConversations();
    } catch (e) {
      console.error("Block error:", e);
      toast.error(e.response?.data?.message || "Failed to block");
    }
  };

  const unblockUser = async (targetUserId) => {
    if (!targetUserId) {
      toast.error("No user selected to unblock");
      return;
    }
    try {
      await api.post("/direct-messages/unblock", { targetId: targetUserId });
      toast.success("User unblocked");
      fetchConversations();
    } catch (e) {
      console.error("Unblock error:", e);
      toast.error(e.response?.data?.message || "Failed to unblock");
    }
  };

  useEffect(() => {
    if (!currentUserId) return;
    const onUserBlocked = ({ by, target }) => {
      const me = String(currentUserIdRef.current);
      const other = me === String(by) ? String(target) : String(by);
      setConversations(prev => {
        const next = prev.map(c => {
          const isThis = String(c.otherUser?._id) === other;
          if (!isThis) return c;
          return { ...c, status: "blocked", blockedBy: by, lastUpdatedAt: new Date().toISOString() };
        });
        return next;
      });
      setSelectedConversation(prev => {
        if (!prev || String(prev.otherUser?._id) !== other) return prev;
        return { ...prev, status: "blocked", blockedBy: by };
      });
      toast.info(me === String(by) ? "You blocked this user" : "You were blocked");
    };

    const onUserUnblocked = ({ by, target }) => {
      const me = String(currentUserIdRef.current);
      const other = me === String(by) ? String(target) : String(by);
      setConversations(prev => prev.map(c => {
        const isThis = String(c.otherUser?._id) === other;
        if (!isThis) return c;
        // Optimistically mark unblocked; status will restore on next fetch or messageRequestUpdated
        return { ...c, blockedBy: null, status: c.status === "blocked" ? "pending" : c.status };
      }));
      setSelectedConversation(prev => {
        if (!prev || String(prev.otherUser?._id) !== other) return prev;
        return { ...prev, blockedBy: null, status: prev.status === "blocked" ? "pending" : prev.status };
      });
      toast.info(me === String(by) ? "User unblocked" : "User can now message you");
    };

    socket.on("dm:userBlocked", onUserBlocked);
    socket.on("dm:userUnblocked", onUserUnblocked);
    return () => {
      socket.off("dm:userBlocked", onUserBlocked);
      socket.off("dm:userUnblocked", onUserUnblocked);
    };
  }, [currentUserId]);

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: "short" });
    }
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const derivedRequestSender = (() => {
    if (!selectedConversation) return null;
    if (selectedConversation.requestSentBy) return selectedConversation.requestSentBy;
    if (selectedConversation.status === "rejected" && selectedConversation.participants && Array.isArray(selectedConversation.participants)) {
      const me = String(currentUserId);
      const other = selectedConversation.participants.map(String).find((p) => p !== me);
      return other || null;
    }
    return null;

  })();
  const effectiveRequestSentBy = selectedConversation?.requestSentBy || derivedRequestSender;
  const canSend = selectedConversation && (
    selectedConversation.status === "accepted" ||
    !selectedConversation._id ||
    (selectedConversation.status === "rejected" &&
      String(effectiveRequestSentBy) === String(currentUserId))
  );

  const handleViewProfile = async () => {
    const userToView = selectedConversation?.otherUser;
    if (!userToView) return;

    setProfileOpen(false);

    try {
      await redirectToProfile(userToView);
    } catch (err) {

      console.error("Profile redirect failed:", err);

      const idOrName = userToView.username || userToView._id;
      if (idOrName) router.push(`/user/${encodeURIComponent(String(idOrName))}`);
    }
  };

  return (
    <div className={styles.inboxContainer}>
      <div
        className={`${styles.mobileHeader} ${selectedConversation && !sidebarVisible ? styles.hideHeader : ""
          }`}
      >
        <button
          className={styles.toggleSidebarButton}
          onClick={() => setSidebarVisible(!sidebarVisible)}
          aria-label="Toggle sidebar"
        >
          {sidebarVisible ? <IoChevronBack /> : <IoMenu />}
        </button>
        <h2>Messages</h2>
      </div>

      <div
        className={`${styles.sidebar} ${sidebarVisible ? styles.sidebarVisible : ""
          }`}
      >
        <div className={styles.sidebarHeader}>
          <div>
            <img src={messageIcon?.src || messageIcon} />
            <h2>Messages</h2>
          </div>
          <button
            className={styles.newMessageButton}
            onClick={() => setShowNewMessageModal(true)}
            aria-label="New Message"
          >
            <IoAdd />
          </button>
        </div>

        <div className={styles.searchUsers}>
          <img src={searchIcon?.src || searchIcon} />
          <input
            type="text"
            value={searchQueryforChat}
            onChange={(e) => {
              setsearchQueryforChat(e.target.value);
            }}
            placeholder="Search conversations..."
          />
        </div>

        <div className={styles.tabsContainer}>
          <button
            className={`${styles.tab} ${activeTab === "conversations" ? styles.activeTab : ""
              }`}
            onClick={() => setActiveTab("conversations")}
          >
            Conversations
          </button>
          <button
            className={`${styles.tab} ${activeTab === "requests" ? styles.activeTab : ""
              }`}
            onClick={() => setActiveTab("requests")}
          >
            Requests
            {messageRequests.length > 0 && (
              <span className={styles.requestBadge}>
                {messageRequests.length}
              </span>
            )}
          </button>
        </div>

        <div className={styles.conversationsList}>
          {activeTab === "conversations" ? (
            isLoading ? (
              <div className={styles.loadingState}>
                <div className={styles.loadingAnimation}>
                  <div></div>
                  <div></div>
                  <div></div>
                </div>
                <p>Loading conversations...</p>
              </div>
            ) : conversations.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyStateIcon}>
                  <AiOutlineSend size={40} />
                </div>
                <h4>No conversations yet</h4>
                <p>Start chatting with other users</p>
                <button
                  className={styles.startConversationButton}
                  onClick={() => setShowNewMessageModal(true)}
                >
                  Start a conversation
                </button>
              </div>
            ) : (
              conversations.map((conversation) => (
                <div
                  key={conversation._id}
                  className={`${styles.conversationItem} ${selectedConversation &&
                    selectedConversation._id === conversation._id
                    ? styles.selectedConversation
                    : ""
                    } ${!conversation.isRead ? styles.unreadConversation : ""}`}
                  onClick={() => {
                    setSelectedConversation(conversation);
                    // Hide sidebar on mobile when a conversation is selected
                    if (isMobile) {
                      setSidebarVisible(false);
                    }
                  }}
                >
                  <div className={styles.userAvatar}>
                    <img
                      src={
                        conversation.otherUser?.picture ||
                        conversation.otherUser?.profile?.profilePhoto ||
                        "/default-avatar.png"
                      }
                      alt={conversation.otherUser.name}
                    />
                    {!conversation.isRead && (
                      <div className={styles.unreadIndicator}></div>
                    )}
                    {/* {conversation.otherUser.verified && (
                      <div className={styles.verifiedBadge}>✓</div>
                    )} */}
                  </div>

                  <div className={styles.conversationInfo}>
                    <div className={styles.conversationHeader}>
                      <h3>
                        {conversation.otherUser.name}
                        {!conversation.isRead && (
                          <span className={styles.dotIndicator}></span>
                        )}
                      </h3>
                      <span className={styles.timeStamp}>
                        {formatTime(conversation.lastUpdatedAt)}
                      </span>
                    </div>
                    <div className={styles.messagePreview}>
                      {conversation.status === "pending" ? (
                        <span className={styles.pendingLabel}>
                          Pending request
                        </span>
                      ) : conversation.lastMessage ? (
                        <>
                          {conversation.lastMessage.sender._id ===
                            currentUserId && (
                              <span className={styles.outgoingIndicator}>
                                {conversation.lastMessage.isRead ? (
                                  <IoCheckmarkDone className={styles.readIcon} />
                                ) : (
                                  <IoCheckmarkDone />
                                )}
                              </span>
                            )}
                          <p
                            className={`${styles.previewText} ${!conversation.isRead
                              ? styles.unreadPreviewText
                              : ""
                              }`}
                          >
                            {conversation.lastMessage.sender._id ===
                              currentUserId && (
                                <span className={styles.youPrefix}>You: </span>
                              )}
                            {conversation.lastMessage.content.length > 30
                              ? conversation.lastMessage.content.substring(
                                0,
                                30
                              ) + "..."
                              : conversation.lastMessage.content}
                          </p>
                        </>
                      ) : (
                        <p className={styles.previewText}>No messages yet</p>
                      )}
                    </div>
                  </div>

                  <div className={styles.conversationActions}>
                    <button
                      className={styles.deleteButton}
                      onClick={(e) => deleteConversation(conversation._id, e)}
                      aria-label="Delete conversation"
                    >
                      <BiTrashAlt />
                    </button>
                  </div>
                </div>
              ))
            )
          ) : // Message requests tab
            messageRequests.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyStateIcon}>
                  <IoAdd size={40} />
                </div>
                <h4>No message requests</h4>
                <p>When someone new messages you, it will appear here</p>
              </div>
            ) : (
              messageRequests.map((request) => (
                <div key={request._id} className={styles.requestItem}>
                  <div className={styles.userAvatar}>
                    <img
                      src={
                        request.requester?.picture ||
                        request.requester?.profile?.profilePhoto ||
                        "/default-avatar.png"
                      }
                      alt={request.requester.name}
                    />
                    <div className={styles.newRequestIndicator}></div>
                    {/* {request.requester.verified && (
                    <div className={styles.verifiedBadge}>✓</div>
                  )} */}
                  </div>
                  <div className={styles.requestInfo}>
                    <div className={styles.requestHeader}>
                      <h3>{request.requester.name}</h3>
                      <span className={styles.timeStamp}>
                        {formatTime(request.createdAt)}
                      </span>
                    </div>
                    <p className={styles.previewText}>
                      {request.lastMessage
                        ? request.lastMessage.content.length > 30
                          ? request.lastMessage.content.substring(0, 30) + "..."
                          : request.lastMessage.content
                        : "New message request"}
                    </p>
                  </div>
                  <div className={styles.requestActions}>
                    <button
                      className={styles.acceptButton}
                      onClick={() => handleAcceptRequest(request._id)}
                      aria-label="Accept request"
                    >
                      <IoCheckmarkCircle color="#22c55e" size={20} />
                    </button>
                    <button
                      className={styles.rejectButton}
                      onClick={() => handleRejectRequest(request._id)}
                      aria-label="Reject request"
                    >
                      <IoCloseCircle color="#ef4444" size={20} />
                    </button>
                    <button
                      className={styles.blockButton}
                      onClick={() => handleBlockRequest(request._id)}
                      aria-label="Block user"
                    >
                      <IoBan color="#64748b" size={20} />
                    </button>
                  </div>
                </div>
              ))
            )}
        </div>
      </div>

      <div className={styles.conversationView}>
        <div className={styles.chatArea}>
        {selectedConversation ? (
          <>
            <div className={styles.conversationHeaderMain}>
              <button
                className={styles.backButton}
                onClick={() => {
                  // Show the sidebar on mobile when back button is clicked
                  if (isMobile) {
                    setSidebarVisible(true);
                  }
                  setSelectedConversation(null);
                  setMessages([]);
                  setActiveTab("conversations");
                  setConversations((prev) =>
                    prev.map((conv) =>
                      conv._id === selectedConversation._id
                        ? { ...conv, isRead: true }
                        : conv
                    )
                  );
                }}
                aria-label="Back to conversations"
              >
                <IoClose />
              </button>
              <div
                className={styles.userInfo}
                onClick={() => setProfileOpen(true)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && setProfileOpen(true)}
                aria-label="View profile"
              >
                <img
                  src={
                    selectedConversation.otherUser?.picture ||
                    selectedConversation.otherUser?.profile?.profilePhoto ||
                    "/default-avatar.png"
                  }
                  alt={selectedConversation.otherUser.name}
                  className={styles.headerAvatar}
                />
                <div>
                  <h3 className={styles.headerName}>{selectedConversation.otherUser.name}</h3>
                  <p className={styles.username}>@{selectedConversation.otherUser.username}</p>
                </div>
              </div>
              {/* Could add more header actions here */}
            </div>

            <div className={styles.messagesContainer}>
              {selectedConversation.status === "pending" && (
                <div className={styles.pendingMessageBanner}>
                  <p>This user has not accepted your message request yet.</p>
                </div>
              )}

              {messages.length === 0 ? (
                <div className={styles.emptyMessagesState}>
                  <p>No messages yet</p>
                  {selectedConversation.status === "accepted" && (
                    <p>Send a message to start the conversation</p>
                  )}
                </div>
              ) : (
                messages.map((message, index) => {
                  const isCurrentUser = message.sender._id === currentUserId;
                  const showDateDivider =
                    index === 0 ||
                    new Date(message.createdAt).toDateString() !==
                    new Date(messages[index - 1].createdAt).toDateString();

                  return (
                    <React.Fragment key={message._id}>
                      {showDateDivider && (
                        <div className={styles.dateDivider}>
                          <span>
                            {new Date(message.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      <div
                        className={`${styles.messageItem} ${isCurrentUser
                          ? styles.outgoingMessage
                          : styles.incomingMessage
                          }`}
                      >
                        {!isCurrentUser && (
                          <img
                            src={
                              message.sender?.picture ||
                              message.sender?.profile?.profilePhoto ||
                              "/default-avatar.png"
                            }
                            alt={message.sender.name}
                            className={styles.messageAvatar}
                          />
                        )}
                        <div className={styles.messageContent}>
                          <p>{message.content}</p>
                          <div className={styles.messageFooter}>
                            <span className={styles.messageTime}>
                              {new Date(message.createdAt).toLocaleTimeString(
                                [],
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </span>
                            {isCurrentUser && (
                              <span className={styles.readStatus}>
                                {message.isRead ? (
                                  <IoCheckmarkDone
                                    className={styles.readIcon}
                                  />
                                ) : (
                                  <IoCheckmarkDone />
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })
              )}

              {/* Typing indicators */}
              {Object.entries(typingUsers)
                .filter(([userId]) => userId === str(selectedConversation?.otherUser?._id))
                .map(([userId, user]) =>
                  userId !== str(currentUserId) && (
                    <div key={userId} className={styles.typingIndicator}>
                      <img
                        src={user?.picture || "/default-avatar.png"}
                        alt={user.name}
                        className={styles.typingAvatar}
                      />
                      <div className={styles.typingBubble}>
                        <div className={styles.typingDots}>
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                      </div>
                    </div>
                  )
                )}

              <div ref={messagesEndRef} />
            </div>

            {canSend && (
              <form
                className={styles.messageInputContainer}
                onSubmit={handleSendMessage}
              >
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    if (e.target.value.trim()) {
                      handleTyping(true);
                    } else {
                      handleTyping(false);
                    }
                  }}
                  placeholder="Type a message..."
                  ref={messageInputRef}
                  disabled={
                    selectedConversation.status === "pending" &&
                    selectedConversation._id
                  }
                />
                <button
                  type="submit"
                  className={styles.sendButton}
                  disabled={
                    !newMessage.trim() ||
                    (selectedConversation.status === "pending" &&
                      selectedConversation._id)
                  }
                >
                  <AiOutlineSend />
                </button>
              </form>
            )}
          </>
        ) : (
          <div className={styles.noConversationSelected}>
            <img src={newConvImg?.src || newConvImg} />
            <h3>Select a conversation or start a new one</h3>
            <h4>
              Choose from your existing conversations or start a new chat with
              someone.
            </h4>
            <button
              className={styles.startConversationButton}
              onClick={() => setShowNewMessageModal(true)}
            >
              Start a conversation
            </button>
          </div>
        )}
        </div>

        {profileOpen && selectedConversation?.otherUser && (
          <DMUserProfile
            open={true}
            onClose={() => setProfileOpen(false)}
            user={selectedConversation?.otherUser}
            conversation={selectedConversation}
            currentUserId={currentUserId}
            conversationStatus={selectedConversation?.status}
            blockedBy={selectedConversation?.blockedBy || null}
            onStartChat={() => {
              setProfileOpen(false);
              if (messageInputRef?.current) messageInputRef.current.focus();
            }}
            onBlock={() => {
              const id = selectedConversation?.otherUser?._id;
              if (!id) return;
              setProfileOpen(false);
              blockUser(id);
            }}
            onUnblock={() => {
              const id = selectedConversation?.otherUser?._id;
              if (!id) return;
              setProfileOpen(false);
              unblockUser(id);
            }}
            onAcceptRequest={() => {
              const cid = selectedConversation?._id;
              if (!cid) return;
              setProfileOpen(false);
              handleAcceptRequest(cid);
            }}
            onRejectRequest={() => {
              const cid = selectedConversation?._id;
              if (!cid) return;
              setProfileOpen(false);
              handleRejectRequest(cid);
            }}
            onDeleteChat={() => {
              const cid = selectedConversation?._id;
              if (!cid) return;
              setProfileOpen(false);
              deleteConversation(cid);
            }}
            onViewProfile={handleViewProfile}
          />
        )}
      </div>

      {/* New Message Modal */}
      {showNewMessageModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => {
            setShowNewMessageModal(false);
            setSearchQuery("");
            setSearchResults([]);
          }}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>New Conversation</h3>
              <button
                className={styles.closeModalButton}
                onClick={() => {
                  setShowNewMessageModal(false);
                  setSearchQuery("");
                  setSearchResults([]);
                }}
                aria-label="Close modal"
              >
                <IoClose />
              </button>
            </div>
            <div className={styles.searchContainer}>
              <div className={styles.searchInputContainer}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    // Auto-search after typing (debounced)
                    if (e.target.value.trim().length >= 2) {
                      clearTimeout(searchTimeoutRef.current);
                      searchTimeoutRef.current = setTimeout(() => {
                        handleSearchUsers();
                      }, 300);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && searchQuery.trim()) {
                      handleSearchUsers();
                    }
                  }}
                  placeholder="Search by name or username..."
                  className={styles.searchInput}
                  autoFocus
                />
                <button
                  className={styles.searchButton}
                  onClick={handleSearchUsers}
                  disabled={isSearching || !searchQuery.trim()}
                  aria-label="Search users"
                >
                  {isSearching ? (
                    <div className={styles.searchingSpinner}></div>
                  ) : (
                    <IoSearch />
                  )}
                </button>
              </div>

              {searchQuery.trim() && (
                <div
                  className={`${styles.searchResults} ${searchResults.length > 0 ? styles.hasResults : ""
                    }`}
                >
                  {isSearching ? (
                    <div className={styles.searchingState}>
                      <div className={styles.searchingAnimation}>
                        <div></div>
                        <div></div>
                        <div></div>
                      </div>
                      <p>Searching for users...</p>
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className={styles.noResultsState}>
                      <p>No users found matching &quot;{searchQuery}&quot;</p>
                      <p className={styles.searchTip}>
                        Try a different name or username
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className={styles.resultsHeader}>
                        <span>
                          {searchResults.length}{" "}
                          {searchResults.length === 1 ? "user" : "users"} found
                        </span>
                      </div>
                      <div className={styles.resultsList}>
                        {searchResults.map((user) => (
                          <div
                            key={user._id}
                            className={styles.searchResultItem}
                            onClick={() => startNewConversation(user)}
                          >
                            <div className={styles.resultAvatarContainer}>
                              <img
                                src={
                                  user?.picture ||
                                  user.profile?.profilePhoto ||
                                  "/default-avatar.png"
                                }
                                alt={user.name}
                                className={styles.resultAvatar}
                              />
                              {/* {user.verified && (
                                <div className={styles.verifiedBadge}>✓</div>
                              )} */}
                            </div>
                            <div className={styles.resultInfo}>
                              <h4>{user.name}</h4>
                              <p>@{user.username}</p>
                            </div>
                            {user.conversationStatus && (
                              <div className={styles.conversationStatus}>
                                {user.conversationStatus === "accepted" ? (
                                  <span className={styles.existingConversation}>
                                    <IoCheckmarkDone />
                                    Existing
                                  </span>
                                ) : user.conversationStatus === "pending" ? (
                                  <span className={styles.pendingRequest}>
                                    Pending
                                  </span>
                                ) : user.conversationStatus === "rejected" ? (
                                  <span className={styles.rejectedRequest}>
                                    Rejected
                                  </span>
                                ) : (
                                  <span className={styles.blockedConversation}>
                                    Blocked
                                  </span>
                                )}
                              </div>
                            )}
                            <button
                              className={styles.messageUserButton}
                              aria-label={`Message ${user.name}`}
                            >
                              <AiOutlineSend />
                            </button>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {!searchQuery.trim() && (
                <div className={styles.emptySearchState}>
                  <div className={styles.searchIllustration}>
                    <IoSearch className={styles.searchIcon} />
                  </div>
                  <h4>Find people to message</h4>
                  <p>Search by name or username to start a conversation</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {showDeleteModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className={styles.deleteModal}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Delete Conversation</h3>
            <p>Are you sure you want to delete this conversation?</p>
            <div className={styles.deleteModalActions}>
              <button onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button
                onClick={confirmDeleteConversation}
                className={styles.deleteButton}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Inbox;
