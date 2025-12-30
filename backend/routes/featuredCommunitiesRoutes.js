const express = require("express");
const router = express.Router();
const {
  setFeaturedCommunities,
  getFeaturedCommunities,
} = require("../controllers/featuredCommunitiesController");
const { isAdmin, upload } = require("../middleware.js");

// Admin: Set/update featured communities
router.post("/admin/all-communities", isAdmin, setFeaturedCommunities);

router.get("/explore/all-communities", getFeaturedCommunities);

module.exports = router;
