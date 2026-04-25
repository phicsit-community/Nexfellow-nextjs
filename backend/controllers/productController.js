const mongoose = require("mongoose");
const Product = require("../models/productModel");
const ProductReview = require("../models/productReviewModel");
const ExpressError = require("../utils/ExpressError");
const { uploadOnBunny, removeFromBunny } = require("../utils/attachments");
const path = require("path");
const { FEEDBACK_FOCUS_OPTIONS } = require("../models/productModel");
const { REVIEW_TAGS } = require("../models/productReviewModel");

const MIN_REVIEWS_TO_LAUNCH = 5;

// Fields the owner can update before launch (all editable fields)
const ALLOWED_UPDATE_FIELDS = [
  "name",
  "tagline",
  "description",
  "category",
  "buildStage",
  "feedbackFocus",
  "specificQuestion",
  "productUrl",
  "demoVideo",
];

// Fields the owner can still update after launch — identity fields (name, tagline, category)
// are locked once a product is publicly listed to prevent silent misrepresentation.
const POST_LAUNCH_UPDATE_FIELDS = [
  "description",
  "buildStage",
  "feedbackFocus",
  "specificQuestion",
  "productUrl",
  "demoVideo",
];

function assertValidId(id) {
  if (!mongoose.Types.ObjectId.isValid(id))
    throw new ExpressError("Invalid ID", 400);
}

// POST /products
const createProduct = async (req, res) => {
  const {
    name,
    tagline,
    description,
    category,
    buildStage,
    feedbackFocus,
    specificQuestion,
    productUrl,
    demoVideo,
  } = req.body;

  if (feedbackFocus) {
    if (!Array.isArray(feedbackFocus))
      throw new ExpressError("feedbackFocus must be an array", 400);
    if (feedbackFocus.length > 3)
      throw new ExpressError("feedbackFocus can have at most 3 items", 400);
    for (const item of feedbackFocus) {
      if (!FEEDBACK_FOCUS_OPTIONS.includes(item))
        throw new ExpressError(`Invalid feedbackFocus item: "${item}"`, 400);
    }
  }

  // Products must always start as drafts — status cannot be set on creation.
  const product = new Product({
    name,
    tagline,
    description,
    category,
    buildStage,
    feedbackFocus,
    specificQuestion,
    productUrl,
    demoVideo,
    status: "draft",
    owner: req.userId,
  });

  await product.save();
  res.status(201).json(product);
};

