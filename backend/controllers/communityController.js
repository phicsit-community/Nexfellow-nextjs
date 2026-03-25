const Community = require("../models/communityModel");
const ExpressError = require("../utils/ExpressError");
const User = require("../models/userModel");
const Forum = require("../models/forumModel");
const Post = require("../models/postModel");
const fs = require("fs");
const path = require("path");
const { getIo } = require("../utils/websocket");
const mongoose = require("mongoose");
const uploadAttachments = require("../utils/attachments");
const NotificationService = require("../utils/notificationService");
const { ROLE_OPTIONS } = require("../constants/roles");

// Create a new community
module.exports.createCommunity = async (req, res) => {
  try {
    const { name, description, category } = req.body;
    const ownerId = req.userId;

    const user = await User.findById(ownerId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.createdCommunity) {
      return res.status(400).json({
        message: "User already owns a community.",
      });
    }

    if (name && name !== user.name) {
      user.name = name;
      await user.save();
    }

    const newCommunity = new Community({
      description,
      category,
      owner: ownerId,
      // appraisals,
    });

    const savedCommunity = await newCommunity.save();

    user.createdCommunity = savedCommunity._id;
    await user.save();

    res.status(201).json({
      message: "Community created successfully!",
      community: savedCommunity,
    });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error creating community: " + error.message });
  }
};

// Get all communities
module.exports.getAllCommunities = async (req, res) => {
  // console.log("GET /community/admin hit by:", req.user?.email);
  try {
    const communities = await Community.find({ isDeleted: false }).populate(
      "owner"
    );

    if (!communities || communities.length === 0) {
      return res.status(404).json({ message: "No communities found." });
    }

    res.status(200).json(communities);
  } catch (error) {
    const statusCode = error.kind === "ObjectId" ? 400 : 500;
    const errorMessage = error.message.includes("not found")
      ? "Community not found."
      : "Error fetching communities.";
    res
      .status(statusCode)
      .json({ message: errorMessage, error: error.message });
  }
};

module.exports.getCommunityByUsername = async (req, res) => {
  const { username } = req.params;

  try {
    // Find the user by username and get their createdCommunity field
    const user = await User.findOne({ username }).select("createdCommunity");

    if (!user || !user.createdCommunity) {
      return res.status(404).json({ message: "User or community not found!" });
    }

    const communityId = user.createdCommunity;

    // Find the community by ID and populate the necessary fields
    const community = await Community.findById(communityId).populate([
      { path: "posts", select: "title content createdAt" },
      { path: "owner" },
      { path: "moderators" },
      { path: "members" },
      {
        path: "owner",
        populate: { path: "followers" },
      },
    ]);

    if (!community) {
      return res.status(404).json({ message: "Community not found!" });
    }

    if (community.isDeleted) {
      return res
        .status(410)
        .json({ message: "This community has been deleted." });
    }

    if (!community.pageViews) {
      community.pageViews = [];
    }

    community.pageViews.push({ timestamp: new Date() });
    await community.save();
    // Convert the Mongoose document to a plain object and add member count
    const communityData = community.toObject();
    communityData.membercount = community.members.length;

    res.status(200).json(communityData);
  } catch (error) {
    if (error instanceof mongoose.CastError) {
      return res.status(400).json({ message: "Invalid community ID format." });
    }

    res
      .status(error.statusCode || 500)
      .json({ message: "Error fetching community: " + error.message });
  }
};

// Get a community by ID
module.exports.getCommunityById = async (req, res) => {
  const { communityId } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(communityId)) {
      return res.status(400).json({ message: "Invalid community ID format." });
    }

    const community = await Community.findById(communityId).populate([
      { path: "posts", select: "title content createdAt" },
      { path: "owner" },
      { path: "moderators" },
      {
        path: "owner",
        populate: {
          path: "followers",
          populate: {
            path: "createdCommunity",
            select: "name accountType isDeleted",
          },
        },
      },
    ]);

    if (!community) {
      throw new ExpressError("Community not found!", 404);
    }

    const memberIds = community.owner?.followers || [];

    if (community.isDeleted) {
      throw new ExpressError("This community has been deleted.", 410);
    }

    res.status(200).json({ community });
  } catch (error) {
    if (error instanceof mongoose.CastError) {
      return res.status(400).json({ message: "Invalid community ID format." });
    }

    res
      .status(error.statusCode || 500)
      .json({ message: "Error fetching community: " + error.message });
  }
};

