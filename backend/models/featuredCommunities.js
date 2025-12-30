const mongoose = require("mongoose");

const featuredCommunitiesSchema = new mongoose.Schema({
  key: {
    type: String,
    default: "explore_all",
    unique: true,
  },
  communityIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Community",
    },
  ],
});

module.exports = mongoose.model(
  "FeaturedCommunities",
  featuredCommunitiesSchema
);
