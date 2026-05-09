const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/Payments");
const { isAuthenticated } = require("../middleware");

// Authenticated: creates a Dodo hosted checkout session.
// Returns { checkoutUrl } for the frontend to redirect the user.
router.post("/checkout", isAuthenticated, paymentController.createCheckoutSession);

// Unauthenticated: Dodo calls this directly with a signed webhook event.
// Signature verification is done inside the controller.
router.post("/webhook", paymentController.handleWebhook);

module.exports = router;
