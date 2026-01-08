const express = require('express');
const { getAllQuizzes, getQuizzesByAdminId, getUsersByQuizId } = require('../controllers/quizController');

const router = express.Router();

// Route for getting all quizzes
router.get('/', getAllQuizzes);

// Route for getting quizzes by admin ID
router.get('/admin/:adminId', getQuizzesByAdminId);

router.get('/:quizId/users', getUsersByQuizId);

module.exports = router;
