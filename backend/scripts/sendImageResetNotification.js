require("dotenv").config();
const mongoose = require("mongoose");
const NotificationService = require("../utils/notificationService");
const Admin = require("../models/adminModel");

// Hardcoded admin credentials
const ADMIN_EMAIL = "phicsit.community@gmail.com";
const ADMIN_PASSWORD = "Phicsit@admin#Nexfellow1234";

const bcrypt = require("bcryptjs");

const USERS = ["66dc86572764539c931f95fa", "68008d1ad9cedab47442b317"];

const notificationPayload = {
  title: "Profile Image and Banner Update",
  message: `Dear User,

We recently experienced an internal server issue that temporarily affected profile and banner image visibility across the platform. As part of the resolution, all user images were reverted to default for stability and consistency.

The issue has now been resolved, and you can re-upload your profile and banner images at your convenience.

We sincerely apologize for the inconvenience caused and appreciate your understanding and cooperation.

– Team Nexfellow (Developer's Desk)`,
  recipients: USERS,
};

const start = async () => {
  try {
    console.log("⏳ Connecting to MongoDB...");
    await mongoose.connect(process.env.DB_URL);
    console.log("✅ MongoDB connected successfully");

    // Authenticate Admin
    console.log("🔐 Logging in with admin credentials...");
    const admin = await Admin.findOne({ email: ADMIN_EMAIL.toLowerCase() });
    if (!admin || !bcrypt.compareSync(ADMIN_PASSWORD, admin.password)) {
      throw new Error("❌ Invalid admin credentials");
    }

    console.log("🛡️ Admin authenticated. Admin ID:", admin._id.toString());

    // Send notification
    console.log("📨 Sending system notification to users...");
    const result = await NotificationService.createAndSendNotification({
      ...notificationPayload,
      senderId: admin._id,
      type: "system",
      priority: "high",
    });

    console.log("✅ Notification sent successfully:", result._id.toString());
    process.exit(0);
  } catch (err) {
    console.error("❌ Script failed:", err.message);
    process.exit(1);
  }
};

start();
