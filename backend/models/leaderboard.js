const mongoose = require('mongoose');
const schema = mongoose.Schema;


const leaderboardSchema = new schema({
    quizId: {
        type: schema.Types.ObjectId,
        ref: 'Quiz',
        required: true,
    },
    
    ranks: [
        {
            userId: {
                type: schema.Types.ObjectId,
                ref: 'User',
            },
            score: {
                type: Number,
                required: true,
            },
            username: {
                type: String,
                required: true,
            },

            country: {
                type: String,
                required: true,
            },

        },
        
    ],

    date: {
        type: Date,
        default: Date.now
    },

    highestScore: {
        type: Number,
        default: 0,
        // required: true,
    },

    totalUsers: {
        type: Number,
        default: 0,
        // required: true,
    }

})

leaderboardSchema.methods.addUser = function(userId, score, username, country) {
    // Check if the userId already exists in the ranks array
    const existingUser = this.ranks.find(ranks => ranks.userId?.equals(userId));
    if (existingUser) {
        const existingUserIndex = this.ranks.indexOf(existingUser);
        // If the userId already exists, update the corresponding entry
        this.ranks[existingUserIndex].score = score;
        this.ranks[existingUserIndex].username = username;
        this.ranks[existingUserIndex].country = country;
    } else {
        // If the userId doesn't exist, add a new entry
        this.ranks.push({ userId, score, username, country });
    }

    // Update totalUsers and highestScore
    this.totalUsers = this.ranks.length;
    this.highestScore = Math.max(this.highestScore, score);
}

module.exports = mongoose.model('Leaderboard', leaderboardSchema);

