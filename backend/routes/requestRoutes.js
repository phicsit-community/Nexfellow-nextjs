const express = require("express");
const {
  createRequest,
  getAllRequests,
  getRequestById,
  updateRequest,
  deleteRequest,
  approveVerifyRequest,
  rejectVerifyRequest,
  getVerificationStatus,
} = require("../controllers/requestController");
const { isAdmin } = require("../middleware.js");
const catchAsync = require("../utils/CatchAsync");

const router = express.Router();

// POST /requests - Create a new request
router.post("/", catchAsync(createRequest));

// GET /requests - Get all requests
router.get("/", isAdmin, catchAsync(getAllRequests));

// GET /requests/:id - Get a single request by ID
router.get("/:id", isAdmin, catchAsync(getRequestById));

// PUT /requests/:id - Update a request by ID
router.put("/:id", isAdmin, catchAsync(updateRequest));

// DELETE /requests/:id - Delete a request by ID
router.delete("/:id", isAdmin, catchAsync(deleteRequest));

// PUT /requests/:id/approve - Approve a request
router.put("/:id/approve", isAdmin, catchAsync(approveVerifyRequest));

// PUT /requests/:id/reject - Reject a request
router.put("/:id/reject", isAdmin, catchAsync(rejectVerifyRequest));

router.get("/status/:userId", getVerificationStatus);

module.exports = router;
