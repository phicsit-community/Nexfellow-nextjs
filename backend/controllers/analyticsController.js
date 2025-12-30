const mongoose = require("mongoose");
const Community = require("../models/communityModel");
const Comment = require("../models/commentModel");
const Like = require("../models/likeModel");
const User = require("../models/userModel");
const Quiz = require("../models/communityQuiz");
const Post = require("../models/postModel");
const ShortenedUrl = require("../models/shortenedUrlModel");

function getDateRanges(filter, now = new Date()) {
  let filterStartDate = new Date(now);
  let comparisonStartDate = new Date(now);
  let previousPeriodStart = new Date(now);
  let dayFilterStartDate;

  switch (filter) {
    case "day":
      filterStartDate.setDate(now.getDate() - 1);
      comparisonStartDate.setDate(now.getDate() - 2);
      previousPeriodStart.setDate(now.getDate() - 2);
      break;
    case "week":
      filterStartDate.setDate(now.getDate() - 7);
      comparisonStartDate.setDate(now.getDate() - 14);
      previousPeriodStart.setDate(now.getDate() - 14);
      break;
    case "month":
      filterStartDate.setMonth(now.getMonth() - 1);
      comparisonStartDate.setMonth(now.getMonth() - 2);
      previousPeriodStart.setMonth(now.getMonth() - 2);
      break;
    case "quarter":
      filterStartDate.setMonth(now.getMonth() - 3);
      comparisonStartDate.setMonth(now.getMonth() - 6);
      previousPeriodStart.setMonth(now.getMonth() - 6);
      break;
    case "half":
      filterStartDate.setMonth(now.getMonth() - 6);
      comparisonStartDate.setMonth(now.getMonth() - 12);
      previousPeriodStart.setMonth(now.getMonth() - 12);
      break;
    case "year":
      filterStartDate.setFullYear(now.getFullYear() - 1);
      comparisonStartDate.setFullYear(now.getFullYear() - 2);
      previousPeriodStart.setFullYear(now.getFullYear() - 2);
      break;
    default: // 'all' or undefined
      filterStartDate = new Date(0);
      dayFilterStartDate = new Date(now);
      dayFilterStartDate.setDate(now.getDate() - 1);
      comparisonStartDate = new Date(now);
      comparisonStartDate.setDate(now.getDate() - 2);
      previousPeriodStart = new Date(now);
      previousPeriodStart.setDate(now.getDate() - 2);
  }
  return {
    filterStartDate,
    comparisonStartDate,
    previousPeriodStart,
    dayFilterStartDate,
  };
}

function calculateGrowth(current, previous) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

