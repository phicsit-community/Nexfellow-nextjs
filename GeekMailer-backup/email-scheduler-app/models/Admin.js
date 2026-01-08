const mongoose = require('mongoose');
const schema = mongoose.Schema;

const AdminSchema = new schema({
    username: {
        type: String,
        required: true,
        min: 6,
    },
    email: { 
        type: String,
        required: true,
        unique: true,
        min: 6,
        max: 255,
    },
    password: {
        type: String,
        required: true,
        min: 6,
        max: 1024,
    },
});

module.exports = mongoose.model('Admin', AdminSchema);
