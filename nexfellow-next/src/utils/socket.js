// src/utils/socket.js
import { io } from "socket.io-client";

let apiUrl;

// Next.js environment variables
if (process.env.NODE_ENV === "development") {
  console.log("Running in development mode");
  apiUrl = process.env.NEXT_PUBLIC_LOCALHOST;
} else {
  console.log("Running in production mode");
  apiUrl = process.env.NEXT_PUBLIC_SERVER_URL;
}

let socket = null;

export const initializeSocket = (userId) => {
  if (!userId) {
    console.warn("⚠️ No userId provided. Socket will not connect.");
    return null;
  }

  // If socket already exists, just update auth & reconnect
  if (socket) {
    socket.auth = { userId };
    if (!socket.connected) {
      socket.connect();
    }
    return socket;
  }

  // === Create socket instance ===
  socket = io(apiUrl, {
    autoConnect: false, // only connect after auth
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    auth: { userId },
  });

  // === Socket event listeners (set once) ===
  socket.on("connect", () => {
    console.log(`✅ Socket connected: ${socket.id}`);
    console.log(`User ID used for connection: ${userId}`);

    // Join personal rooms
    socket.emit("joinFollowedCommunities", userId);
    socket.emit("joinDirectMessages", userId);
  });

  socket.on("disconnect", (reason) => {
    console.log(`❌ Socket disconnected: ${socket.id}, reason: ${reason}`);
  });

  socket.on("error", (error) => {
    console.error(`Socket error: ${error.message}`);
  });

  socket.on("connect_error", (err) => {
    console.error("Socket connection error:", err.message);
  });

  // === Global notifications ===
  socket.on("newNotification", (notification) => {
    console.log("🔔 New notification:", notification);
  });

  socket.on("notification:read", (updatedUnreadCount) => {
    console.log("🔔 Notification read update, unread count:", updatedUnreadCount);
    // You can propagate this event to your React state or event bus to update UI
  });

  socket.on("newSystemNotification", (notification) => {
    console.log("newSystemNotification", notification);
  });

  socket.on("newCommunityNotification", (notification) => {
    console.log("newCommunityNotification", notification);
  });

  // === Community events ===
  socket.on("community:newMessage", (message) => {
    console.log("💬 New community message:", message);
  });

  socket.on("community:deletedMessage", (messageId) => {
    console.log("🗑️ Community message deleted:", messageId);
  });

  socket.on("community:updatedMessage", (updatedMessage) => {
    console.log("✏️ Community message updated:", updatedMessage);
  });

  socket.on("community:typing", (data) => {
    console.log("⌨️ Community typing status:", data);
  });

  // === Direct message events ===
  socket.on("dm:newMessage", (data) => {
    console.log("📩 New direct message:", data);
  });

  socket.on("dm:typing", (data) => {
    console.log("⌨️ Direct message typing:", data);
  });

  socket.on("dm:messageRead", (data) => {
    console.log("✅ Direct message read receipt:", data);
  });

  // === Comments ===
  socket.on("comment:new", (comment) => {
    console.log("💬 New comment:", comment);
  });

  socket.on("comment:updated", (comment) => {
    console.log("✏️ Comment updated:", comment);
  });

  socket.on("comment:liked", (comment) => {
    console.log("👍 Comment liked:", comment);
  });

  socket.on("comment:reported", (comment) => {
    console.log("⚠️ Comment reported:", comment);
  });

  // Finally connect
  socket.connect();

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log("🛑 Socket fully disconnected and reset.");
  }
};