module.exports.getAnalytics = async (req, res) => {
  try {
    const { communityId } = req.params;
    const { filter } = req.query;
    const now = new Date();
    const { filterStartDate, comparisonStartDate, dayFilterStartDate } =
      getDateRanges(filter, now);

    const objectId = new mongoose.Types.ObjectId(communityId);
    const community = await Community.findById(objectId)
      .populate("owner")
      .populate("quiz")
      .lean();

    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    // Prepare IDs
    const memberIds = community.owner?.followers || [];
    const quizIds = (community.quiz || []).map((q) => q._id);
    const communityPosts = await Post.find(
      { community: objectId },
      { _id: 1 }
    ).lean();
    const communityPostIds = communityPosts.map((post) => post._id);

    // Date ranges for queries
    // For "all", periodStart is null (no date filter); for others, use filterStartDate.
    const periodStart = filter === "all" || !filter ? null : filterStartDate;
    const prevStart = filter === "all" || !filter ? null : comparisonStartDate;
    const prevEnd = filter === "all" || !filter ? null : filterStartDate;

    // 1. Views (still in-memory; for large data, move to a collection)
    const totalViews = community.pageViews ? community.pageViews.length : 0;
    const filteredViewsCount = community.pageViews
      ? periodStart
        ? community.pageViews.filter((view) => view.timestamp > periodStart)
            .length
        : totalViews
      : 0;
    const previousPeriodViewsCount = community.pageViews
      ? prevStart && prevEnd
        ? community.pageViews.filter(
            (view) => view.timestamp > prevStart && view.timestamp <= prevEnd
          ).length
        : 0
      : 0;
    const viewGrowth = calculateGrowth(
      filteredViewsCount,
      previousPeriodViewsCount
    );

    // 2. Shortened URLs & Clicks
    const shortenedUrls = await ShortenedUrl.find({
      communityId: objectId,
    }).lean();

    // Shortened URL click counts
    const shortenedUrlCurrentPeriodPipeline = [
      { $match: { communityId: objectId } },
      { $unwind: "$clickDetails" },
    ];
    if (periodStart) {
      shortenedUrlCurrentPeriodPipeline.push({
        $match: { "clickDetails.timestamp": { $gte: periodStart } },
      });
    }
    shortenedUrlCurrentPeriodPipeline.push({ $count: "total" });

    const shortenedUrlPrevPeriodPipeline = [
      { $match: { communityId: objectId } },
      { $unwind: "$clickDetails" },
    ];
    if (prevStart && prevEnd) {
      shortenedUrlPrevPeriodPipeline.push({
        $match: { "clickDetails.timestamp": { $gte: prevStart, $lt: prevEnd } },
      });
    }
    shortenedUrlPrevPeriodPipeline.push({ $count: "total" });

    const [currentShortenedClicks, totalShortenedClicks, prevShortenedClicks] =
      await Promise.all([
        ShortenedUrl.aggregate(shortenedUrlCurrentPeriodPipeline),
        ShortenedUrl.aggregate([
          { $match: { communityId: objectId } },
          { $group: { _id: null, total: { $sum: "$clicks" } } },
        ]),
        ShortenedUrl.aggregate(shortenedUrlPrevPeriodPipeline),
      ]);

    // Top 5 shortened URLs by filtered clicks
    const topShortenedUrls = shortenedUrls
      .map((url) => ({
        shortCode: url.shortCode,
        originalUrl: url.originalUrl,
        totalClicks: url.clicks,
        filteredClicks: periodStart
          ? url.clickDetails.filter((click) => click.timestamp > periodStart)
              .length
          : url.clicks,
      }))
      .sort((a, b) => b.filteredClicks - a.filteredClicks)
      .slice(0, 5);

    // 3. Parallel Aggregates (comments, likes, members, participants, linkClicks)
    // Helper: Only add createdAt filter if periodStart is set
    const dateFilter = periodStart ? { createdAt: { $gte: periodStart } } : {};
    const prevDateFilter =
      prevStart && prevEnd
        ? { createdAt: { $gte: prevStart, $lt: prevEnd } }
        : {};

    // Likes
    const likeQuery = {
      post: { $in: communityPostIds },
      ...dateFilter,
    };
    const prevLikeQuery = {
      post: { $in: communityPostIds },
      ...prevDateFilter,
    };

    // Comments
    const commentQuery = {
      post: { $in: communityPostIds },
      ...dateFilter,
    };
    const prevCommentQuery = {
      post: { $in: communityPostIds },
      ...prevDateFilter,
    };

    // Members
    const memberQuery = {
      _id: { $in: memberIds },
      ...dateFilter,
    };
    const prevMemberQuery = {
      _id: { $in: memberIds },
      ...prevDateFilter,
    };

    // Participants (Quiz)
    const quizCurrentPeriodPipeline = [{ $match: { _id: { $in: quizIds } } }];
    if (periodStart)
      quizCurrentPeriodPipeline[0].$match.createdAt = { $gte: periodStart };
    quizCurrentPeriodPipeline.push({
      $group: { _id: null, total: { $sum: "$totalRegistered" } },
    });

    const quizPrevPeriodPipeline = [{ $match: { _id: { $in: quizIds } } }];
    if (prevStart && prevEnd)
      quizPrevPeriodPipeline[0].$match.createdAt = {
        $gte: prevStart,
        $lt: prevEnd,
      };
    quizPrevPeriodPipeline.push({
      $group: { _id: null, total: { $sum: "$totalRegistered" } },
    });

    // Link Clicks (Posts)
    const linkClickMatch = {
      community: objectId,
      linkClicks: { $exists: true },
    };
    const linkClickPipeline = [
      { $match: linkClickMatch },
      { $unwind: "$linkClicks" },
    ];
    if (periodStart)
      linkClickPipeline.push({
        $match: { "linkClicks.timestamp": { $gte: periodStart } },
      });
    linkClickPipeline.push({ $count: "total" });

    const prevLinkClickPipeline = [
      { $match: linkClickMatch },
      { $unwind: "$linkClicks" },
    ];
    if (prevStart && prevEnd)
      prevLinkClickPipeline.push({
        $match: { "linkClicks.timestamp": { $gte: prevStart, $lt: prevEnd } },
      });
    prevLinkClickPipeline.push({ $count: "total" });

    // Total link clicks (all time)
    const totalLinkClickPipeline = [
      { $match: linkClickMatch },
      { $unwind: "$linkClicks" },
      { $count: "total" },
    ];

    const [
      totalComments,
      totalLikes,
      totalParticipants,
      newMembers,
      newComments,
      newLikes,
      newParticipants,
      prevMembers,
      prevComments,
      prevLikes,
      prevParticipants,
      newLinkClicks,
      totalLinkClicks,
      prevLinkClicks,
    ] = await Promise.all([
      Comment.countDocuments({ post: { $in: communityPostIds } }),
      Like.countDocuments({ post: { $in: communityPostIds } }),
      Quiz.aggregate([
        { $match: { _id: { $in: quizIds } } },
        { $group: { _id: null, total: { $sum: "$totalRegistered" } } },
      ]),
      User.countDocuments(memberQuery),
      Comment.countDocuments(commentQuery),
      Like.countDocuments(likeQuery),
      Quiz.aggregate(quizCurrentPeriodPipeline),
      User.countDocuments(prevMemberQuery),
      Comment.countDocuments(prevCommentQuery),
      Like.countDocuments(prevLikeQuery),
      Quiz.aggregate(quizPrevPeriodPipeline),
      Post.aggregate(linkClickPipeline),
      Post.aggregate(totalLinkClickPipeline),
      Post.aggregate(prevLinkClickPipeline),
    ]);

    // Growth Calculations
    const commentGrowth = calculateGrowth(newComments, prevComments);
    const likeGrowth = calculateGrowth(newLikes, prevLikes);
    const participantGrowth = calculateGrowth(
      newParticipants[0] ? newParticipants[0].total : 0,
      prevParticipants[0] ? prevParticipants[0].total : 0
    );
    const memberGrowth = calculateGrowth(newMembers, prevMembers);
    const linkClickGrowth = calculateGrowth(
      newLinkClicks && newLinkClicks[0] ? newLinkClicks[0].total : 0,
      prevLinkClicks && prevLinkClicks[0] ? prevLinkClicks[0].total : 0
    );
    const shortenedUrlClickGrowth = calculateGrowth(
      currentShortenedClicks && currentShortenedClicks[0]
        ? currentShortenedClicks[0].total
        : 0,
      prevShortenedClicks && prevShortenedClicks[0]
        ? prevShortenedClicks[0].total
        : 0
    );

    res.status(200).json({
      totalMembers: memberIds.length,
      totalComments,
      totalLikes,
      totalParticipants: totalParticipants[0] ? totalParticipants[0].total : 0,
      newMembers,
      newComments,
      newLikes,
      newParticipants: newParticipants[0] ? newParticipants[0].total : 0,

      // Growth rates as percentages
      commentGrowth: parseFloat(commentGrowth.toFixed(1)),
      likeGrowth: parseFloat(likeGrowth.toFixed(1)),
      participantGrowth: parseFloat(participantGrowth.toFixed(1)),
      memberGrowth: parseFloat(memberGrowth.toFixed(1)),
      viewGrowth: parseFloat(viewGrowth.toFixed(1)),
      linkClickGrowth: parseFloat(linkClickGrowth.toFixed(1)),
      shortenedUrlClickGrowth: parseFloat(shortenedUrlClickGrowth.toFixed(1)),

      totalViews,
      filteredViews: filteredViewsCount,

      // Link clicks data
      newLinkClicks:
        newLinkClicks && newLinkClicks[0] ? newLinkClicks[0].total : 0,
      totalLinkClicks:
        totalLinkClicks && totalLinkClicks[0] ? totalLinkClicks[0].total : 0,

      // Shortened URL clicks data
      newShortenedUrlClicks:
        currentShortenedClicks && currentShortenedClicks[0]
          ? currentShortenedClicks[0].total
          : 0,
      totalShortenedUrlClicks:
        totalShortenedClicks && totalShortenedClicks[0]
          ? totalShortenedClicks[0].total
          : 0,

      shortenedUrls: {
        total: shortenedUrls.length,
        filteredClicks:
          currentShortenedClicks && currentShortenedClicks[0]
            ? currentShortenedClicks[0].total
            : 0,
        topUrls: topShortenedUrls,
      },
    });
  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports.getReputation = async (req, res) => {
  try {
    const { communityId } = req.params;
    const now = new Date();
    const lastWeek = new Date(now);
    lastWeek.setDate(now.getDate() - 7); // Adjust period as needed

    const objectId = new mongoose.Types.ObjectId(communityId);
    const community = await Community.findById(objectId)
      .populate("quiz")
      .populate("owner");
    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    const communityPosts = await Post.find({ community: objectId }, { _id: 1 });
    const communityPostIds = communityPosts.map((post) => post._id);
    const quizIds = community.quiz.map((q) => q._id) || [];
    const memberIds = community.owner?.followers || [];

    const dayFilterStartDate = lastWeek;

    const [
      newViews,
      newMembers,
      newComments,
      newLikes,
      newParticipants,
      newLinkClicks,
      newShortenedUrlClicks,
    ] = await Promise.all([
      // Views
      community.pageViews.filter((view) => view.timestamp > dayFilterStartDate)
        .length,

      // Members
      User.countDocuments({
        _id: { $in: memberIds },
        createdAt: { $gte: dayFilterStartDate },
      }),

      // Comments
      Comment.countDocuments({
        post: { $in: communityPostIds },
        createdAt: { $gte: dayFilterStartDate },
      }),

      // Likes
      Like.countDocuments({
        post: { $in: communityPostIds },
        communityId: communityId,
        createdAt: { $gte: dayFilterStartDate },
      }),

      // Quiz Participants
      Quiz.aggregate([
        {
          $match: {
            _id: { $in: quizIds },
            createdAt: { $gte: dayFilterStartDate },
          },
        },
        {
          $group: { _id: null, total: { $sum: "$totalRegistered" } },
        },
      ]),

      // Link Clicks from posts
      Post.aggregate([
        { $match: { community: objectId, linkClicks: { $exists: true } } },
        { $unwind: "$linkClicks" },
        {
          $match: {
            "linkClicks.timestamp": { $gte: dayFilterStartDate },
          },
        },
        { $count: "total" },
      ]),

      // Link Clicks from shortened URLs
      ShortenedUrl.aggregate([
        {
          $match: {
            communityId: objectId,
            "clickDetails.timestamp": { $gte: dayFilterStartDate },
          },
        },
        { $unwind: "$clickDetails" },
        {
          $match: {
            "clickDetails.timestamp": { $gte: dayFilterStartDate },
          },
        },
        { $count: "total" },
      ]),
    ]);

    const participants = newParticipants[0]?.total || 0;
    const clicks = newLinkClicks[0]?.total || 0;
    const shortenedUrlClicks = newShortenedUrlClicks[0]?.total || 0;

    // Normalize values to 0-100 scale (you can adjust max expected ranges here)
    const normalize = (value, max) => Math.min((value / max) * 100, 100);

    const score =
      normalize(newViews, 1000) * 0.25 +
      normalize(newMembers, 100) * 0.2 +
      normalize(newComments, 200) * 0.15 +
      normalize(newLikes, 200) * 0.1 +
      normalize(participants, 100) * 0.15 +
      normalize(clicks, 300) * 0.1 +
      normalize(shortenedUrlClicks, 300) * 0.05;

    const reputationScore = parseFloat(score.toFixed(1));

    return res.status(200).json({
      communityId,
      reputationScore,
      breakdown: {
        newViews,
        newMembers,
        newComments,
        newLikes,
        newParticipants: participants,
        newLinkClicks: clicks,
        newShortenedUrlClicks: shortenedUrlClicks,
      },
    });
  } catch (error) {
    console.error("Reputation error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports.getLinkAnalytics = async (req, res) => {
  try {
    const { communityId } = req.params;
    const { timeframe = "all" } = req.query; // Filter type: day, week, month, quarter, half, year, all

    const objectId = new mongoose.Types.ObjectId(communityId);
    const community = await Community.findById(objectId);

    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    // Calculate timeframe date range
    const now = new Date();
    let startDate = new Date(0); // Default to beginning of time for 'all'

    switch (timeframe) {
      case "day":
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 1);
        break;
      case "week":
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case "month":
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "quarter":
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 3);
        break;
      case "half":
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 6);
        break;
      case "year":
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    // Find all shortened URLs for this community
    const shortenedUrls = await ShortenedUrl.find({ communityId: objectId })
      .sort({ clicks: -1 })
      .populate("creator", "name username picture")
      .populate("postId", "title");

    // Get click distribution by time (daily for last week, monthly for longer periods)
    const getTimeBasedClickDistribution = async () => {
      const isPeriodShort = ["day", "week"].includes(timeframe);
      const groupByField = isPeriodShort
        ? {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$clickDetails.timestamp",
            },
          }
        : {
            $dateToString: { format: "%Y-%m", date: "$clickDetails.timestamp" },
          };

      const clickDistribution = await ShortenedUrl.aggregate([
        { $match: { communityId: objectId } },
        { $unwind: "$clickDetails" },
        {
          $match: {
            "clickDetails.timestamp": { $gte: startDate },
          },
        },
        {
          $group: {
            _id: groupByField,
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      return clickDistribution;
    };

    // Get click distribution by country
    const getCountryClickDistribution = async () => {
      const clicksByCountry = await ShortenedUrl.aggregate([
        { $match: { communityId: objectId } },
        { $unwind: "$clickDetails" },
        {
          $match: {
            "clickDetails.timestamp": { $gte: startDate },
            "clickDetails.country": { $exists: true, $ne: null },
          },
        },
        {
          $group: {
            _id: "$clickDetails.country",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]);

      return clicksByCountry;
    };

    // Get click distribution by device/browser
    const getDeviceClickDistribution = async () => {
      const clicksByDevice = await ShortenedUrl.aggregate([
        { $match: { communityId: objectId } },
        { $unwind: "$clickDetails" },
        {
          $match: {
            "clickDetails.timestamp": { $gte: startDate },
            "clickDetails.userAgent": { $exists: true, $ne: null },
          },
        },
        {
          $addFields: {
            browser: {
              $cond: [
                {
                  $regexMatch: {
                    input: "$clickDetails.userAgent",
                    regex: /Chrome/,
                  },
                },
                "Chrome",
                {
                  $cond: [
                    {
                      $regexMatch: {
                        input: "$clickDetails.userAgent",
                        regex: /Firefox/,
                      },
                    },
                    "Firefox",
                    {
                      $cond: [
                        {
                          $and: [
                            {
                              $regexMatch: {
                                input: "$clickDetails.userAgent",
                                regex: /Safari/,
                              },
                            },
                            {
                              $not: {
                                $regexMatch: {
                                  input: "$clickDetails.userAgent",
                                  regex: /Chrome/,
                                },
                              },
                            },
                          ],
                        },
                        "Safari",
                        {
                          $cond: [
                            {
                              $regexMatch: {
                                input: "$clickDetails.userAgent",
                                regex: /Edge/,
                              },
                            },
                            "Edge",
                            {
                              $cond: [
                                {
                                  $regexMatch: {
                                    input: "$clickDetails.userAgent",
                                    regex: /Opera|OPR/,
                                  },
                                },
                                "Opera",
                                "Other",
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            isMobile: {
              $cond: [
                {
                  $regexMatch: {
                    input: "$clickDetails.userAgent",
                    regex:
                      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i,
                  },
                },
                true,
                false,
              ],
            },
          },
        },
        {
          $group: {
            _id: "$browser",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]);

      const deviceTypeDistribution = await ShortenedUrl.aggregate([
        { $match: { communityId: objectId } },
        { $unwind: "$clickDetails" },
        {
          $match: {
            "clickDetails.timestamp": { $gte: startDate },
            "clickDetails.userAgent": { $exists: true, $ne: null },
          },
        },
        {
          $addFields: {
            isMobile: {
              $cond: [
                {
                  $regexMatch: {
                    input: "$clickDetails.userAgent",
                    regex:
                      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i,
                  },
                },
                "Mobile",
                "Desktop",
              ],
            },
          },
        },
        {
          $group: {
            _id: "$isMobile",
            count: { $sum: 1 },
          },
        },
      ]);

      return { browserDistribution: clicksByDevice, deviceTypeDistribution };
    };

    // Get referrer distribution
    const getReferrerDistribution = async () => {
      const clicksByReferrer = await ShortenedUrl.aggregate([
        { $match: { communityId: objectId } },
        { $unwind: "$clickDetails" },
        {
          $match: {
            "clickDetails.timestamp": { $gte: startDate },
            "clickDetails.referrer": { $exists: true, $ne: null },
          },
        },
        {
          $addFields: {
            domain: {
              $cond: [
                { $eq: ["$clickDetails.referrer", "Direct"] },
                "Direct",
                {
                  $let: {
                    vars: {
                      urlParts: { $split: ["$clickDetails.referrer", "/"] },
                    },
                    in: {
                      $cond: [
                        {
                          $gte: [{ $size: { $ifNull: ["$$urlParts", []] } }, 3],
                        },
                        { $arrayElemAt: ["$$urlParts", 2] },
                        "Unknown",
                      ],
                    },
                  },
                },
              ],
            },
          },
        },
        {
          $group: {
            _id: "$domain",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]);

      return clicksByReferrer;
    };

    // Get top performing links
    const getTopLinks = async () => {
      return shortenedUrls
        .filter((url) => {
          if (timeframe === "all") return true;

          // Filter by timeframe if needed
          const hasClicksInTimeframe = url.clickDetails.some(
            (click) => click.timestamp >= startDate
          );

          return hasClicksInTimeframe;
        })
        .slice(0, 10)
        .map((url) => ({
          id: url._id,
          originalUrl: url.originalUrl,
          shortUrl: `${req.protocol}://${req.get("host")}/link/${
            url.shortCode
          }`,
          shortCode: url.shortCode,
          clicks: url.clicks,
          clicksInTimeframe: url.clickDetails.filter(
            (click) => click.timestamp >= startDate
          ).length,
          createdAt: url.createdAt,
          creator: url.creator,
          post: url.postId,
        }));
    };

    // Execute all queries in parallel
    const [
      timeDistribution,
      countryDistribution,
      deviceData,
      referrerDistribution,
      topLinks,
    ] = await Promise.all([
      getTimeBasedClickDistribution(),
      getCountryClickDistribution(),
      getDeviceClickDistribution(),
      getReferrerDistribution(),
      getTopLinks(),
    ]);

    // Calculate total clicks and links
    const totalLinks = shortenedUrls.length;
    const totalClicks = shortenedUrls.reduce((sum, url) => sum + url.clicks, 0);
    const clicksInTimeframe = shortenedUrls.reduce(
      (sum, url) =>
        sum +
        url.clickDetails.filter((click) => click.timestamp >= startDate).length,
      0
    );

    // Calculate average clicks per link
    const avgClicksPerLink =
      totalLinks > 0 ? parseFloat((totalClicks / totalLinks).toFixed(2)) : 0;

    // Get unique countries count
    const uniqueCountries = new Set(
      shortenedUrls.flatMap((url) =>
        url.clickDetails
          .filter((click) => click.timestamp >= startDate && click.country)
          .map((click) => click.country)
      )
    ).size;

    res.status(200).json({
      summary: {
        totalLinks,
        totalClicks,
        clicksInTimeframe,
        avgClicksPerLink,
        uniqueCountries,
      },
      distributions: {
        byTime: timeDistribution,
        byCountry: countryDistribution,
        byDevice: deviceData,
        byReferrer: referrerDistribution,
      },
      topLinks,
    });
  } catch (error) {
    console.error("Link analytics error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
