const router = require("express").Router();
const quiz = require("../controllers/quizController.js");
const catchAsync = require("../utils/CatchAsync.js");
const { isClient } = require("../middleware.js");

router
  .route("/add-reward-to-quiz/:quizId")
  .put(catchAsync(quiz.addRewardToQuiz));

router.route("/getAllQuizzes").get(catchAsync(quiz.getAllQuizes));

router.route("/getQuiz/:quizid").get(isClient, catchAsync(quiz.getQuiz));

// Public route for quiz details (needed for OG metadata)
router.route("/public/:quizid").get(catchAsync(quiz.getPublicQuiz));

router
  .route("/registerQuiz/:quizId")
  .post(isClient, catchAsync(quiz.registerQuiz));

router
  .route("/isRegistered/:quizId")
  .post(isClient, catchAsync(quiz.isRegistered));

router
  .route("/actionBookmark/:quizId")
  .post(isClient, catchAsync(quiz.actionBookmark));

router
  .route("/bookmarkedQuizzes/")
  .get(isClient, catchAsync(quiz.bookmarkedQuizzes));

router.route("/yourQuizzes").get(isClient, catchAsync(quiz.getYourQuizzes));

router
  .route("/getQuestions/:quizid")
  .get(isClient, catchAsync(quiz.getQuestions));

router
  .route("/submitQuiz/:quizId")
  .post(isClient, catchAsync(quiz.addResponseAndUpdateSubmission));

router.route("/getSubmissions").get(isClient, catchAsync(quiz.getSubmissions));

router
  .route("/getScore/:userid/:quizid")
  .get(isClient, catchAsync(quiz.getFinalScore));

router
  .route("/getQuizAnalytics/:quizid")
  .get(isClient, catchAsync(quiz.getQuizAnalytics));

router
  .route("/getWrongAnswers/:quizid")
  .get(isClient, catchAsync(quiz.getWrongAnswers));

router
  .route("/getLeaderboard/:quizid")
  .get(isClient, catchAsync(quiz.getLeaderboard));

module.exports = router;
