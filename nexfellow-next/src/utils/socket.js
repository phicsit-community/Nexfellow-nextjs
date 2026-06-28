import { io } from "socket.io-client";

let apiUrl;

if (process.env.NODE_ENV === "development") {
  apiUrl = process.env.NEXT_PUBLIC_LOCALHOST;
} else {
  apiUrl = process.env.NEXT_PUBLIC_SERVER_URL;
}

let socket = null;

// Clerk loads asynchronously. Retry getting the token a few times
// in case session isn't ready immediately after page hydration.
const getClerkToken = async (retries = 8, delayMs = 250) => {
  for (let i = 0; i < retries; i++) {
    try {
      const token = await window.Clerk?.session?.getToken();
      if (token) return token;
    } catch (_) {}
    if (i < retries - 1) await new Promise((r) => setTimeout(r, delayMs));
  }
  return null;
};

export const initializeSocket = async (userId) => {
  if (!userId) {
    console.warn("⚠️ No userId provided. Socket will not connect.");
    return null;
  }

  // If socket exists but is disconnected (e.g. after page navigation),
  // refresh the auth token and reconnect rather than reusing the stale token.
  if (socket) {
    if (!socket.connected) {
      const freshToken = await getClerkToken();
      if (!freshToken) {
        console.warn("⚠️ Clerk session not ready — socket reconnect skipped.");
        return socket;
      }
      socket.auth = { token: freshToken };
      socket.connect();
    }
    return socket;
  }

  const token = await getClerkToken();
  if (!token) {
    console.warn("⚠️ Could not get Clerk token — socket will not connect.");
    return null;
  }

  socket = io(apiUrl, {
    autoConnect: false,
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    auth: { token },
  });

  socket.on("connect", () => {
    console.log(`✅ Socket connected: ${socket.id}`);
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

  socket.on("newNotification", (notification) => {
    console.log("🔔 New notification:", notification);
  });

  socket.on("notification:read", (updatedUnreadCount) => {
    console.log("🔔 Notification read update, unread count:", updatedUnreadCount);
  });

  socket.on("newSystemNotification", (notification) => {
    console.log("newSystemNotification", notification);
  });

  socket.on("newCommunityNotification", (notification) => {
    console.log("newCommunityNotification", notification);
  });

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

  socket.on("dm:newMessage", (data) => {
    console.log("📩 New direct message:", data);
  });

  socket.on("dm:typing", (data) => {
    console.log("⌨️ Direct message typing:", data);
  });

  socket.on("dm:messageRead", (data) => {
    console.log("✅ Direct message read receipt:", data);
  });

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
