// utils/userDeleteUtil.js

const mongoose = require("mongoose");
const userModel = require("../models/userModel");
const postModel = require("../models/postModel");
const commentModel = require("../models/commentModel");
const submissionModel = require("../models/submissions");
const reportModel = require("../models/reportModel");
const rewardModel = require("../models/rewardModel");
const quizModel = require("../models/quizzes");
const profileModel = require("../models/profileModel");
const communityModel = require("../models/communityModel");
const userDeviceTokenModel = require("../models/UserDeviceToken");
const attachmentModel = require("../models/attachmentModel");
const bookmarkModel = require("../models/bookmarkModel");
const challengeModel = require("../models/challengeModel");
const challengeActivityModel = require("../models/challengeActivityModel");
const challengeRewardModel = require("../models/challengeRewardModel");
const challengeSubmissionModel = require("../models/challengeSubmissionModel");
const communityQuizModel = require("../models/communityQuiz");
const communitySubmissionModel = require("../models/CommunitySubmission");
const communityLeaderboardModel = require("../models/communityLeaderboard");
const completedTasksModel = require("../models/completedTasksModel");
const conversationModel = require("../models/conversationModel");
const directMessageModel = require("../models/directMessageModel");
const eventModel = require("../models/eventModel");
const featuredCommunitiesModel = require("../models/featuredCommunities");
const forumModel = require("../models/forumModel");
const leaderboardModel = require("../models/leaderboard");
const likeModel = require("../models/likeModel");
const messageModel = require("../models/messageModel");
const notificationModel = require("../models/Notification");
const questionModel = require("../models/questions");
const requestModel = require("../models/Request");
const shortenedUrlModel = require("../models/shortenedUrlModel");
const taskModel = require("../models/taskModel");

const deleteUserDeep = async (userId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // ✅ Convert to ObjectId once
    const objectId = new mongoose.Types.ObjectId(userId);

    // 1. Delete all user's posts, comments, attachments, likes, messages
    await postModel.deleteMany({ author: objectId }).session(session);
    await commentModel.deleteMany({ author: objectId }).session(session);
    await attachmentModel.deleteMany({ user: objectId }).session(session);
    await likeModel.deleteMany({ user: objectId }).session(session);
    await messageModel.deleteMany({ author: objectId }).session(session);

    // 2. Delete submissions, completed tasks, challenge/community submissions
    await submissionModel.deleteMany({ userId: objectId }).session(session);
    await completedTasksModel.deleteMany({ userId: objectId }).session(session);
    await challengeSubmissionModel.deleteMany({ user: objectId }).session(session);
    await communitySubmissionModel.deleteMany({ userId: objectId }).session(session);

    // 3. Challenge activities & rewards
    await challengeActivityModel.deleteMany({ user: objectId }).session(session);
    await challengeRewardModel.deleteMany({ user: objectId }).session(session);

    // 4. Reports, rewards, device tokens, bookmarks, requests
    await reportModel
      .deleteMany({ $or: [{ reporterId: objectId }, { authorId: objectId }] })
      .session(session);
    await rewardModel.deleteMany({ userId: objectId }).session(session);
    await userDeviceTokenModel.deleteMany({ user: objectId }).session(session);
    await bookmarkModel.deleteMany({ user: objectId }).session(session);
    await requestModel.deleteMany({ userId: objectId }).session(session);

    // 5. Conversations & direct messages
    await conversationModel.deleteMany({ participants: objectId }).session(session);
    await directMessageModel.deleteMany({ sender: objectId }).session(session);

    // 6. Events
    await eventModel.updateMany(
      { "participants.user": objectId },
      { $pull: { participants: { user: objectId } } },
      { session }
    );
    await eventModel.deleteMany({ createdBy: objectId }).session(session);

    // 7. Remove user from arrays in other models
    await quizModel.updateMany(
      { registeredUsers: objectId },
      { $pull: { registeredUsers: objectId } },
      { session }
    );
    await quizModel.updateMany(
      { User_profile_Image: objectId },
      { $pull: { User_profile_Image: objectId } },
      { session }
    );
    await communityQuizModel.updateMany(
      { participants: objectId },
      { $pull: { participants: objectId } },
      { session }
    );
    await communityModel.updateMany(
      { members: objectId },
      { $pull: { members: objectId } },
      { session }
    );
    await communityModel.updateMany(
      { followers: objectId },
      { $pull: { followers: objectId } },
      { session }
    );
    await communityModel.updateMany(
      { moderators: objectId },
      { $pull: { moderators: objectId } },
      { session }
    );
    await communityModel.updateMany(
      { topMembers: objectId },
      { $pull: { topMembers: objectId } },
      { session }
    );
    await communityModel.updateMany(
      { appraisals: objectId },
      { $pull: { appraisals: objectId } },
      { session }
    );
    await communityModel.updateMany(
      { owner: objectId },
      { $set: { isDeleted: true, deletedAt: new Date() } },
      { session }
    );

    await challengeModel.updateMany(
      {},
      { $pull: { participants: { user: objectId } } },
      { session }
    );
    await forumModel.updateMany(
      { discussions: objectId },
      { $pull: { discussions: objectId } },
      { session }
    );
    await leaderboardModel.updateMany(
      { "ranks.userId": objectId },
      { $pull: { ranks: { userId: objectId } } },
      { session }
    );
    await communityLeaderboardModel.updateMany(
      { "ranks.userId": objectId },
      { $pull: { ranks: { userId: objectId } } },
      { session }
    );
    await notificationModel.updateMany(
      { "recipients.user": objectId },
      { $pull: { recipients: { user: objectId } } },
      { session }
    );
    await notificationModel.deleteMany({ sender: objectId }).session(session);
    await featuredCommunitiesModel.updateMany(
      { communityIds: objectId },
      { $pull: { communityIds: objectId } },
      { session }
    );

    // Followers/following/muted/blocked lists
    await userModel.updateMany(
      { followers: objectId },
      { $pull: { followers: objectId } },
      { session }
    );
    await userModel.updateMany(
      { following: objectId },
      { $pull: { following: objectId } },
      { session }
    );
    await userModel.updateMany(
      { mutedUsers: objectId },
      { $pull: { mutedUsers: objectId } },
      { session }
    );
    await userModel.updateMany(
      { blockedUsers: objectId },
      { $pull: { blockedUsers: objectId } },
      { session }
    );
    await userModel.updateMany(
      { hiddenPosts: { $elemMatch: { $eq: objectId } } },
      { $pull: { hiddenPosts: objectId } },
      { session }
    );

    // Short URLs
    await shortenedUrlModel.updateMany(
      { creator: objectId },
      { $set: { creator: null } },
      { session }
    );

    // 8. Profile
    await profileModel.deleteOne({ userId: objectId }).session(session);

    // 9. User
    await userModel.deleteOne({ _id: objectId }).session(session);

    await session.commitTransaction();
    session.endSession();

    return {
      success: true,
      message: "User and all related data deleted successfully.",
    };
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error in deleteUserDeep:", err);
    return {
      success: false,
      message: "Error while deleting user and related data.",
      error: err.message,
    };
  }
};

module.exports = { deleteUserDeep };