// GET /products/stats
const getDashboardStats = async (req, res) => {
  const ownerId = new mongoose.Types.ObjectId(req.userId);

  const totalProducts = await Product.countDocuments({
    owner: ownerId,
    status: { $ne: "archived" },
  });

  const productIds = await Product.find({
    owner: ownerId,
    status: { $ne: "archived" },
  }).distinct("_id");

  if (productIds.length === 0) {
    return res.status(200).json({ totalProducts: 0, totalReviews: 0, avgRating: 0 });
  }

  const [stats] = await ProductReview.aggregate([
    { $match: { product: { $in: productIds } } },
    {
      $group: {
        _id: null,
        totalReviews: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
    {
      $project: {
        _id: 0,
        totalReviews: 1,
        avgRating: { $round: ["$avgRating", 1] },
      },
    },
  ]);

  res.status(200).json({
    totalProducts,
    totalReviews: stats?.totalReviews ?? 0,
    avgRating: stats?.avgRating ?? 0,
  });
};

// GET /products/my
const getMyProducts = async (req, res) => {
  const ownerId = new mongoose.Types.ObjectId(req.userId);
  const includeArchived = req.query.includeArchived === "true";

  const matchStage = { owner: ownerId };
  if (!includeArchived) matchStage.status = { $ne: "archived" };

  const products = await Product.aggregate([
    { $match: matchStage },
    { $sort: { createdAt: -1 } },
    {
      $lookup: {
        from: "productreviews",
        localField: "_id",
        foreignField: "product",
        as: "reviews",
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
    // Never expose the upvotes array (voter IDs) to clients.
    { $project: { reviews: 0, upvotes: 0 } },
  ]);

  res.status(200).json(products);
};

// GET /products/:id
const getProductById = async (req, res) => {
  assertValidId(req.params.id);

  const product = await Product.findById(req.params.id, { upvotes: 0 }).populate(
    "owner",
    "name username picture"
  );
  if (!product) throw new ExpressError("Product not found", 404);

  // Visibility guard: drafts and archived products are only visible to their owner.
  // in_review products are visible to any authenticated user (they need to review).
  // launched products are publicly readable (but better served via /launches/:id).
  if (
    (product.status === "draft" || product.status === "archived") &&
    product.owner._id.toString() !== req.userId
  ) {
    throw new ExpressError("Product not found", 404);
  }

  const reviews = await ProductReview.find({ product: product._id })
    .populate("reviewer", "name username picture")
    .populate("replies.author", "name username picture")
    .sort({ createdAt: -1 })
    .limit(10);

  const [stats] = await ProductReview.aggregate([
    { $match: { product: product._id } },
    {
      $group: {
        _id: null,
        totalReviews: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
    {
      $project: {
        _id: 0,
        totalReviews: 1,
        avgRating: { $round: ["$avgRating", 1] },
      },
    },
  ]);

  res.status(200).json({
    product,
    reviews,
    stats: stats ?? { totalReviews: 0, avgRating: 0 },
  });
};

// PUT /products/:id
const updateProduct = async (req, res) => {
  assertValidId(req.params.id);

  const product = await Product.findById(req.params.id);
  if (!product) throw new ExpressError("Product not found", 404);
  if (product.owner.toString() !== req.userId)
    throw new ExpressError("Forbidden", 403);
  if (product.status === "archived")
    throw new ExpressError("Cannot edit an archived product", 400);

  if (req.body.feedbackFocus !== undefined) {
    if (!Array.isArray(req.body.feedbackFocus))
      throw new ExpressError("feedbackFocus must be an array", 400);
    if (req.body.feedbackFocus.length > 3)
      throw new ExpressError("feedbackFocus can have at most 3 items", 400);
    for (const item of req.body.feedbackFocus) {
      if (!FEEDBACK_FOCUS_OPTIONS.includes(item))
        throw new ExpressError(`Invalid feedbackFocus item: "${item}"`, 400);
    }
  }

  // Once launched, identity fields are locked to prevent misrepresentation in the feed.
  const allowedFields =
    product.status === "launched" ? POST_LAUNCH_UPDATE_FIELDS : ALLOWED_UPDATE_FIELDS;

  const updates = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }

  if (Object.keys(updates).length === 0)
    throw new ExpressError("No valid fields to update", 400);

  Object.assign(product, updates);
  await product.save();
  res.status(200).json(product);
};

// POST /products/:id/submit
const submitProduct = async (req, res) => {
  assertValidId(req.params.id);

  const product = await Product.findById(req.params.id);
  if (!product) throw new ExpressError("Product not found", 404);
  if (product.owner.toString() !== req.userId)
    throw new ExpressError("Forbidden", 403);
  if (product.status !== "draft")
    throw new ExpressError("Only draft products can be submitted", 400);

  product.status = "in_review";
  await product.save();
  res.status(200).json({ message: "Product submitted for review", product });
};

// POST /products/:id/launch
const launchProduct = async (req, res) => {
  assertValidId(req.params.id);

  const product = await Product.findById(req.params.id);
  if (!product) throw new ExpressError("Product not found", 404);
  if (product.owner.toString() !== req.userId)
    throw new ExpressError("Forbidden", 403);
  if (product.status !== "in_review")
    throw new ExpressError("Only products in review can be launched", 400);

  const reviewCount = await ProductReview.countDocuments({ product: product._id });
  if (reviewCount < MIN_REVIEWS_TO_LAUNCH)
    throw new ExpressError(
      `You need at least ${MIN_REVIEWS_TO_LAUNCH} reviews before launching (you have ${reviewCount})`,
      400
    );

  product.status = "launched";
  await product.save();
  res.status(200).json({ message: "Product launched successfully", product });
};

// DELETE /products/:id
const deleteProduct = async (req, res) => {
  assertValidId(req.params.id);

  const product = await Product.findById(req.params.id);
  if (!product) throw new ExpressError("Product not found", 404);
  if (product.owner.toString() !== req.userId)
    throw new ExpressError("Forbidden", 403);

  product.status = "archived";
  await product.save();
  res.status(200).json({ message: "Product archived" });
};

// POST /products/:id/screenshots
const uploadScreenshots = async (req, res) => {
  assertValidId(req.params.id);

  const product = await Product.findById(req.params.id);
  if (!product) throw new ExpressError("Product not found", 404);
  if (product.owner.toString() !== req.userId)
    throw new ExpressError("Forbidden", 403);
  if (!req.files || req.files.length === 0)
    throw new ExpressError("No files provided", 400);
  if (product.screenshots.length + req.files.length > 5)
    throw new ExpressError("Maximum 5 screenshots allowed", 400);

  const uploadedUrls = [];
  try {
    for (const file of req.files) {
      const ext = path.extname(file.originalname);
      const targetPath = `products/screenshots/${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      const url = await uploadOnBunny(file.path, targetPath);
      if (!url) throw new Error("Upload failed for " + file.originalname);
      uploadedUrls.push(url);
    }
  } catch (err) {
    for (const url of uploadedUrls) {
      await removeFromBunny(url);
    }
    throw new ExpressError("Screenshot upload failed: " + err.message, 500);
  }

  product.screenshots.push(...uploadedUrls);
  await product.save();
  res.status(200).json({ screenshots: product.screenshots });
};

// POST /products/:id/reviews
const createReview = async (req, res) => {
  assertValidId(req.params.id);

  const product = await Product.findById(req.params.id);
  if (!product) throw new ExpressError("Product not found", 404);
  if (product.owner.toString() === req.userId)
    throw new ExpressError("You cannot review your own product", 403);
  if (!["in_review", "launched"].includes(product.status))
    throw new ExpressError("This product is not open for feedback", 400);

  const existing = await ProductReview.findOne({
    product: product._id,
    reviewer: req.userId,
  });
  if (existing)
    throw new ExpressError("You have already reviewed this product", 400);

  const { rating, content, tags } = req.body;

  // Explicit range check — !rating would silently reject a valid rating of 0.
  const ratingNum = Number(rating);
  if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5)
    throw new ExpressError("rating must be an integer between 1 and 5", 400);

  if (!content || typeof content !== "string" || content.trim().length < 10)
    throw new ExpressError("content must be at least 10 characters", 400);

  // Validate tags against the enum before hitting the DB.
  const tagsArr = tags || [];
  if (!Array.isArray(tagsArr))
    throw new ExpressError("tags must be an array", 400);
  for (const tag of tagsArr) {
    if (!REVIEW_TAGS.includes(tag))
      throw new ExpressError(`Invalid tag: "${tag}"`, 400);
  }

  const review = new ProductReview({
    product: product._id,
    reviewer: req.userId,
    rating: ratingNum,
    content: content.trim(),
    tags: tagsArr,
    round: product.reviewRound,
  });

  await review.save();
  await review.populate("reviewer", "name username picture");
  res.status(201).json(review);
};

// GET /products/:id/reviews
const getReviews = async (req, res) => {
  assertValidId(req.params.id);

  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
  const { tag } = req.query;

  const filter = { product: req.params.id };
  if (tag) {
    if (!REVIEW_TAGS.includes(tag))
      throw new ExpressError("Invalid tag filter", 400);
    filter.tags = tag;
  }

  const [reviews, total] = await Promise.all([
    ProductReview.find(filter)
      .populate("reviewer", "name username picture")
      .populate("replies.author", "name username picture")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    ProductReview.countDocuments(filter),
  ]);

  res.status(200).json({ reviews, total, page, totalPages: Math.ceil(total / limit) });
};

// POST /products/:id/reviews/:reviewId/reply
const replyToReview = async (req, res) => {
  assertValidId(req.params.id);
  assertValidId(req.params.reviewId);

  const product = await Product.findById(req.params.id);
  if (!product) throw new ExpressError("Product not found", 404);
  if (product.owner.toString() !== req.userId)
    throw new ExpressError("Only the product owner can reply", 403);

  const review = await ProductReview.findOne({
    _id: req.params.reviewId,
    product: req.params.id,
  });
  if (!review) throw new ExpressError("Review not found", 404);

  const { content } = req.body;
  if (!content || typeof content !== "string" || !content.trim())
    throw new ExpressError("Reply content is required", 400);

  review.replies.push({ author: req.userId, content: content.trim() });
  await review.save();
  await review.populate("replies.author", "name username picture");
  res.status(200).json(review);
};

// POST /products/:id/reviews/:reviewId/helpful
const markHelpful = async (req, res) => {
  assertValidId(req.params.id);
  assertValidId(req.params.reviewId);

  const userId = new mongoose.Types.ObjectId(req.userId);

  const review = await ProductReview.findOne(
    { _id: req.params.reviewId, product: req.params.id },
    { reviewer: 1 }
  );
  if (!review) throw new ExpressError("Review not found", 404);

  // Reviewer cannot mark their own review as helpful.
  if (review.reviewer.equals(userId))
    throw new ExpressError("You cannot mark your own review as helpful", 403);

  // Atomic toggle — same pattern as toggleUpvote.
  const marked = await ProductReview.findOneAndUpdate(
    { _id: review._id, helpfulBy: { $ne: userId } },
    { $addToSet: { helpfulBy: userId }, $inc: { helpfulCount: 1 } },
    { new: true, select: "helpfulCount" }
  );

  if (marked) {
    return res.status(200).json({ helpfulCount: marked.helpfulCount, marked: true });
  }

  const unmarked = await ProductReview.findOneAndUpdate(
    { _id: review._id, helpfulBy: userId },
    { $pull: { helpfulBy: userId }, $inc: { helpfulCount: -1 } },
    { new: true, select: "helpfulCount" }
  );

  if (unmarked) {
    const safeCount = Math.max(0, unmarked.helpfulCount);
    if (unmarked.helpfulCount < 0) {
      await ProductReview.findByIdAndUpdate(review._id, { $set: { helpfulCount: 0 } });
    }
    return res.status(200).json({ helpfulCount: safeCount, marked: false });
  }

  throw new ExpressError("Review not found", 404);
};

// PUT /products/:id/reviews/:reviewId/resolve
const resolveReview = async (req, res) => {
  assertValidId(req.params.id);
  assertValidId(req.params.reviewId);

  const product = await Product.findById(req.params.id);
  if (!product) throw new ExpressError("Product not found", 404);
  if (product.owner.toString() !== req.userId)
    throw new ExpressError("Only the product owner can resolve reviews", 403);

  const review = await ProductReview.findOne({
    _id: req.params.reviewId,
    product: req.params.id,
  });
  if (!review) throw new ExpressError("Review not found", 404);

  review.resolved = !review.resolved;
  await review.save();
  res.status(200).json({ resolved: review.resolved });
};

module.exports = {
  createProduct,
  getDashboardStats,
  getMyProducts,
  getProductById,
  updateProduct,
  submitProduct,
  launchProduct,
  deleteProduct,
  uploadScreenshots,
  createReview,
  getReviews,
  replyToReview,
  markHelpful,
  resolveReview,
};
