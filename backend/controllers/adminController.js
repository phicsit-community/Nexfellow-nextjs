const Admin = require("../models/adminModel");
const sendMail = require("../utils/mailSender");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Quiz = require("../models/quizzes");
const Question = require("../models/questions");
const Submission = require("../models/submissions");
const Leaderboard = require("../models/leaderboard");
const ExpressError = require("../utils/ExpressError");
const moment = require("moment-timezone");
const userModel = require("../models/userModel");
const profile = require("../models/profileModel");
const mongoose = require("mongoose");
const uploadOnCloudinary = require("../utils/cloudinary");
const { isCommunityCreator } = require("../middleware");
const Request = require("../models/Request");
const { getIo } = require("../utils/websocket");
const { deleteUserDeep } = require("../utils/userDeleteUtil");
const Community = require("../models/communityModel");
const Post = require("../models/postModel");
const Attachment = require("../models/attachmentModel");
const fs = require("fs");
const { removeFromBunny } = require("../utils/attachments");
const NotificationService = require("../utils/notificationService");
const Notification = require("../models/Notification");

module.exports.adminlogin = async (req, res) => {
  let { email, password } = req.body;

  if (!email || !password) {
    throw new ExpressError("missing fields", 400);
  }
  email = email.toLowerCase();
  const user = await Admin.findOne({ email: email });

  if (!user) {
    throw new ExpressError("invalid credentials", 400);
  }

  if (!bcrypt.compareSync(password, user.password)) {
    throw new ExpressError("invalid credentials", 400);
  }
  const payload = {
    adminId: user._id,
    email: user.email,
    username: user.username,
  };
  const token = jwt.sign(payload, `${process.env.ADMIN_SECRET}`, {
    expiresIn: "3h",
  });
  res.cookie("adminjwt", token, {
    signed: true,
    httpOnly: false,
    sameSite: "none",
    maxAge: 3 * 1000 * 60 * 60,
    secure: true,
  });
  res.status(200).json({
    token,
    user: user._id,
    expiresIn: new Date(Date.now() + 3 * 60 * 60 * 1000),
  });
};

module.exports.adminlogout = (req, res) => {
  res.clearCookie("adminjwt").json("logout");
};

module.exports.adminregister = async (req, res) => {
  let { username, email, password } = req.body;
  if (!username || !email || !password)
    throw new ExpressError("missing fields", 400);
  email = email.toLowerCase();
  const registeredEmail = await Admin.findOne({
    email: email,
    username: username,
  });

  if (registeredEmail) {
    throw new ExpressError("email or username already registered", 400);
  }
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);
  const user = await Admin.create({ username, email, password: hash });
  // await sendVerificationEmail(email,user);
  res.status(200).json("register successful");
};

module.exports.createQuiz = async (req, res) => {
  const {
    title,
    description,
    startTime,
    endTime,
    duration,
    rules,
    category,
    misc,
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
    throw new ExpressError("Missing fields", 400);
  }

  const startTimeUTC = moment(startTime).utc().toDate();
  const endTimeUTC = moment(endTime).utc().toDate();

  const miscData = [];

  // Handle misc fields
  if (misc && Array.isArray(misc)) {
    for (let i = 0; i < misc.length; i++) {
      const field = misc[i];

      // Find files based on Multer's field naming convention
      const filesForField = req.files.filter((file) =>
        file.fieldname.startsWith(`misc[${i}][fieldValue]`)
      );

      if (filesForField.length > 0) {
        console.log(`Found files for ${field.fieldName}:`, filesForField);

        const uploadedImages = await Promise.all(
          filesForField.map(async (file) => {
            console.log("Uploading file:", file.path);
            const uploadResult = await uploadOnCloudinary(file.path);
            return uploadResult ? uploadResult.secure_url : null;
          })
        );

        const imageUrls = uploadedImages.filter(Boolean); // Keep only valid URLs
        miscData.push({ fieldName: field.fieldName, fieldValue: imageUrls });
      } else {
        console.log(`No files found for ${field.fieldName}`);
        miscData.push({ fieldName: field.fieldName, fieldValue: [] });
      }
    }
  }

  const newQuiz = new Quiz({
    title,
    description,
    startTime: startTimeUTC,
    endTime: endTimeUTC,
    duration,
    adminId: req.adminId,
    rules,
    category,
    misc: miscData,
  });

  await newQuiz.save();
  res.json({ message: "Quiz created", quizId: newQuiz._id });
};

