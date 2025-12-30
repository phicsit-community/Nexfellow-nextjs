const Request = require("../models/Request");
const User = require("../models/userModel");
const { getIo } = require("../utils/websocket");
const Community = require("../models/communityModel");
const NotificationService = require("../utils/notificationService");
const getPlatformAdminId = require("../utils/getPlatformAdminId");

// Create a new request
const createRequest = async (req, res) => {
  try {
    const {
      action,
      userId,
      message,
      communityName,
      description,
      email,
      accountType,
      socialMediaLink,
      category,
    } = req.body;

    const newRequest = new Request({
      action,
      userId,
      message,
      communityName,
      description,
      email,
      accountType,
      socialMediaLink,
      category,
    });

    const savedRequest = await newRequest.save();

    const adminId = await getPlatformAdminId();

    // Notify user
    await NotificationService.createAndSendNotification({
      title: "Request Submitted",
      message: "Your request has been submitted and is under review.",
      senderId: adminId || null,
      senderModel: "Admin",
      recipients: [userId],
      type: "system",
      priority: "normal",
    });

    res.status(201).json(savedRequest);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all requests (for listing)
const getAllRequests = async (req, res) => {
  try {
    const requests = await Request.find()
      .populate("userId")
      .sort({ createdAt: -1 });
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single request by ID (for detailed view)
const getRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await Request.findById(id)
      .populate("userId")
      .populate("community");

    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    res.status(200).json(request);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a request
const updateRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedRequest = await Request.findByIdAndUpdate(id, updates, {
      new: true,
    });

    if (!updatedRequest) {
      return res.status(404).json({ error: "Request not found" });
    }

    // Notify user
    await NotificationService.createAndSendNotification({
      title: "Request Updated",
      message: "Your request has been updated.",
      senderId: req.adminId || null,
      senderModel: "Admin",
      recipients: [updatedRequest.userId],
      type: "system",
      priority: "normal",
    });

    res.status(200).json(updatedRequest);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a request
const deleteRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedRequest = await Request.findByIdAndDelete(id);

    if (!deletedRequest) {
      return res.status(404).json({ error: "Request not found" });
    }

    // Notify user
    await NotificationService.createAndSendNotification({
      title: "Request Deleted",
      message: "Your request has been deleted.",
      senderId: req.adminId || null,
      senderModel: "Admin",
      recipients: [deletedRequest.userId],
      type: "system",
      priority: "normal",
    });

    res.status(200).json({ message: "Request deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Approve and verify request
const approveVerifyRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await Request.findById(id);

    if (!request) {
      return res
        .status(404)
        .json({ success: false, message: "Request not found" });
    }

    // Fetch user with profile populated to access bio
    const user = await User.findById(request.userId).populate("profile");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (user.createdCommunity) {
      return res.status(400).json({
        success: false,
        message: "User already owns a community.",
      });
    }

    let { communityName, category, accountType } = request;
    if (!communityName || !category || !accountType) {
      return res.status(400).json({
        success: false,
        message: "Incomplete community details in request.",
      });
    }

    if (communityName !== user.name) {
      user.name = communityName;
      await user.save();
    }

    const profileDescription = user.profile?.bio || "";

    const newCommunity = new Community({
      name: communityName,
      category: [category],
      owner: user._id,
      accountType,
      description: profileDescription || "No description provided",
    });

    const savedCommunity = await newCommunity.save();

    user.createdCommunity = savedCommunity._id;
    user.isCommunityAccount = true;

    if (accountType === "Individual") {
      user.verificationBadge = true;
      user.communityBadge = false;
    } else if (accountType === "Organization") {
      user.verificationBadge = false;
      user.communityBadge = true;
    }

    await user.save();

    request.status = "Approved";
    await request.save();

    await NotificationService.createAndSendNotification({
      title: "Request Approved",
      message:
        "Your request has been approved and your community has been created!",
      senderId: req.adminId || null,
      senderModel: "Admin",
      recipients: [user._id],
      type: "system",
      priority: "high",
    });

    res.status(200).json({
      success: true,
      message: "Request approved and community created successfully!",
      request,
      community: savedCommunity,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Reject a request (reverts approval action)
const rejectVerifyRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await Request.findById(id);

    if (!request) {
      return res
        .status(404)
        .json({ success: false, message: "Request not found" });
    }

    const user = await User.findById(request.userId);
    if (user) {
      if (user.createdCommunity) {
        const community = await Community.findById(user.createdCommunity);

        if (community) {
          await Community.findByIdAndDelete(user.createdCommunity);
        }

        user.createdCommunity = null;
      }

      user.isCommunityAccount = false;
      user.verificationBadge = false;
      user.communityBadge = false;

      if (request.communityName !== user.name) {
        user.name = request.name || user.name;
      }

      await user.save();
    }

    request.status = "Rejected";
    await request.save();

    // Notify user
    await NotificationService.createAndSendNotification({
      title: "Request Rejected",
      message:
        "Your request has been rejected. Please review and try again if needed.",
      senderId: req.adminId || null,
      senderModel: "Admin",
      recipients: [request.userId],
      type: "system",
      priority: "high",
    });

    res.status(200).json({
      success: true,
      message: "Request rejected successfully, user reverted",
      request,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const getVerificationStatus = async (req, res) => {
  try {
    const { userId } = req.params;

    const request = await Request.findOne({ userId });

    if (!request) {
      return res
        .status(404)
        .json({ message: "No request found for this user" });
    }

    res.status(200).json({ status: request.status });
  } catch (error) {
    console.error("Error fetching verification status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  createRequest,
  getAllRequests,
  getRequestById,
  updateRequest,
  deleteRequest,
  approveVerifyRequest,
  rejectVerifyRequest,
  getVerificationStatus,
};
