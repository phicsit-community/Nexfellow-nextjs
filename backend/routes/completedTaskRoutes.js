const express = require('express');
const router = express.Router();
const completeTaskController = require('../controllers/completedTaskController');
const catchAsync = require('../utils/CatchAsync')
const { isClient,isAdmin } = require('../middleware');

router.route('/complete')
    .post(catchAsync(completeTaskController.addCompletedTask));

router.route('/user/:userId')
    .get( catchAsync(completeTaskController.getCompletedTasksByUser));

router.route('/challenge/:challengeId')
    .get( catchAsync(completeTaskController.getCompletedTasksByChallenge));

router.route('/day/:day')
    .get(catchAsync(completeTaskController.getCompletedTasksByDay));

router.route('/user/:userId/day/:day')
    .get( catchAsync(completeTaskController.getCompletedTasksByUserAndDay));

router.route('/challenge/:challengeId/day/:day')
    .get( catchAsync(completeTaskController.getCompletedTasksByChallengeAndDay));

router.route('/delete')
    .delete(catchAsync(completeTaskController.deleteCompletedTask));

router.route('/all')
    .get(catchAsync(completeTaskController.getAll));

module.exports = router;
