const User = require("../models/userModel");
const Post = require("../models/postModel");
const Comment = require("../models/commentModel");
const Bookmark = require("../models/bookmarkModel");
const Quiz = require("../models/communityQuiz");
const Event = require("../models/eventModel");
const Challenge = require("../models/challengeModel");
const Reward = require("../models/rewardModel");
const Like = require("../models/likeModel");
const Community = require("../models/communityModel");
const Notification = require("../models/Notification");

// -- Core helpers --
function getLastMonthsLabels(n) {
  const arr = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    // -- DASH between month/year so predictions work --
    arr.push(
      d.toLocaleString("default", { month: "short" }) +
        "-" +
        d.toLocaleString("default", { year: "2-digit" })
    );
  }
  return arr;
}
function getLastNDaysLabels(n) {
  const arr = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    arr.push(d.toISOString().slice(0, 10));
  }
  return arr;
}
function calcDelta(current, prev) {
  if (prev === 0) return current === 0 ? 0 : 100;
  return ((current - prev) / Math.abs(prev)) * 100;
}
function predictNextValue(yArr) {
  const n = yArr.length;
  if (n < 2) return yArr[n - 1] || 0;
  const xArr = Array.from({ length: n }, (_, i) => i + 1);
  const sumX = xArr.reduce((a, b) => a + b, 0);
  const sumY = yArr.reduce((a, b) => a + b, 0);
  const sumXY = xArr.reduce((s, x, i) => s + x * yArr[i], 0);
  const sumXX = xArr.reduce((s, x) => s + x * x, 0);
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX || 1);
  const intercept = (sumY - slope * sumX) / n;
  return Math.round(slope * (n + 1) + intercept);
}
function getNextMonthLabel(lastLabel) {
  if (!lastLabel || typeof lastLabel !== "string" || !lastLabel.includes("-"))
    return "";
  const [monthStr, yearStr] = lastLabel.split("-");
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  let idx = months.indexOf(monthStr);
  let year = parseInt(yearStr, 10);
  if (idx === -1 || isNaN(year)) return "";
  idx += 1;
  if (idx >= 12) {
    idx = 0;
    year += 1;
  }
  let paddedYear = yearStr.length === 2 ? String(year).slice(-2) : String(year);
  return `${months[idx]}-${paddedYear}`;
}
function safeValue(x) {
  return typeof x === "number" && isFinite(x) ? x : 0;
}

