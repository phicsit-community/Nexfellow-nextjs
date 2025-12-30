const mongoose = require("mongoose");
const User = require("../models/userModel");

async function cleanFollowedCommunities() {
  try {
    await mongoose.connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Cleaning started...");

    // Step 1: Clear followedCommunities for all users
    await User.updateMany({}, { $set: { followedCommunities: [] } });
    console.log("Cleared followedCommunities for all users.");

    // Step 2: Process users who have followings
    const users = await User.find({ following: { $exists: true, $ne: [] } });

    for (const user of users) {
      let newFollowedCommunities = [];

      console.log(`Processing user: ${user.name} (${user.username})`);

      for (const followedId of user.following) {
        const followedUser = await User.findOne({
          _id: followedId,
          isCommunityAccount: true,
          createdCommunity: { $ne: null },
        }).select("createdCommunity name username");

        if (followedUser) {
          newFollowedCommunities.push(followedUser.createdCommunity);
          console.log(
            `✅ ${user.name} now follows community from ${followedUser.name} (${followedUser.username})`
          );
        }
      }

      await User.updateOne(
        { _id: user._id },
        { $set: { followedCommunities: newFollowedCommunities } }
      );

      console.log(
        `Updated followedCommunities for ${user.name} (${user.username})`
      );
    }

    console.log("Data cleaning completed.");
  } catch (error) {
    console.error("Error during cleaning:", error);
  } finally {
    mongoose.connection.close();
  }
}

cleanFollowedCommunities();

// const mongoose = require("mongoose");
// const Like = require("./models/likeModel");
// const Post = require("./models/postModel");
// const User = require("./models/userModel");

// async function cleanInvalidLikesAndUpdateCounts() {
//   try {
//     await mongoose.connect(
//       "mongodb+srv://kartikaggarwal2004:RAEWTmu3lAmm5anV@cluster0.qaycstr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
//     );
//     console.log("🔍 Connected to database.\n");

//     // STEP 1: Delete likes with non-existent users
//     const likes = await Like.find().populate("user", "_id");
//     let deletedLikes = 0;
//     for (const like of likes) {
//       if (!like.user) {
//         await Like.deleteOne({ _id: like._id });
//         deletedLikes++;
//         console.log(`❌ Deleted like ${like._id} (invalid user)`);
//       }
//     }
//     console.log(`\n✅ Deleted ${deletedLikes} likes with invalid users.\n`);

//     // STEP 2: Remove duplicate likes (same user liking same post multiple times)
//     const allLikes = await Like.find({}, "user post").lean();
//     const likeMap = new Map();
//     let duplicateDeleted = 0;

//     for (const like of allLikes) {
//       const key = `${like.user}_${like.post}`;
//       if (!likeMap.has(key)) {
//         likeMap.set(key, like._id);
//       } else {
//         await Like.deleteOne({ _id: like._id });
//         duplicateDeleted++;
//         console.log(`❌ Deleted duplicate like ${like._id}`);
//       }
//     }
//     console.log(`\n✅ Deleted ${duplicateDeleted} duplicate likes.\n`);

//     // STEP 3: Correct likeCount for ALL posts
//     console.log("🔄 Verifying and fixing likeCount for all posts...\n");

//     const posts = await Post.find();
//     for (const post of posts) {
//       const realCount = await Like.countDocuments({ post: post._id });
//       if (post.likeCount !== realCount) {
//         console.log(
//           `🛠️ Fixing likeCount for post ${post._id}: was ${post.likeCount}, now ${realCount}`
//         );
//         await Post.updateOne({ _id: post._id }, { likeCount: realCount });
//       }
//     }

//     console.log("\n✅ Like count verification and update completed.");
//   } catch (err) {
//     console.error("❌ Error:", err);
//   } finally {
//     mongoose.connection.close();
//   }
// }

// cleanInvalidLikesAndUpdateCounts();
