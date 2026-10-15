import { io } from "socket.io-client";

let apiUrl;

if (process.env.NODE_ENV === "development") {
  apiUrl = process.env.NEXT_PUBLIC_LOCALHOST;
} else {
  apiUrl = process.env.NEXT_PUBLIC_SERVER_URL;
}

let socket = null;
// In-flight initialization, so concurrent callers (PrivateLayout + ClientInitializer)
// share one attempt instead of each creating their own connection.
let pendingInit = null;

// Components subscribe (via useSocket) so they re-render once the socket exists.
// Clerk's token arrives asynchronously, so pages that mount on a hard refresh
// render before the socket has been created.
const listeners = new Set();
const setSocket = (next) => {
  socket = next;
  listeners.forEach((listener) => listener());
};

export const subscribeSocket = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

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

export const initializeSocket = (userId) => {
  if (!pendingInit) {
    pendingInit = connectSocket(userId).finally(() => {
      pendingInit = null;
    });
  }
  return pendingInit;
};

const connectSocket = async (userId) => {
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

  const instance = io(apiUrl, {
    autoConnect: false,
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    auth: { token },
  });

  instance.on("connect", () => {
    console.log(`✅ Socket connected: ${instance.id}`);
    instance.emit("joinFollowedCommunities", userId);
    instance.emit("joinDirectMessages", userId);
  });

  instance.on("disconnect", (reason) => {
    console.log(`❌ Socket disconnected: ${instance.id}, reason: ${reason}`);
  });

  instance.on("error", (error) => {
    console.error(`Socket error: ${error.message}`);
  });

  instance.on("connect_error", (err) => {
    console.error("Socket connection error:", err.message);
  });

  instance.on("newNotification", (notification) => {
    console.log("🔔 New notification:", notification);
  });

  instance.on("notification:read", (updatedUnreadCount) => {
    console.log("🔔 Notification read update, unread count:", updatedUnreadCount);
  });

  instance.on("newSystemNotification", (notification) => {
    console.log("newSystemNotification", notification);
  });

  instance.on("newCommunityNotification", (notification) => {
    console.log("newCommunityNotification", notification);
  });

  instance.on("community:newMessage", (message) => {
    console.log("💬 New community message:", message);
  });

  instance.on("community:deletedMessage", (messageId) => {
    console.log("🗑️ Community message deleted:", messageId);
  });

  instance.on("community:updatedMessage", (updatedMessage) => {
    console.log("✏️ Community message updated:", updatedMessage);
  });

  instance.on("community:typing", (data) => {
    console.log("⌨️ Community typing status:", data);
  });

  instance.on("dm:newMessage", (data) => {
    console.log("📩 New direct message:", data);
  });

  instance.on("dm:typing", (data) => {
    console.log("⌨️ Direct message typing:", data);
  });

  instance.on("dm:messageRead", (data) => {
    console.log("✅ Direct message read receipt:", data);
  });

  instance.on("comment:new", (comment) => {
    console.log("💬 New comment:", comment);
  });

  instance.on("comment:updated", (comment) => {
    console.log("✏️ Comment updated:", comment);
  });

  instance.on("comment:liked", (comment) => {
    console.log("👍 Comment liked:", comment);
  });

  instance.on("comment:reported", (comment) => {
    console.log("⚠️ Comment reported:", comment);
  });

  instance.connect();
  setSocket(instance);

  return instance;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    setSocket(null);
    console.log("🛑 Socket fully disconnected and reset.");
  }
};
