const express = require("express");
const router = express.Router();
const directMessageController = require("../controllers/directMessageController");
const { isClient } = require("../middleware");

// Get all conversations for a user
router.get(
  "/conversations",
  isClient,
  directMessageController.getUserConversations
);

// Get pending message requests for a user
router.get("/requests", isClient, directMessageController.getMessageRequests);

// Get messages for a specific conversation
router.get(
  "/conversations/:conversationId",
  isClient,
  directMessageController.getConversationMessages
);

// Send a message (or create a conversation if it doesn't exist)
router.post("/send", isClient, directMessageController.sendMessage);

// Handle message request (accept or reject)
router.post(
  "/requests/handle",
  isClient,
  directMessageController.handleMessageRequest
);

// Mark messages as read
router.patch(
  "/conversations/:conversationId/read",
  isClient,
  directMessageController.markMessagesAsRead
);

// Delete a message (soft delete for the current user only)
router.delete(
  "/messages/:messageId",
  isClient,
  directMessageController.deleteMessage
);

// Search users to start a new conversation
router.get("/search-users", isClient, directMessageController.searchUsers);

// Delete a conversation
router.delete(
  "/conversations/:conversationId",
  isClient,
  directMessageController.deleteConversation
);

// POST /direct-messages/block
router.post("/block", isClient, directMessageController.blockUser);

// POST /direct-messages/unblock
router.post("/unblock", isClient, directMessageController.unblockUser);


module.exports = router;
