const mongoose = require("mongoose");
require("dotenv").config();
const Community = require("../models/communityModel"); // Adjust the path to your Community model
const User = require("../models/userModel"); // Adjust the path to your User model
const dbURL = process.env.DB_URL;

// Connect to the database
async function connectDB() {
  try {
    await mongoose.connect(dbURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to the database");
  } catch (error) {
    console.error("Database connection error:", error.message);
    process.exit(1);
  }
}

// Sync profilePic for all communities
async function syncProfilePics() {
  try {
    const communities = await Community.find(); // Fetch all communities
    let updatedCount = 0;

    for (const community of communities) {
      const owner = await User.findById(community.owner);

      if (!owner) {
        console.log(`Owner not found for community: ${community._id}`);
        continue;
      }

      if (owner.picture) {
        // Log current state for debugging
        console.log(`Checking community ${community._id}:`);
        console.log(`  Current community profilePic: ${community.profilePic}`);
        console.log(`  Owner's picture: ${owner.picture}`);

        // Update community profilePic if it's different
        if (community.profilePic !== owner.picture) {
          community.profilePic = owner.picture;
          await community.save();
          updatedCount++;
          console.log(`  Updated profilePic for community ${community._id}`);
        }
      } else {
        console.log(`No picture found for owner ${owner._id}`);
      }
    }

    console.log(`Successfully synced ${updatedCount} communities.`);
  } catch (error) {
    console.error("Error syncing profile pics:", error.message);
  } finally {
    mongoose.connection.close(); // Close the database connection
  }
}

// Run the script
(async function main() {
  await connectDB();
  await syncProfilePics();
})();
