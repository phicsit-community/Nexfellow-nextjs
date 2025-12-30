const Profile = require("../models/profileModel");


module.exports.getLeaderboardResults = async (req, res) => {
  try {
    const profiles = await Profile.find()
      .sort({ rating: -1 })
      .populate("userId", "username country registeredQuizzes picture")
      .lean();

    if (!profiles.length) {
      return res.status(404).json({ message: "No leaderboard data found" });
    }
    console.log(profiles);

    const leaderboardData = profiles
      .filter((profile) => profile.userId != null)
      .map((profile, index) => ({
        rank: index + 1,
        username: profile.userId ? profile.userId.username : "Unknown",
        country: profile.userId ? profile.userId.country : "Unknown",
        totalQuiz: profile.userId?.registeredQuizzes?.length,
        rating: profile.rating,
        picture: profile.userId?.picture,
      }));

    res.json(leaderboardData);
  } catch (err) {
    console.error("Error fetching leaderboard data:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
