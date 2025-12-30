const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    day: {
        type: Number, required: true 
    },
    title: {
        type: String, 
        required: true 
    },
    description: {  
        type: String, 
        required: true 
    },

});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
