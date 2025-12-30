const Community = require("../models/communityModel");
const CommunityQuiz = require("../models/communityQuiz");
const CommunityQuestion = require("../models/communityQuestion");
const CommunityLeaderboard = require("../models/communityLeaderboard");
const Submission = require("../models/CommunitySubmission");
const RewardModel = require("../models/rewardModel");
const ExpressError = require("../utils/ExpressError");
const { uploadOnBunny, removeFromBunny } = require("../utils/attachments");
const fs = require("fs");
const moment = require("moment-timezone");
const User = require("../models/userModel");
const Profile = require("../models/profileModel");
const nodemailer = require("nodemailer");
const Mailgen = require("mailgen");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const generateSlug = require("../utils/slugGenerator");

// Helper to extract Bunny storage path from CDN URL
const getBunnyStoragePath = (cdnUrl) => {
  try {
    const url = new URL(cdnUrl);
    return url.pathname.startsWith("/") ? url.pathname.slice(1) : url.pathname;
  } catch {
    return null;
  }
};

// Helper function to find quiz by ID or slug
const findQuizByIdOrSlug = async (quizId, populateFields = "") => {
  let quiz;

  // Try to find quiz by ID first if it looks like a valid MongoDB ObjectId
  if (mongoose.Types.ObjectId.isValid(quizId)) {
    quiz = populateFields
      ? await CommunityQuiz.findById(quizId).populate(populateFields)
      : await CommunityQuiz.findById(quizId);
  }

  // If not found or not a valid ObjectId, try finding by slug
  if (!quiz) {
    quiz = populateFields
      ? await CommunityQuiz.findOne({ slug: quizId }).populate(populateFields)
      : await CommunityQuiz.findOne({ slug: quizId });
  }

  return quiz;
};

function isOwnerOrEventAdmin(community, userId) {
  const isOwner = community.owner?.toString() === userId.toString();
  const modEntry = (community.moderators || []).find(
    (mod) => mod.user?.toString() === userId.toString()
  );
  const isEventAdmin = modEntry && modEntry.role === "event-admin";
  return isOwner || isEventAdmin;
}