module.exports.updateQuiz = async (req, res) => {
  const {
    title,
    description,
    startTime,
    endTime,
    duration,
    rules,
    category,
    misc,
  } = req.body;
  const quizId = req.params.quizid;

  const startTimeUTC = moment(startTime).utc().toDate();
  const endTimeUTC = moment(endTime).utc().toDate();

  if (
    !title ||
    !description ||
    !startTime ||
    !endTime ||
    !duration ||
    !rules ||
    !category
  ) {
    throw new ExpressError("Missing fields", 400);
  }

  const miscData = [];

  if (misc && Array.isArray(misc)) {
    for (const field of misc) {
      if (req.files && req.files[field.fieldName]) {
        const uploadedImages = await Promise.all(
          req.files[field.fieldName].map((file) =>
            uploadOnCloudinary(file.path)
          )
        );
        const imageUrls = uploadedImages.map((result) => result.secure_url);
        miscData.push({ fieldName: field.fieldName, fieldValue: imageUrls });
      } else {
        miscData.push({ fieldName: field.fieldName, fieldValue: [] });
      }
    }
  }

  const quiz = await Quiz.findByIdAndUpdate(quizId, {
    title,
    description,
    startTime: startTimeUTC,
    endTime: endTimeUTC,
    duration,
    rules,
    category,
    misc: miscData,
  });

  if (!quiz) {
    throw new ExpressError("Quiz not found", 400);
  }
  res.json("Quiz updated");
};

module.exports.deleteQuiz = async (req, res) => {
  const quizId = req.params.quizid;
  const quiz = await Quiz.findById(quizId);
  if (!quiz) {
    throw new ExpressError("quiz not found", 400);
  }
  const questionIds = quiz.questions;
  const deletedQuiz = await Quiz.findByIdAndDelete(quizId);
  if (!deletedQuiz) {
    throw new ExpressError("quiz not found", 400);
  }
  if (questionIds.length === 0) {
    return res.json("Quiz deleted");
  }
  await Question.deleteMany({ _id: { $in: questionIds } });
  res.json("Quiz and associated questions deleted");
};

module.exports.getQuizzes = async (req, res) => {
  const adminId = req.params.adminid;
  const quizzes = await Quiz.find({ adminId: adminId });
  if (!quizzes) {
    throw new ExpressError("no quizzes found", 400);
  }
  res.json(quizzes);
};

module.exports.getQuiz = async (req, res) => {
  const quizId = req.params.quizid;
  const quiz = await Quiz.findById(quizId);
  if (!quiz) {
    throw new ExpressError("quiz not found", 400);
  }
  res.json(quiz);
};

module.exports.getQuestions = async (req, res) => {
  const quizId = req.params.quizid;
  const questions = await Question.find({ quizId: quizId });
  if (!questions) {
    throw new ExpressError("no questions found", 400);
  }
  res.json(questions);
};

module.exports.getQuestionByQuestionId = async (req, res) => {
  const questionId = req.params.questionId;
  const question = await Question.findById(questionId);
  if (!question) {
    throw new ExpressError("question not found", 400);
  }
  res.json(question);
};

