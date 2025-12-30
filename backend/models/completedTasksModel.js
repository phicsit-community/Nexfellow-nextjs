const mongoose = require('mongoose');

const completedTasksSchema = new mongoose.Schema({
    day: {
        type: Number, 
        required: true 
    },
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    taskId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Task', 
        required: true 
    },
    challengeId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Challenge', 
        required: true 
    },
    completionTime: { 
        type: Date, 
        required: true 
    }
});

const CompletedTasks = mongoose.model('CompletedTasks', completedTasksSchema);

module.exports = CompletedTasks;
