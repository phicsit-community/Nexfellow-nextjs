const mongoose = require("mongoose");

const CommunityLeaderboardSchema = new mongoose.Schema({
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CommunityQuiz",
    required: true,
  },
  ranks: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      score: Number,
      username: String,
      country: String,
    },
  ],
});

CommunityLeaderboardSchema.methods.addUser = function (
  userId,
  score,
  username,
  country
) {
  const existingRank = this.ranks.find((rank) => rank.userId.equals(userId));

  if (existingRank) {
    existingRank.score = Math.max(existingRank.score, score);
  } else {
    this.ranks.push({ userId, score, username, country });
  }

  this.ranks.sort((a, b) => b.score - a.score);
};

const CommunityLeaderboard = mongoose.model(
  "CommunityLeaderboard",
  CommunityLeaderboardSchema
);
module.exports = CommunityLeaderboard;
