const User = require('../models/userModel');

// Get users with optional filtering
const getUsers = async (req, res) => {
    try {
        const { quizId, adminId, challengeId, country, tier } = req.query;

        // Create a filter object
        let filters = {};

        // Apply filters if query params are provided
        if (quizId) {
            filters.registeredQuizzes = quizId;
        }
        if (adminId) {
            filters._id = adminId; // Assuming admin is a specific user with this ID
        }
        if (challengeId) {
            filters.joinedChallenges = challengeId;
        }
        if (country) {
            filters.country = country;
        }
        if (tier) {
            filters.subscriptionTier = tier;
        }

        // Fetch users based on filters, only select the email field
        const users = await User.find(filters).select('username email');
        return res.status(200).json(users);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// Get all users
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('email');
        return res.status(200).json(users);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// Get users by registered quizzes
const getUsersByQuizId = async (req, res) => {
    const { quizId } = req.params;
    try {
        const users = await User.find({ registeredQuizzes: quizId }).select('email');
        return res.status(200).json(users);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// Get users by joined challenges
const getUsersByChallengeId = async (req, res) => {
    const { challengeId } = req.params;
    try {
        const users = await User.find({ joinedChallenges: challengeId }).select('email');
        return res.status(200).json(users);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// Get users by country
const getUsersByCountry = async (req, res) => {
    const { country } = req.params;
    try {
        const users = await User.find({ country }).select('email');
        return res.status(200).json(users);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// Get users by subscription tier
const getUsersByTier = async (req, res) => {
    const { tier } = req.params;
    try {
        const users = await User.find({ subscriptionTier: tier }).select('email');
        return res.status(200).json(users);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getUsers,
    getAllUsers,
    getUsersByQuizId,
    getUsersByChallengeId,
    getUsersByCountry,
    getUsersByTier
};
