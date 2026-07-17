const mongoose = require("mongoose");
const Product = require("../models/productModel");
const ProductReview = require("../models/productReviewModel");
const Profile = require("../models/profileModel");
const ExpressError = require("../utils/ExpressError");
const { CATEGORIES } = require("../models/productModel");
const { REVIEW_TAGS } = require("../models/productReviewModel");

// Validates req.params.id is a well-formed ObjectId before any DB query.
// Prevents raw CastErrors from leaking through the error handler.
function assertValidId(id) {
  if (!mongoose.Types.ObjectId.isValid(id))
    throw new ExpressError("Invalid product ID", 400);
}

// Safe integer parse with explicit fallback — prevents NaN propagating into queries.
function parseIntSafe(val, fallback) {
  const n = parseInt(val, 10);
  return Number.isFinite(n) ? n : fallback;
}

// GET /launches
// Query params: tab (today|week|alltime), sort (top|new|trending), category, page, limit
const getLaunches = async (req, res) => {
  const { tab = "today", sort = "top", category, page, limit } = req.query;
  const pageNum = Math.max(1, parseIntSafe(page, 1));
  const limitNum = Math.min(50, Math.max(1, parseIntSafe(limit, 20)));

  const match = { status: { $in: ["in_review", "launched"] } };

  const now = new Date();
  if (tab === "today") {
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    match.launchedAt = { $gte: startOfDay };
  } else if (tab === "week") {
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    match.launchedAt = { $gte: weekAgo };
  }
  // "alltime" — no date filter

  // Validate category against the allowed enum before injecting into query.
  if (category) {
    if (!CATEGORIES.includes(category))
      throw new ExpressError("Invalid category", 400);
    match.category = category;
  }

  // Boosted products (active BOOST_PRODUCT spend) are pinned above the normal
  // ranking within whatever tab/sort is selected.
  let sortStage;
  if (sort === "new") {
    sortStage = { $sort: { isBoosted: -1, launchedAt: -1 } };
  } else if (sort === "trending") {
    sortStage = { $sort: { isBoosted: -1, trendingScore: -1, launchedAt: -1 } };
  } else {
    sortStage = { $sort: { isBoosted: -1, upvoteCount: -1, launchedAt: -1 } };
  }

  const addBoostedField = [
    { $addFields: { isBoosted: { $cond: [{ $gt: ["$boostedUntil", now] }, 1, 0] } } },
  ];

  const addTrendingField =
    sort === "trending"
      ? [
          {
            $addFields: {
              trendingScore: {
                $divide: [
                  "$upvoteCount",
                  {
                    $add: [
                      1,
                      {
                        $divide: [
                          { $subtract: [now, "$launchedAt"] },
                          3600000,
                        ],
                      },
                    ],
                  },
                ],
              },
            },
          },
        ]
      : [];

  const pipeline = [
    { $match: match },
    ...addBoostedField,
    ...addTrendingField,
    sortStage,
    { $skip: (pageNum - 1) * limitNum },
    { $limit: limitNum },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [{ $project: { name: 1, username: 1, picture: 1 } }],
      },
    },
    { $unwind: { path: "$owner", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "productreviews",
        localField: "_id",
        foreignField: "product",
        as: "reviews",
        pipeline: [{ $project: { rating: 1 } }],
      },
    },
    {
      $addFields: {
        totalReviews: { $size: "$reviews" },
        avgRating: {
          $cond: [
            { $eq: [{ $size: "$reviews" }, 0] },
            0,
            { $round: [{ $avg: "$reviews.rating" }, 1] },
          ],
        },
      },
    },
    // Never expose the upvotes array (voter IDs) or internal fields to clients.
    { $project: { reviews: 0, upvotes: 0, trendingScore: 0, isBoosted: 0 } },
  ];

  const [products, total] = await Promise.all([
    Product.aggregate(pipeline),
    Product.countDocuments(match),
  ]);

  // If the request is authenticated, mark which products the user has already upvoted.
  if (req.userId && products.length > 0) {
    const productIds = products.map(p => p._id);
    const votedDocs = await Product.find(
      { _id: { $in: productIds }, upvotes: req.userId },
      { _id: 1 }
    ).lean();
    const votedSet = new Set(votedDocs.map(d => d._id.toString()));
    products.forEach(p => { p.userHasVoted = votedSet.has(p._id.toString()); });
  }

  res.status(200).json({
    launches: products,
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum),
  });
};

// GET /launches/live
// Products launched in last 48h, sorted by upvoteCount, limit 5
const getLiveLaunches = async (_req, res) => {
  const cutoff = new Date();
  cutoff.setHours(cutoff.getHours() - 48);

  const now = new Date();
  const products = await Product.aggregate([
    { $match: { status: { $in: ["in_review", "launched"] }, launchedAt: { $gte: cutoff } } },
    { $addFields: { isBoosted: { $cond: [{ $gt: ["$boostedUntil", now] }, 1, 0] } } },
    { $sort: { isBoosted: -1, upvoteCount: -1, launchedAt: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "productreviews",
        localField: "_id",
        foreignField: "product",
        as: "reviews",
        pipeline: [{ $project: { rating: 1 } }],
      },
    },
    {
      $addFields: {
        totalReviews: { $size: "$reviews" },
        avgRating: {
          $cond: [
            { $eq: [{ $size: "$reviews" }, 0] },
            0,
            { $round: [{ $avg: "$reviews.rating" }, 1] },
          ],
        },
      },
    },
    { $project: { reviews: 0, upvotes: 0, isBoosted: 0 } },
  ]);

  res.status(200).json({ live: products });
};

