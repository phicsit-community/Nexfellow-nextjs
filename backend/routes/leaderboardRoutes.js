
const router = require('express').Router();
const catchAsync = require('../utils/CatchAsync');
const leaderboard = require('../controllers/quizController.js');
const { getLeaderboardResults } = require('../controllers/leaderboardController');

router.get('/getLeaderboardResults',getLeaderboardResults);

module.exports = router;