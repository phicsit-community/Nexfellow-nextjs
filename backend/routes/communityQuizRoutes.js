const express = require("express");
const router = express.Router();
const { isAuthenticated, upload } = require("../middleware");

const {
  // Quiz CRUD
  createCommunityQuiz,
  getCommunityQuizzes,
  getPublicQuiz,
  getCommunityQuizById,
  updateCommunityQuiz,
  deleteCommunityQuiz,
  // Question CRUD
  addQuestion,
  updateQuestion,
  deleteQuestion,
  getCommunityQuestionsForCreator,
  getCommunityQuestionsForUser,
  // Leaderboard
  getLeaderboard,
  updateLeaderboard,
  // Registration
  registerCommunityQuiz,
  isRegisteredCommunityQuiz,
  // Submission
  submitCommunityQuiz,
  getCommunityQuizSubmission,
  // Rewards
  assignCommunityQuizRewards,
  getCommunityQuizRewards,
  // Search/Filter
  searchCommunityQuizzes,
  getActiveCommunityQuizzes,
  getUpcomingCommunityQuizzes,
  getPastCommunityQuizzes,
  // Registrations
  getCommunityQuizRegistrations,
  hasAttemptedCommunityQuiz,
  getParticipantsForCreator,
} = require("../controllers/communityQuizController");

// ------------------- QUIZ CRUD -------------------

// Create a quiz (communityId is required for creation)
router.post(
  "/:communityId/quizzes",
  isAuthenticated,
  upload.any(),
  createCommunityQuiz
);

// Get all quizzes for a community
router.get("/:communityId/quizzes", getCommunityQuizzes);
router.get("/public/:quizid", getPublicQuiz);

// Get all quizzes (search/filter, active, upcoming, past)
router.get("/quizzes", searchCommunityQuizzes);
router.get("/quizzes/active", getActiveCommunityQuizzes);
router.get("/quizzes/upcoming", getUpcomingCommunityQuizzes);
router.get("/quizzes/past", getPastCommunityQuizzes);

// Get, update, delete a single quiz (by quizId)
router.get("/quizzes/:quizId", isAuthenticated, getCommunityQuizById);
router.put(
  "/quizzes/:quizId",
  isAuthenticated,
  upload.any(),
  updateCommunityQuiz
);
router.delete("/quizzes/:quizId", isAuthenticated, deleteCommunityQuiz);

// ------------------- QUESTION CRUD -------------------

// Add, update, delete, get all questions (by quizId)
router.post("/quizzes/:quizId/questions", isAuthenticated, addQuestion);

router.put("/questions/:questionId", isAuthenticated, updateQuestion);
router.delete("/questions/:questionId", isAuthenticated, deleteQuestion);
router.get(
  "/creator/:quizId/questions",
  isAuthenticated,
  getCommunityQuestionsForCreator
);
router.get(
  "/quizzes/:quizId/participants",
  isAuthenticated,
  getParticipantsForCreator
);

router.get(
  "/user/:quizId/questions",
  isAuthenticated,
  getCommunityQuestionsForUser
);

// ------------------- LEADERBOARD -------------------

router.get("/quizzes/:quizId/leaderboard", getLeaderboard);
router.post("/quizzes/:quizId/leaderboard", updateLeaderboard);

// ------------------- REGISTRATION -------------------

router.post(
  "/quizzes/:quizId/register",
  isAuthenticated,
  registerCommunityQuiz
);

// Check if user is registered for a community quiz
router.post(
  "/quizzes/:quizId/isRegistered",
  isAuthenticated,
  isRegisteredCommunityQuiz
);

router.get(
  "/quizzes/:quizId/registrations",
  isAuthenticated,
  getCommunityQuizRegistrations
);

// ------------------- SUBMISSION -------------------

router.post("/quizzes/:quizId/submit", isAuthenticated, submitCommunityQuiz);
router.get(
  "/quizzes/:quizId/submission/:userId",
  isAuthenticated,
  getCommunityQuizSubmission
);

// ------------------- REWARDS -------------------

router.post(
  "/quizzes/:quizId/rewards",
  isAuthenticated,
  assignCommunityQuizRewards
);
router.get("/quizzes/:quizId/rewards", getCommunityQuizRewards);

router.get(
  "/quizzes/:quizId/attempted",
  isAuthenticated,
  hasAttemptedCommunityQuiz
);

module.exports = router;