// ✅ Create a new quiz
module.exports.createCommunityQuiz = async (req, res) => {
  const userId = req.userId;
  try {
    const {
      title,
      description,
      startTime,
      endTime,
      duration,
      rules,
      category,
      misc,
      timerMode = "full",
    } = req.body;
    const { communityId } = req.params;

    if (
      !title ||
      !description ||
      !startTime ||
      !endTime ||
      !rules ||
      !category ||
      !communityId
    ) {
      throw new ExpressError("Missing required fields", 400);
    }

    // Check permission: allow only owner and event-admin
    const community = await Community.findById(communityId).lean();
    if (!community) {
      throw new ExpressError("Community not found", 404);
    }
    if (!isOwnerOrEventAdmin(community, userId)) {
      return res.status(403).json({
        message: "You are not authorized to create a quiz in this community",
      });
    }

    const startTimeUTC = moment(startTime).utc().toDate();
    const endTimeUTC = moment(endTime).utc().toDate();

    let parsedRules = rules;
    if (typeof rules === "string") {
      try {
        parsedRules = JSON.parse(rules);
      } catch (e) {
        parsedRules = [];
      }
    }

    const miscData = [];

    // Handle misc fields and file uploads
    if (misc && Array.isArray(misc)) {
      for (let i = 0; i < misc.length; i++) {
        const field = misc[i];

        // Find files using Multer's field naming convention
        const filesForField = (req.files || []).filter((file) =>
          file.fieldname.startsWith(`misc[${i}][fieldValue]`)
        );

        if (filesForField.length > 0) {
          const uploadedImages = await Promise.all(
            filesForField.map(async (file) => {
              const uploadResult = await uploadOnBunny(file.path);
              return uploadResult ? uploadResult.url : null;
            })
          );

          const imageUrls = uploadedImages.filter(Boolean);
          miscData.push({ fieldName: field.fieldName, fieldValue: imageUrls });
        } else {
          miscData.push({ fieldName: field.fieldName, fieldValue: [] });
        }
      }
    }

    // Create the new quiz and link it to the community
    const newQuiz = new CommunityQuiz({
      title,
      description,
      rewards: [],
      startTime: startTimeUTC,
      endTime: endTimeUTC,
      duration,
      creatorId: communityId,
      rules: parsedRules,
      category,
      timerMode,
      misc: miscData,
      slug: generateSlug(title),
    });

    await newQuiz.save();

    await Community.findByIdAndUpdate(communityId, {
      $push: { quiz: newQuiz._id },
    });

    res.status(201).json({ success: true, quiz: newQuiz });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Update quiz
module.exports.updateCommunityQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const userId = req.userId;
    const {
      title,
      description,
      startTime,
      endTime,
      duration,
      rules,
      category,
      misc,
      timerMode,
    } = req.body;

    if (
      !title ||
      !description ||
      !startTime ||
      !endTime ||
      !duration ||
      !rules ||
      !category
    ) {
      throw new ExpressError("Missing required fields", 400);
    }

    // Find the quiz by ID or slug
    const existingQuiz = await findQuizByIdOrSlug(quizId);
    if (!existingQuiz) {
      throw new ExpressError("Quiz not found", 404);
    }

    const community = await Community.findById(existingQuiz.creatorId).lean();
    if (!community) throw new ExpressError("Community not found", 404);
    if (!isOwnerOrEventAdmin(community, userId)) {
      return res
        .status(403)
        .json({ message: "You are not authorized to update this quiz" });
    }

    const startTimeUTC = moment(startTime).utc().toDate();
    const endTimeUTC = moment(endTime).utc().toDate();

    const miscData = [];

    if (misc && Array.isArray(misc)) {
      for (let i = 0; i < misc.length; i++) {
        const field = misc[i];

        // Find files using Multer's field naming convention
        const filesForField = (req.files || []).filter((file) =>
          file.fieldname.startsWith(`misc[${i}][fieldValue]`)
        );

        // Get existing URLs from req.body
        let existingUrls = [];
        if (field.fieldValue) {
          if (Array.isArray(field.fieldValue)) {
            existingUrls = field.fieldValue.filter(
              (url) => typeof url === "string"
            );
          } else if (typeof field.fieldValue === "string") {
            existingUrls = [field.fieldValue];
          }
        }

        let imageUrls = [...existingUrls];

        if (filesForField.length > 0) {
          const uploadedImages = await Promise.all(
            filesForField.map(async (file) => {
              const uploadResult = await uploadOnBunny(file.path);
              return uploadResult ? uploadResult.url : null;
            })
          );
          imageUrls = [...imageUrls, ...uploadedImages.filter(Boolean)];
        }

        miscData.push({ fieldName: field.fieldName, fieldValue: imageUrls });
      }
    }

    let parsedRules = rules;
    if (typeof rules === "string") {
      try {
        parsedRules = JSON.parse(rules);
      } catch (e) {
        parsedRules = [];
      }
    }

    const updatedQuiz = await CommunityQuiz.findByIdAndUpdate(
      existingQuiz._id,
      {
        title,
        description,
        startTime: startTimeUTC,
        endTime: endTimeUTC,
        duration,
        rules: parsedRules,
        category,
        timerMode,
        misc: miscData,
      },
      { new: true }
    );

    if (!updatedQuiz) {
      throw new ExpressError("Quiz not found", 404);
    }

    res.status(200).json({ success: true, quiz: updatedQuiz });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Delete quiz
module.exports.deleteCommunityQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const userId = req.userId;

    // Find the quiz by ID or slug
    const quiz = await findQuizByIdOrSlug(quizId);
    if (!quiz) {
      throw new ExpressError("Quiz not found", 404);
    }

    const community = await Community.findById(quiz.creatorId).lean();
    if (!community) throw new ExpressError("Community not found", 404);
    if (!isOwnerOrEventAdmin(community, userId)) {
      return res
        .status(403)
        .json({ message: "You are not authorized to update this quiz" });
    }

    // Optionally: Delete misc images from Bunny storage
    if (quiz && quiz.misc && Array.isArray(quiz.misc)) {
      for (const field of quiz.misc) {
        if (Array.isArray(field.fieldValue)) {
          for (const url of field.fieldValue) {
            const storagePath = getBunnyStoragePath(url);
            if (storagePath) {
              await removeFromBunny(storagePath);
            }
          }
        }
      }
    }

    await CommunityQuiz.findByIdAndDelete(quiz._id);
    await CommunityQuestion.deleteMany({ quizId: quiz._id });
    await CommunityLeaderboard.deleteMany({ quizId: quiz._id });

    res
      .status(200)
      .json({ success: true, message: "Quiz deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports.deleteQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;

    const deletedQuestion = await CommunityQuestion.findByIdAndDelete(
      questionId
    );
    if (!deletedQuestion) {
      throw new ExpressError("Question not found", 404);
    }

    // ✅ Remove question reference from the quiz
    await CommunityQuiz.findByIdAndUpdate(deletedQuestion.quizId, {
      $pull: { questions: questionId },
    });

    res.status(200).json({
      success: true,
      message: "Question deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports.addQuestion = async (req, res) => {
  try {
    const { type, text, options, correctOption, timeLimit } = req.body;
    const quizId = req.params.quizId;

    if (!text || !type || !correctOption) {
      throw new ExpressError("Missing required fields", 400);
    }

    // Find the quiz by ID or slug
    const quiz = await findQuizByIdOrSlug(quizId);
    if (!quiz) {
      throw new ExpressError("Quiz not found", 404);
    }

    const formattedOptions = options.map((option) => ({ text: option.text }));

    const formattedCorrectOption = Array.isArray(correctOption)
      ? correctOption
      : [correctOption];

    const newQuestion = new CommunityQuestion({
      quizId: quiz._id,
      type,
      text,
      // If timeLimit is provided, it should be in seconds
      timeLimit: timeLimit || null,
      options: formattedOptions,
      correctOption: formattedCorrectOption,
    });

    const savedQuestion = await newQuestion.save();

    if (!savedQuestion) {
      throw new ExpressError("Error saving question", 500);
    }

    const updatedQuiz = await CommunityQuiz.findByIdAndUpdate(
      quiz._id,
      { $push: { questions: savedQuestion._id } },
      { new: true }
    );

    if (!updatedQuiz) {
      throw new ExpressError("Error finding quiz", 500);
    }

    res.status(201).json({
      success: true,
      message: "Question created",
      questionId: savedQuestion._id,
    });
  } catch (error) {
    console.error(error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports.updateQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const { type, text, options, correctOption, timeLimit } = req.body;

    // ✅ Validation for required fields
    if (!text || !type || !correctOption) {
      throw new ExpressError("Missing required fields", 400);
    }

    // ✅ Format options
    const formattedOptions = options.map((option) => ({ text: option.text }));

    // ✅ Format correctOption to array if needed
    const formattedCorrectOption = Array.isArray(correctOption)
      ? correctOption
      : [correctOption];

    // ✅ Update the question
    const updatedQuestion = await CommunityQuestion.findByIdAndUpdate(
      questionId,
      {
        type,
        text,
        options: formattedOptions,
        correctOption: formattedCorrectOption,
        // If timeLimit is provided, it should be in seconds
        timeLimit: timeLimit || null,
      },
      { new: true }
    );

    if (!updatedQuestion) {
      throw new ExpressError("Question not found", 404);
    }

    res.status(200).json({
      success: true,
      question: updatedQuestion,
    });
  } catch (error) {
    console.error(error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports.getCommunityQuestionsForCreator = async (req, res) => {
  try {
    const userId = req.userId;
    const { quizId } = req.params;

    // Find the quiz by ID or slug and populate creatorId
    const quiz = await findQuizByIdOrSlug(quizId, "creatorId questions");
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    const community = await Community.findById(quiz.creatorId).lean();
    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    // Authorize owner or event-admin
    if (!isOwnerOrEventAdmin(community, userId)) {
      return res
        .status(403)
        .json({ message: "You are not authorized to view these questions" });
    }

    const questions = await CommunityQuestion.find({
      _id: { $in: quiz.questions },
    });

    const duration = quiz.duration * 60;

    return res.status(200).json({ questions, duration });
  } catch (error) {
    console.error("Error fetching community quiz questions (creator):", error);
    return res.status(500).json({ message: error.message });
  }
};

module.exports.getParticipantsForCreator = async (req, res) => {
  try {
    const userId = req.userId;
    const { quizId } = req.params;

    // Find the quiz by ID or slug and populate creatorId
    const quiz = await findQuizByIdOrSlug(quizId, "creatorId participants");
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    // Get the community
    const community = await Community.findById(quiz.creatorId).lean();
    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    // Authorize owner or event-admin
    if (!isOwnerOrEventAdmin(community, userId)) {
      return res
        .status(403)
        .json({ message: "You are not authorized to view these participants" });
    }

    // Get all registered users for the quiz
    const registeredUsers = await User.find({
      registeredCommunityQuizzes: quiz._id,
    })
      .select("_id username profileImage")
      .lean();

    // If no registered users and no participants
    if (
      (!registeredUsers || registeredUsers.length === 0) &&
      (!quiz.participants || quiz.participants.length === 0)
    ) {
      return res.status(200).json({ participants: [] });
    }

    // Combine both lists (registered users and participants)
    let participantIds = new Set();
    if (quiz.participants && quiz.participants.length > 0) {
      quiz.participants.forEach((participant) => {
        // If participant is an object, extract _id; else assume it's an ObjectId or string
        const id =
          typeof participant === "object" && participant !== null
            ? participant._id
            : participant;
        if (id) participantIds.add(id.toString());
      });
    }
    registeredUsers.forEach((user) => participantIds.add(user._id.toString()));

    // Filter for valid ObjectIds (24 hex chars)
    const isValidObjectId = (id) =>
      typeof id === "string" && /^[a-fA-F0-9]{24}$/.test(id);

    const validParticipantIds =
      Array.from(participantIds).filter(isValidObjectId);

    // Get submissions to determine status and scores
    const submissions = await Submission.find({
      quizId: quiz._id,
      userId: { $in: validParticipantIds },
    })
      .select("userId score")
      .lean();

    // Create a map of submissions by userId for quick lookup
    const submissionMap = {};
    submissions.forEach((sub) => {
      if (sub.userId) {
        submissionMap[sub.userId.toString()] = sub.score;
      }
    });

    // Get all user details (including both registered and participants)
    const users = await User.find({
      _id: { $in: validParticipantIds },
    })
      .select("_id name username picture")
      .lean();

    // Create a map for quick user lookup
    const userMap = {};
    users.forEach((user) => {
      userMap[user._id.toString()] = user;
    });

    // Map users to the requested format
    const participants = validParticipantIds
      .map((id) => {
        const user = userMap[id];
        if (!user) return null; // Skip if user not found

        const hasSubmitted = submissionMap.hasOwnProperty(id);
        return {
          userId: user._id,
          name: user.name || user.username,
          profileImage: user.picture || null,
          status: hasSubmitted ? "submitted" : "registered",
          score: hasSubmitted ? submissionMap[id] : null,
        };
      })
      .filter(Boolean); // Remove null entries

    return res.status(200).json({ participants });
  } catch (error) {
    console.error("Error fetching participants for creator:", error);
    return res.status(500).json({ message: error.message });
  }
};

module.exports.getCommunityQuizzes = async (req, res) => {
  try {
    const { communityId } = req.params;

    console.log("Backend Community ID:", communityId);
    const quizzes = await CommunityQuiz.find({
      creatorId: communityId,
    }).populate("questions creatorId");

    res.status(200).json({ success: true, quizzes });
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports.getPublicQuiz = async (req, res) => {
  try {
    const { quizid } = req.params;

    // Find quiz by ID or slug
    const quiz = await findQuizByIdOrSlug(quizid);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    // Populate questions if timerMode is "rapid"
    let questions = [];
    if (quiz.timerMode === "rapid") {
      questions = await CommunityQuestion.find({ quizId: quiz._id }).lean();
    }

    // Prepare a safe structure for public response
    const publicQuiz = {
      _id: quiz._id,
      title: quiz.title,
      description: quiz.description,
      category: quiz.category,
      totalRegistered: quiz.totalRegistered,
      userImages: quiz.User_profile_Image || [],
      duration: quiz.duration,
      questionCount: quiz.questions?.length || 0,
      rewards: quiz.rewards,
      rules: quiz.rules?.slice(0, 3) || [],
      timerMode: quiz.timerMode,
      visibility: quiz.visibility,
      startTime: quiz.startTime,
      endTime: quiz.endTime,
      totalMarks: quiz.totalMarks || 0,
      // Include questions if timerMode is "rapid"
      questions: quiz.timerMode === "rapid" ? questions : [],
    };

    return res.status(200).json({
      status: "success",
      quiz: publicQuiz,
    });
  } catch (error) {
    console.error("Error fetching public community quiz data:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ Get a single quiz by ID
module.exports.getCommunityQuizById = async (req, res) => {
  try {
    const { quizId } = req.params;
    const userId = req.userId;

    // Find the quiz by ID or slug
    const quiz = await findQuizByIdOrSlug(quizId, "questions");
    if (!quiz) {
      throw new ExpressError("Quiz not found", 404);
    }

    const userSubmission = await Submission.findOne({
      quizId: quiz._id,
      userId: userId,
    });

    const allUserSubmissions = await Submission.find({ quizId: quiz._id });
    allUserSubmissions.sort((a, b) => b.score - a.score);

    const userRank =
      allUserSubmissions.findIndex(
        (submission) =>
          submission.userId &&
          submission.userId.toString() === userId.toString()
      ) + 1;

    const beatPercentage =
      allUserSubmissions.length > 0
        ? ((allUserSubmissions.length - userRank) / allUserSubmissions.length) *
        100
        : 0;

    let message;
    if (allUserSubmissions.length === 1) {
      message = "You're the first to participate in this contest!";
    } else {
      message = `You beat ${beatPercentage.toFixed(2)}% in this contest`;
    }

    res.status(200).json({
      quiz,
      response: userSubmission,
      message,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get leaderboard
module.exports.getLeaderboard = async (req, res) => {
  try {
    const { quizId } = req.params;

    // Find the quiz by ID or slug to get the actual _id
    const quiz = await findQuizByIdOrSlug(quizId);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    const leaderboard = await CommunityLeaderboard.findOne({
      quizId: quiz._id,
    });

    if (!leaderboard) {
      return res.status(404).json({ message: "Leaderboard not found" });
    }

    res.status(200).json({ ranks: leaderboard.ranks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Update leaderboard
const calculateCommunityScore = (submission, quiz) => {
  const { answers } = submission;
  let score = 0;

  answers.forEach((answer) => {
    const question = quiz.questions.find(
      (q) => q._id.toString() === answer.questionId
    );

    if (question && question.correctOption.length > 1) {
      const correctAnswers = question.correctOption.sort().toString();
      const userAnswers = answer.selectedOptions.sort().toString();

      if (correctAnswers === userAnswers) {
        score++;
      }
    } else if (answer.correct) {
      score++;
    }
  });

  return score;
};

// Helper: Add rating to users based on ranks
const addCommunityRating = async (leaderboard, quizId) => {
  try {
    if (!leaderboard || !leaderboard.ranks || leaderboard.ranks.length === 0) {
      throw new Error("Leaderboard has no ranks to process.");
    }

    const ranksDescending = leaderboard.ranks.sort((a, b) => b.score - a.score);

    for (let i = 0; i < ranksDescending.length; i++) {
      let rating = 0;

      if (i === 0) {
        rating = 30;
      } else if (i === 1) {
        rating = 25;
      } else if (i === 2) {
        rating = 20;
      } else if (i >= 3 && i < 10) {
        rating = 15;
      } else {
        rating = 10;
      }

      if (!ranksDescending[i].userId) {
        console.warn(`User ID is missing for rank ${i + 1}, skipping.`);
        continue;
      }

      const userProfile = await Profile.findOne({
        userId: ranksDescending[i].userId,
      });

      if (!userProfile) continue;

      const existingQuizRating = userProfile.quizRatings.find((ratingEntry) =>
        ratingEntry.quizId.equals(quizId)
      );

      if (existingQuizRating) {
        await Profile.updateOne(
          { userId: ranksDescending[i].userId, "quizRatings.quizId": quizId },
          { $set: { "quizRatings.$.rating": rating } }
        );
      } else {
        await Profile.updateOne(
          { userId: ranksDescending[i].userId },
          {
            $inc: { rating: rating },
            $push: { quizRatings: { quizId: quizId, rating: rating } },
          }
        );
      }
    }
  } catch (error) {
    console.error("Error adding ratings:", error);
    throw new Error("Failed to add ratings due to an internal error.");
  }
};

// Main controller: Compile results and update leaderboard for community quiz
module.exports.updateLeaderboard = async (req, res) => {
  try {
    const quizId = req.params.quizId;
    console.log("params:", req.params);
    console.log("Quiz ID:", quizId);

    // Find the quiz by ID or slug
    const quiz = await findQuizByIdOrSlug(quizId, "questions");
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found." });
    }

    const submissions = await Submission.find({ quizId: quiz._id }).populate(
      "userId"
    );
    if (!submissions || submissions.length === 0) {
      return res.status(404).json({ message: "No submissions found." });
    }

    let leaderboard = await CommunityLeaderboard.findOne({
      quizId: quiz._id,
    }).populate("ranks.userId");
    if (!leaderboard) {
      leaderboard = new CommunityLeaderboard({ quizId: quiz._id, ranks: [] });
    } else {
      leaderboard.ranks = [];
    }

    for (const submission of submissions) {
      if (submission.userId) {
        submission.score = calculateCommunityScore(submission, quiz);
        submission.correctAnswers = submission.answers.filter(
          (answer) => answer.correct
        ).length;

        // Add user to leaderboard
        leaderboard.ranks.push({
          userId: submission.userId._id,
          score: submission.score * 10,
          username: submission.userId.username,
          country: submission.userId.country,
        });

        await submission.save();
      } else {
        console.warn(`Submission missing userId: ${submission._id}`);
      }
    }

    await addCommunityRating(leaderboard, quiz._id);

    await leaderboard.save();

    res.status(200).json({ success: true, leaderboard });
  } catch (err) {
    console.error("Error compiling community results:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// Send verification email (reuse from main)
const sendVerificationEmail = async (email, user) => {
  const secret = process.env.SECRET;
  const token = jwt.sign({ id: user._id }, secret, { expiresIn: "120m" });

  let config = {
    host: "smtp.hostinger.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  };
  let transporter = nodemailer.createTransport(config);
  let MailGenerator = new Mailgen({
    theme: "default",
    product: {
      name: "NexFellow",
      link: "https://mailgen.js/",
    },
  });

  var response = {
    body: {
      name: `${user.username}`,
      intro: "This is for the verification of the email you have provided.",
      action: {
        instructions: "Click the button below to verify the email:",
        button: {
          color: "#DC4D2F",
          text: "Click here",
          link: `${process.env.BACKEND_DOMAIN}/user/verifyEmail/${user._id}/${token}`,
        },
      },
      outro:
        "If you did not request a verification email, no further action is required on your part.",
    },
  };

  var emailBody = MailGenerator.generate(response);
  let message = {
    from: `${process.env.EMAIL}`,
    to: `${email}`,
    subject: "Email Verification",
    html: emailBody,
  };

  transporter
    .sendMail(message)
    .then(() => console.log("Verification email sent"))
    .catch((err) => console.log(err));
};

// Send quiz details email
const sendCommunityQuizDetails = async (email, user) => {
  try {
    if (!email || typeof email !== 'string' || !email.trim()) {
      throw new ExpressError('No email recipient provided for quiz details', 400);
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.hostinger.com",
      port: 465,
      secure: true,
      auth: { user: process.env.EMAIL, pass: process.env.PASSWORD },
    });

    const MailGenerator = new Mailgen({
      theme: "default",
      product: { name: "NexFellow", link: `${process.env.SITE_URL}` },
    });

    const lastRegisteredQuizId =
      user.registeredCommunityQuizzes[user.registeredCommunityQuizzes.length - 1];

    const response = {
      body: {
        name: `${user.username}`,
        intro: "This email is for the Community Contest you have registered for!",
        action: {
          instructions: "Click the button below to go to the Contest:",
          button: {
            color: "#40dc2f",
            text: "Click here",
            link: `${process.env.SITE_URL}/community/contests/${lastRegisteredQuizId}`,
          },
        },
        outro:
          "If you haven't registered for this Contest, no further action is required on your part!",
      },
    };

    const emailBody = MailGenerator.generate(response);

    // Do not coerce undefined with a template literal
    const message = {
      from: process.env.EMAIL,
      to: email.trim(),
      subject: "Community Contest Details",
      html: emailBody,
    };

    // Optional: log to verify recipients
    console.log('email debug', { to: message.to });

    await transporter.sendMail(message);
    console.log("Community contest email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
    throw new ExpressError("Failed to send Community Contest details email", 500);
  }
};

// Register for a community quiz
module.exports.registerCommunityQuiz = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const userId = req.userId;

    console.log(
      "Registering for community quiz - quizId:",
      quizId,
      "userId:",
      userId
    );

    if (!userId || !quizId) {
      throw new ExpressError("quizId or userId not provided", 400);
    }

    const user = await User.findById(userId).select('+email');
    if (!user) {
      throw new ExpressError("user not found", 400);
    }

    console.log("User found:", user.username, "verified:", user.verified);

    if (!user.verified) {
      await sendVerificationEmail(user.email, user);
      return res.status(400).json({
        message: "User not verified. Verification email sent",
      });
    }

    // Find the quiz by ID or slug
    const quiz = await findQuizByIdOrSlug(quizId);
    if (!quiz) {
      throw new ExpressError("quiz not found", 400);
    }

    user.registeredCommunityQuizzes = user.registeredCommunityQuizzes || [];
    if (user.registeredCommunityQuizzes.includes(quiz._id.toString())) {
      throw new ExpressError("You have already registered for this quiz", 400);
    }

    console.log("Quiz found:", quiz.title, "startTime:", quiz.startTime);

    if (Date.now() > quiz.startTime) {
      throw new ExpressError(
        "Contest has started. No registration allowed",
        400
      );
    }

    // Register user for quiz (use the actual _id)
    user.registeredCommunityQuizzes.push(quiz._id);
    await user.save();

    console.log("User registered for quiz successfully");

    // Increment totalRegistered
    quiz.totalRegistered++;

    // Add user profile image (FIFO, max 3)
    if (user.picture) {
      quiz.User_profile_Image = quiz.User_profile_Image || [];
      if (quiz.User_profile_Image.length < 3) {
        quiz.User_profile_Image.push(user.picture);
      } else if (quiz.User_profile_Image.length === 3) {
        quiz.User_profile_Image.shift();
        quiz.User_profile_Image.push(user.picture);
      }
    }

    // Rewards logic (optional, if you want to assign rewards here)
    // Example: If you want to assign a default reward on registration, do it here
    // quiz.rewards = [...quiz.rewards, someRewardId];

    // append the user's mongo id to quiz.participants
    if (!quiz.participants) {
      quiz.participants = [];
    }
    if (!quiz.participants.includes(user._id.toString())) {
      quiz.participants.push(user._id);
    }

    await quiz.save();

    console.log("Quiz updated with new registration");

    await sendCommunityQuizDetails(user.email, user);

    console.log("Registration email sent to user");

    res.status(200).json("Community Contest registered");
  } catch (error) {
    console.error("Error in registerCommunityQuiz:", error);
    next(error);
  }
};

// Check if user is registered for a community quiz
module.exports.isRegisteredCommunityQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    console.log("Quiz ID:", quizId);
    const userId = req.userId;
    console.log("User ID:", userId);

    if (!userId || !quizId) {
      return res
        .status(400)
        .json({ success: false, message: "quizId or userId not provided" });
    }

    // Find the quiz by ID or slug
    const quiz = await findQuizByIdOrSlug(quizId);
    if (!quiz) {
      return res
        .status(404)
        .json({ success: false, message: "Quiz not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const isRegistered =
      Array.isArray(user.registeredCommunityQuizzes) &&
      user.registeredCommunityQuizzes.includes(quiz._id.toString());

    return res.status(200).json({ success: true, isRegistered });
  } catch (error) {
    console.error("Error checking registration:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Bookmark/unbookmark a community quiz
module.exports.actionCommunityBookmark = async (req, res) => {
  try {
    const userId = req.userId;
    const quizId = req.params.quizId;

    // Find the quiz by ID or slug
    const quiz = await findQuizByIdOrSlug(quizId);
    if (!quiz) {
      return res.status(404).json({ message: "Contest not found" });
    }

    const profile = await Profile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({ message: "Profile not found!" });
    }

    profile.communityBookmarks = profile.communityBookmarks || [];

    if (profile.communityBookmarks.includes(quiz._id.toString())) {
      profile.communityBookmarks.pull(quiz._id);
      await profile.save();
      res.status(200).json({
        message: "Contest removed from bookmarks",
        bookmarks: profile.communityBookmarks,
      });
    } else {
      profile.communityBookmarks.push(quiz._id);
      await profile.save();
      res.status(200).json({
        message: "Contest added to bookmarks",
        bookmarks: profile.communityBookmarks,
      });
    }
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get bookmarked community quizzes
module.exports.bookmarkedCommunityQuizzes = async (req, res) => {
  const userId = req.userId;
  const user = await User.findById(userId);
  if (!user) {
    throw new ExpressError("user not found", 400);
  }

  const profile = await Profile.findOne({ userId });
  if (!profile) {
    return res.status(404).json({ message: "Profile not found!" });
  }

  const bookmarkedQuizzes = profile.communityBookmarks || [];
  const bookmarked = await CommunityQuiz.find({
    _id: { $in: bookmarkedQuizzes },
  });

  try {
    const data = await Promise.all(
      bookmarked.map(async (quiz) => {
        const score = await getscore(quiz._id, userId);
        return {
          title: quiz.title,
          startTime: quiz.startTime,
          endTime: quiz.endTime,
          score: score,
          id: quiz._id,
          premium: user.subscriptionTier === "bronze" ? true : false,
        };
      })
    );

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// Helper to get score for a quiz
const getscore = async (quizId, userId) => {
  try {
    const response = await Submission.findOne({
      quizId: quizId,
      userId: userId,
    });
    return response ? response.score : -2;
  } catch (error) {
    return 0;
  }
};

// Get all community quizzes a user is registered for
module.exports.getYourCommunityQuizzes = async (req, res) => {
  const userId = req.userId;
  const user = await User.findById(userId);
  if (!user) {
    throw new ExpressError("user not found", 400);
  }
  const registeredQuizzes = user.registeredCommunityQuizzes || [];

  const yourQuizzes = await CommunityQuiz.find({
    _id: { $in: registeredQuizzes },
  });

  try {
    const data = await Promise.all(
      yourQuizzes.map(async (quiz) => {
        const score = await getscore(quiz._id, userId);
        return {
          title: quiz.title,
          startTime: quiz.startTime,
          endTime: quiz.endTime,
          score: score,
          id: quiz._id,
          premium: user.subscriptionTier === "bronze" ? true : false,
        };
      })
    );

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// Submit response for a community quiz
module.exports.addCommunityResponseAndUpdateSubmission = async (req, res) => {
  const { answers, timeTaken } = req.body;
  const userId = req.userId;
  const { quizId } = req.params;

  try {
    if (!userId || !quizId) {
      throw new ExpressError("quizId or userId not provided", 400);
    }

    // Find quiz by ID or slug
    const quiz = await findQuizByIdOrSlug(quizId);
    if (!quiz) {
      throw new ExpressError("Quiz not found", 404);
    }

    const now = new Date();
    if (quiz.endTime < now) {
      throw new ExpressError("Quiz has ended. No submission allowed", 400);
    }

    const previousSubmission = await Submission.findOne({
      userId,
      quizId: quiz._id,
    });
    if (previousSubmission) {
      throw new ExpressError("Quiz already submitted", 400);
    }

    let correctAnswersCount = 0;
    let totalScore = 0;
    let maxScore = 0;

    const evaluatedAnswers = await Promise.all(
      answers.map(async (answer) => {
        try {
          const question = await Question.findById(answer.questionId);
          if (!question) {
            throw new ExpressError("Question not found", 404);
          }

          let isCorrect = false;
          let questionScore = 0;
          const questionMaxScore = question.points;

          if (question.type === "checkbox") {
            const correctOptions = question.correctOption;
            const userResponse = answer.response || [];

            if (userResponse.length === 0) {
              isCorrect = false;
              questionScore = 0;
            } else {
              const correctSelectedCount = userResponse.filter((option) =>
                correctOptions.includes(option)
              ).length;

              const incorrectSelectedCount = userResponse.filter(
                (option) => !correctOptions.includes(option)
              ).length;

              const totalCorrectCount = correctOptions.length;

              if (incorrectSelectedCount === 0) {
                questionScore =
                  (correctSelectedCount / totalCorrectCount) * questionMaxScore;
              }

              isCorrect = correctSelectedCount === totalCorrectCount;
            }
          } else if (question.type === "radio") {
            const correctOptions = question.correctOption.map((opt) =>
              opt.toLowerCase()
            );
            const userResponse = Array.isArray(answer.response)
              ? answer.response[0]
              : answer.response;

            if (!userResponse) {
              isCorrect = false;
              questionScore = 0;
            } else {
              const normalizedUserResponse = userResponse.toLowerCase();
              isCorrect = correctOptions.includes(normalizedUserResponse);
              questionScore = isCorrect ? questionMaxScore : 0;
            }
          } else if (question.type === "text") {
            const correctOptions = question.correctOption.map((opt) =>
              opt.toLowerCase()
            );
            const userResponse = Array.isArray(answer.response)
              ? answer.response[0]
              : answer.response;

            if (!userResponse) {
              isCorrect = false;
              questionScore = 0;
            } else {
              const normalizedUserResponse = userResponse.toLowerCase();
              isCorrect = correctOptions.includes(normalizedUserResponse);
              questionScore = isCorrect ? questionMaxScore : 0;
            }
          }

          questionScore = isNaN(questionScore) ? 0 : questionScore;

          if (isCorrect) correctAnswersCount++;
          totalScore += questionScore;
          maxScore += questionMaxScore;

          return { ...answer, correct: isCorrect, score: questionScore };
        } catch (error) {
          throw new ExpressError("Error evaluating answer", 500);
        }
      })
    );

    totalScore = isNaN(totalScore) ? 0 : totalScore;
    maxScore = isNaN(maxScore) ? 0 : maxScore;

    const submission = new Submission({
      userId,
      quizId: quiz._id,
      answers: evaluatedAnswers,
      totalQuestions: answers.length,
      correctAnswers: correctAnswersCount,
      timeTaken,
      score: totalScore,
      maxScore: maxScore,
    });

    await submission.save();

    res.status(200).json("Quiz submitted successfully with partial marking");
  } catch (error) {
    res
      .status(error.status || 500)
      .json({ message: error.message || "Internal Server Error" });
  }
};

// Get final score for a community quiz
module.exports.getCommunityFinalScore = async (req, res) => {
  const { userId, quizId } = req.params;
  if (!userId || !quizId) {
    throw new ExpressError("quizId or userId not provided", 400);
  }

  // Find the quiz by ID or slug
  const quiz = await findQuizByIdOrSlug(quizId);
  if (!quiz) {
    throw new ExpressError("Quiz not found", 404);
  }

  const submission = await Submission.findOne({ userId, quizId: quiz._id });
  if (!submission) {
    throw new ExpressError("Submission not found", 400);
  }
  res.status(200).json({ score: submission.score });
};

// Get questions for a community quiz
module.exports.getCommunityQuestionsForUser = async (req, res) => {
  try {
    const userId = req.userId;
    const { quizId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Find the quiz by ID or slug
    const quiz = await findQuizByIdOrSlug(quizId);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    const isRegistered = (user.registeredCommunityQuizzes || [])
      .map((qid) => qid.toString())
      .includes(quiz._id.toString());

    if (!isRegistered) {
      return res
        .status(403)
        .json({ message: "You are not registered for this Community Quiz" });
    }

    const questions = await CommunityQuestion.find({
      _id: { $in: quiz.questions },
    });

    const duration = quiz.duration * 60;

    return res.status(200).json({ questions, duration });
  } catch (error) {
    console.error("Error fetching community quiz questions (user):", error);
    return res.status(500).json({ message: error.message });
  }
};

// POST /community/quizzes/:quizId/submit
module.exports.submitCommunityQuiz = async (req, res) => {
  const { answers, timeTaken } = req.body;
  const userId = req.userId; // get from auth middleware
  const { quizId } = req.params;

  try {
    if (!userId || !quizId) {
      throw new ExpressError("quizId or userId not provided", 400);
    }

    // Find the quiz by ID or slug
    const quiz = await findQuizByIdOrSlug(quizId, "questions");
    if (!quiz) throw new ExpressError("Quiz not found", 404);

    // Check for duplicate submission
    const previousSubmission = await Submission.findOne({
      userId,
      quizId: quiz._id,
    });
    if (previousSubmission) {
      throw new ExpressError("Quiz already submitted", 400);
    }

    let correctAnswersCount = 0;
    let totalScore = 0;
    let maxScore = 0;

    // Evaluate answers
    const evaluatedAnswers = await Promise.all(
      answers.map(async (answer) => {
        const question = quiz.questions.find(
          (q) => q._id.toString() === answer.questionId
        );
        if (!question) throw new ExpressError("Question not found", 404);

        let isCorrect = false;
        let questionScore = 0;
        const questionMaxScore = question.points || 1; // default 1 if not set

        if (question.type === "checkbox") {
          const correctOptions = question.correctOption.map(String);
          const userResponse = (answer.response || []).map(String);

          const correctSelectedCount = userResponse.filter((option) =>
            correctOptions.includes(option)
          ).length;

          const incorrectSelectedCount = userResponse.filter(
            (option) => !correctOptions.includes(option)
          ).length;

          const totalCorrectCount = correctOptions.length;

          if (incorrectSelectedCount === 0) {
            questionScore =
              (correctSelectedCount / totalCorrectCount) * questionMaxScore;
          }

          isCorrect =
            correctSelectedCount === totalCorrectCount &&
            incorrectSelectedCount === 0;
        } else if (question.type === "radio") {
          const correctOptions = question.correctOption.map((opt) =>
            opt.toLowerCase()
          );
          const userResponse = Array.isArray(answer.response)
            ? answer.response[0]
            : answer.response;

          if (!userResponse) {
            isCorrect = false;
            questionScore = 0;
          } else {
            const normalizedUserResponse = userResponse.toLowerCase();
            isCorrect = correctOptions.includes(normalizedUserResponse);
            questionScore = isCorrect ? questionMaxScore : 0;
          }
        } else if (question.type === "text") {
          const correctOptions = question.correctOption.map((opt) =>
            opt.toLowerCase()
          );
          const userResponse = Array.isArray(answer.response)
            ? answer.response[0]
            : answer.response;

          if (!userResponse) {
            isCorrect = false;
            questionScore = 0;
          } else {
            const normalizedUserResponse = userResponse.toLowerCase();
            isCorrect = correctOptions.includes(normalizedUserResponse);
            questionScore = isCorrect ? questionMaxScore : 0;
          }
        }

        questionScore = isNaN(questionScore) ? 0 : questionScore;

        if (isCorrect) correctAnswersCount++;
        totalScore += questionScore;
        maxScore += questionMaxScore;

        return { ...answer, correct: isCorrect, score: questionScore };
      })
    );

    totalScore = isNaN(totalScore) ? 0 : totalScore;
    maxScore = isNaN(maxScore) ? 0 : maxScore;

    const submission = new Submission({
      userId,
      quizId: quiz._id,
      answers: evaluatedAnswers,
      totalQuestions: answers.length,
      correctAnswers: correctAnswersCount,
      timeTaken,
      score: totalScore,
      maxScore: maxScore,
    });

    await submission.save();

    res
      .status(200)
      .json({ message: "Quiz submitted successfully", submission });
  } catch (error) {
    console.error("Error during quiz submission:", error);
    res
      .status(error.status || 500)
      .json({ message: error.message || "Internal Server Error" });
  }
};

// GET /community/quiz/:quizId/submission/:userId
module.exports.getCommunityQuizSubmission = async (req, res) => {
  try {
    const { quizId, userId } = req.params;

    // Find quiz by ID or slug
    const quiz = await findQuizByIdOrSlug(quizId);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    const submission = await Submission.findOne({
      quizId: quiz._id,
      userId: userId,
    });

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    res.status(200).json({ submission });
  } catch (err) {
    console.error("Error fetching submission:", err);
    res
      .status(500)
      .json({ message: "Error fetching submission", error: err.message });
  }
};

// POST /community/quiz/:quizId/rewards
module.exports.assignCommunityQuizRewards = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { rewardIds } = req.body; // [rewardId1, rewardId2, ...]

    // Find quiz by ID or slug
    const existingQuiz = await findQuizByIdOrSlug(quizId);
    if (!existingQuiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    const quiz = await CommunityQuiz.findByIdAndUpdate(
      existingQuiz._id,
      { rewards: rewardIds },
      { new: true }
    );

    res.status(200).json({ message: "Rewards assigned", quiz });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error assigning rewards", error: err.message });
  }
};

// GET /community/quiz/:quizId/rewards
module.exports.getCommunityQuizRewards = async (req, res) => {
  try {
    const { quizId } = req.params;

    // Find quiz by ID or slug
    const quiz = await findQuizByIdOrSlug(quizId, "rewards");
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    res.status(200).json({ rewards: quiz.rewards });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching rewards", error: err.message });
  }
};

// GET /community/quizzes?category=xyz&status=active
module.exports.searchCommunityQuizzes = async (req, res) => {
  try {
    const { category, status } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (status) filter.status = status; // e.g., 'active', 'past', 'upcoming'
    const quizzes = await CommunityQuiz.find(filter);
    res.status(200).json({ quizzes });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error searching quizzes", error: err.message });
  }
};

// GET /community/quizzes/active
module.exports.getActiveCommunityQuizzes = async (req, res) => {
  try {
    const now = new Date();
    const quizzes = await CommunityQuiz.find({
      startTime: { $lte: now },
      endTime: { $gte: now },
    });
    res.status(200).json({ quizzes });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching active quizzes", error: err.message });
  }
};

// GET /community/quizzes/upcoming
module.exports.getUpcomingCommunityQuizzes = async (req, res) => {
  try {
    const now = new Date();
    const quizzes = await CommunityQuiz.find({ startTime: { $gt: now } });
    res.status(200).json({ quizzes });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching upcoming quizzes", error: err.message });
  }
};

// GET /community/quizzes/past
module.exports.getPastCommunityQuizzes = async (req, res) => {
  try {
    const now = new Date();
    const quizzes = await CommunityQuiz.find({ endTime: { $lt: now } });
    res.status(200).json({ quizzes });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching past quizzes", error: err.message });
  }
};

// GET /community/quiz/:quizId/registrations
module.exports.getCommunityQuizRegistrations = async (req, res) => {
  try {
    const { quizId } = req.params;

    // Find quiz by ID or slug
    const quiz = await findQuizByIdOrSlug(quizId, "registeredUsers");
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    res.status(200).json({ registeredUsers: quiz.registeredUsers });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching registrations", error: err.message });
  }
};

// GET /community/quizzes/:quizId/attempted
module.exports.hasAttemptedCommunityQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const userId = req.userId;
    if (!userId)
      return res
        .status(401)
        .json({ attempted: false, message: "Unauthorized" });

    // Find quiz by ID or slug
    const quiz = await findQuizByIdOrSlug(quizId);
    if (!quiz) {
      return res
        .status(404)
        .json({ attempted: false, message: "Quiz not found" });
    }

    const attempted = await Submission.findOne({ quizId: quiz._id, userId });
    res.json({ attempted: !!attempted });
  } catch (err) {
    res.status(500).json({ attempted: false, message: err.message });
  }
};
