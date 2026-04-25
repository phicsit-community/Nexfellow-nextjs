const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../middleware");
const catchAsync = require("../utils/CatchAsync");
const {
  getLaunches,
  getLiveLaunches,
  getLaunchStats,
  getLaunchById,
  toggleUpvote,
} = require("../controllers/launchController");

// Public
router.get("/", catchAsync(getLaunches));
router.get("/live", catchAsync(getLiveLaunches));
router.get("/stats", catchAsync(getLaunchStats));
router.get("/:id", catchAsync(getLaunchById));

// Auth required
router.post("/:id/upvote", isAuthenticated, catchAsync(toggleUpvote));

module.exports = router;
