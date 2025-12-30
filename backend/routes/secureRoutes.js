const express = require("express");
const {
  generateSecureLink,
  validateSecureLink,
} = require("../controllers/secureLinkController");
const { isAuthenticated } = require("../middleware.js");

const router = express.Router();

router.post("/generate-secure", isAuthenticated, generateSecureLink);

router.get("/secure/:token", validateSecureLink);

module.exports = router;
