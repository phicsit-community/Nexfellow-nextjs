const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");
const {
  isClient,
  isOwnerOrModeratorWithRole,
  setUserIfLoggedIn,
  upload,
} = require("../middleware.js");
const catchAsync = require("../utils/CatchAsync");

// Create an event (Only creator and moderator)
router.post(
  "/create/:communityId",
  isClient,
  isOwnerOrModeratorWithRole(["event-admin"]),
  upload.single("image"),
  catchAsync(eventController.createEvent)
);

// Get all events (Public)
router.get("/all", catchAsync(eventController.getAllEvents));

// Get a specific event by ID (Public)
router.get(
  "/details/:eventId",
  setUserIfLoggedIn,
  catchAsync(eventController.getEventById)
);

// Get a specific event by ID (Public)
router.get(
  "/details/slug/:eventId",
  setUserIfLoggedIn,
  catchAsync(eventController.getEventById)
);

// Get events for a specific community (Public)
router.get(
  "/community/:communityId",
  catchAsync(eventController.getEventsByCommunity)
);

router.get(
  "/community/:communityId/registrants",
  catchAsync(eventController.getRecentEventRegistrantsForCommunity)
);

// Update an event (Only creator or moderator)
router.put(
  "/update/:eventId",
  isClient,
  isOwnerOrModeratorWithRole(["event-admin"]),
  upload.single("image"),
  catchAsync(eventController.updateEvent)
);

// Delete an event (Only creator or moderator)
router.delete(
  "/delete/:eventId",
  isClient,
  isOwnerOrModeratorWithRole(["event-admin"]),
  catchAsync(eventController.deleteEvent)
);

// ===== NEW ROUTES for registration =====

// Register for an event (Only logged in client)
router.post(
  "/register/:eventId",
  isClient,
  catchAsync(eventController.registerForEvent)
);

// Unregister from an event (Only logged in client)
router.post(
  "/unregister/:eventId",
  isClient,
  catchAsync(eventController.unregisterFromEvent)
);

module.exports = router;
