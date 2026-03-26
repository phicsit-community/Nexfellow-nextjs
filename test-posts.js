const mongoose = require("mongoose");
const Post = require("./backend/models/postModel.js");
require("dotenv").config({ path: "./backend/.env" });

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const posts = await Post.find().sort({ createdAt: -1 }).limit(5).populate("author community");
  console.log("Total Posts:", await Post.countDocuments());
  console.log("Posts populated:");
  posts.forEach(p => {
    console.log(p._id, "Author:", p.author ? p.author.name : null, "Community:", p.community ? p.community.name : null);
  });
  console.log("\nAggregation check:");
  const agg = await Post.aggregate([
    { $limit: 5 },
    { $lookup: { from: "users", localField: "author", foreignField: "_id", as: "author" } },
    { $unwind: "$author" }
  ]);
  console.log("Agg results:", agg.length);
  process.exit(0);
}
run();
