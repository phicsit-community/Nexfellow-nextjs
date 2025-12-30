const express = require("express");
const router = express.Router();
const { sendMessage, getMessages, updateMessage, deleteMessage, getMessageHeatmapData, searchUsers } = require("../controllers/messageController");
const catchAsync = require("../utils/CatchAsync");
const { isClient, isCommunityCreator } = require("../middleware");
/**
 * @route POST /messages
 * @desc Send a new message in a discussion
 * @param {string} communityId - The ID of the discussion
 * @param {string} author - The ID of the user sending the message
 * @param {string} content - The message content
 * @returns {object} 201 - Created message object
 * @returns {object} 404 - Discussion not found
 * @returns {object} 500 - Internal server error
 */
router
    .route("/")
    .post(isClient, catchAsync(sendMessage));

/**
 * @route GET /messages/:communityId
 * @desc Get all messages for a discussion
 * @param {string} communityId - The ID of the discussion
 * @returns {array} 200 - List of messages with populated author field
 * @returns {object} 500 - Internal server error
 */
router
    .route("/:communityId")
    .get(isClient, catchAsync(getMessages));

/**
 * @route PATCH /api/chat/message/:messageId
 * @desc Update a message (only by the author)
 * @param {string} messageId - The ID of the message
 * @param {string} content - The new message content
 * @returns {object} 200 - Updated message object
 * @returns {object} 403 - Unauthorized
 * @returns {object} 404 - Message not found
 * @returns {object} 500 - Internal server error
 */
router
    .route("/:messageId")
    .patch(isClient, catchAsync(updateMessage));

/**
 * @route DELETE /api/chat/message/:messageId
 * @desc Delete a message (only by the author)
 * @param {string} messageId - The ID of the message
 * @returns {object} 200 - Success message
 * @returns {object} 403 - Unauthorized
 * @returns {object} 404 - Message not found
 * @returns {object} 500 - Internal server error
 */
router
    .route("/:messageId")
    .delete(isClient, catchAsync(deleteMessage));

/**
 * @route GET /api/chat/heatmap/:communityId
 * @desc Get heatmap data for messages in a discussion (messages per day)
 * @param {string} communityId - The ID of the discussion
 * @returns {object} 200 - Array of message counts per day
 * @returns {object} 500 - Internal server error
 */
router
    .route("/heatmap/:communityId")
    .get(isClient, isCommunityCreator, catchAsync(getMessageHeatmapData));

/**
 * @route GET /api/users/search
 * @desc Search for users by username or email
 * @param {string} query - The search query
 * @returns {array} 200 - List of matching users
 * @returns {object} 500 - Internal server error
 */
router
    .route("/users/search")
    .get(isClient, catchAsync(searchUsers));

module.exports = router;
