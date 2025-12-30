const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analyticsController");
const { isClient, isCommunityCreator } = require("../middleware");

// router.get('/:communityId', isClient, isCommunityCreator, analyticsController.getAnalytics);
router.get("/:communityId", analyticsController.getAnalytics);

router.get("/:communityId/reputation", analyticsController.getReputation);

// Route to get detailed link click analytics
router.get(
  "/:communityId/link-analytics",
  isClient,
  analyticsController.getLinkAnalytics
);

module.exports = router;
