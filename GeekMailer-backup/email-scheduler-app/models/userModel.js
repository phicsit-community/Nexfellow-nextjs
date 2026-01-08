const mongoose = require('mongoose');
const schema = mongoose.Schema;

const userSchema = new schema({

    name: {
        type: String,
        required: true,
        min: 6,
        max: 255,
    },

    username: {
        type: String,
        required: true,
        unique: true,
        min: 6,

    },

    googleId: {
        type: String,
    },

    picture:{
        type: String,
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
        min: 6,
        max: 1024,
    },

    subscriptionTier: {
        type: String,
        default: "free",
        enum: ["free", "bronze"],
    },

    registeredQuizzes: [{
        type: schema.Types.ObjectId,
        ref: 'Quiz',
    }],

    country: {
        type: String,
        default: "India",
    },
 
    profile : {
        type : schema.Types.ObjectId,
        ref: 'Profile'
    },

    verified: {
        type: Boolean,
        default: false,
    },

    verificationBadge: {
        type: Boolean,
        default: false,
    },

    premiumBadge: {
        type: Boolean,
        default: false,
    },

    joinedChallenges: [{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Challenge',
    }]        
});


module.exports = mongoose.model('User', userSchema);
