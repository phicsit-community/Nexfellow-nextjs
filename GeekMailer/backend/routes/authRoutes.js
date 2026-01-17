const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Admin login route
router.post('/login', adminController.adminLogin);

// Admin logout route
router.post('/logout', adminController.adminLogout);

module.exports = router;
