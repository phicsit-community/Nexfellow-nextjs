const express = require("express");
const router = express.Router();
const { isAuthenticated, setUserIfLoggedIn } = require("../middleware");
const catchAsync = require("../utils/CatchAsync");
const {
  getLaunches,
  getLiveLaunches,
  getLaunchStats,
  getLaunchById,
  toggleUpvote,
} = require("../controllers/launchController");

// Public (with optional auth to expose userHasVoted)
router.get("/", setUserIfLoggedIn, catchAsync(getLaunches));
router.get("/live", catchAsync(getLiveLaunches));
router.get("/stats", catchAsync(getLaunchStats));
router.get("/:id", setUserIfLoggedIn, catchAsync(getLaunchById));

// Auth required
router.post("/:id/upvote", isAuthenticated, catchAsync(toggleUpvote));

module.exports = router;