// GET /launches/stats
// Aggregate stats for today
const getLaunchStats = async (_req, res) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [launchStats] = await Product.aggregate([
    { $match: { status: { $in: ["in_review", "launched"] }, launchedAt: { $gte: startOfDay } } },
    {
      $group: {
        _id: null,
        totalLaunches: { $sum: 1 },
        totalUpvotes: { $sum: "$upvoteCount" },
        productIds: { $push: "$_id" },
      },
    },
  ]);

  let totalFeedbacks = 0;
  if (launchStats?.productIds?.length) {
    totalFeedbacks = await ProductReview.countDocuments({
      product: { $in: launchStats.productIds },
      createdAt: { $gte: startOfDay },
    });
  }

  res.status(200).json({
    totalLaunches: launchStats?.totalLaunches ?? 0,
    totalUpvotes: launchStats?.totalUpvotes ?? 0,
    totalFeedbacks,
  });
};

// GET /launches/:id
// Full product detail — all owner-entered fields, owner profile, reviews, stats
const getLaunchById = async (req, res) => {
  assertValidId(req.params.id);

  const rawProduct = await Product.findOne(
    { _id: req.params.id, status: { $in: ["in_review", "launched"] } }
  ).populate("owner", "name username picture");

  if (!rawProduct) throw new ExpressError("Launch not found", 404);

  const product = rawProduct.toObject();
  // Add voted status for the requesting user, then strip the full voter array.
  product.userHasVoted = req.userId
    ? (rawProduct.upvotes || []).some(id => id.toString() === req.userId.toString())
    : false;
  delete product.upvotes;

  // Attach owner bio from the separate Profile document.
  if (product.owner?._id) {
    const ownerProfile = await Profile.findOne(
      { userId: product.owner._id },
      { bio: 1 }
    ).lean();
    if (ownerProfile?.bio) product.owner.bio = ownerProfile.bio;
  }

  const page = Math.max(1, parseIntSafe(req.query.page, 1));
  const limit = Math.min(50, Math.max(1, parseIntSafe(req.query.limit, 10)));
  const { tag } = req.query;

  const reviewFilter = { product: product._id };
  // Validate tag against the allowed enum before injecting into query.
  if (tag) {
    if (!REVIEW_TAGS.includes(tag))
      throw new ExpressError("Invalid tag filter", 400);
    reviewFilter.tags = tag;
  }

  const [reviews, totalReviews, ratingStats] = await Promise.all([
    ProductReview.find(reviewFilter)
      .populate("reviewer", "name username picture")
      .populate("replies.author", "name username picture")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    ProductReview.countDocuments({ product: product._id }),
    ProductReview.aggregate([
      { $match: { product: product._id } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$rating" },
          dist5: { $sum: { $cond: [{ $eq: ["$rating", 5] }, 1, 0] } },
          dist4: { $sum: { $cond: [{ $eq: ["$rating", 4] }, 1, 0] } },
          dist3: { $sum: { $cond: [{ $eq: ["$rating", 3] }, 1, 0] } },
          dist2: { $sum: { $cond: [{ $eq: ["$rating", 2] }, 1, 0] } },
          dist1: { $sum: { $cond: [{ $eq: ["$rating", 1] }, 1, 0] } },
        },
      },
      {
        $project: {
          _id: 0,
          avgRating: { $round: ["$avgRating", 1] },
          dist5: 1,
          dist4: 1,
          dist3: 1,
          dist2: 1,
          dist1: 1,
        },
      },
    ]),
  ]);

  res.status(200).json({
    product,
    reviews,
    totalReviews,
    page,
    totalPages: Math.ceil(totalReviews / limit),
    ratingStats: ratingStats[0] ?? {
      avgRating: 0,
      dist5: 0,
      dist4: 0,
      dist3: 0,
      dist2: 0,
      dist1: 0,
    },
  });
};

// POST /launches/:id/upvote  — auth required
const toggleUpvote = async (req, res) => {
  assertValidId(req.params.id);

  const userId = new mongoose.Types.ObjectId(req.userId);

  // Guard: owner cannot upvote their own product.
  const product = await Product.findOne(
    { _id: req.params.id, status: { $in: ["in_review", "launched"] } },
    { owner: 1, upvotes: 1 }
  );
  if (!product) throw new ExpressError("Launch not found", 404);
  if (product.owner.equals(userId))
    throw new ExpressError("You cannot upvote your own product", 403);

  // Atomic toggle: attempt to add the upvote only if user is NOT already in the array.
  // This eliminates the read-then-write race condition entirely.
  const added = await Product.findOneAndUpdate(
    { _id: product._id, status: { $in: ["in_review", "launched"] }, upvotes: { $ne: userId } },
    { $addToSet: { upvotes: userId }, $inc: { upvoteCount: 1 } },
    { new: true, select: "upvoteCount" }
  );

  if (added) {
    return res.status(200).json({ upvoteCount: added.upvoteCount, upvoted: true });
  }

  // User was already in the array — remove the upvote atomically.
  const removed = await Product.findOneAndUpdate(
    { _id: product._id, status: { $in: ["in_review", "launched"] }, upvotes: userId },
    { $pull: { upvotes: userId }, $inc: { upvoteCount: -1 } },
    { new: true, select: "upvoteCount" }
  );

  if (removed) {
    // Floor at 0 in case of any prior data inconsistency.
    const safeCount = Math.max(0, removed.upvoteCount);
    if (removed.upvoteCount < 0) {
      await Product.findByIdAndUpdate(product._id, { $set: { upvoteCount: 0 } });
    }
    return res.status(200).json({ upvoteCount: safeCount, upvoted: false });
  }

  throw new ExpressError("Launch not found", 404);
};

module.exports = {
  getLaunches,
  getLiveLaunches,
  getLaunchStats,
  getLaunchById,
  toggleUpvote,
};
