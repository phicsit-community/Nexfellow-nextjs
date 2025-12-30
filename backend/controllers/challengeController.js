const Challenge = require("../models/challengeModel");
const ChallengeSubmission = require("../models/challengeSubmissionModel");
const ChallengeReward = require("../models/challengeRewardModel");
const ChallengeActivity = require("../models/challengeActivityModel");
const User = require("../models/userModel");
const Community = require("../models/communityModel");
const ExpressError = require("../utils/ExpressError");
const { uploadOnBunny, removeFromBunny } = require("../utils/attachments");
const mongoose = require("mongoose");

// Helper function to log activity
const logActivity = async (challengeId, userId, activityType, details = {}) => {
  try {
    const activity = new ChallengeActivity({
      challenge: challengeId,
      user: userId,
      activityType,
      ...details,
    });
    await activity.save();
  } catch (error) {
    console.error("Error logging activity:", error);
  }
};

// Helper function to calculate actual duration
const getActualDuration = (challenge) => {
  return challenge.customDuration || challenge.duration;
};

function isOwnerOrEventAdmin(community, userId) {
  const id = userId.toString();
  const isOwner = community.owner?.toString() === id;
  const modEntry = (community.moderators || []).find(
    (mod) => mod.user?.toString() === id
  );
  const isEventAdmin = modEntry && modEntry.role === "event-admin";
  return isOwner || isEventAdmin;
}

// Create a new challenge (Community creators only)
module.exports.createChallenge = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      title,
      description,
      duration,
      customDuration,
      startDate,
      endDate,
      communityId,
      dailyTasks,
      checkpointRewards,
      settings,
    } = req.body;

    console.log("Creating challenge with data:", req.body);

    // Parse JSON strings to arrays/objects (they come as strings from FormData)
    let parsedDailyTasks = [];
    let parsedCheckpointRewards = [];
    let parsedSettings = {};

    try {
      parsedDailyTasks =
        typeof dailyTasks === "string"
          ? JSON.parse(dailyTasks)
          : dailyTasks || [];
    } catch (error) {
      throw new ExpressError("Invalid dailyTasks format", 400);
    }

    try {
      parsedCheckpointRewards =
        typeof checkpointRewards === "string"
          ? JSON.parse(checkpointRewards)
          : checkpointRewards || [];
    } catch (error) {
      throw new ExpressError("Invalid checkpointRewards format", 400);
    }

    try {
      parsedSettings =
        typeof settings === "string" ? JSON.parse(settings) : settings || {};
    } catch (error) {
      throw new ExpressError("Invalid settings format", 400);
    }

    // Get user & community
    const user = await User.findById(req.userId).session(session);
    if (!user || !user.isCommunityAccount) {
      throw new ExpressError(
        "Only community accounts can create challenges",
        403
      );
    }
    const community = await Community.findById(communityId).session(session);
    if (!community) {
      throw new ExpressError("Community not found", 404);
    }

    // Permission check: owner or event-admin
    if (!isOwnerOrEventAdmin(community, req.userId)) {
      throw new ExpressError(
        "You are not authorized to create challenges for this community",
        403
      );
    }

    // Validate duration
    console.log("Duration:", duration, "Custom Duration:", customDuration);
    if (!customDuration) {
      // Convert duration to number to ensure proper comparison
      const durationNum = Number(duration);
      if (![7, 30, 100].includes(durationNum)) {
        throw new ExpressError(
          "Invalid duration. Must be 7, 30, or 100 days, or provide a custom duration",
          400
        );
      }
    } else if (customDuration <= 0) {
      throw new ExpressError("Custom duration must be greater than 0", 400);
    }

    let coverImageUrl = null;
    if (req.file) {
      const uploaded = await uploadOnBunny(req.file.path);
      if (uploaded && uploaded.url) {
        coverImageUrl = uploaded.url;
      }
    }

    const challenge = new Challenge({
      title,
      description,
      duration: customDuration ? null : duration,
      customDuration,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      creator: req.userId,
      community: communityId,
      coverImage: coverImageUrl,
      dailyTasks: parsedDailyTasks,
      checkpointRewards: parsedCheckpointRewards,
      settings: parsedSettings,
    });

    await challenge.save({ session });
    await session.commitTransaction();

    res.status(201).json({
      message: "Challenge created successfully",
      challenge,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Create challenge error:", error);
    res.status(error.statusCode || 500).json({
      message: error.message || "Error creating challenge",
    });
  } finally {
    session.endSession();
  }
};

