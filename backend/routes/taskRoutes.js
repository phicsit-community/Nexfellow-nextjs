const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { isClient } = require('../middleware');
const catchAsync = require('../utils/CatchAsync');

// Route to create a new task
router.route('/create')
    .post(isClient, catchAsync(taskController.createTask));

router.route('/createmultiple')
    .post(isClient, catchAsync(taskController.createMultipleTasks));

// Route to get a task by ID
router.route('/:id')
    .get(catchAsync(taskController.getTaskById));

// Route to get all tasks
router.route('/')
    .get(catchAsync(taskController.getAllTasks));

// Route to update a task by ID
router.route('/update/:id')
    .put(isClient, catchAsync(taskController.updateTask));

// Route to delete a task by ID
router.route('/delete/:id')
    .delete(isClient, catchAsync(taskController.deleteTask));

// Route to get tasks for a specific day (no longer filtering by challengeId)
router.route('/day/:day')
    .get(catchAsync(taskController.getTasksForDay));

module.exports = router;
