const express = require("express");
const router = express.Router();
const shareController = require("../controllers/shareController");

// Meta tag proxy for community by username
router.get("/community/:username", shareController.communityMetaProxy);

module.exports = router;
