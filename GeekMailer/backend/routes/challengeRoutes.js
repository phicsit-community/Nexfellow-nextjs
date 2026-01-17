const express = require('express');
const { getAllChallenges, getChallengesByAdminId, getUsersByChallengeId } = require('../controllers/challengeController');

const router = express.Router();

// Route for getting all challenges
router.get('/', getAllChallenges);

// Route for getting challenges by admin ID
router.get('/admin/:adminId', getChallengesByAdminId);

router.get('/:challengeId/users', getUsersByChallengeId);

module.exports = router;
