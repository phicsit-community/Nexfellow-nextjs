const Quiz = require('../models/quizzes');
const User = require('../models/userModel');

// Get all quizzes
const getAllQuizzes = async (req, res) => {
    try {
        const quizzes = await Quiz.find().select('-__v'); // Exclude version key (__v)
        return res.status(200).json(quizzes);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// Get quizzes by admin ID
const getQuizzesByAdminId = async (req, res) => {
    const { adminId } = req.params;
    try {
        const quizzes = await Quiz.find({ adminId }).select('-__v'); // Exclude version key (__v)
        return res.status(200).json(quizzes);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const getUsersByQuizId = async (req, res) => {
    const { quizId } = req.params;
  
    try {
      // Find users who have registered for the quiz
      const users = await User.find({ registeredQuizzes: quizId }).select('email name');
  
      if (!users) {
        return res.status(404).json({ message: 'No users found for this quiz' });
      }
  
      res.status(200).json(users);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Error retrieving users', error });
    }
  };

module.exports = {
    getAllQuizzes,
    getQuizzesByAdminId,
    getUsersByQuizId
};
