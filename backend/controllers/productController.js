const mongoose = require("mongoose");
const Product = require("../models/productModel");
const ProductReview = require("../models/productReviewModel");
const ExpressError = require("../utils/ExpressError");
const { uploadOnBunny, removeFromBunny } = require("../utils/attachments");
const path = require("path");

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
    status,
  } = req.body;

  if (feedbackFocus && feedbackFocus.length > 3) {
    throw new ExpressError("feedbackFocus can have at most 3 items", 400);
  }

  const allowedStatuses = ["draft", "in_review"];
  const productStatus =
    status && allowedStatuses.includes(status) ? status : "draft";

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
    status: productStatus,
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
    return res.status(200).json({
      totalProducts: 0,
      totalReviews: 0,
      avgRating: 0,
    });
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
    { $project: { reviews: 0 } },
  ]);

  res.status(200).json(products);
};

// GET /products/:id
const getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id).populate(
    "owner",
    "name username picture"
  );
  if (!product) throw new ExpressError("Product not found", 404);

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
  const product = await Product.findById(req.params.id);
  if (!product) throw new ExpressError("Product not found", 404);
  if (product.owner.toString() !== req.userId)
    throw new ExpressError("Forbidden", 403);
  if (product.status === "archived")
    throw new ExpressError("Cannot edit an archived product", 400);

  if (req.body.feedbackFocus && req.body.feedbackFocus.length > 3) {
    throw new ExpressError("feedbackFocus can have at most 3 items", 400);
  }

  const updates = {};
  for (const field of ALLOWED_UPDATE_FIELDS) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }

  Object.assign(product, updates);
  await product.save();
  res.status(200).json(product);
};

// POST /products/:id/submit
const submitProduct = async (req, res) => {
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

// DELETE /products/:id
const deleteProduct = async (req, res) => {
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
  const product = await Product.findById(req.params.id);
  if (!product) throw new ExpressError("Product not found", 404);
  if (product.owner.toString() === req.userId)
    throw new ExpressError("You cannot review your own product", 403);
  if (product.status !== "in_review")
    throw new ExpressError("This product is not open for review", 400);

  const existing = await ProductReview.findOne({
    product: product._id,
    reviewer: req.userId,
  });
  if (existing)
    throw new ExpressError("You have already reviewed this product", 400);

  const { rating, content, tags } = req.body;
  if (!rating || !content)
    throw new ExpressError("rating and content are required", 400);

  const review = new ProductReview({
    product: product._id,
    reviewer: req.userId,
    rating,
    content,
    tags: tags || [],
    round: product.reviewRound,
  });

  await review.save();
  await review.populate("reviewer", "name username picture");
  res.status(201).json(review);
};

// GET /products/:id/reviews
const getReviews = async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, parseInt(req.query.limit) || 10);
  const { tag } = req.query;

  const filter = { product: req.params.id };
  if (tag) filter.tags = tag;

  const [reviews, total] = await Promise.all([
    ProductReview.find(filter)
      .populate("reviewer", "name username picture")
      .populate("replies.author", "name username picture")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    ProductReview.countDocuments(filter),
  ]);

  res.status(200).json({
    reviews,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
};

// POST /products/:id/reviews/:reviewId/reply
const replyToReview = async (req, res) => {
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
  if (!content) throw new ExpressError("Reply content is required", 400);

  review.replies.push({ author: req.userId, content });
  await review.save();
  await review.populate("replies.author", "name username picture");
  res.status(200).json(review);
};

// POST /products/:id/reviews/:reviewId/helpful
const markHelpful = async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.userId);

  const review = await ProductReview.findOne({
    _id: req.params.reviewId,
    product: req.params.id,
  });
  if (!review) throw new ExpressError("Review not found", 404);

  const alreadyMarked = review.helpfulBy.some((id) => id.equals(userId));

  const update = alreadyMarked
    ? { $pull: { helpfulBy: userId }, $inc: { helpfulCount: -1 } }
    : { $addToSet: { helpfulBy: userId }, $inc: { helpfulCount: 1 } };

  const updated = await ProductReview.findByIdAndUpdate(
    review._id,
    update,
    { new: true }
  );

  res.status(200).json({ helpfulCount: updated.helpfulCount, marked: !alreadyMarked });
};

// PUT /products/:id/reviews/:reviewId/resolve
const resolveReview = async (req, res) => {
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
  deleteProduct,
  uploadScreenshots,
  createReview,
  getReviews,
  replyToReview,
  markHelpful,
  resolveReview,
};