exports.getOverview = async (req, res) => {
  try {
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const startOf30DaysAgo = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - 30
    );
    const startOfPrev30Days = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - 60
    );

    // All-Time Totals
    const [
      totalUsers,
      totalPosts,
      totalComments,
      totalBookmarks,
      totalQuizzes,
      totalEvents,
      totalChallenges,
      totalRewards,
      totalLikes,
      totalCommunities,
      totalNotifications,
    ] = await Promise.all([
      User.countDocuments(),
      Post.countDocuments(),
      Comment.countDocuments(),
      Bookmark.countDocuments(),
      Quiz.countDocuments(),
      Event.countDocuments(),
      Challenge.countDocuments(),
      Reward.countDocuments(),
      Like.countDocuments(),
      Community.countDocuments(),
      Notification.countDocuments(),
    ]);

    // Deltas (current vs previous 30d)
    const [
      prevUsers,
      prevPosts,
      prevComments,
      prevBookmarks,
      prevQuizzes,
      prevEvents,
      prevChallenges,
      prevRewards,
      prevLikes,
      prevCommunities,
      prevNotifications,
    ] = await Promise.all([
      User.countDocuments({
        createdAt: { $gte: startOfPrev30Days, $lt: startOf30DaysAgo },
      }),
      Post.countDocuments({
        createdAt: { $gte: startOfPrev30Days, $lt: startOf30DaysAgo },
      }),
      Comment.countDocuments({
        createdAt: { $gte: startOfPrev30Days, $lt: startOf30DaysAgo },
      }),
      Bookmark.countDocuments({
        dateTime: { $gte: startOfPrev30Days, $lt: startOf30DaysAgo },
      }),
      Quiz.countDocuments({
        createdAt: { $gte: startOfPrev30Days, $lt: startOf30DaysAgo },
      }),
      Event.countDocuments({
        createdAt: { $gte: startOfPrev30Days, $lt: startOf30DaysAgo },
      }),
      Challenge.countDocuments({
        createdAt: { $gte: startOfPrev30Days, $lt: startOf30DaysAgo },
      }),
      Reward.countDocuments({
        createdAt: { $gte: startOfPrev30Days, $lt: startOf30DaysAgo },
      }),
      Like.countDocuments({
        createdAt: { $gte: startOfPrev30Days, $lt: startOf30DaysAgo },
      }),
      Community.countDocuments({
        createdAt: { $gte: startOfPrev30Days, $lt: startOf30DaysAgo },
      }),
      Notification.countDocuments({
        createdAt: { $gte: startOfPrev30Days, $lt: startOf30DaysAgo },
      }),
    ]);
    const activeUsers = await User.countDocuments({
      updatedAt: { $gte: startOf30DaysAgo },
    });
    const prevActiveUsers = await User.countDocuments({
      updatedAt: { $gte: startOfPrev30Days, $lt: startOf30DaysAgo },
    });
    const activeUsersDelta = calcDelta(activeUsers, prevActiveUsers);

    // Real-time stats
    const [
      newUsersToday,
      postsToday,
      commentsToday,
      activeCommunities,
      topQuiz,
    ] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: startOfToday } }),
      Post.countDocuments({ createdAt: { $gte: startOfToday } }),
      Comment.countDocuments({ createdAt: { $gte: startOfToday } }),
      Community.countDocuments({
        updatedAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) },
      }),
      Quiz.findOne().sort({ totalRegistered: -1 }).select("title"),
    ]);

    // Monthly user growth & predictions
    const months = getLastMonthsLabels(12);
    const usersByMonth = await User.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
    ]);
    const userGrowth = months.map((label) => {
      const [month, year] = label.split("-");
      // If label is "Jul-25" after the fix, will work below:
      const yearFull = "20" + year;
      const match = usersByMonth.find(
        (u) =>
          u._id ===
          `${yearFull}-${String(
            new Date(`${month} 1, ${yearFull}`).getMonth() + 1
          ).padStart(2, "0")}`
      );
      return { label, value: safeValue(match?.count) };
    });
    const userGrowthPredictionValue = predictNextValue(
      userGrowth.map((u) => u.value)
    );
    const userGrowthPrediction = {
      label: getNextMonthLabel(userGrowth.at(-1)?.label),
      value: userGrowthPredictionValue,
    };

    // Monthly post growth & predictions
    const postsByMonth = await Post.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
    ]);
    const postGrowth = months.map((label) => {
      const [month, year] = label.split("-");
      const yearFull = "20" + year;
      const match = postsByMonth.find(
        (p) =>
          p._id ===
          `${yearFull}-${String(
            new Date(`${month} 1, ${yearFull}`).getMonth() + 1
          ).padStart(2, "0")}`
      );
      return { label, value: safeValue(match?.count) };
    });
    const postGrowthPredictionValue = predictNextValue(
      postGrowth.map((u) => u.value)
    );
    const postGrowthPrediction = {
      label: getNextMonthLabel(postGrowth.at(-1)?.label),
      value: postGrowthPredictionValue,
    };

    // Daily active users (30d)
    const days = getLastNDaysLabels(30);
    const usersByDay = await User.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" } },
          count: { $sum: 1 },
        },
      },
    ]);
    const activeUsersChart = days.map((label) => {
      const match = usersByDay.find((u) => u._id === label);
      return { label, value: safeValue(match?.count) };
    });

    // Distributions: role, country
    const rolesAgg = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]);
    const roleDistribution = {};
    rolesAgg.forEach((r) => (roleDistribution[r._id] = r.count));
    const countryAgg = await User.aggregate([
      { $group: { _id: "$country", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 },
    ]);
    const countryDistribution = {};
    let otherCount = 0;
    (
      await User.aggregate([
        { $group: { _id: "$country", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $skip: 6 },
      ])
    ).forEach((c) => (otherCount += c.count));
    countryAgg.forEach(
      (c) => (countryDistribution[c._id || "Unknown"] = c.count)
    );
    if (otherCount > 0) countryDistribution["Other"] = otherCount;

    // (Community etc as needed)

    res.json({
      totalUsers,
      totalPosts,
      activeUsers,
      totalComments,
      totalBookmarks,
      totalQuizzes,
      totalEvents,
      totalChallenges,
      totalRewards,
      totalLikes,
      totalCommunities,
      totalNotifications,
      totalUsersDelta: calcDelta(totalUsers, prevUsers),
      postsDelta: calcDelta(totalPosts, prevPosts),
      activeUsersDelta,
      commentsDelta: calcDelta(totalComments, prevComments),
      bookmarksDelta: calcDelta(totalBookmarks, prevBookmarks),
      quizzesDelta: calcDelta(totalQuizzes, prevQuizzes),
      eventsDelta: calcDelta(totalEvents, prevEvents),
      challengesDelta: calcDelta(totalChallenges, prevChallenges),
      rewardsDelta: calcDelta(totalRewards, prevRewards),
      likesDelta: calcDelta(totalLikes, prevLikes),
      communitiesDelta: calcDelta(totalCommunities, prevCommunities),
      notificationsDelta: calcDelta(totalNotifications, prevNotifications),
      newUsersToday,
      postsToday,
      commentsToday,
      activeCommunities,
      topQuizTitle: topQuiz?.title || "",
      userGrowth,
      userGrowthPrediction,
      postGrowth,
      postGrowthPrediction,
      activeUsersChart,
      roleDistribution,
      countryDistribution,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to load analytics", error: err.message });
  }
};