// Update a community by ID
module.exports.updateCommunity = async (req, res) => {
  try {
    const { name, description, category, accountType } = req.body;

    const communityId = req.params.communityId;
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ message: "Community not found!" });
    }

    if (!community.owner.equals(userId)) {
      return res
        .status(403)
        .json({ message: "You are not authorized to update this community." });
    }

    user.name = name || user.name;
    community.description = description || community.description;
    community.category = category || community.category;
    community.accountType = accountType || community.accountType;

    await user.save();
    const updatedCommunity = await community.save();

    res.status(200).json({
      message: "Community updated successfully!",
      community: updatedCommunity,
    });
  } catch (error) {
    if (error instanceof mongoose.CastError) {
      return res.status(400).json({ message: "Invalid community ID format." });
    }

    res
      .status(error.statusCode || 500)
      .json({ message: "Error updating community: " + error.message });
  }
};

// Soft delete a community by ID
module.exports.deleteCommunity = async (req, res) => {
  try {
    const communityId = req.params.communityId;
    const userId = req.userId;

    const community = await Community.findById(communityId);
    if (!community) {
      throw new ExpressError("Community not found!", 404);
    }

    if (!community.owner.equals(userId)) {
      return res.status(403).json({
        message: "You do not have permission to delete this community.",
      });
    }

    community.deletedAt = new Date();
    community.isDeleted = true;
    await community.save();

    const deletedPosts = await Post.updateMany(
      { community: communityId },
      { deletedAt: new Date(), isDeleted: true }
    );

    console.log(
      `Community ${communityId} soft deleted with ${deletedPosts.n} posts affected.`
    );

    res.status(200).json({
      message: "Community soft deleted successfully!",
      deletedPosts: deletedPosts.n,
    });
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ message: "Error deleting community: " + error.message });
  }
};

// Toggle community membership (follow/unfollow)
module.exports.toggleCommunityMembership = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const communityId = req.params.communityId;
    const userId = req.userId;
    const { action } = req.body;
    const io = getIo();

    const community = await Community.findById(communityId);
    if (!community) {
      throw new ExpressError("Community not found", 404);
    }

    let message;
    if (action === "follow") {
      const isMember = community.members.includes(userId);
      if (!isMember) {
        community.members.push(userId);
        await community.save();

        const user = await User.findById(userId);
        if (!user) {
          return res.status(404).json({ message: "User not found." });
        }

        user.followedCommunities.push(communityId);
        await user.save();

        await session.commitTransaction();
        session.endSession();

        io.emit("joinCommmunity", communityId);
        message = "Successfully followed the community.";
      } else {
        await session.commitTransaction();
        session.endSession();
        return res
          .status(400)
          .json({ message: "User is already a member of this community." });
      }
    } else if (action === "unfollow") {
      const index = community.members.indexOf(userId);
      if (index !== -1) {
        community.members.splice(index, 1);
        await community.save();

        const user = await User.findById(userId);
        if (!user) {
          return res.status(404).json({ message: "User not found." });
        }

        const followedIndex = user.followedCommunities.indexOf(communityId);
        if (followedIndex !== -1) {
          user.followedCommunities.splice(followedIndex, 1);
          await user.save();
        }
        await session.commitTransaction();
        session.endSession();
        io.emit("leaveCommunity", communityId);
        message = "Successfully unfollowed the community.";
      } else {
        await session.commitTransaction();
        session.endSession();
        return res
          .status(400)
          .json({ message: "User is not a member of this community." });
      }
    } else {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Invalid action." });
    }

    res.status(200).json({ message });
  } catch (error) {
    res.status(500).json({
      message: "Error toggling community membership: " + error.message,
    });
  }
};

