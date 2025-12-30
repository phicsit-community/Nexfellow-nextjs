const Task = require('../models/taskModel');
const Challenge = require('../models/challengeModel');
const { body, validationResult } = require('express-validator');

module.exports.createTask = async (req, res) => {
    try {
        const { challengeId } = req.body;

        const task = new Task({
            day: req.body.day,
            title: req.body.title,
            description: req.body.description
        });
        const savedTask = await task.save();
        const updateChallenge = (await Challenge.find(challengeId)
            .select('tasks'))
            .push(savedTask._id);
        res.status(201).json(savedTask, updateChallenge);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

module.exports.createMultipleTasks = async (req, res) => {
    const { challengeId, tasks } = req.body;
 
    await body('tasks').isArray().withMessage('Tasks must be an array').run(req);

    if (tasks && Array.isArray(tasks)) {
        tasks.forEach((_, index) => {
            body(`tasks[${index}].day`).notEmpty().withMessage('Day is required').run(req);
            body(`tasks[${index}].title`).notEmpty().withMessage('Title is required').run(req);
            body(`tasks[${index}].description`).notEmpty().withMessage('Description is required').run(req);
        });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try { 
        const tasksToSave = tasks.map(task => ({
            day: task.day,
            title: task.title,
            description: task.description,
        }));
        const savedTasks = await Task.insertMany(tasksToSave);
 
        const taskIds = savedTasks.map(task => task._id);
        const updatedChallenge = await Challenge.findByIdAndUpdate(
            challengeId,
            { $push: { tasks: { $each: taskIds } } },
            { new: true } 
        );

        if (!updatedChallenge) {
            return res.status(404).json({ message: 'Challenge not found' });
        }
 
        res.status(201).json({ savedTasks, updatedChallenge });
    } catch (err) {
        console.error('Error creating tasks:', err);
        res.status(500).json({ message: 'Internal Server Error', details: err.message });
    }
};

module.exports.getTaskById = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.status(200).json(task);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports.getAllTasks = async (req, res) => {
    try {
        const tasks = await Task.find();
        if (!tasks) {
            return res.status(404).json({ message: 'No tasks available' });
        }
        res.status(200).json(tasks);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server error');
    }
};

module.exports.updateTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        task.day = req.body.day || task.day;
        task.title = req.body.title || task.title;
        task.description = req.body.description || task.description;

        const updatedTask = await task.save();
        res.status(200).json(updatedTask);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports.deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
 
        const task = await Task.findByIdAndDelete(id);

        if (!task) {
            return res.status(404).json({ 
                success: false, 
                message: 'Task not found. Please check the task ID and try again.' 
            });
        }
 
        await Challenge.updateMany(
            { tasks: id },
            { $pull: { tasks: id } }
        );

        res.status(200).json({ 
            success: true, 
            message: 'Task deleted successfully.', 
            deletedTask: task 
        });
    } catch (err) {
        console.error('Error deleting task:', err);
        res.status(500).json({ 
            success: false, 
            message: 'An error occurred while attempting to delete the task. Please try again later.',
            details: err.message 
        });
    }
};
  
module.exports.getTasksForDay = async (req, res) => {
    try {
        const tasks = await Task.find({ 
            day: req.params.day
        });
        if (tasks.length === 0) {
            return res.status(404).json({ message: 'No tasks found for this day' });
        }
        res.status(200).json(tasks);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
