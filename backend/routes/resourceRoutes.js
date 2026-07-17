const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/CatchAsync");
const { isAuthenticated } = require("../middleware");
const {
  submitResource,
  listResources,
  getMyResources,
  unlockResource,
} = require("../controllers/resourceController");

// -- Named routes MUST come before /:id --
router.get("/mine", isAuthenticated, catchAsync(getMyResources));

router.post("/", isAuthenticated, catchAsync(submitResource));
router.get("/", isAuthenticated, catchAsync(listResources));
router.post("/:id/unlock", isAuthenticated, catchAsync(unlockResource));

module.exports = router;
