const Community = require("../models/community");
const User = require("../models/userModel");

const authorizeRoles = (allowedRoles = []) => {
  return async (req, res, next) => {
    try {
      const communityId = req.params.communityId;

      if (!communityId) {
        return res
          .status(400)
          .json({ message: "Community ID is required in params" });
      }

      const community = await Community.findById(communityId);
      if (!community) {
        return res.status(404).json({ message: "Community not found" });
      }

      const userId = req.user._id.toString();

      // Check if user is the creator
      if (community.owner.toString() === userId) {
        req.userRole = "creator";
        req.communityId = communityId;
        return next();
      }

      // Check communityRoles in user document
      const user = await User.findById(userId).select("communityRoles");

      const roleEntry = user.communityRoles.find(
        (entry) => entry.communityId.toString() === communityId
      );

      if (roleEntry && allowedRoles.includes(roleEntry.role)) {
        req.userRole = roleEntry.role;
        req.communityId = communityId;
        return next();
      }

      return res
        .status(403)
        .json({ message: "Not authorized for this community" });
    } catch (error) {
      console.error("Authorization error:", error);
      return res
        .status(500)
        .json({ message: "Server error during role check" });
    }
  };
};

module.exports = authorizeRoles;
