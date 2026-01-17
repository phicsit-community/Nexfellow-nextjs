const mongoose = require('mongoose');
const schema = mongoose.Schema;

const challengeSchema = new schema({
    challengeTitle: {
        type: String,
        required: true,
        min: 6,
        max: 255,
    },

    challengeDescription: {
        type: String,
        required: true,
        min: 6,
        max: 255,
    },
    
    startDate: {
        type: Date,
        required: true,
    },

    endDate: {
        type: Date,
        required: true,
    },

    createdBy: {    
        type: schema.Types.ObjectId,
        ref: "Admin",
    },
});

module.exports = mongoose.model('Challenge', challengeSchema);