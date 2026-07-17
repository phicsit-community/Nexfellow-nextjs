const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/Payments");
const { isAuthenticated } = require("../middleware");
const catchAsync = require("../utils/CatchAsync");

// Authenticated: creates a Dodo hosted checkout session.
// Returns { checkoutUrl } for the frontend to redirect the user.
router.post("/checkout", isAuthenticated, catchAsync(paymentController.createCheckoutSession));

// Authenticated: creates a Dodo hosted customer portal session so the user
// can manage or cancel their subscription.
router.post("/portal", isAuthenticated, catchAsync(paymentController.createPortalSession));

// Unauthenticated: Dodo calls this directly with a signed webhook event.
// Signature verification is done inside the controller.
router.post("/webhook", catchAsync(paymentController.handleWebhook));

module.exports = router;
