const express = require("express");
const router = express.Router();

const {
    sendMessage,
    getMessages,
    updateMessage,
    deleteMessage,
    getMessageHeatmapData,
    searchUsers,
    reactToMessage,
} = require("../controllers/discussionsController");

const catchAsync = require("../utils/CatchAsync");
const { isClient, isCommunityCreator } = require("../middleware");


/**
 * @route POST /api/chat/messages
 * @desc Send a new message in a discussion
 * @access Authenticated users
 */
router.post("/", isClient, catchAsync(sendMessage));

/**
 * @route GET /api/chat/messages/:communityId
 * @desc Get all messages for a community discussion
 * @access Authenticated users
 */
router.get("/:communityId", isClient, catchAsync(getMessages));

/**
 * @route PATCH /api/chat/messages/:messageId
 * @desc Update a message (only by the author)
 * @access Authenticated users
 */
router.patch("/:messageId", isClient, catchAsync(updateMessage));

/**
 * @route DELETE /api/chat/messages/:messageId
 * @desc Delete a message (author, moderator, or community owner)
 * @access Authenticated users
 */
router.delete("/:messageId", isClient, catchAsync(deleteMessage));

// ================================
// 📌 ANALYTICS / UTILITIES
// ================================

/**
 * @route GET /api/chat/messages/heatmap/:communityId
 * @desc Get heatmap data for community messages (per day counts)
 * @access Community creators only
 */
router.get(
    "/heatmap/:communityId",
    isClient,
    isCommunityCreator,
    catchAsync(getMessageHeatmapData)
);

/**
 * @route GET /api/chat/messages/users/search
 * @desc Search for users (by username or name)
 * @access Authenticated users
 */
router.get("/users/search", isClient, catchAsync(searchUsers));

/**
 * @route POST /api/chat/messages/:messageId/reactions
 * @desc React to a message
 * @access Authenticated users
 */
router.post("/:messageId/react", isClient, catchAsync(reactToMessage));

module.exports = router;
