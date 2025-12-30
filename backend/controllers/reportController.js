const Report = require("../models/reportModel");
const path = require("path");
const fs = require("fs");
const { uploadOnBunny, removeFromBunny } = require("../utils/attachments");

// Helper to extract Bunny storage path from CDN URL
const getBunnyStoragePath = (cdnUrl) => {
  try {
    const url = new URL(cdnUrl);
    return url.pathname.startsWith("/") ? url.pathname.slice(1) : url.pathname;
  } catch {
    return null;
  }
};

// Create a new report
exports.createReport = async (req, res) => {
  try {
    const { postId, authorId, category, description, type } = req.body;
    const reporterId = req.userId; // Current logged in user

    // Validate required fields based on report type
    if (!authorId || !category) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // For Post reports, postId is required
    if (type === "Post" && !postId) {
      return res
        .status(400)
        .json({ message: "Post ID is required for post reports" });
    }

    // Create new report object
    const reportData = {
      authorId,
      reporterId,
      category,
      description,
      type: type || "Post", // Default to Post if not specified
    };

    // Add postId if it exists (for Post type reports)
    if (postId) {
      reportData.postId = postId;
    }

    // Handle image uploads if any
    if (req.files && req.files.length > 0) {
      const imageUrls = [];

      for (const file of req.files) {
        // Write buffer to temp file for Bunny upload
        const tempFilePath = path.join(
          __dirname,
          "../public/temp",
          `${Date.now()}-${file.originalname}`
        );
        fs.writeFileSync(tempFilePath, file.buffer);

        // Upload to Bunny
        const bunnyResult = await uploadOnBunny(tempFilePath);

        if (bunnyResult && bunnyResult.url) {
          imageUrls.push(bunnyResult.url);
        }

        // Optionally, delete the temp file after upload
        try {
          if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
          }
        } catch (err) {
          console.error("Temp file cleanup error:", err.message);
        }
      }

      reportData.images = imageUrls;
    }

    // Create and save the report
    const report = new Report(reportData);
    await report.save();

    res.status(201).json({
      success: true,
      message: "Report submitted successfully",
      report,
    });
  } catch (error) {
    console.error("Error creating report:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit report",
      error: error.message,
    });
  }
};

// Get all reports (for admin)
exports.getAllReports = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Filter parameters
    const status = req.query.status;
    const category = req.query.category;

    // Prepare filter object
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;

    // Get reports with pagination
    const reports = await Report.find(filter)
      .populate("postId", "content createdAt")
      .populate("authorId", "name username picture")
      .populate("reporterId", "name username picture")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const totalReports = await Report.countDocuments(filter);

    res.status(200).json({
      success: true,
      reports,
      pagination: {
        totalReports,
        totalPages: Math.ceil(totalReports / limit),
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch reports",
      error: error.message,
    });
  }
};

// Get a single report by ID
exports.getReportById = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    const reportId = req.params.id;

    const report = await Report.findById(reportId)
      .populate("postId", "content createdAt")
      .populate("authorId", "name username picture")
      .populate("reporterId", "name username picture")
      .populate("reviewedBy", "name username");

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    res.status(200).json({
      success: true,
      report,
    });
  } catch (error) {
    console.error("Error fetching report:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch report",
      error: error.message,
    });
  }
};

// Update report status (for admin)
exports.updateReportStatus = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    const reportId = req.params.id;
    const { status, reviewNotes } = req.body;

    // Validate the status
    const validStatuses = ["pending", "reviewed", "resolved", "dismissed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid report status",
      });
    }

    // Find and update the report
    const report = await Report.findByIdAndUpdate(
      reportId,
      {
        status,
        reviewNotes,
        reviewedBy: req.user._id,
        reviewedAt: new Date(),
      },
      { new: true }
    );

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Report status updated successfully",
      report,
    });
  } catch (error) {
    console.error("Error updating report status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update report status",
      error: error.message,
    });
  }
};

// Get reports by user (reports made by the user)
exports.getReportsByUser = async (req, res) => {
  try {
    const userId = req.user._id;

    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get reports by user
    const reports = await Report.find({ reporterId: userId })
      .populate("postId", "content createdAt")
      .populate("authorId", "name username picture")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const totalReports = await Report.countDocuments({ reporterId: userId });

    res.status(200).json({
      success: true,
      reports,
      pagination: {
        totalReports,
        totalPages: Math.ceil(totalReports / limit),
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    console.error("Error fetching user reports:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user reports",
      error: error.message,
    });
  }
};

// Report a user
exports.reportUser = async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    const { category, description } = req.body;
    const reporterId = req.userId; // Current logged in user

    // Validate required fields
    if (!targetUserId || !category) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Create new report object
    const reportData = {
      authorId: targetUserId, // The user being reported
      reporterId,
      category,
      description,
      type: "Account", // User report type
    };

    // Handle image uploads if any
    if (req.files && req.files.length > 0) {
      const imageUrls = [];

      for (const file of req.files) {
        const tempFilePath = path.join(
          __dirname,
          "../public/temp",
          `${Date.now()}-${file.originalname}`
        );
        fs.writeFileSync(tempFilePath, file.buffer);

        // Upload to Bunny
        const bunnyResult = await uploadOnBunny(tempFilePath);

        if (bunnyResult && bunnyResult.url) {
          imageUrls.push(bunnyResult.url);
        }

        // Clean up temp file
        try {
          if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
          }
        } catch (err) {
          console.error("Temp file cleanup error:", err.message);
        }
      }

      reportData.images = imageUrls;
    }

    // Create and save the report
    const report = new Report(reportData);
    await report.save();

    res.status(201).json({
      success: true,
      message: "User reported successfully",
      report,
    });
  } catch (error) {
    console.error("Error reporting user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to report user",
      error: error.message,
    });
  }
};
