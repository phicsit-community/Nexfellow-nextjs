const mongoose = require("mongoose");
require("dotenv").config();

const User = require("../models/userModel");
const Community = require("../models/communityModel");

async function syncAllCommunityMembers() {
  try {
    await mongoose.connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Connected to MongoDB");

    // Find all users who own a community
    const owners = await User.find({
      createdCommunity: { $exists: true, $ne: null },
    })
      .select("followers createdCommunity _id")
      .lean();

    console.log(`Found ${owners.length} community owners.`);

    let updatedCount = 0;

    for (const owner of owners) {
      if (!owner.createdCommunity) continue;

      // Followers as strings
      const followers = (owner.followers || []).map((id) => id.toString());

      // Include the owner themselves
      const memberSet = new Set([...followers, owner._id.toString()]);

      // Update the community members array
      const updatedCommunity = await Community.findByIdAndUpdate(
        owner.createdCommunity,
        { members: Array.from(memberSet) },
        { new: true }
      );

      if (updatedCommunity) {
        updatedCount++;
        console.log(
          `Updated members for community ${owner.createdCommunity} (Owner: ${owner._id})`
        );
      } else {
        console.warn(
          `Community not found for owner: ${owner._id} (community id: ${owner.createdCommunity})`
        );
      }
    }

    console.log(
      `Synchronization complete. Updated ${updatedCount} communities.`
    );

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("Error during synchronization:", error);
    process.exit(1);
  }
}

// Run immediately if script called directly
if (require.main === module) {
  syncAllCommunityMembers();
}

module.exports = { syncAllCommunityMembers };
