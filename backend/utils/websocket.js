const { Server } = require("socket.io");
const User = require("../models/userModel");
let io;

const initializeWebsocket = (server) => {
  try {
    io = new Server(server, {
      cors: {
        origin: [
          "http://localhost:3000",
          "http://localhost:3001",
          "http://localhost:5173",
          "http://localhost:5174",
          "http://localhost:5175",
          "https://admin.geekclash.in",
          "https://geekclash.in",
          "https://nexfellow.com",
          "https://www.nexfellow.com",
          "https://admin.nexfellow.com",
          process.env.SITE_URL,
          process.env.ADMIN_URL,
        ].filter(Boolean),
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    io.on("connection", async (socket) => {
      console.log(`Socket connected: ${socket.id}`);

      // Authenticate user by userId from handshake auth
      const userId = socket.handshake.auth?.userId;
      if (!userId) {
        console.error(`Socket ${socket.id} missing userId in handshake auth, disconnecting`);
        socket.disconnect(true);
        return;
      }
      console.log(`Socket ${socket.id} authenticated with userId: ${userId}`);

      // Log all received events for monitoring
      socket.onAny((event, ...args) => {
        console.log(`Received event: '${event}' from socket ${socket.id}`, args);
      });

      // Helper: emit current size of a room
      const emitRoomCount = (room) => {
        const size = io.sockets.adapter.rooms.get(room)?.size || 0; // v4 adapter Map API
        io.to(room).emit("community:userCountUpdate", { count: size });
      };

      // Followed communities and notifications
      socket.on("joinFollowedCommunities", async (userIdReceived) => {
        if (!userIdReceived) {
          console.error("No userId provided in joinFollowedCommunities event");
          socket.disconnect(true);
          return;
        }
        try {
          socket.join(userIdReceived.toString());
          const user = await User.findById(userIdReceived).select("followedCommunities");
          if (user && user.followedCommunities.length) {
            user.followedCommunities.forEach((communityId) => {
              socket.join(communityId.toString());
            });
          } else {
            console.log(`User ${userIdReceived} has no followed communities`);
          }
        } catch (error) {
          console.error(`Error fetching user data for ${userIdReceived}:`, error);
        }
      });

      // Community chat events
      socket.on("joinCommunity", (communityId) => {
        if (!communityId) {
          console.error("No community ID provided to joinCommunity event");
          return;
        }
        socket.join(communityId);
        console.log(`Socket ${socket.id} joined community room: ${communityId}`);
        emitRoomCount(communityId); // NEW: broadcast updated room size
      });

      socket.on("leaveCommunity", (communityId) => {
        socket.leave(communityId);
        console.log(`Socket ${socket.id} left community room: ${communityId}`);
        emitRoomCount(communityId); // NEW: broadcast updated room size
      });

      // Optional: allow clients to explicitly request a count
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
        console.log(`Community typing → ${communityId}: ${username} (${userId}) typing=${typingStatus}`);
      });

      // Direct messages events
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
        console.log(`DM typing to ${recipientId} from ${senderId}: typing=${typingStatus}`);
      });

      socket.on("dm:messageRead", (data) => {
        const { conversationId, userId, recipientId } = data;
        if (!conversationId || !userId || !recipientId) {
          console.error("Missing data for dm:messageRead event");
          return;
        }
        socket.to(recipientId.toString()).emit("dm:messageRead", { conversationId, readBy: userId });
        console.log(`DM read receipt → Conversation ${conversationId}, read by ${userId}`);
      });

      // Comments events
      socket.on("commentAdded", (comment) => {
        io.emit("comment:new", comment);
        console.log(`New comment broadcast: ${comment.content}`);
      });

      socket.on("commentUpdated", (comment) => {
        io.emit("comment:updated", comment);
        console.log(`Comment updated: ${comment.content}`);
      });

      socket.on("commentLiked", (comment) => {
        io.emit("comment:liked", comment);
        console.log(`Comment liked: ${comment.content}`);
      });

      socket.on("commentReported", (comment) => {
        io.emit("comment:reported", comment);
        console.log(`Comment reported: ${comment.content}`);
      });

      // Handle disconnect: update counts in all rooms the socket was part of
      socket.on("disconnect", (reason) => {
        console.log(`Socket ${socket.id} disconnected. Reason: ${reason}`);
        socket.rooms.forEach((room) => {
          if (room !== socket.id) emitRoomCount(room); // NEW: broadcast reduced size
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
};
