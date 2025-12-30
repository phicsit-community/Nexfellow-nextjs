const FeaturedCommunities = require("../models/featuredCommunities");
const Community = require("../models/communityModel");

// Admin: Set/update the featured communities list
module.exports.setFeaturedCommunities = async (req, res) => {
  try {
    const { communityIds } = req.body; // Array of ObjectIds
    if (!Array.isArray(communityIds)) {
      return res.status(400).json({ message: "communityIds must be an array" });
    }
    const doc = await FeaturedCommunities.findOneAndUpdate(
      { key: "explore_all" },
      { communityIds },
      { upsert: true, new: true }
    );
    res.json({ success: true, doc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Public: Get the featured communities list (ordered)
module.exports.getFeaturedCommunities = async (req, res) => {
  try {
    const doc = await FeaturedCommunities.findOne({ key: "explore_all" });
    if (!doc || !doc.communityIds.length) return res.json([]);

    // Fetch and populate communities
    const communities = await Community.find({
      _id: { $in: doc.communityIds },
    })
      .populate("owner")
      .populate("members", "username");

    const ordered = doc.communityIds
      .map((id) => communities.find((c) => c._id.toString() === id.toString()))
      .filter(Boolean);

    res.json(ordered);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
