const Challenge = require('../models/challengeModel');
const User = require('../models/userModel');

// Get all challenges
const getAllChallenges = async (req, res) => {
    try {
        const challenges = await Challenge.find().select('-__v'); // Exclude version key (__v)
        return res.status(200).json(challenges);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// Get challenges by admin ID
const getChallengesByAdminId = async (req, res) => {
    const { adminId } = req.params;
    try {
        const challenges = await Challenge.find({ createdBy: adminId }).select('-__v'); // Exclude version key (__v)
        return res.status(200).json(challenges);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const getUsersByChallengeId = async (req, res) => {
    const { challengeId } = req.params;
  
    try {
      // Find users who have joined the challenge
      const users = await User.find({ joinedChallenges: challengeId }).select('email name');
  
      if (!users) {
        return res.status(404).json({ message: 'No users found for this challenge' });
      }
  
      res.status(200).json(users);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Error retrieving users', error });
    }
  };

module.exports = {
    getAllChallenges,
    getChallengesByAdminId,
    getUsersByChallengeId,
};