// Get all challenges (public)
module.exports.getAllChallenges = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (status && ["upcoming", "ongoing", "completed"].includes(status)) {
      filter.status = status;
    } else {
      filter.status = { $in: ["upcoming", "ongoing"] }; // Only show published challenges
    }

    const challenges = await Challenge.find(filter)
      .populate("creator", "name username picture")
      .populate("community", "name description picture")
      .select("-participants -dailyTasks.submissionPrompt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Challenge.countDocuments(filter);

    res.json({
      challenges,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching challenges: " + error.message });
  }
};

// Get challenge details (public)
module.exports.getChallengeDetails = async (req, res) => {
  try {
    const { challengeId } = req.params;

    const challenge = await Challenge.findById(challengeId)
      .populate("creator", "name username picture")
      .populate("community", "name description picture owner moderators");

    if (!challenge) {
      return res.status(404).json({ message: "Challenge not found" });
    }

    // For public access, hide sensitive information
    const publicChallenge = {
      ...challenge.toObject(),
      participants: undefined,
      dailyTasks: challenge.dailyTasks.map((task) => ({
        day: task.day,
        title: task.title,
        description: task.description,
        submissionType: task.submissionType,
      })),
    };

    res.json({ challenge: publicChallenge });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching challenge: " + error.message });
  }
};

// Enroll in a challenge (authenticated users)
module.exports.enrollInChallenge = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { challengeId } = req.params;
    const userId = req.userId;

    const challenge = await Challenge.findById(challengeId).session(session);
    if (!challenge) {
      throw new ExpressError("Challenge not found", 404);
    }

    if (challenge.status !== "upcoming" && challenge.status !== "ongoing") {
      throw new ExpressError("Cannot enroll in this challenge", 400);
    }

    // Check if already enrolled
    const existingParticipant = challenge.participants.find((p) =>
      p.user.equals(userId)
    );
    if (existingParticipant) {
      throw new ExpressError("Already enrolled in this challenge", 400);
    }

    // Add participant
    challenge.participants.push({
      user: userId,
      enrolledAt: new Date(),
    });

    challenge.stats.totalEnrolled += 1;
    await challenge.save({ session });

    // Log activity with enhanced details
    await logActivity(challengeId, userId, "enrolled", {
      timestamp: new Date(),
      challengeTitle: challenge.title,
      totalParticipants: challenge.participants.length,
      challengeDuration: getActualDuration(challenge),
    });

    await session.commitTransaction();

    res.json({ message: "Successfully enrolled in challenge" });
  } catch (error) {
    await session.abortTransaction();
    res.status(error.statusCode || 500).json({
      message: error.message || "Error enrolling in challenge",
    });
  } finally {
    session.endSession();
  }
};

// Submit for a specific day (authenticated users)
module.exports.submitForDay = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { challengeId, day } = req.params;
    const { content } = req.body;
    const userId = req.userId;

    const challenge = await Challenge.findById(challengeId).session(session);
    if (!challenge) {
      throw new ExpressError("Challenge not found", 404);
    }

    // Check if user is enrolled
    const participant = challenge.participants.find((p) =>
      p.user.equals(userId)
    );
    if (!participant) {
      throw new ExpressError("You must enroll in the challenge first", 400);
    }

    // Check if day is valid
    const dayNum = parseInt(day);
    const actualDuration = getActualDuration(challenge);
    if (dayNum < 1 || dayNum > actualDuration) {
      throw new ExpressError("Invalid day", 400);
    }

    // Calculate current available day based on first submission
    const userSubmissions = await ChallengeSubmission.find({
      user: userId,
      challenge: challengeId,
    }).sort({ day: 1 });

    let currentAvailableDay = 1;
    if (userSubmissions.length > 0) {
      const firstSubmission = userSubmissions[0];
      const firstSubmissionDate = new Date(firstSubmission.submittedAt);
      const today = new Date();

      // Calculate days since first submission
      const daysSinceFirst = Math.floor(
        (today - firstSubmissionDate) / (1000 * 60 * 60 * 24)
      );
      currentAvailableDay = Math.min(
        firstSubmission.day + daysSinceFirst,
        actualDuration
      );
    }

    // Allow submission for the current available day
    // For new users (no submissions), they can submit for day 1
    // For existing users, they can submit for the current calculated day
    if (dayNum !== currentAvailableDay) {
      if (userSubmissions.length === 0 && dayNum === 1) {
        // Allow first submission for day 1
      } else if (dayNum < currentAvailableDay) {
        throw new ExpressError("This day has already passed", 400);
      } else {
        throw new ExpressError("This day is not yet available", 400);
      }
    }

    // Get the daily task for this day
    const dailyTask = challenge.dailyTasks.find((task) => task.day === dayNum);
    if (!dailyTask) {
      throw new ExpressError("No task found for this day", 400);
    }

    // Check if already submitted for this day
    const existingSubmission = await ChallengeSubmission.findOne({
      user: userId,
      challenge: challengeId,
      day: dayNum,
    }).session(session);

    if (existingSubmission) {
      throw new ExpressError("Already submitted for this day", 400);
    }

    let attachmentUrl = null;
    let attachmentType = null;

    if (req.file) {
      const uploaded = await uploadOnBunny(req.file.path);
      if (uploaded && uploaded.url) {
        attachmentUrl = uploaded.url;
        attachmentType = req.file.mimetype.startsWith("image/")
          ? "image"
          : "file";
      }
    }

    // Create submission
    const submission = new ChallengeSubmission({
      user: userId,
      challenge: challengeId,
      day: dayNum,
      submissionType: dailyTask.submissionType,
      content: dailyTask.submissionType === "text" ? content : undefined,
      imageUrl: attachmentType === "image" ? attachmentUrl : undefined,
      fileUrl: attachmentType === "file" ? attachmentUrl : undefined,
      attachments: attachmentUrl
        ? [
            {
              url: attachmentUrl,
              fileType: req.file.mimetype,
              fileName: req.file.originalname,
              fileSize: req.file.size,
            },
          ]
        : undefined,
      status: challenge.settings?.autoApproveSubmissions
        ? "approved"
        : "pending",
    });

    await submission.save({ session });

    // Update participant progress if auto-approved
    if (challenge.settings?.autoApproveSubmissions) {
      if (!participant.completedDays.includes(dayNum)) {
        participant.completedDays.push(dayNum);
        participant.progress = Math.round(
          (participant.completedDays.length / actualDuration) * 100
        );
        participant.currentDay = Math.max(participant.currentDay, dayNum + 1);
      }
    }

    await challenge.save({ session });

    // Log activity with enhanced details
    await logActivity(challengeId, userId, "submitted", {
      day: dayNum,
      submission: submission._id,
      submissionType: dailyTask.submissionType,
      submissionPreview:
        dailyTask.submissionType === "text"
          ? (content?.substring(0, 100) || "").trim() +
            (content?.length > 100 ? "..." : "")
          : `${
              dailyTask.submissionType.charAt(0).toUpperCase() +
              dailyTask.submissionType.slice(1)
            } uploaded`,
      progress: participant.progress,
      currentDay: participant.currentDay,
    });

    await session.commitTransaction();

    res.status(201).json({
      message: "Submission created successfully",
      submission,
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(error.statusCode || 500).json({
      message: error.message || "Error creating submission",
    });
  } finally {
    session.endSession();
  }
};

