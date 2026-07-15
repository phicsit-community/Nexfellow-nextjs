const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/CatchAsync");
const { isAuthenticated } = require("../middleware");
const { getBalance, getHistory, spend, getSummary, getEarnEvents } = require("../controllers/creditController");

router.get("/balance", isAuthenticated, catchAsync(getBalance));
router.get("/summary", isAuthenticated, catchAsync(getSummary));
router.get("/history", isAuthenticated, catchAsync(getHistory));
router.get("/earn-events", isAuthenticated, catchAsync(getEarnEvents));
router.post("/spend", isAuthenticated, catchAsync(spend));

module.exports = router;
