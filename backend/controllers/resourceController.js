const mongoose = require("mongoose");
const Resource = require("../models/resourceModel");
const { RESOURCE_CATEGORIES } = require("../models/resourceModel");
const CreditService = require("../services/creditService");
const ExpressError = require("../utils/ExpressError");

function assertValidId(id) {
  if (!mongoose.Types.ObjectId.isValid(id))
    throw new ExpressError("Invalid resource ID", 400);
}

function parseIntSafe(val, fallback) {
  const n = parseInt(val, 10);
  return Number.isFinite(n) ? n : fallback;
}

// POST /resources
const submitResource = async (req, res) => {
  const { title, description, url, category } = req.body;
  if (!title || !description || !url)
    throw new ExpressError("title, description, and url are required", 400);
  if (category && !RESOURCE_CATEGORIES.includes(category))
    throw new ExpressError("Invalid category", 400);

  const resource = await Resource.create({
    title,
    description,
    url,
    category: category || "Other",
    uploader: req.userId,
  });
  res.status(201).json({ resource });
};

// GET /resources?category=&page=&limit=
// Locked resources are returned without their url — only title/description/category preview.
const listResources = async (req, res) => {
  const { category, page, limit } = req.query;
  const pageNum = Math.max(1, parseIntSafe(page, 1));
  const limitNum = Math.min(50, Math.max(1, parseIntSafe(limit, 20)));

  const filter = { status: "approved" };
  if (category) {
    if (!RESOURCE_CATEGORIES.includes(category))
      throw new ExpressError("Invalid category", 400);
    filter.category = category;
  }

  const [resources, total] = await Promise.all([
    Resource.find(filter)
      .populate("uploader", "name username picture")
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean(),
    Resource.countDocuments(filter),
  ]);

  const shaped = resources.map((r) => {
    const unlocked =
      r.uploader?._id?.toString() === req.userId ||
      (r.unlockedBy || []).some((id) => id.toString() === req.userId);
    return {
      _id: r._id,
      title: r.title,
      description: r.description,
      category: r.category,
      uploader: r.uploader,
      createdAt: r.createdAt,
      unlocked,
      url: unlocked ? r.url : undefined,
    };
  });

  res.status(200).json({
    resources: shaped,
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum),
  });
};

// GET /resources/mine — the uploader's own submissions, any status
const getMyResources = async (req, res) => {
  const resources = await Resource.find({ uploader: req.userId })
    .sort({ createdAt: -1 })
    .lean();
  res.status(200).json({ resources });
};

// POST /resources/:id/unlock — costs 10 credits (UNLOCK_RESOURCE), once per resource.
// Free for the uploader and for anyone who already unlocked it.
const unlockResource = async (req, res) => {
  assertValidId(req.params.id);
  const resource = await Resource.findById(req.params.id);
  if (!resource) throw new ExpressError("Resource not found", 404);
  if (resource.status !== "approved")
    throw new ExpressError("This resource is not available", 400);

  const isOwner = resource.uploader.toString() === req.userId;
  const alreadyUnlocked = (resource.unlockedBy || []).some(
    (id) => id.toString() === req.userId
  );

  if (!isOwner && !alreadyUnlocked) {
    await CreditService.spend({
      userId: req.userId,
      eventCode: "UNLOCK_RESOURCE",
      idempotencyKey: `UNLOCK_RESOURCE:${req.userId}:${resource._id}`,
      entityRef: { model: "Resource", id: resource._id },
    });
    await Resource.findByIdAndUpdate(resource._id, {
      $addToSet: { unlockedBy: req.userId },
    });
  }

  res.status(200).json({ url: resource.url });
};

// ── Admin (mounted under /admin, isAdmin middleware) ────────────────────────

// GET /admin/resources/pending
const listPendingResources = async (req, res) => {
  const resources = await Resource.find({ status: "pending" })
    .populate("uploader", "name username email")
    .sort({ createdAt: 1 })
    .lean();
  res.status(200).json({ resources });
};

// POST /admin/resources/:id/approve
const approveResource = async (req, res) => {
  assertValidId(req.params.id);
  const resource = await Resource.findById(req.params.id);
  if (!resource) throw new ExpressError("Resource not found", 404);
  if (resource.status !== "pending")
    throw new ExpressError("Only pending resources can be approved", 400);

  resource.status = "approved";
  await resource.save();

  // Fire-and-forget, mirroring award() usage elsewhere (e.g. subscription/streak
  // grants) — a capped-out uploader (2/month) still gets the approval, just no credits.
  CreditService.award({
    userId: resource.uploader,
    eventCode: "RESOURCE_UPLOAD",
    idempotencyKey: `RESOURCE_UPLOAD:${resource.uploader}:${resource._id}`,
    entityRef: { model: "Resource", id: resource._id },
  }).catch((err) => console.error("RESOURCE_UPLOAD credit award failed:", err.message));

  res.status(200).json({ message: "Resource approved", resource });
};

// POST /admin/resources/:id/reject   body: { rejectionNote }
const rejectResource = async (req, res) => {
  assertValidId(req.params.id);
  const { rejectionNote } = req.body;
  const resource = await Resource.findById(req.params.id);
  if (!resource) throw new ExpressError("Resource not found", 404);
  if (resource.status !== "pending")
    throw new ExpressError("Only pending resources can be rejected", 400);

  resource.status = "rejected";
  resource.rejectionNote = rejectionNote || null;
  await resource.save();

  res.status(200).json({ message: "Resource rejected", resource });
};

module.exports = {
  submitResource,
  listResources,
  getMyResources,
  unlockResource,
  listPendingResources,
  approveResource,
  rejectResource,
};
