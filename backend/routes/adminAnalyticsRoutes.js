// routes/adminAnalyticsRoutes.js

const express = require("express");
const router = express.Router();
const adminAnalyticsController = require("../controllers/adminAnalyticsController");

// You can add authentication middleware here if needed
router.get("/overview", adminAnalyticsController.getOverview);

module.exports = router;