module.exports.createQuestion = async (req, res) => {
  const { type, text, options, correctOption } = req.body;
  const quizId = req.params.quizid;

  if (!text || !type || !correctOption) {
    throw new ExpressError("missing fields", 400);
  }

  const newQuestion = new Question({
    type,
    text,
    options,
    correctOption: Array.isArray(correctOption)
      ? correctOption
      : [correctOption],
    quizId,
  });
  const savedQuestion = await newQuestion.save();

  if (!savedQuestion) {
    throw new ExpressError("Error saving question", 500);
  }

  // Find the quiz by ID and update its questions array
  const quiz = await Quiz.findByIdAndUpdate(
    quizId,
    { $push: { questions: savedQuestion._id } },
    { new: true }
  );

  if (!quiz) {
    throw new ExpressError("Error finding quiz", 500);
  }

  res.json({ message: "question created", questionId: savedQuestion._id });
};

module.exports.updateQuestion = async (req, res) => {
  const { text, options, correctOption } = req.body;
  const questionId = req.params.questionid;

  if (!text || !options || !correctOption) {
    throw new ExpressError("missing fields", 400);
  }

  const question = await Question.findByIdAndUpdate(questionId, {
    text,
    options,
    correctOption,
  });
  if (!question) {
    throw new ExpressError("question not found", 400);
  }
  res.json("question updated");
};

module.exports.deleteQuestion = async (req, res) => {
  const questionId = req.params.questionid;

  const question = await Question.findById(questionId);
  if (!question) {
    throw new ExpressError("question not found", 400);
  }

  const quizId = question.quizId;

  // Delete the question
  const deletedQuestion = await Question.findByIdAndDelete(questionId);
  if (!deletedQuestion) {
    throw new ExpressError("question not found", 400);
  }

  // Remove the question ID from the Quiz array of questions
  await Quiz.findByIdAndUpdate(
    quizId,
    { $pull: { questions: questionId } },
    { new: true }
  );

  res.json("Question deleted and removed from Quiz");
};

