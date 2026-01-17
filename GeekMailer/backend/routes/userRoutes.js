const express = require('express');
const { 
    getUsers, 
    getAllUsers, 
    getUsersByQuizId, 
    getUsersByChallengeId, 
    getUsersByCountry, 
    getUsersByTier 
} = require('../controllers/userController');

const router = express.Router();

// Route for optional filtering with query parameters
router.get('/', getUsers);

// Route for getting all users
router.get('/all', getAllUsers);

// Route for getting users by registered quiz ID
router.get('/quiz/:quizId', getUsersByQuizId);

// Route for getting users by joined challenge ID
router.get('/challenge/:challengeId', getUsersByChallengeId);

// Route for getting users by country
router.get('/country/:country', getUsersByCountry);

// Route for getting users by subscription tier
router.get('/tier/:tier', getUsersByTier);

module.exports = router;
