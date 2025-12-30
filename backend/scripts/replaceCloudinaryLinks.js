require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/userModel"); // adjust path if needed

mongoose
  .connect(process.env.DB_URL)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// New Bunny CDN-hosted default images
const NEW_PROFILE_URL =
  "https://nexfellow.b-cdn.net/defaults/default-profile.png";
const NEW_BANNER_URL =
  "https://nexfellow.b-cdn.net/defaults/default-banner.png";

async function replaceCloudinaryLinks() {
  try {
    // Regex to match any Cloudinary URL
    const cloudinaryRegex = /^https:\/\/res\.cloudinary\.com\//;

    // Find users where either `picture` or `banner` is a Cloudinary URL
    const users = await User.find({
      $or: [
        { picture: { $regex: cloudinaryRegex } },
        { banner: { $regex: cloudinaryRegex } },
      ],
    });

    if (users.length === 0) {
      console.log("🎉 No users with Cloudinary URLs found.");
      return;
    }

    console.log(`🔍 Found ${users.length} user(s) with Cloudinary URLs.`);

    let updatedCount = 0;

    for (const user of users) {
      const updates = {};
      if (user.picture?.match(cloudinaryRegex))
        updates.picture = NEW_PROFILE_URL;
      if (user.banner?.match(cloudinaryRegex)) updates.banner = NEW_BANNER_URL;

      if (Object.keys(updates).length > 0) {
        await User.updateOne({ _id: user._id }, { $set: updates });
        console.log(`✅ Updated user ${user._id}`);
        updatedCount++;
      }
    }

    console.log(`\n🎯 Migration complete: ${updatedCount} user(s) updated.`);
  } catch (error) {
    console.error("🚨 Migration error:", error.message);
  } finally {
    mongoose.disconnect();
  }
}

replaceCloudinaryLinks();
