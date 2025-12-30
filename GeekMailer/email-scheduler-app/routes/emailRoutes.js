const express = require('express');
const router = express.Router();
const emailController = require('../controllers/emailController');
const { isAuthenticated } = require('../middlewares/authMiddleware');
const { upload } = require('../utils/upload');

// Route for sending an email immediately
router.route('/send-immediate')
  .post(isAuthenticated, upload.array('attachments', 10), emailController.SendImmediateEmail);

// Route for scheduling an email
router.route('/schedule')
  .post(isAuthenticated, upload.array('attachments', 10), emailController.ScheduleEmail);

// Route to view email details by ID
router.route('/email/:id')
  .get(isAuthenticated, emailController.viewEmail)
  .patch(isAuthenticated, emailController.markEmailAsInactive); // Mark email as inactive

// Route to get emails by Admin ID
router.route('/admin/:adminId')
  .get(isAuthenticated, emailController.GetEmailsByAdminId);

// Route to get all active jobs
router.route('/active')
  .get(isAuthenticated, emailController.GetAllActiveJobs);

// Route for viewing all emails
router.route('/')
  .get(isAuthenticated, emailController.viewAllEmails);

// Route for deleting a specific email by ID
router.route('/delete/:id')
  .delete(isAuthenticated, emailController.deleteEmailById);

module.exports = router;