// Approve a community
module.exports.approveCommunity = async (req, res) => {
  try {
    const community = await Community.findById(req.params.communityId);
    if (!community) {
      throw new ExpressError("Community not found", 404);
    }

    community.isApproved = true;
    await community.save();
    res.status(200).json({ message: "Community approved successfully!" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error approving community: " + error.message });
  }
};

// Search communities
module.exports.searchCommunities = async (req, res) => {
  try {
    const { query } = req.query;
    const communities = await Community.find({
      name: { $regex: query, $options: "i" },
      isDeleted: false,
    });

    if (communities.length === 0) {
      return res
        .status(404)
        .json({ message: "No communities found matching your search." });
    }

    res.status(200).json(communities);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error searching communities: " + error.message });
  }
};

module.exports.toggleAppraisals = async (req, res) => {
  try {
    const { communityId } = req.params;
    const { userId } = req;

    // Find the community
    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    // Check if the userId exists in the appraisals list
    const index = community.appraisals.indexOf(userId);

    if (index === -1) {
      // Add the userId if not present
      community.appraisals.push(userId);
    } else {
      // Remove the userId if already present
      community.appraisals.splice(index, 1);
    }

    await community.save();

    return res.status(200).json({
      message:
        index === -1
          ? "User added to appraisals"
          : "User removed from appraisals",
      appraisals: community.appraisals,
    });
  } catch (error) {
    console.error("Error toggling appraisals:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
// Get communities for a specific user
module.exports.getUserCommunities = async (req, res) => {
  const { userId } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID format." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const ownedCommunity = await Community.findOne({
      owner: userId,
      isDeleted: false,
    });

    const moderatedCommunities = await Community.find({
      moderators: userId,
      isDeleted: false,
    });

    const joinedCommunities = await Community.find({
      members: userId,
      isDeleted: false,
    });

    res.status(200).json({
      ownedCommunity,
      moderatedCommunities,
      joinedCommunities,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching user communities: " + error.message });
  }
};

module.exports.editTopMembers = async (req, res) => {
  try {
    const { id: communityId } = req.params;
    const { topMembers } = req.body;

    if (!Array.isArray(topMembers) || topMembers.length > 5) {
      return res.status(400).json({
        message: "Top members list must contain up to 5 valid user IDs.",
      });
    }

    const validUsers = await User.find({ _id: { $in: topMembers } });
    if (validUsers.length !== topMembers.length) {
      return res.status(400).json({ message: "Some user IDs are invalid." });
    }

    const updatedCommunity = await Community.findByIdAndUpdate(
      communityId,
      { topMembers: topMembers },
      { new: true }
    );

    if (!updatedCommunity) {
      return res.status(404).json({ message: "Community not found." });
    }

    res.status(200).json({
      message: "Top members updated successfully.",
      topMembers: updatedCommunity.topMembers,
    });
  } catch (error) {
    console.error("Error updating top members:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

module.exports.getTopMembers = async (req, res) => {
  try {
    const { id: communityId } = req.params;

    const community = await Community.findById(communityId)
      .populate("topMembers")
      .select("topMembers");

    if (!community) {
      return res.status(404).json({ message: "Community not found." });
    }

    res.status(200).json({
      message: "Top members retrieved successfully.",
      topMembers: community.topMembers,
    });
  } catch (error) {
    console.error("Error retrieving top members:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

exports.getUsersWithRoles = async (req, res) => {
  try {
    const { userIds, communityId } = req.body;
    if (!userIds || !Array.isArray(userIds) || !communityId) {
      return res
        .status(400)
        .json({ message: "userIds and communityId are required" });
    }

    const users = await User.find({ _id: { $in: userIds } }).select(
      "_id name username picture createdCommunity communityRoles"
    );

    const owner = users.find(
      (u) => String(u.createdCommunity) === String(communityId)
    );

    const otherUsers = users
      .filter((u) => String(u.createdCommunity) !== String(communityId))
      .map((u) => {
        const roleObj = u.communityRoles.find(
          (r) => String(r.communityId) === String(communityId)
        );
        return {
          ...u.toObject(),
          role: roleObj ? roleObj.role : "member",
        };
      });

    res.status(200).json({
      owner: owner || null,
      users: otherUsers,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

function addOrUpdateModerator(community, userId, role) {
  const idx = community.moderators.findIndex(
    (mod) => String(mod.user) === String(userId)
  );
  if (idx >= 0) {
    community.moderators[idx].role = role;
  } else {
    community.moderators.push({ user: userId, role });
  }
}

exports.editRole = async (req, res) => {
  const { userId, role, communityId } = req.body;
  const validRoles = [
    "member",
    "moderator",
    "content-admin",
    "event-admin",
    "analyst",
  ];

  if (!userId || !role || !communityId || !validRoles.includes(role)) {
    return res
      .status(400)
      .json({ message: "User ID, role, and valid communityId are required" });
  }

  try {
    const user = await User.findById(userId);
    const community = await Community.findById(communityId).populate(
      "owner",
      "username name picture"
    );
    if (!user || !community) {
      return res.status(404).json({ message: "User or Community not found" });
    }

    if (String(user.createdCommunity) === String(communityId)) {
      return res.status(403).json({ message: "Cannot change creator's role" });
    }

    const existingRoleObj = user.communityRoles.find(
      (r) => String(r.communityId) === String(communityId)
    );
    const oldRole = existingRoleObj ? existingRoleObj.role : "member";

    if (existingRoleObj) {
      existingRoleObj.role = role;
    } else {
      user.communityRoles.push({ communityId, role });
    }

    if (
      ["moderator", "content-admin", "event-admin", "analyst"].includes(role)
    ) {
      addOrUpdateModerator(community, userId, role);
    } else {
      community.moderators = community.moderators.filter(
        (mod) => String(mod.user) !== String(userId)
      );
    }

    if (!community.members.includes(userId)) {
      community.members.push(userId);
    }
    if (!user.followedCommunities.includes(communityId)) {
      user.followedCommunities.push(communityId);
    }

    await user.save();
    await community.save();

    const getRoleLabel = (roleKey) => {
      const option = ROLE_OPTIONS.find(
        (r) => r.value.toLowerCase() === roleKey.toLowerCase()
      );
      return option ? option.label : roleKey;
    };

    let notificationMessage = null;
    const communityLink = `<a href="${process.env.SITE_URL}/community/${community?.owner?.username}" target="_blank" style="color: #007bff; text-decoration: underline;">${community.owner.username}</a>`;

    if (oldRole === "member" && role !== "member") {
      notificationMessage = `You have been added as a ${getRoleLabel(
        role
      )} in the community ${communityLink}.`;
    } else if (oldRole !== "member" && role === "member") {
      notificationMessage = `You have been removed from moderators and set as a Member in the community ${communityLink}.`;
    } else if (oldRole !== role && role !== "member") {
      notificationMessage = `Your moderator role has been changed to ${getRoleLabel(
        role
      )} in the community ${communityLink}.`;
    }

    if (notificationMessage) {
      await NotificationService.createAndSendNotification({
        title: "Community Role Update",
        message: notificationMessage,
        senderId: community.owner,
        senderModel: "User",
        recipients: [userId],
        communityId: communityId,
        type: "system",
        priority: "normal",
      });
    }

    return res.status(200).json({ message: "Role updated", userId, role });
  } catch (error) {
    console.error("Error updating role:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.transferOwnership = async (req, res) => {
  const { fromUserId, toUserId } = req.body;
  const { communityId } = req.params;

  if (!fromUserId || !toUserId || !communityId) {
    return res.status(400).json({ message: "Missing fields" });
  }

  try {
    const fromUser = await User.findById(fromUserId);
    const toUser = await User.findById(toUserId);
    const community = await Community.findById(communityId);

    if (!fromUser || !toUser || !community) {
      return res.status(404).json({ message: "User or Community not found" });
    }

    if (String(fromUser.createdCommunity) !== String(communityId)) {
      return res
        .status(403)
        .json({ message: "Only the creator can transfer ownership" });
    }

    // Transfer ownership
    fromUser.createdCommunity = null;
    toUser.createdCommunity = communityId;
    community.owner = toUserId;

    // Demote previous owner in user.communityRoles
    const fromRole = fromUser.communityRoles.find(
      (r) => String(r.communityId) === String(communityId)
    );
    if (fromRole) fromRole.role = "admin";
    else fromUser.communityRoles.push({ communityId, role: "admin" });

    // Promote new owner to creator
    const toRole = toUser.communityRoles.find(
      (r) => String(r.communityId) === String(communityId)
    );
    if (toRole) toRole.role = "creator";
    else toUser.communityRoles.push({ communityId, role: "creator" });

    // Update moderators in community
    // Remove old owner if present in moderators,
    // demote to admin if you wish, or remove completely
    community.moderators = community.moderators.filter(
      (mod) => String(mod.user) !== String(fromUserId)
    );
    // Add new owner as "creator" in moderators if needed
    addOrUpdateModerator(community, toUserId, "creator");

    await fromUser.save();
    await toUser.save();
    await community.save();

    return res.status(200).json({ message: "Ownership transferred" });
  } catch (error) {
    console.error("Transfer error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.getModerators = async (req, res) => {
  const { communityId } = req.params;
  if (!communityId)
    return res.status(400).json({ message: "communityId is required" });

  try {
    const community = await Community.findById(communityId)
      .populate("moderators.user", "name username picture")
      .lean();

    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    // Map to produce final array
    const moderators = community.moderators.map((mod) => ({
      _id: mod.user?._id || mod.user, // if not populated
      name: mod.user?.name || "",
      username: mod.user?.username || "",
      picture: mod.user?.picture || "",
      role: mod.role,
    }));

    res.status(200).json(moderators);
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getMyModeratedCommunities = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).lean();

    if (!user || !user.communityRoles) {
      return res.json({ communities: [] });
    }

    const roles = user.communityRoles.filter((role) => role.role !== "member");
    const communityIds = roles.map((role) => role.communityId);

    const communities = await Community.find({ _id: { $in: communityIds } })
      .select("link owner")
      .populate("owner", "name picture username")
      .lean();

    const result = communities.map((comm) => {
      const matchedRole = roles.find(
        (r) => r.communityId.toString() === comm._id.toString()
      );
      return {
        communityId: comm._id,
        link: comm.link,
        name: comm.owner?.name || "",
        picture: comm.owner?.picture || "",
        username: comm.owner?.username || "",
        owner: comm.owner?._id || "",
        role: matchedRole?.role || "member",
      };
    });

    return res.json({ communities: result });
  } catch (err) {
    return res.status(500).json({ message: "Server Error" });
  }
};

// Get followers count for a community
module.exports.getCommunityFollowers = async (req, res) => {
  try {
    const { communityId } = req.params;
    const community = await Community.findById(communityId).populate("members");

    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    res.json({ followers: community.members });
  } catch (error) {
    console.error("Error fetching community followers:", error);
    res.status(500).json({ message: "Error fetching followers count", error });
  }
};

module.exports.addOrUpdateLink = async (req, res) => {
  try {
    const { link } = req.body;
    const communityId = req.params.communityId;
    const userId = req.userId;

    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ message: "Community not found!" });
    }

    if (!community.owner.equals(userId)) {
      return res
        .status(403)
        .json({ message: "Unauthorized to update this community." });
    }

    if (community.link && process.env.ENFORCE_SINGLE_EDIT === "true") {
      return res
        .status(403)
        .json({ message: "Editing the link is not allowed again." });
    }

    community.link = link;
    await community.save();

    res.status(200).json({
      message: community.link
        ? "Link updated successfully!"
        : "Link added successfully!",
      link: community.link,
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating link: " + error.message });
  }
};

// Delete Link
module.exports.deleteLink = async (req, res) => {
  try {
    const communityId = req.params.communityId;
    const userId = req.userId;

    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ message: "Community not found!" });
    }

    if (!community.owner.equals(userId)) {
      return res
        .status(403)
        .json({ message: "Unauthorized to delete this link." });
    }

    community.link = null;
    await community.save();

    res.status(200).json({ message: "Link deleted successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting link: " + error.message });
  }
};

module.exports.checkFollowStatus = async (req, res) => {
  try {
    const { communityId } = req.params;
    const userId = req.user.id;

    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ message: "Community not found." });
    }

    const isFollowing = community.members.includes(userId);
    return res.status(200).json({ isFollowing });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
};

module.exports.getFeaturedMembers = async (req, res) => {
  try {
    const { communityId } = req.params;
    const userId = req.user.id;

    const community = await Community.findById(communityId).populate(
      "featuredMembers",
      "name username profilePic"
    );

    if (!community) {
      return res.status(404).json({ message: "Community not found." });
    }

    const isFollowing = community.members.includes(userId);
    return res
      .status(200)
      .json({ isFollowing, featuredMembers: community.featuredMembers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
};

function userIsContentAdminOrOwner(community, userId) {
  if (!community || !userId) return false;
  if (community.owner.equals(userId)) return true;

  const mod = community.moderators.find(
    (m) => String(m.user) === String(userId) && m.role === "content-admin"
  );
  return !!mod;
}

module.exports.pinPost = async (req, res) => {
  try {
    const { communityId, postId } = req.params;
    const userId = req.userId;

    // Validate IDs
    if (
      !mongoose.Types.ObjectId.isValid(communityId) ||
      !mongoose.Types.ObjectId.isValid(postId)
    ) {
      return res.status(400).json({ message: "Invalid communityId or postId" });
    }

    // Find the community with owner and moderators populated
    const community = await Community.findById(communityId)
      .populate("owner")
      .populate("moderators")
      .exec();

    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    // Authorization check
    if (!userIsContentAdminOrOwner(community, userId)) {
      return res.status(403).json({
        message:
          "Only community owner or content-admin moderators can pin posts",
      });
    }

    // Find the post and verify it belongs to the community
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    if (!post.community || !post.community.equals(communityId)) {
      return res
        .status(400)
        .json({ message: "Post does not belong to the specified community" });
    }

    const previousPinnedPostId = community.pinnedPost;

    // Unpin previous pinned post if any
    if (community.pinnedPost) {
      await Post.findByIdAndUpdate(community.pinnedPost, { pinned: false });
    }

    // Pin the new post
    await Post.findByIdAndUpdate(postId, { pinned: true });
    community.pinnedPost = postId;
    await community.save();

    const io = getIo();
    io.to(communityId).emit("postPinned", {
      communityId,
      pinnedPostId: postId,
      previousPinnedPostId,
    });

    return res.status(200).json({
      message: "Post pinned successfully",
      pinnedPostId: postId,
      previousPinnedPostId,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error pinning post: " + error.message });
  }
};

module.exports.unpinPost = async (req, res) => {
  try {
    const { communityId } = req.params;
    const userId = req.userId;

    if (!mongoose.Types.ObjectId.isValid(communityId)) {
      return res.status(400).json({ message: "Invalid communityId" });
    }

    // Find the community with owner and moderators populated
    const community = await Community.findById(communityId)
      .populate("owner")
      .populate("moderators")
      .exec();

    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    // Authorization check
    if (!userIsContentAdminOrOwner(community, userId)) {
      return res.status(403).json({
        message:
          "Only community owner or content-admin moderators can unpin posts",
      });
    }

    if (!community.pinnedPost) {
      return res.status(400).json({ message: "No post is currently pinned" });
    }

    const previousPinnedPostId = community.pinnedPost;

    // Unpin post
    await Post.findByIdAndUpdate(previousPinnedPostId, { pinned: false });
    community.pinnedPost = null;
    await community.save();

    const io = getIo();
    io.to(communityId).emit("postUnpinned", {
      communityId,
      previousPinnedPostId,
    });

    return res.status(200).json({
      message: "Post unpinned successfully",
      previousPinnedPostId,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error unpinning post: " + error.message });
  }
};

// Get top 10 popular communities sorted by follower count (descending)
module.exports.getPopularCommunities = async (req, res) => {
  try {
    const communities = await Community.aggregate([
      { $match: { isDeleted: false } },
      {
        $addFields: {
          followerCount: { $size: "$members" }
        }
      },
      { $sort: { followerCount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "owner"
        }
      },
      { $unwind: "$owner" },
      {
        $project: {
          followerCount: 1,
          description: 1,
          category: 1,
          accountType: 1,
          isApproved: 1,
          "owner._id": 1,
          "owner.name": 1,
          "owner.username": 1,
          "owner.picture": 1,
        }
      }
    ]);

    return res.status(200).json({ communities });
  } catch (error) {
    console.error("Error fetching popular communities:", error);
    return res.status(500).json({ message: "Error fetching popular communities: " + error.message });
  }
};