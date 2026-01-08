const { getHomePage } = require('../controllers/adminController');
const { isAuthenticated } = require('../middlewares/authMiddleware');

const router = require('express').Router();

router
    .route('/')
    .get(isAuthenticated, getHomePage);

module.exports = router;