const calculateScore = (submission, quiz) => {
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

const addRating = async (leaderboard, quizId) => {
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

      const userProfile = await profile.findOne({
        userId: ranksDescending[i].userId,
      });

      const existingQuizRating = userProfile.quizRatings.find((ratingEntry) =>
        ratingEntry.quizId.equals(quizId)
      );

      if (existingQuizRating) {
        await profile.updateOne(
          { userId: ranksDescending[i].userId, "quizRatings.quizId": quizId },
          { $set: { "quizRatings.$.rating": rating } }
        );
      } else {
        await profile.updateOne(
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

module.exports.compileResults = async (req, res) => {
  try {
    const quizId = req.params.quizid;

    if (!mongoose.Types.ObjectId.isValid(quizId)) {
      return res.status(400).json({ message: "Invalid quiz ID format." });
    }

    const submissions = await Submission.find({ quizId: quizId }).populate(
      "userId"
    );
    if (!submissions || submissions.length === 0) {
      return res.status(404).json({ message: "No submissions found." });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found." });
    }

    let leaderboard = await Leaderboard.findOne({ quizId: quizId }).populate(
      "ranks.userId"
    );
    if (!leaderboard) {
      leaderboard = new Leaderboard({ quizId });
    }

    for (const submission of submissions) {
      if (submission.userId) {
        submission.score = calculateScore(submission, quiz);
        submission.correctAnswers = submission.answers.filter(
          (answer) => answer.correct
        ).length;

        leaderboard.addUser(
          submission.userId._id,
          submission.score * 10,
          submission.userId.username,
          submission.userId.country
        );

        await submission.save();
      } else {
        console.warn(`Submission missing userId: ${submission._id}`);
      }
    }

    await addRating(leaderboard, quizId);

    if (leaderboard.isModified()) {
      await leaderboard.save();
    }

    res.status(200).json("Results compiled successfully");
  } catch (err) {
    console.error("Error compiling results:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

module.exports.referralDetails = async (req, res) => {
  const referrers = await profile
    .find({ totalUsersReferred: { $gt: 0 } })
    .populate("userId");
  //   console.log(referrers);
  const arrayToSend = [];
  for (let i = 0; i < referrers.length; i++) {
    let objToPush = {};
    objToPush.username = referrers[i].userId.username;
    objToPush.totalUsersReffered = referrers[i].totalUsersReferred;
    arrayToSend.push(objToPush);
  }
  res.status(200).json({ referralDetails: arrayToSend });
};

// Verification Badge Controller
module.exports.giveVerifyBadge = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await userModel.findById(userId).populate("createdCommunity");
    if (!user) return res.status(404).send("User not found");

    const newVerificationState = !user.verificationBadge;
    const updates = {
      verificationBadge: newVerificationState,
      communityBadge: newVerificationState ? false : user.communityBadge,
    };

    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { $set: updates },
      {
        new: true,
        select: "_id verificationBadge communityBadge createdCommunity",
      }
    );

    // Update community account type if exists
    if (user.createdCommunity) {
      await Community.findByIdAndUpdate(user.createdCommunity._id, {
        $set: { accountType: "Individual" }, // Verification badge always = Individual
      });
    }

    res.status(200).json({
      verificationBadge: updatedUser.verificationBadge,
      communityBadge: updatedUser.communityBadge,
      accountType: "Individual",
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

// Community Badge Controller
module.exports.giveCommunityBadge = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await userModel.findById(userId).populate("createdCommunity");
    if (!user) return res.status(404).send("User not found");

    const newCommunityState = !user.communityBadge;
    const updates = {
      communityBadge: newCommunityState,
      verificationBadge: newCommunityState ? false : user.verificationBadge,
    };

    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { $set: updates },
      {
        new: true,
        select: "_id communityBadge verificationBadge createdCommunity",
      }
    );

    // Update community account type if exists
    if (user.createdCommunity) {
      await Community.findByIdAndUpdate(user.createdCommunity._id, {
        $set: {
          accountType: newCommunityState ? "Organization" : "Individual",
        },
      });
    }

    res.status(200).json({
      communityBadge: updatedUser.communityBadge,
      verificationBadge: updatedUser.verificationBadge,
      accountType: newCommunityState ? "Organization" : "Individual",
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

module.exports.givePremiumBadge = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).send("User not found");
    }

    const currentValue = user.premiumBadge;
    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { $set: { premiumBadge: !currentValue } },
      { new: true, select: "premiumBadge _id" }
    );

    if (updatedUser) {
      res.status(200).json(updatedUser);
    } else {
      res.status(500).send("Failed to update user verification status");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

module.exports.getRegisteredUsersByAdmin = async (req, res) => {
  try {
    const users = await userModel
      .find()
      .sort({ createdAt: -1 })
      .select(
        "_id username name email verificationBadge premiumBadge communityBadge picture profile createdCommunity createdAt country "
      )
      .populate({
        path: "profile",
      })
      .populate({
        path: "createdCommunity",
        select: "communityBadge accountType", // Get community badge and account type
      })
      .lean();

    const data = users.map((user) => ({
      _id: user._id,
      username: user.username,
      name: user.name,
      email: user.email,
      verificationBadge: user.verificationBadge,
      premiumBadge: user.premiumBadge,
      communityBadge: user.communityBadge,
      picture: user.picture,
      occupation: user.profile?.occupation,
      phoneNumber: user.profile?.phoneNumber,
      rating: user.profile?.rating,
      username: user.username,
      coins: user.profile?.coin,
      createdCommunity: user.createdCommunity || null,
      createdAt: user.createdAt,
      country: user.country,
    }));

    return res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports.viewRequests = async (req, res) => {
  try {
    const Requests = await Request.find();
    return res.status(200).json(Requests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports.toggleCommunityCreatorAccount = async (req, res) => {
  try {
    const userId = req.body.userId;
    const currentValue = await userModel
      .find(userId)
      .select("isCommunityCreator");
    const requestedUser = await userModel.findByIdAndUpdate(userId, {
      $set: { isCommunityCreator: !currentValue },
    });
    const io = getIo();
    const notif = new Notification({
      title: "Community Status Update",
      message: `${requestedUser.name}'s request for community status has been approved.`,
      type: "system",
    });
    io.to(userId.toString()).emit("newNotification", notif);
    return res.status(200).json(requestedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports.deleteUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await deleteUserDeep(userId);

    if (result.success) {
      return res.status(200).json({ message: result.message });
    } else {
      return res.status(500).json({ message: result.message });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports.getAllCommunities = async (req, res) => {
  try {
    const communities = await Community.find().populate(
      "owner",
      "name username email"
    ); // populate owner details

    if (!communities || communities.length === 0) {
      return res.status(404).json({ message: "No communities found" });
    }

    return res.status(200).json(communities);
  } catch (error) {
    console.error("Error fetching communities:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Fetch all posts (with optional search and pagination)
module.exports.adminGetAllPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search || "";

    const query = {};
    if (search) {
      query.$or = [
        { content: { $regex: search, $options: "i" } },
        { title: { $regex: search, $options: "i" } },
      ];
    }

    const posts = await Post.find(query)
      .populate("author", "name username email")
      .populate("community", "name")
      .populate("attachments")
      .sort({ createdAt: -1, _id: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    const total = await Post.countDocuments(query);

    res.status(200).json({ posts, total, page, limit });
  } catch (error) {
    res.status(500).json({ message: "Error fetching posts: " + error.message });
  }
};

// Fetch posts by community (with pagination)
module.exports.adminGetPostsByCommunity = async (req, res) => {
  try {
    const communityId = req.params.communityId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ community: communityId })
      .populate("author", "name username email")
      .populate("community", "name")
      .populate("attachments")
      .sort({ createdAt: -1, _id: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    const total = await Post.countDocuments({ community: communityId });

    res.status(200).json({ posts, total, page, limit });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching community posts: " + error.message });
  }
};

// Hard delete any post (admin override)
module.exports.adminDeletePost = async (req, res) => {
  try {
    const postId = req.params.postId;
    const post = await Post.findById(postId).populate("attachments");

    if (!post) {
      throw new ExpressError("Post not found", 404);
    }

    // Delete all attachments from Bunny or local
    if (post.attachments && post.attachments.length > 0) {
      for (const attachment of post.attachments) {
        if (attachment.fileUrl && attachment.fileUrl.startsWith("http")) {
          await removeFromBunny(attachment.fileUrl);
        } else if (attachment.fileUrl && fs.existsSync(attachment.fileUrl)) {
          fs.unlinkSync(attachment.fileUrl);
        }
        await Attachment.findByIdAndDelete(attachment._id);
      }
    }

    await Post.findByIdAndDelete(postId);
    res.status(200).json({ message: "Post deleted successfully by admin!" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting post: " + error.message });
  }
};

// Temporarily take down a post (soft delete, admin action)
module.exports.adminTakedownPost = async (req, res) => {
  try {
    const postId = req.params.postId;
    const { reason } = req.body;
    const adminId = req.adminId;
    const admin = await Admin.findById(adminId);
    console.log("Admin taking down post:", admin);
    console.log("admin id:", adminId);

    const post = await Post.findById(postId).populate("author");

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    post.isDeleted = true;
    post.deletedAt = new Date();
    post.takedownReason = reason || "No reason provided";
    post.underReview = "none";

    await post.save();

    // Send notification to post author
    await NotificationService.createAndSendNotification({
      title: "Your post has been taken down",
      message: `Your post "${
        post.title || post.content?.slice(0, 40) || "Untitled"
      }" was temporarily removed by an admin.${
        reason ? "\nReason: " + reason : ""
      }`,
      recipients: [post.author._id],
      senderId: adminId,
      senderModel: "Admin",
      type: "system",
      priority: "high",
      communityId: post.community,
      meta: { postId: post._id },
    });

    res
      .status(200)
      .json({ message: "Post temporarily taken down for review.", post });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error taking down post: " + error.message });
  }
};

// Restore a previously taken down post (admin action)
module.exports.adminRestorePost = async (req, res) => {
  try {
    const postId = req.params.postId;
    const adminId = req.adminId; // or req.userId if you use that for admins

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (!post.isDeleted) {
      return res.status(400).json({ message: "Post is not taken down." });
    }

    post.isDeleted = false;
    post.deletedAt = null;
    post.takedownReason = "";
    post.underReview = "approved";
    await post.save();

    // Optionally notify the author that their post is restored
    await NotificationService.createAndSendNotification({
      title: "Your post has been restored",
      message: `Your post "${
        post.title || post.content?.slice(0, 40) || "Untitled"
      }" has been reinstated by an admin.`,
      recipients: [post.author],
      senderId: adminId,
      senderModel: "Admin",
      type: "system",
      priority: "normal",
      communityId: post.community,
      meta: { postId: post._id },
    });

    res.status(200).json({ message: "Post restored successfully.", post });
  } catch (error) {
    res.status(500).json({ message: "Error restoring post: " + error.message });
  }
};

// User requests review of a taken down post
module.exports.requestPostReview = async (req, res) => {
  try {
    const postId = req.params.postId;
    const userId = req.userId; // Authenticated user

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Only author can request review
    if (!post.author.equals(userId)) {
      return res.status(403).json({
        message: "You are not authorized to request a review for this post.",
      });
    }

    if (!post.isDeleted) {
      return res.status(400).json({ message: "Post is not taken down." });
    }

    post.underReview = "pending";
    await post.save();

    res.status(200).json({
      message: "Review request submitted. Our team will review your post.",
      post,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error requesting review: " + error.message });
  }
};

// Admin rejects a post appeal
module.exports.adminRejectPostAppeal = async (req, res) => {
  try {
    const postId = req.params.postId;
    const adminId = req.adminId;
    const { rejectionReason } = req.body;

    const post = await Post.findById(postId).populate("author");

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.underReview !== "pending") {
      return res
        .status(400)
        .json({ message: "No pending appeal for this post." });
    }

    post.underReview = "rejected";
    await post.save();

    // Notify the author
    await NotificationService.createAndSendNotification({
      title: "Your post appeal was rejected",
      message: `Your appeal for the post "${
        post.title || post.content?.slice(0, 40) || "Untitled"
      }" was rejected by an admin.${
        rejectionReason ? "\nReason: " + rejectionReason : ""
      }`,
      recipients: [post.author._id],
      senderId: adminId,
      senderModel: "Admin",
      type: "system",
      priority: "high",
      communityId: post.community,
      meta: { postId: post._id },
    });

    res.status(200).json({ message: "Post appeal rejected.", post });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error rejecting appeal: " + error.message });
  }
};

module.exports.getRecentNotifications = async (req, res) => {
  try {
    // You can adjust filters as desired (system type, recipients > 1, etc.)
    const recent = await Notification.find({ type: "system" })
      .sort({ createdAt: -1 })
      .limit(10)
      .select("title recipients createdAt")
      .lean();

    // For each notification, count recipients
    const notifications = recent.map((n) => ({
      title: n.title,
      time: n.createdAt,
      recipients: n.recipients ? n.recipients.length : 0,
    }));

    res.status(200).json(notifications);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch recent notifications." });
  }
};

module.exports.getActiveUserCount = async (req, res) => {
  try {
    // "Active" is someone whose user document was updated in the last 24 hours
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
    const count = await userModel.countDocuments({
      updatedAt: { $gte: since },
    });
    res.json({ activeUsers: count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch active user count" });
  }
};
