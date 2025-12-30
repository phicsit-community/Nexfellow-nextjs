const express = require("express");
const User = require("../models/userModel");
const Post = require("../models/postModel");
const Comment = require("../models/commentModel");
const Community = require("../models/communityModel");
const Event = require("../models/eventModel");
const Challenge = require("../models/challengeModel");
const CommunityQuiz = require("../models/communityQuiz");
const { isClient } = require("../middleware");

const router = express.Router();

// Helper function for error handling
const handleErrors = (res, error) => {
  console.error("Search error:", error);
  const status = error.status || 500;
  const message = error.message || "An unexpected error occurred";
  res.status(status).json({ message });
};

router.get("/", isClient, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ message: "Query required" });

    const currentUserId = req.user._id.toString();
    const followingIds = req.user.following.map((id) => id.toString());

    // Find matched users with all fields
    let matchedUsers = await User.find({
      $or: [
        { username: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
        { name: { $regex: q, $options: "i" } },
      ],
    }).populate("createdCommunity profile");

    const matchedUserIds = matchedUsers.map((user) => user._id);

    const matchedCommunityIds = matchedUsers
      .filter((user) => user.createdCommunity)
      .map((user) => user.createdCommunity._id || user.createdCommunity);

    function sortByOwnerAndFollowing(items, getOwnerId) {
      return items.sort((a, b) => {
        const aOwnerId = getOwnerId(a)?.toString();
        const bOwnerId = getOwnerId(b)?.toString();

        if (aOwnerId === currentUserId) return -1;
        if (bOwnerId === currentUserId) return 1;

        const aFollowed = followingIds.includes(aOwnerId);
        const bFollowed = followingIds.includes(bOwnerId);

        if (aFollowed && !bFollowed) return -1;
        if (!aFollowed && bFollowed) return 1;

        return 0;
      });
    }

    // Use try-catch for each database query to handle specific errors
    let posts = [];
    try {
      posts = await Post.find({
        $or: [
          { title: { $regex: q, $options: "i" } },
          { content: { $regex: q, $options: "i" } },
          { author: { $in: matchedUserIds } },
        ],
      }).populate("author attachments comments attachments community");
    } catch (error) {
      console.error("Error fetching posts:", error);
    }

    let communities = [];
    try {
      communities = await Community.find({
        $or: [
          { name: { $regex: q, $options: "i" } },
          { description: { $regex: q, $options: "i" } },
          { owner: { $in: matchedUserIds } },
        ],
      }).populate("posts owner appraisals");
    } catch (error) {
      console.error("Error fetching communities:", error);
    }

    let events = [];
    try {
      events = await Event.find({
        $or: [
          { title: { $regex: q, $options: "i" } },
          { description: { $regex: q, $options: "i" } },
          { createdBy: { $in: matchedUserIds } },
        ],
      }).populate("communityId createdBy");
    } catch (error) {
      console.error("Error fetching events:", error);
    }

    let challenges = [];
    try {
      challenges = await Challenge.find({
        $or: [
          { title: { $regex: q, $options: "i" } },
          { description: { $regex: q, $options: "i" } },
          { creator: { $in: matchedUserIds } },
        ],
      }).populate("creator"); // Changed from createdBy to creator to match the schema
    } catch (error) {
      console.error("Error fetching challenges:", error);
    }

    let communityQuizzes = [];
    try {
      communityQuizzes = await CommunityQuiz.find({
        $or: [
          { title: { $regex: q, $options: "i" } },
          { description: { $regex: q, $options: "i" } },
          { creatorId: { $in: matchedCommunityIds } },
        ],
      }).populate("creatorId");
    } catch (error) {
      console.error("Error fetching community quizzes:", error);
    }

    // Apply sorting to non-empty arrays only
    const users = sortByOwnerAndFollowing(matchedUsers, (user) => user._id);

    if (posts.length) {
      posts = sortByOwnerAndFollowing(
        posts,
        (post) => post.author?._id || post.author
      );
    }

    if (communities.length) {
      communities = sortByOwnerAndFollowing(
        communities,
        (community) => community.owner?._id || community.owner
      );
    }

    if (events.length) {
      events = sortByOwnerAndFollowing(
        events,
        (event) => event.createdBy?._id || event.createdBy
      );
    }

    if (challenges.length) {
      challenges = sortByOwnerAndFollowing(
        challenges,
        (challenge) => challenge.creator?._id || challenge.creator // Changed from createdBy to creator
      );
    }

    if (communityQuizzes.length) {
      communityQuizzes = sortByOwnerAndFollowing(
        communityQuizzes,
        (quiz) => quiz.creatorId?._id || quiz.creatorId
      );
    }

    const results = {
      users,
      posts,
      communities,
      events,
      challenges,
      contests: communityQuizzes,
    };

    res.json(results);
  } catch (error) {
    handleErrors(res, error);
  }
});

router.get("/top-for-searchbar", async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ message: "Query required" });

    const users = await User.find({
      $or: [
        { username: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
        { name: { $regex: q, $options: "i" } },
      ],
    }).limit(5);

    const results = { users };

    res.json(results);
  } catch (error) {
    handleErrors(res, error);
  }
});

module.exports = router;
