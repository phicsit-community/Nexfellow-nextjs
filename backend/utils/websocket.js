const { Server } = require("socket.io");
const { createClerkClient, verifyToken } = require("@clerk/backend");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const Admin = require("../models/adminModel");
const { isAllowedOrigin } = require("../config/allowedOrigins");

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

let io;
let adminNs;

// Required lazily: adminUserFeed itself depends on this module.
const adminFeed = () => require("../services/adminUserFeed");

// Presence: userId -> number of open sockets (a user can have several tabs/devices).
// In-memory, so it reflects this process only — same scope as the socket rooms.
const onlineUsers = new Map();

const markOnline = (userId) => {
  const count = (onlineUsers.get(userId) || 0) + 1;
  onlineUsers.set(userId, count);
  if (count === 1) adminFeed().pushAdminPresence(userId, true);
  // Every new connection may follow a fresh sign-in, so refresh the admin row
  adminFeed().pushAdminUser(userId);
};

const markOffline = (userId) => {
  const remaining = (onlineUsers.get(userId) || 1) - 1;
  if (remaining > 0) {
    onlineUsers.set(userId, remaining);
    return;
  }
  onlineUsers.delete(userId);
  const lastSeenAt = new Date();
  adminFeed().pushAdminPresence(userId, false, lastSeenAt);
  User.updateOne({ _id: userId }, { $set: { lastSeenAt } }).catch((err) =>
    console.error(`Failed to record lastSeenAt for ${userId}:`, err.message)
  );
};

const getOnlineUserIds = () => Array.from(onlineUsers.keys());
const isUserOnline = (userId) => onlineUsers.has(userId);

// Admin panel sockets live in their own namespace so they never count as
// online users, and authenticate with the admin JWT rather than Clerk.
const initializeAdminNamespace = () => {
  adminNs = io.of("/admin");

  adminNs.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Unauthorized — no token"));

      const decoded = jwt.verify(token, process.env.ADMIN_SECRET);
      const admin = await Admin.findById(decoded.adminId).select("_id");
      if (!admin) return next(new Error("Unauthorized — not an admin"));

      socket.adminId = admin._id.toString();
      next();
    } catch (err) {
      console.error("Admin socket auth error:", err.message);
      next(new Error("Unauthorized"));
    }
  });

  adminNs.on("connection", (socket) => {
    console.log(`Admin socket connected: ${socket.id}, adminId: ${socket.adminId}`);
    adminFeed().sendPresenceSnapshot(socket);
  });
};

const initializeWebsocket = (server) => {
  try {
    io = new Server(server, {
      cors: {
        origin: (origin, callback) => callback(null, isAllowedOrigin(origin)),
        methods: ["GET", "POST"],
      },
    });

    initializeAdminNamespace();

    io.use(async (socket, next) => {
      try {
        const token =
          socket.handshake.auth?.token ||
          socket.handshake.headers?.authorization?.replace("Bearer ", "");

        if (!token) return next(new Error("Unauthorized — no token"));

        const payload = await verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY });
        const user = await User.findOne({ clerkId: payload.sub }).select("_id");
        if (!user) return next(new Error("Unauthorized — user not found"));

        socket.userId = user._id.toString();
        next();
      } catch (err) {
        console.error("Socket auth error:", err.message);
        next(new Error("Unauthorized"));
      }
    });

    io.on("connection", async (socket) => {
      console.log(`Socket connected: ${socket.id}, userId: ${socket.userId}`);
      markOnline(socket.userId);

      socket.onAny((event, ...args) => {
        console.log(`Received event: '${event}' from socket ${socket.id}`, args);
      });

      const emitRoomCount = (room) => {
        const size = io.sockets.adapter.rooms.get(room)?.size || 0;
        io.to(room).emit("community:userCountUpdate", { count: size });
      };

      socket.on("joinFollowedCommunities", async (userIdReceived) => {
        if (!userIdReceived) {
          console.error("No userId provided in joinFollowedCommunities event");
          return;
        }
        try {
          socket.join(userIdReceived.toString());
          const user = await User.findById(userIdReceived).select("followedCommunities");
          if (user && user.followedCommunities.length) {
            user.followedCommunities.forEach((communityId) => {
              socket.join(communityId.toString());
            });
          }
        } catch (error) {
          console.error(`Error fetching user data for ${userIdReceived}:`, error);
        }
      });

      socket.on("joinCommunity", (communityId) => {
        if (!communityId) {
          console.error("No community ID provided to joinCommunity event");
          return;
        }
        socket.join(communityId);
        console.log(`Socket ${socket.id} joined community room: ${communityId}`);
        emitRoomCount(communityId);
      });

      socket.on("leaveCommunity", (communityId) => {
        socket.leave(communityId);
        console.log(`Socket ${socket.id} left community room: ${communityId}`);
        emitRoomCount(communityId);
      });

      socket.on("community:getUserCount", ({ communityId }) => {
        if (!communityId) return;
        emitRoomCount(communityId);
      });

      socket.on("community:typing", (data) => {
        const { communityId, userId, typingStatus, name, username, picture } = data;
        if (!communityId || !userId || typingStatus === undefined) {
          console.error("Missing data for community:typing event");
          return;
        }
        io.to(communityId).emit("community:typing", { userId, typingStatus, name, username, picture });
      });

      socket.on("joinDirectMessages", (userIdReceived) => {
        if (!userIdReceived) {
          console.error("No userId provided for direct messaging");
          return;
        }
        socket.join(userIdReceived.toString());
        console.log(`Socket ${socket.id} joined DM room: ${userIdReceived}`);
      });

      socket.on("dm:typing", (data) => {
        const { recipientId, senderId, typingStatus, name, picture } = data;
        if (!recipientId || !senderId || typingStatus === undefined) {
          console.error("Missing data for dm:typing event");
          return;
        }
        socket.to(recipientId.toString()).emit("dm:typing", { senderId, typingStatus, name, picture });
      });

      socket.on("dm:messageRead", (data) => {
        const { conversationId, userId, recipientId } = data;
        if (!conversationId || !userId || !recipientId) {
          console.error("Missing data for dm:messageRead event");
          return;
        }
        socket.to(recipientId.toString()).emit("dm:messageRead", { conversationId, readBy: userId });
      });

      socket.on("commentAdded", (comment) => {
        io.emit("comment:new", comment);
      });

      socket.on("commentUpdated", (comment) => {
        io.emit("comment:updated", comment);
      });

      socket.on("commentLiked", (comment) => {
        io.emit("comment:liked", comment);
      });

      socket.on("commentReported", (comment) => {
        io.emit("comment:reported", comment);
      });

      socket.on("disconnect", (reason) => {
        console.log(`Socket ${socket.id} disconnected. Reason: ${reason}`);
        markOffline(socket.userId);
        socket.rooms.forEach((room) => {
          if (room !== socket.id) emitRoomCount(room);
        });
      });

      socket.on("error", (error) => {
        console.error(`Socket ${socket.id} error: ${error.message || error}`);
      });
    });

    console.log("✅ WebSocket server initialized successfully");
  } catch (error) {
    console.error("❌ Error initializing WebSocket server:", error);
  }

  return io;
};

const getIo = () => {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
};

module.exports = {
  initializeWebsocket,
  getIo,
  getOnlineUserIds,
  isUserOnline,
  getAdminNamespace: () => adminNs || null,
};
