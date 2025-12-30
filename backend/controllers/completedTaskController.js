const CompletedTasks = require('../models/completedTasksModel'); 
const Task = require('../models/taskModel');

module.exports.addCompletedTask = async (req, res) => {
    try {
        const { userId, taskId } = req.body;

        const task = await Task.findById(taskId);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        const { challengeId, day } = task;

        const existingTask = await CompletedTasks.findOne({
            userId,
            taskId,
        });

        if (existingTask) {
            return res.status(409).json({ message: 'Task already marked as completed.' });
        }

        const completedTask = new CompletedTasks({
            day,
            userId,
            taskId,
            challengeId,
            completionTime: new Date()
        });

        await completedTask.save();

        res.status(201).json({ message: 'Task marked as completed', completedTask });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports.getCompletedTasksByUser = async (req, res) => {
    try {
        const userId = req.params.userId;
        const completedTasks = await CompletedTasks.find({ userId })

        res.status(200).json({ completedTasks });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports.getCompletedTasksByChallenge = async (req, res) => {
    try {
        const { challengeId } = req.params;
        const completedTasks = await CompletedTasks.find({ challengeId })

        res.status(200).json({ completedTasks });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports.getCompletedTasksByDay = async (req, res) => {
    try {
        const { day } = req.params;
        const completedTasks = await CompletedTasks.find({ day })

        res.status(200).json({ completedTasks });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports.getCompletedTasksByUserAndDay = async (req, res) => {
    try {
        const { userId, day } = req.params;

        const completedTasks = await CompletedTasks.find({ userId, day })

        res.status(200).json({ completedTasks });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports.getCompletedTasksByChallengeAndDay = async (req, res) => {
    try {
        const { challengeId, day } = req.params;

        const completedTasks = await CompletedTasks.find({ challengeId, day })

        res.status(200).json({ completedTasks });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports.deleteCompletedTask = async (req, res) => {
    try {
        const { _id } = req.body; 

        const deletedTask = await CompletedTasks.findByIdAndDelete(_id);

        if (!deletedTask) {
            return res.status(404).json({ message: 'Completed task not found' });
        }

        res.status(200).json({ message: 'Completed task deleted successfully', deletedTask });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports.getAll = async (req, res) => {
    try {
        const completedTasks = await CompletedTasks.find();
        res.status(200).json({completedTasks})
    }
    catch (error) {
        console.error(error);
        res.status(500).json({message: 'Server Error'});
    }
}