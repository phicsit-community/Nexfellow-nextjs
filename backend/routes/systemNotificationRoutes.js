const express = require("express");
const router = express.Router();
const SystemNotificationController = require("../controllers/systemNotificationController");
const { isAdmin, isClient } = require("../middleware");

// Send system notification (Admin only)
router.post(
  "/send",
  isAdmin,
  SystemNotificationController.sendSystemNotification
);

// Get system notifications for the logged-in user
router.get("/", isClient, SystemNotificationController.getSystemNotifications);

// Mark a system notification as read
router.patch(
  "/:notificationId/read",
  isClient,
  SystemNotificationController.markSystemNotificationAsRead
);

// Delete a system notification (Admin only)
router.delete(
  "/:notificationId",
  isAdmin,
  SystemNotificationController.deleteSystemNotification
);

// Get a system notification by ID
router.get(
  "/:notificationId",
  isClient,
  SystemNotificationController.getSystemNotificationById
);

// Bulk mark all notifications as read (for user)
router.post(
  "/read/all",
  isClient,
  SystemNotificationController.markAllNotificationsAsRead
);

// Bulk delete all notifications for user
router.delete(
  "/delete/all",
  isClient,
  SystemNotificationController.deleteAllNotifications
);

// Single delete notification for user (removes user from recipients array)
router.delete(
  "/:notificationId/user",
  isClient,
  SystemNotificationController.deleteNotification
);

module.exports = router;
