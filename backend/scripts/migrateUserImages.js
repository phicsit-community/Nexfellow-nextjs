require("dotenv").config();
const mongoose = require("mongoose");

mongoose
  .connect(process.env.DB_URL)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

const User = require("../models/userModel");

const OLD_PROFILE_URL =
  "https://nexfellow.b-cdn.net/uploads/default-profile.png";
const NEW_PROFILE_URL =
  "https://nexfellow.b-cdn.net/defaults/default-profile.png";
const OLD_BANNER_URL = 
  "https://nexfellow.b-cdn.net/uploads/default-banner.png";
const NEW_BANNER_URL =
  "https://nexfellow.b-cdn.net/defaults/default-banner.png";

async function migrateUserImages() {
  try {
    // Find users with old profile or banner URLs
    const users = await User.find({
      $or: [{ picture: OLD_PROFILE_URL }, { banner: OLD_BANNER_URL }],
    });

    if (users.length === 0) {
      console.log("No users found with old image URLs.");
      return;
    }

    // Update each user
    for (const user of users) {
      const updates = {};
      if (user.picture === OLD_PROFILE_URL) {
        updates.picture = NEW_PROFILE_URL;
      }
      if (user.banner === OLD_BANNER_URL) {
        updates.banner = NEW_BANNER_URL;
      }

      // Only update if there are changes
      if (Object.keys(updates).length > 0) {
        await User.updateOne({ _id: user._id }, { $set: updates });
        console.log(`Updated user ${user._id}:`, updates);
      }
    }

    console.log("Migration completed successfully.");
  } catch (error) {
    console.error("Migration error:", error.message);
  } finally {
    mongoose.disconnect();
  }
}

migrateUserImages();