// Get user's progress in a challenge (authenticated users)
module.exports.getUserProgress = async (req, res) => {
  try {
    const { challengeId } = req.params;
    const userId = req.userId;

    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({ message: "Challenge not found" });
    }

    const participant = challenge.participants.find((p) =>
      p.user.equals(userId)
    );
    if (!participant) {
      return res
        .status(400)
        .json({ message: "You are not enrolled in this challenge" });
    }

    // Get user's submissions
    const submissions = await ChallengeSubmission.find({
      user: userId,
      challenge: challengeId,
    }).sort({ day: 1 });

    // Get earned rewards
    const rewards = await ChallengeReward.find({
      user: userId,
      challenge: challengeId,
      status: "awarded",
    });

    const actualDuration = getActualDuration(challenge);

    // Calculate progress based on day tracking
    let currentAvailableDay = 1;
    let missedDays = [];
    let completedDays = participant.completedDays || [];
    let progress = 0;

    if (submissions.length > 0) {
      // Find the first submission to start tracking
      const firstSubmission = submissions[0];
      const firstSubmissionDate = new Date(firstSubmission.submittedAt);
      const today = new Date();

      // Calculate days since first submission
      const daysSinceFirst = Math.floor(
        (today - firstSubmissionDate) / (1000 * 60 * 60 * 24)
      );

      // Current available day is based on first submission + days passed
      currentAvailableDay = Math.min(
        firstSubmission.day + daysSinceFirst,
        actualDuration
      );

      // Find missed days
      for (let day = firstSubmission.day; day < currentAvailableDay; day++) {
        const hasSubmissionForDay = submissions.some(
          (sub) => sub.day === day && sub.status === "approved"
        );
        if (!hasSubmissionForDay && !completedDays.includes(day)) {
          missedDays.push(day);
        }
      }

      // Update completed days based on approved submissions
      completedDays = submissions
        .filter((sub) => sub.status === "approved")
        .map((sub) => sub.day);

      // Calculate progress percentage
      progress = Math.round((completedDays.length / actualDuration) * 100);

      // Update participant data
      participant.completedDays = completedDays;
      participant.currentDay = currentAvailableDay;
      participant.progress = progress;
      participant.missedDays = missedDays;

      // Check if challenge is completed
      if (completedDays.length === actualDuration) {
        participant.isCompleted = true;
        participant.completedAt = new Date();
      }

      // Save updated participant data
      await challenge.save();
    }

    res.json({
      participant: {
        ...participant.toObject(),
        currentDay: currentAvailableDay,
        missedDays: missedDays,
        completedDays: completedDays,
        progress: progress,
      },
      submissions,
      rewards,
      stats: {
        totalDays: actualDuration,
        completedDays: completedDays.length,
        missedDays: missedDays.length,
        progress: progress,
        isCompleted: participant.isCompleted,
        currentAvailableDay: currentAvailableDay,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching progress: " + error.message });
  }
};

// Get challenges user is enrolled in
module.exports.getMyEnrolledChallenges = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    const filter = { "participants.user": req.userId };
    if (status) filter.status = status;

    const challenges = await Challenge.find(filter)
      .populate("creator", "name username picture")
      .populate("community", "name description picture")
      .sort({ "participants.enrolledAt": -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Add user's progress to each challenge
    const challengesWithProgress = challenges.map((challenge) => {
      const participant = challenge.participants.find((p) =>
        p.user.equals(req.userId)
      );
      return {
        ...challenge.toObject(),
        userProgress: participant
          ? {
              progress: participant.progress,
              currentDay: participant.currentDay,
              completedDays: participant.completedDays,
              isCompleted: participant.isCompleted,
            }
          : null,
        participants: undefined, // Hide other participants
      };
    });

    const total = await Challenge.countDocuments(filter);

    res.json({
      challenges: challengesWithProgress,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching enrolled challenges: " + error.message,
    });
  }
};

module.exports.getCommunityChallenges = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, communityId } = req.query;
    const skip = (page - 1) * limit;

    let filter = {};

    // Fetch community to check ownership
    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    // Owner sees all, others see only their created
    if (community.owner?.toString() === req.userId.toString()) {
      filter.community = communityId;
      if (status) filter.status = status;
    } else {
      filter.creator = req.userId;
      if (status) filter.status = status;
    }

    const challenges = await Challenge.find(filter)
      .populate("community", "name description picture")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Challenge.countDocuments(filter);

    res.json({
      challenges,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching challenges: " + error.message });
  }
};

// Get challenges created by user (creator only)
module.exports.getMyCreatedChallenges = async (req, res) => {
  try {
    const { communityId } = req.params;
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    const filter = { community: communityId };
    if (status) filter.status = status;

    const challenges = await Challenge.find(filter)
      .populate("community", "name description picture")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Challenge.countDocuments(filter);

    res.json({
      challenges,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching challenges: " + error.message });
  }
};

// Update challenge details (creator only)
module.exports.updateChallenge = async (req, res) => {
  try {
    const { challengeId } = req.params;
    const updates = req.body;

    // Parse JSON strings to arrays/objects (they come as strings from FormData)
    if (updates.dailyTasks && typeof updates.dailyTasks === "string") {
      try {
        updates.dailyTasks = JSON.parse(updates.dailyTasks);
      } catch (error) {
        return res.status(400).json({ message: "Invalid dailyTasks format" });
      }
    }

    if (
      updates.checkpointRewards &&
      typeof updates.checkpointRewards === "string"
    ) {
      try {
        updates.checkpointRewards = JSON.parse(updates.checkpointRewards);
      } catch (error) {
        return res
          .status(400)
          .json({ message: "Invalid checkpointRewards format" });
      }
    }

    if (updates.settings && typeof updates.settings === "string") {
      try {
        updates.settings = JSON.parse(updates.settings);
      } catch (error) {
        return res.status(400).json({ message: "Invalid settings format" });
      }
    }

    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({ message: "Challenge not found" });
    }

    // Fetch associated community
    const community = await Community.findById(challenge.community);
    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    if (!isOwnerOrEventAdmin(community, req.userId)) {
      return res.status(403).json({
        message: "Only community owner or event-admin can update challenge",
      });
    }

    // Handle cover image update
    if (req.file) {
      // Remove old image if exists
      if (challenge.coverImage) {
        // Extract path from Bunny CDN URL and remove
        const oldPath = challenge.coverImage.split("/").pop();
        await removeFromBunny(oldPath).catch(console.error);
      }

      const uploaded = await uploadOnBunny(req.file.path);
      if (uploaded && uploaded.url) {
        updates.coverImage = uploaded.url;
      }
    }

    // Prevent updating certain fields if challenge is ongoing
    if (challenge.status === "ongoing") {
      delete updates.duration;
      delete updates.customDuration;
      delete updates.startDate;
      delete updates.endDate;
    }

    Object.assign(challenge, updates);
    await challenge.save();

    res.json({
      message: "Challenge updated successfully",
      challenge,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating challenge: " + error.message });
  }
};

// Delete challenge (creator only)
module.exports.deleteChallenge = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { challengeId } = req.params;

    const challenge = await Challenge.findById(challengeId).session(session);
    if (!challenge) {
      throw new ExpressError("Challenge not found", 404);
    }

    // Fetch community
    const community = await Community.findById(challenge.community).session(
      session
    );
    if (!community) {
      throw new ExpressError("Community not found", 404);
    }

    if (!isOwnerOrEventAdmin(community, req.userId)) {
      throw new ExpressError(
        "Only community owner or event-admin can delete challenge",
        403
      );
    }

    // Cannot delete ongoing challenges
    if (challenge.status === "ongoing") {
      throw new ExpressError("Cannot delete ongoing challenge", 400);
    }

    // Delete related data
    await ChallengeSubmission.deleteMany({ challenge: challengeId }).session(
      session
    );
    await ChallengeReward.deleteMany({ challenge: challengeId }).session(
      session
    );
    await ChallengeActivity.deleteMany({ challenge: challengeId }).session(
      session
    );

    // Remove cover image from Bunny CDN
    if (challenge.coverImage) {
      const imagePath = challenge.coverImage.split("/").pop();
      await removeFromBunny(imagePath).catch(console.error);
    }

    await Challenge.findByIdAndDelete(challengeId).session(session);

    await session.commitTransaction();

    res.json({ message: "Challenge deleted successfully" });
  } catch (error) {
    await session.abortTransaction();
    res.status(error.statusCode || 500).json({
      message: error.message || "Error deleting challenge",
    });
  } finally {
    session.endSession();
  }
};

// Update challenge status (creator only)
module.exports.updateChallengeStatus = async (req, res) => {
  try {
    const { challengeId } = req.params;
    const { status } = req.body;

    if (!["unpublished", "upcoming", "ongoing", "completed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({ message: "Challenge not found" });
    }

    // Fetch community for access check
    const community = await Community.findById(challenge.community);
    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }
    if (!isOwnerOrEventAdmin(community, req.userId)) {
      return res.status(403).json({
        message: "Only community owner or event-admin can update status",
      });
    }

    challenge.status = status;
    await challenge.save();

    res.json({
      message: "Challenge status updated successfully",
      challenge,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating status: " + error.message });
  }
};

// Get challenge analytics (creator only)
module.exports.getChallengeAnalytics = async (req, res) => {
  try {
    const { challengeId } = req.params;

    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({ message: "Challenge not found" });
    }

    const community = await Community.findById(challenge.community);
    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    if (!isOwnerOrEventAdmin(community, req.userId)) {
      return res.status(403).json({
        message: "Only community owner or event-admin can access analytics",
      });
    }

    const totalParticipants = challenge.participants.length;
    const completedParticipants = challenge.participants.filter(
      (p) => p.isCompleted
    ).length;

    // Get submission stats
    const submissionStats = await ChallengeSubmission.aggregate([
      { $match: { challenge: new mongoose.Types.ObjectId(challengeId) } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Daily submission counts
    const dailySubmissions = await ChallengeSubmission.aggregate([
      { $match: { challenge: new mongoose.Types.ObjectId(challengeId) } },
      {
        $group: {
          _id: "$day",
          total: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
          approved: {
            $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] },
          },
          rejected: {
            $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      overview: {
        totalParticipants,
        completedParticipants,
        completionRate:
          totalParticipants > 0
            ? (completedParticipants / totalParticipants) * 100
            : 0,
        avgProgress:
          totalParticipants > 0
            ? challenge.participants.reduce((sum, p) => sum + p.progress, 0) /
              totalParticipants
            : 0,
      },
      submissions: {
        byStatus: submissionStats,
        byDay: dailySubmissions,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching analytics: " + error.message });
  }
};

// Get all submissions for review (creator only)
module.exports.getSubmissionsForReview = async (req, res) => {
  try {
    const { challengeId } = req.params;
    const { day, status = "pending", page = 1, limit = 20 } = req.query;

    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({ message: "Challenge not found" });
    }

    const community = await Community.findById(challenge.community);
    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }
    if (!isOwnerOrEventAdmin(community, req.userId)) {
      return res.status(403).json({
        message: "Only community owner or event-admin can review submissions",
      });
    }

    const filter = { challenge: challengeId };
    if (status) filter.status = status;
    if (day) filter.day = parseInt(day);

    const skip = (page - 1) * limit;

    const submissions = await ChallengeSubmission.find(filter)
      .populate("user", "name username picture")
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ChallengeSubmission.countDocuments(filter);

    res.json({
      submissions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching submissions: " + error.message });
  }
};

// Review a submission (creator only)
module.exports.reviewSubmission = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { challengeId, submissionId } = req.params;
    const { status, comment } = req.body;

    if (!["approved", "rejected", "needs_revision"].includes(status)) {
      throw new ExpressError("Invalid status", 400);
    }

    const challenge = await Challenge.findById(challengeId).session(session);
    if (!challenge) {
      throw new ExpressError("Challenge not found", 404);
    }

    const community = await Community.findById(challenge.community).session(
      session
    );
    if (!community) throw new ExpressError("Community not found", 404);

    if (!isOwnerOrEventAdmin(community, req.userId)) {
      throw new ExpressError(
        "Only community owner or event-admin can review submissions",
        403
      );
    }

    const submission = await ChallengeSubmission.findById(submissionId).session(
      session
    );
    if (!submission) {
      throw new ExpressError("Submission not found", 404);
    }

    // Update submission
    submission.status = status;
    submission.feedback = {
      comment,
      reviewedBy: req.userId,
      reviewedAt: new Date(),
    };

    await submission.save({ session });

    // Log review activity
    await logActivity(challengeId, submission.user, status, {
      day: submission.day,
      submissionId: submission._id,
      feedback: comment,
      reviewedBy: req.userId,
      submissionType: submission.submissionType,
    });

    // Update participant progress if approved
    if (status === "approved") {
      const participant = challenge.participants.find((p) =>
        p.user.equals(submission.user)
      );
      if (participant && !participant.completedDays.includes(submission.day)) {
        participant.completedDays.push(submission.day);
        const actualDuration = getActualDuration(challenge);
        participant.progress = Math.round(
          (participant.completedDays.length / actualDuration) * 100
        );

        // Check if challenge is completed
        if (participant.completedDays.length === actualDuration) {
          participant.isCompleted = true;
          participant.completedAt = new Date();
          challenge.stats.totalCompleted += 1;
        }

        // Award checkpoint rewards
        const checkpointRewards = challenge.checkpointRewards.filter(
          (reward) => reward.checkpointDay === submission.day
        );

        for (const rewardConfig of checkpointRewards) {
          const existingReward = await ChallengeReward.findOne({
            challenge: challengeId,
            user: submission.user,
            checkpointDay: submission.day,
          }).session(session);

          if (!existingReward) {
            const reward = new ChallengeReward({
              challenge: challengeId,
              user: submission.user,
              checkpointDay: submission.day,
              rewardType: rewardConfig.rewardType,
              rewardValue: rewardConfig.rewardValue,
              rewardDescription: rewardConfig.rewardDescription,
              status: "awarded",
            });

            await reward.save({ session });

            // Add to participant's earned rewards
            participant.earnedRewards.push({
              checkpointDay: submission.day,
              rewardType: rewardConfig.rewardType,
              earnedAt: new Date(),
            });

            // Log activity
            await logActivity(challengeId, submission.user, "reward_earned", {
              day: submission.day,
              reward: reward._id,
            });
          }
        }

        await challenge.save({ session });

        // Log day completion
        await logActivity(challengeId, submission.user, "day_completed", {
          day: submission.day,
          progress: participant.progress,
        });

        // Log challenge completion if applicable
        if (participant.isCompleted) {
          await logActivity(
            challengeId,
            submission.user,
            "challenge_completed",
            {
              progress: 100,
            }
          );
        }
      }
    }

    await session.commitTransaction();

    res.json({
      message: "Submission reviewed successfully",
      submission,
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(error.statusCode || 500).json({
      message: error.message || "Error reviewing submission",
    });
  } finally {
    session.endSession();
  }
};

// Get challenge activity feed (creator only)
module.exports.getChallengeActivity = async (req, res) => {
  try {
    const { challengeId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({ message: "Challenge not found" });
    }

    const community = await Community.findById(challenge.community);

    if (!community) throw new ExpressError("Community not found", 404);

    if (!isOwnerOrEventAdmin(community, req.userId)) {
      throw new ExpressError(
        "Only community owner or event-admin can review submissions",
        403
      );
    }

    const skip = (page - 1) * limit;

    const activities = await ChallengeActivity.find({ challenge: challengeId })
      .populate("user", "name username picture")
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ChallengeActivity.countDocuments({
      challenge: challengeId,
    });

    res.json({
      activities,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching activity: " + error.message });
  }
};

module.exports.getChallengeActivityByUser = async (req, res) => {
  try {
    const { challengeId, userId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({ message: "Challenge not found" });
    }

    // Fetch associated community
    const community = await Community.findById(challenge.community);
    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    // Allow: owner, event-admin, that user if is themselves, or if a participant
    const isAllowed =
      isOwnerOrEventAdmin(community, req.userId) ||
      req.userId === userId ||
      challenge.participants.some((p) => p.user.equals(userId));

    if (!isAllowed) {
      return res
        .status(403)
        .json({ message: "You do not have permission to view this activity" });
    }

    const skip = (page - 1) * limit;
    const activities = await ChallengeActivity.find({
      challenge: challengeId,
      user: userId,
    })
      .populate("user", "name username picture")
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    const total = await ChallengeActivity.countDocuments({
      challenge: challengeId,
      user: userId,
    });
    res.json({
      activities,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching activity: " + error.message });
  }
};

// Assign manual rewards to participants (Admin functionality)
module.exports.assignRewards = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { challengeId } = req.params;
    const { rewards } = req.body;

    // Validate input
    if (!Array.isArray(rewards) || rewards.length === 0) {
      throw new ExpressError("Rewards array is required", 400);
    }

    // Verify challenge exists and user is the creator
    const challenge = await Challenge.findById(challengeId).session(session);
    if (!challenge) {
      throw new ExpressError("Challenge not found", 404);
    }

    const community = await Community.findById(challenge.community).session(
      session
    );
    if (!community) throw new ExpressError("Community not found", 404);

    if (!isOwnerOrEventAdmin(community, req.userId)) {
      throw new ExpressError(
        "Only community owner or event-admin can review submissions",
        403
      );
    }

    const assignedRewards = [];

    for (const rewardData of rewards) {
      const {
        userId,
        rewardType,
        amount,
        prizeDetails,
        badgeDetails,
        certificateDetails,
        rank,
      } = rewardData;

      // Validate user exists and is a participant
      const user = await User.findById(userId).session(session);
      if (!user) {
        throw new ExpressError(`User ${userId} not found`, 404);
      }

      // Check if user is a participant in the challenge
      const isParticipant = challenge.participants.some((p) =>
        p.user.equals(userId)
      );
      if (!isParticipant) {
        throw new ExpressError(
          `User ${userId} is not a participant in this challenge`,
          400
        );
      }

      // Create reward record
      let rewardValue = "";
      let rewardDescription = "";

      switch (rewardType) {
        case "cash":
          rewardValue = `$${amount}`;
          rewardDescription = `Cash reward of $${amount}`;
          break;
        case "prize":
          rewardValue = prizeDetails?.name || "Physical Prize";
          rewardDescription = `Prize: ${prizeDetails?.name}${
            prizeDetails?.value ? ` (Value: $${prizeDetails.value})` : ""
          }`;
          break;
        case "badge":
          rewardValue = badgeDetails?.name || "Digital Badge";
          rewardDescription = `Badge: ${badgeDetails?.name}`;
          break;
        case "certificate":
          rewardValue = certificateDetails?.title || "Certificate";
          rewardDescription = `Certificate: ${certificateDetails?.title}`;
          break;
        default:
          throw new ExpressError(`Invalid reward type: ${rewardType}`, 400);
      }

      // Check if reward already exists for this user and challenge
      const existingReward = await ChallengeReward.findOne({
        challenge: challengeId,
        user: userId,
      }).session(session);

      if (existingReward) {
        // Update existing reward
        existingReward.rewardType =
          rewardType === "cash" ? "custom" : rewardType;
        existingReward.rewardValue = rewardValue;
        existingReward.rewardDescription = rewardDescription;
        existingReward.status = "awarded";
        existingReward.awardedAt = new Date();
        await existingReward.save({ session });
        assignedRewards.push(existingReward);
      } else {
        // Create new reward
        const newReward = new ChallengeReward({
          challenge: challengeId,
          user: userId,
          checkpointDay: rank || 0, // Use rank as checkpointDay for manual rewards
          rewardType: rewardType === "cash" ? "custom" : rewardType,
          rewardValue,
          rewardDescription,
          status: "awarded",
          awardedAt: new Date(),
        });
        await newReward.save({ session });
        assignedRewards.push(newReward);
      }

      // Log activity
      await logActivity(challengeId, userId, "reward_assigned", {
        rewardType,
        rewardValue,
        assignedBy: req.userId,
      });
    }

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: `${assignedRewards.length} reward(s) assigned successfully`,
      data: {
        assignedRewards,
        challenge: challenge._id,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Error assigning rewards:", error);

    if (error instanceof ExpressError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error while assigning rewards",
    });
  } finally {
    session.endSession();
  }
};

// Get challenge leaderboard (public)
module.exports.getChallengeLeaderboard = async (req, res) => {
  try {
    const { challengeId } = req.params;

    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({ message: "Challenge not found" });
    }

    // Fetch associated community
    const community = await Community.findById(challenge.community);
    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    // Allow: owner, event-admin, or any participant
    const isAllowed =
      isOwnerOrEventAdmin(community, req.userId) ||
      challenge.participants.some((p) => p.user.equals(req.userId));

    if (!isAllowed) {
      return res.status(403).json({
        message: "You do not have permission to view the leaderboard",
      });
    }

    // Get participants with their progress
    const leaderboard = challenge.participants
      .map((participant) => {
        return {
          user: participant.user,
          progress: participant.progress,
          completedDays: participant.completedDays.length,
          isCompleted: participant.isCompleted,
          enrolledAt: participant.enrolledAt,
        };
      })
      .sort(
        (a, b) => b.progress - a.progress || b.completedDays - a.completedDays
      );

    // Populate user details
    const populatedLeaderboard = await User.populate(leaderboard, {
      path: "user",
      select: "name username picture",
    });

    // Add rank to each entry
    const rankedLeaderboard = populatedLeaderboard.map((entry, index) => {
      return {
        ...entry,
        rank: index + 1,
      };
    });

    res.json({
      leaderboard: rankedLeaderboard,
      totalParticipants: challenge.participants.length,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching leaderboard: " + error.message,
    });
  }
};

// Get challenges by community (public)
module.exports.getChallengesByCommunity = async (req, res) => {
  try {
    const { communityId } = req.params;
    const { page = 1, limit = 3 } = req.query;
    const skip = (page - 1) * limit;

    const challenges = await Challenge.find({ community: communityId })
      .populate("creator", "name username picture")
      .populate("community", "name description picture")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Challenge.countDocuments({ community: communityId });

    res.json({
      challenges,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching challenges by community: " + error.message,
    });
  }
};

// Get comprehensive admin dashboard data (creator only)
module.exports.getAdminDashboard = async (req, res) => {
  try {
    const { challengeId } = req.params;
    const userId = req.userId;

    // Find challenge and verify ownership
    const challenge = await Challenge.findById(challengeId)
      .populate("creator", "name username email")
      .populate("community", "name")
      .lean();

    if (!challenge) {
      return res.status(404).json({ message: "Challenge not found" });
    }

    const community = await Community.findById(challenge.community);

    if (!community) throw new ExpressError("Community not found", 404);

    if (!isOwnerOrEventAdmin(community, req.userId)) {
      throw new ExpressError(
        "Only community owner or event-admin can review submissions",
        403
      );
    }

    // Get all submissions with user details
    const submissions = await ChallengeSubmission.find({
      challenge: challengeId,
    })
      .populate("user", "name username email picture")
      .sort({ submittedAt: -1 })
      .lean();

    // Get all participants with their progress
    const participants = await Promise.all(
      challenge.participants.map(async (participant) => {
        const user = await User.findById(participant.user)
          .select("name username email picture")
          .lean();
        const userSubmissions = submissions.filter((sub) =>
          sub.user._id.equals(participant.user)
        );

        return {
          _id: participant._id,
          user,
          enrolledAt: participant.enrolledAt,
          currentDay: participant.currentDay,
          completedDays: participant.completedDays || [],
          missedDays: participant.missedDays || [],
          progress: participant.progress || 0,
          isCompleted: participant.isCompleted || false,
          completedAt: participant.completedAt,
          submissionsCount: userSubmissions.length,
          lastSubmissionDate:
            userSubmissions.length > 0 ? userSubmissions[0].submittedAt : null,
        };
      })
    );

    // Get challenge activity
    const activities = await ChallengeActivity.find({ challenge: challengeId })
      .populate("user", "name username picture")
      .sort({ timestamp: -1 })
      .limit(50)
      .lean();

    // Calculate statistics
    const stats = {
      totalParticipants: participants.length,
      activeParticipants: participants.filter((p) => p.progress > 0).length,
      completedParticipants: participants.filter((p) => p.isCompleted).length,
      totalSubmissions: submissions.length,
      pendingSubmissions: submissions.filter((s) => s.status === "pending")
        .length,
      approvedSubmissions: submissions.filter((s) => s.status === "approved")
        .length,
      rejectedSubmissions: submissions.filter((s) => s.status === "rejected")
        .length,
      averageProgress:
        participants.length > 0
          ? Math.round(
              participants.reduce((sum, p) => sum + p.progress, 0) /
                participants.length
            )
          : 0,
      completionRate:
        participants.length > 0
          ? Math.round(
              (participants.filter((p) => p.isCompleted).length /
                participants.length) *
                100
            )
          : 0,
    };

    // Daily submission analytics
    const dailySubmissionStats = {};
    submissions.forEach((sub) => {
      const day = sub.day;
      if (!dailySubmissionStats[day]) {
        dailySubmissionStats[day] = {
          total: 0,
          approved: 0,
          pending: 0,
          rejected: 0,
        };
      }
      dailySubmissionStats[day].total++;
      dailySubmissionStats[day][sub.status]++;
    });

    res.json({
      challenge,
      participants,
      submissions,
      activities,
      stats,
      dailySubmissionStats,
      actualDuration: getActualDuration(challenge),
    });
  } catch (error) {
    console.error("Error fetching admin dashboard:", error);
    res.status(500).json({
      message: "Error fetching dashboard data",
      error: error.message,
    });
  }
};

// Get participants for admin dashboard
module.exports.getParticipants = async (req, res) => {
  try {
    const { challengeId } = req.params;

    // Verify ownership
    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({ message: "Challenge not found" });
    }

    const community = await Community.findById(challenge.community);

    if (!community) throw new ExpressError("Community not found", 404);

    if (!isOwnerOrEventAdmin(community, req.userId)) {
      throw new ExpressError(
        "Only community owner or event-admin can review submissions",
        403
      );
    }

    // Get participants with user details
    const participants = await Challenge.findById(challengeId)
      .select("participants")
      .populate("participants.user", "name username email picture")
      .lean();

    if (!participants) {
      return res.status(404).json({ message: "Challenge not found" });
    }

    // Calculate progress and add additional data
    const enrichedParticipants = participants.participants.map(
      (participant) => {
        const actualDuration = getActualDuration(challenge);
        const progress = Math.round(
          (participant.completedDays.length / actualDuration) * 100
        );

        return {
          ...participant,
          progress,
          completedCheckpoints: participant.earnedRewards || [],
          reward:
            participant.earnedRewards && participant.earnedRewards.length > 0
              ? {
                  earned: true,
                  rewardType: participant.earnedRewards[0].rewardType,
                }
              : { earned: false },
        };
      }
    );

    res.json({
      participants: enrichedParticipants,
      total: enrichedParticipants.length,
    });
  } catch (error) {
    console.error("Error getting participants:", error);
    res
      .status(500)
      .json({ message: "Error fetching participants: " + error.message });
  }
};

// Bulk approve submissions
module.exports.bulkApproveSubmissions = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { challengeId } = req.params;
    const { submissionIds } = req.body;

    if (
      !submissionIds ||
      !Array.isArray(submissionIds) ||
      submissionIds.length === 0
    ) {
      return res
        .status(400)
        .json({ message: "Please provide submission IDs to approve" });
    }

    // Verify challenge ownership
    const challenge = await Challenge.findById(challengeId).session(session);
    if (!challenge) {
      return res.status(404).json({ message: "Challenge not found" });
    }

    const community = await Community.findById(challenge.community).session(
      session
    );
    if (!community) throw new ExpressError("Community not found", 404);

    if (!isOwnerOrEventAdmin(community, req.userId)) {
      throw new ExpressError(
        "Only community owner or event-admin can review submissions",
        403
      );
    }

    // Update submissions
    const result = await ChallengeSubmission.updateMany(
      {
        _id: { $in: submissionIds },
        challenge: challengeId,
        status: "pending",
      },
      {
        $set: {
          status: "approved",
          "feedback.comment": "Bulk approved by admin",
          "feedback.reviewedBy": req.userId,
          "feedback.reviewedAt": new Date(),
        },
      },
      { session }
    );

    // Update participant progress for each approved submission
    const approvedSubmissions = await ChallengeSubmission.find({
      _id: { $in: submissionIds },
      status: "approved",
    }).session(session);

    for (const submission of approvedSubmissions) {
      // Add to completed days if not already there
      await Challenge.updateOne(
        {
          _id: challengeId,
          "participants.user": submission.user,
          "participants.completedDays": { $ne: submission.day },
        },
        {
          $addToSet: { "participants.$.completedDays": submission.day },
        },
        { session }
      );

      // Log activity
      await logActivity(challengeId, submission.user, "day_completed", {
        day: submission.day,
        submission: submission._id,
      });
    }

    await session.commitTransaction();

    res.json({
      message: `${result.modifiedCount} submissions approved successfully`,
      approvedCount: result.modifiedCount,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Bulk approve error:", error);
    res
      .status(500)
      .json({ message: "Error approving submissions: " + error.message });
  } finally {
    session.endSession();
  }
};

// Bulk reject submissions
module.exports.bulkRejectSubmissions = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { challengeId } = req.params;
    const { submissionIds } = req.body;

    if (
      !submissionIds ||
      !Array.isArray(submissionIds) ||
      submissionIds.length === 0
    ) {
      return res
        .status(400)
        .json({ message: "Please provide submission IDs to reject" });
    }

    // Verify challenge ownership
    const challenge = await Challenge.findById(challengeId).session(session);
    if (!challenge) {
      return res.status(404).json({ message: "Challenge not found" });
    }

    const community = await Community.findById(challenge.community).session(
      session
    );
    if (!community) throw new ExpressError("Community not found", 404);

    if (!isOwnerOrEventAdmin(community, req.userId)) {
      throw new ExpressError(
        "Only community owner or event-admin can review submissions",
        403
      );
    }

    // Update submissions
    const result = await ChallengeSubmission.updateMany(
      {
        _id: { $in: submissionIds },
        challenge: challengeId,
        status: "pending",
      },
      {
        $set: {
          status: "rejected",
          "feedback.comment": "Bulk rejected by admin",
          "feedback.reviewedBy": req.userId,
          "feedback.reviewedAt": new Date(),
        },
      },
      { session }
    );

    await session.commitTransaction();

    res.json({
      message: `${result.modifiedCount} submissions rejected successfully`,
      rejectedCount: result.modifiedCount,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Bulk reject error:", error);
    res
      .status(500)
      .json({ message: "Error rejecting submissions: " + error.message });
  } finally {
    session.endSession();
  }
};

// Get challenge details for admin (includes all data)
module.exports.getChallengeDetailsAdmin = async (req, res) => {
  try {
    const { challengeId } = req.params;

    const challenge = await Challenge.findById(challengeId)
      .populate("creator", "name username picture")
      .populate("community", "name description picture")
      .populate("participants.user", "name username email picture");

    if (!challenge) {
      return res.status(404).json({ message: "Challenge not found" });
    }

    const community = await Community.findById(challenge.community);

    if (!community) throw new ExpressError("Community not found", 404);

    if (!isOwnerOrEventAdmin(community, req.userId)) {
      throw new ExpressError(
        "Only community owner or event-admin can review submissions",
        403
      );
    }

    // Return full challenge data with calculated fields
    const challengeData = {
      ...challenge.toObject(),
      actualDuration: getActualDuration(challenge),
      participants: challenge.participants.map((participant) => {
        const progress = Math.round(
          (participant.completedDays.length / getActualDuration(challenge)) *
            100
        );
        return {
          ...participant.toObject(),
          progress,
          completedCheckpoints: participant.earnedRewards || [],
          reward:
            participant.earnedRewards && participant.earnedRewards.length > 0
              ? {
                  earned: true,
                  rewardType: participant.earnedRewards[0].rewardType,
                }
              : { earned: false },
        };
      }),
    };

    res.json({ challenge: challengeData });
  } catch (error) {
    console.error("Error fetching challenge admin details:", error);
    res
      .status(500)
      .json({ message: "Error fetching challenge details: " + error.message });
  }
};
