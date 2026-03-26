const mongoose = require("mongoose");
const Post = require("../models/postModel");
const fs = require("fs");
const Community = require("../models/communityModel");
const Attachment = require("../models/attachmentModel");
const ExpressError = require("../utils/ExpressError");
const User = require("../models/userModel");
const { uploadOnBunny, removeFromBunny } = require("../utils/attachments");
const urlShortener = require("../utils/urlShortener");
const Like = require("../models/likeModel");
const { getIo } = require("../utils/websocket");
const redis = require("../utils/redisClient");

// Helper to extract Bunny storage path from CDN URL
const getBunnyStoragePath = (cdnUrl) => {
  try {
    const url = new URL(cdnUrl);
    return url.pathname.startsWith("/") ? url.pathname.slice(1) : url.pathname;
  } catch {
    return null;
  }
};

// Upload a single attachment to Bunny
const uploadAttachment = async (filePath, originalname, mimetype, session) => {
  const uploaded = await uploadOnBunny(filePath);
  if (!uploaded || !uploaded.url) throw new Error("Attachment upload failed");
  const attachment = new Attachment({
    filename: originalname,
    fileType: mimetype,
    fileUrl: uploaded.url,
  });
  return (await attachment.save({ session }))._id;
};

// Remove a single attachment from Bunny
const removeAttachment = async (fileUrl) => {
  const storagePath = getBunnyStoragePath(fileUrl);
  if (storagePath) {
    await removeFromBunny(storagePath);
  }
};

function userIsContentAdminOrOwner(community, userId) {
  if (!community || !userId) return false;
  if (community.owner.equals(userId)) return true;

  // moderators is array of { user: ObjectId, role: String }
  const mod = community.moderators.find(
    (m) => String(m.user) === String(userId) && m.role === "content-admin"
  );
  return !!mod;
}

module.exports.createPost = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { title, content, community, private } = req.body;

    const postCommunity = await Community.findById(community)
      .populate("owner moderators")
      .session(session);

    if (!postCommunity) {
      throw new ExpressError("Community not found", 404);
    }

    // Check if user is owner or content-admin moderator
    const isAuthorized = userIsContentAdminOrOwner(postCommunity, req.userId);
    if (!isAuthorized) {
      throw new ExpressError(
        "Unauthorized to create a post in this community",
        403
      );
    }

    let authorId = req.userId;
    if (
      postCommunity.owner &&
      String(postCommunity.owner) !== String(req.userId) &&
      postCommunity.moderators.some(
        (mod) =>
          String(mod.user) === String(req.userId) &&
          mod.role === "content-admin"
      )
    ) {
      authorId = postCommunity.owner;
    }

    const post = new Post({
      author: authorId,
      title,
      content,
      community,
      private,
    });

    const tempId = post._id;

    const { processedContent, shortenedUrls } =
      await urlShortener.processAndShortenUrls(
        content,
        req.userId,
        tempId,
        community
      );

    post.content = processedContent;

    const savedPost = await post.save({ session });

    postCommunity.posts.push(savedPost);
    await postCommunity.save({ session });

    if (req.files && req.files.length > 0) {
      const attachmentPromises = req.files.map(async (file) => {
        return await uploadAttachment(
          file.path,
          file.originalname,
          file.mimetype,
          session
        );
      });

      const attachmentIds = await Promise.all(attachmentPromises);
      savedPost.attachments.push(...attachmentIds);
      await savedPost.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    getIo().emit("newPost", savedPost);

    res.status(201).json({
      message: "Post created successfully!",
      post: savedPost,
      shortenedUrls: shortenedUrls,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: "Error creating post: " + error.message });
  }
};

module.exports.updatePost = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const postId = req.params.postId;
    const { title, content, private, removeAttachments = "[]" } = req.body;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      throw new ExpressError("Invalid Post ID", 400);
    }

    const post = await Post.findById(postId)
      .populate("attachments")
      .populate({
        path: "community",
        populate: { path: "owner moderators" },
      })
      .session(session);

    if (!post) throw new ExpressError("Post not found", 404);
    if (!post.community)
      throw new ExpressError("Post is not linked to a community", 400);

    // Authorization: author, or owner, or content-admin moderator only
    const isAuthor = post.author.toString() === req.userId;
    const isContentAdminOrOwner = userIsContentAdminOrOwner(
      post.community,
      req.userId
    );

    if (!isAuthor && !isContentAdminOrOwner) {
      throw new ExpressError("Unauthorized to update this post", 403);
    }

    post.title = title || post.title;

    if (content) {
      const { processedContent, shortenedUrls } =
        await urlShortener.processAndShortenUrls(
          content,
          req.userId,
          postId,
          post.community._id
        );
      post.content = processedContent;
    }

    post.private = private !== undefined ? private : post.private;

    const parsedRemoveAttachments = Array.isArray(removeAttachments)
      ? removeAttachments
      : JSON.parse(removeAttachments);

    if (parsedRemoveAttachments.length > 0) {
      const attachmentsToDelete = await Attachment.find({
        _id: { $in: parsedRemoveAttachments },
      });

      for (const attachment of attachmentsToDelete) {
        try {
          if (attachment.fileUrl && attachment.fileUrl.startsWith("http")) {
            await removeAttachment(attachment.fileUrl);
          } else if (attachment.fileUrl && fs.existsSync(attachment.fileUrl)) {
            fs.unlinkSync(attachment.fileUrl);
          }
          await Attachment.findByIdAndDelete(attachment._id);
        } catch (err) {
          // ignore errors deleting attachments
        }
      }

      post.attachments = post.attachments.filter(
        (attachment) =>
          !parsedRemoveAttachments.includes(attachment._id.toString())
      );
    }

    if (req.files && req.files.length > 0) {
      const attachmentPromises = req.files.map(async (file) => {
        return await uploadAttachment(
          file.path,
          file.originalname,
          file.mimetype,
          session
        );
      });

      post.attachments.push(...(await Promise.all(attachmentPromises)));
    }

    await post.save({ session });
    await session.commitTransaction();
    session.endSession();

    const updatedPost = await Post.findById(postId).populate("attachments");
    res
      .status(200)
      .json({ message: "Post updated successfully!", post: updatedPost });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: "Error updating post: " + error.message });
  }
};

module.exports.deletePost = async (req, res) => {
  try {
    const postId = req.params.postId;
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      throw new ExpressError("Invalid Post ID", 400);
    }

    const post = await Post.findById(postId).populate("attachments community");

    if (!post) {
      throw new ExpressError("Post not found", 404);
    }

    const isContentAdminOrOwner = userIsContentAdminOrOwner(
      post.community,
      req.userId
    );

    if (!isContentAdminOrOwner) {
      throw new ExpressError("Unauthorized to delete this post", 403);
    }

    // Delete all attachments from storage and DB
    if (post.attachments && post.attachments.length > 0) {
      for (const attachment of post.attachments) {
        if (attachment.fileUrl && attachment.fileUrl.startsWith("http")) {
          await removeAttachment(attachment.fileUrl);
        } else if (attachment.fileUrl && fs.existsSync(attachment.fileUrl)) {
          fs.unlinkSync(attachment.fileUrl);
        }
        await Attachment.findByIdAndDelete(attachment._id);
      }
    }

    await Post.findByIdAndDelete(postId);
    res.status(200).json({ message: "Post deleted successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting post: " + error.message });
  }
};

// Get all posts in a community
module.exports.getPostsByCommunity = async (req, res) => {
  try {
    const communityId = req.params.communityId;
    const posts = await Post.find({ community: communityId, isDeleted: false })
      .populate("author")
      .populate("attachments")
      .populate("community")
      .sort({ createdAt: -1, _id: -1 })
      .exec();
    if (!posts) {
      throw new ExpressError("No posts found in this community", 404);
    }

    res.status(200).json({ posts });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving posts: " + error.message });
  }
};

// Get a single post by ID
module.exports.getPostById = async (req, res) => {
  try {
    const postId = req.params.postId;
    const post = await Post.findById(postId)
      .populate("author")
      .populate("attachments")
      .populate("community");

    if (!post) {
      throw new ExpressError("Post not found", 404);
    }

    res.status(200).json({ post });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving post: " + error.message });
  }
};

module.exports.getPostsByFollowedCommunities = async (req, res) => {
  try {
    const userId = req.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const user = await User.findById(userId).select(
      "followedCommunities following"
    );
    if (!user) {
      throw new ExpressError("User not found", 404);
    }

    const followedCommunityIds = user.followedCommunities || [];
    const followedUserIds = user.following || [];

    if (!followedCommunityIds.length && !followedUserIds.length) {
      return res.status(200).json({ posts: [], total: 0 });
    }

    const query = {
      isDeleted: false,
      $or: [
        { community: { $in: followedCommunityIds } },
        { author: { $in: followedUserIds } },
      ],
    };

    const posts = await Post.find(query)
      .populate("author", "-password -refreshToken -googleAccessToken -googleRefreshToken")
      .populate("attachments")
      .populate("community")
      .sort({ createdAt: -1, _id: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments(query);

    res.status(200).json({ posts, total });
  } catch (error) {
    res.status(500).json({ message: "Error fetching posts: " + error.message });
  }
};

module.exports.getAllPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ isDeleted: false })
      .populate("author")
      .populate("community")
      .populate("attachments")
      .sort({ createdAt: -1, _id: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    const total = await Post.countDocuments({ isDeleted: false });

    res.status(200).json({ posts, total });
  } catch (error) {
    res.status(500).json({ message: "Error fetching posts: " + error.message });
  }
};

module.exports.togglePinPost = async (req, res) => {
  try {
    const postId = req.params.postId;
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      throw new ExpressError("Invalid Post ID", 400);
    }

    const post = await Post.findById(postId).populate("community");
    if (!post) {
      throw new ExpressError("Post not found", 404);
    }

    const community = await Community.findById(post.community._id)
      .populate("owner")
      .populate("moderators")
      .exec();

    if (!community) {
      throw new ExpressError("Community not found", 404);
    }

    if (!userIsContentAdminOrOwner(community, req.userId)) {
      throw new ExpressError("Unauthorized to pin/unpin this post", 403);
    }

    if (post.pinned) {
      post.pinned = false;
      await post.save();
      return res.status(200).json({ message: "Post unpinned successfully!" });
    } else {
      await Post.updateMany({ community: community._id }, { pinned: false });
      post.pinned = true;
      await post.save();
      return res.status(200).json({ message: "Post pinned successfully!" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error toggling pin status: " + error.message });
  }
};

// Increment the share count of a post
module.exports.incrementPostShares = async (req, res) => {
  try {
    const postId = req.params.postId;
    const userId = req.userId;

    const post = await Post.findById(postId);

    if (!post) {
      throw new ExpressError("Post not found", 404);
    }

    // Initialize shares array if undefined
    if (!post.sharedBy) {
      post.sharedBy = [];
    }

    // Check if this user has already shared this post
    const alreadyShared = post.sharedBy.some((id) => id.equals(userId));

    // Only increment and add to sharedBy if this is a new share by this user
    if (userId && !alreadyShared) {
      post.sharedBy.push(userId);
      // Update the share count to match unique users who shared
      post.shares = post.sharedBy.length;
      await post.save();
      return res
        .status(200)
        .json({ message: "Post share count incremented!", count: post.shares });
    }

    // If already shared by this user, don't increment
    res.status(200).json({
      message: "Post already shared by this user!",
      count: post.shares,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error incrementing share count: " + error.message });
  }
};

// Increment the view count of a post
module.exports.incrementPostViews = async (req, res) => {
  try {
    const postId = req.params.postId;
    const post = await Post.findById(postId);

    if (!post) {
      throw new ExpressError("Post not found", 404);
    }
    if (post.views === undefined || post.views === null) {
      post.views = 0;
    }

    post.views += 1;
    await post.save();

    res.status(200).json({ message: "Post view count incremented!" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error incrementing view count: " + error.message });
  }
};

// Track link clicks in a post
module.exports.trackLinkClick = async (req, res) => {
  try {
    const { postId } = req.params;
    const { url } = req.body;

    if (!url) {
      throw new ExpressError("URL is required", 400);
    }

    const post = await Post.findById(postId);
    if (!post) {
      throw new ExpressError("Post not found", 404);
    }

    // Initialize linkClicks array if it doesn't exist
    if (!post.linkClicks) {
      post.linkClicks = [];
    }

    // Add click information with timestamp and URL
    const clickInfo = {
      url,
      timestamp: new Date(),
      userId: req.userId || null,
      userAgent: req.headers["user-agent"] || null,
      referrer: req.headers.referer || "Direct",
      ip: req.ip,
    };

    // Try to get country information from IP
    try {
      if (req.geoip && req.geoip.country) {
        clickInfo.country = req.geoip.country;
      }
    } catch (err) {
      // If geoip fails, continue without country information
    }

    post.linkClicks.push(clickInfo);
    await post.save();

    res.status(200).json({
      message: "Link click tracked successfully",
      clickCount: post.linkClicks.length,
    });
  } catch (error) {
    console.error("Error tracking link click:", error);
    res
      .status(500)
      .json({ message: "Error tracking link click", error: error.message });
  }
};

// module.exports.getDynamicFeedPosts = async (req, res) => {
//   try {
//     const userId = req.userId;
//     const limit = parseInt(req.query.limit) || 10;
//     const cursor = req.query.cursor || null;

//     const excludeIdsParam = req.query.excludeIds || "";
//     const excludeIds = excludeIdsParam
//       .split(",")
//       .filter(id => id.trim() !== "")
//       .map(id =>
//         mongoose.Types.ObjectId.isValid(id.trim())
//           ? new mongoose.Types.ObjectId(id.trim())
//           : null
//       )
//       .filter(id => id !== null);

//     const likedPostDocs = await Like.find({ user: userId }).select("post").lean();
//     const likedPostIds = likedPostDocs.map(l => l.post.toString());
//     const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

//     const matchStage = {
//       isDeleted: false,
//       _id: { $nin: excludeIds }
//     };

//     if (cursor && mongoose.Types.ObjectId.isValid(cursor)) {
//       matchStage._id = { ...matchStage._id, $lt: new mongoose.Types.ObjectId(cursor) };
//     }

//     const pipeline = [
//       { $match: matchStage },
//       {
//         $addFields: {
//           likedByUser: { $in: ["$_id", likedPostIds] },
//           isNew: { $gte: ["$createdAt", twoDaysAgo] },
//           randomSort: { $rand: {} },
//           recencyScore: {
//             $divide: [{ $subtract: [new Date(), "$createdAt"] }, 1000 * 60 * 60]
//           }
//         }
//       },
//       {
//         $addFields: {
//           score: {
//             $add: [
//               { $cond: [{ $eq: ["$likedByUser", false] }, 10, 0] },
//               { $cond: [{ $eq: ["$isNew", true] }, 5, 0] },
//               { $multiply: ["$randomSort", 2] },
//               { $cond: [{ $lte: ["$recencyScore", 48] }, 3, 0] }
//             ]
//           }
//         }
//       },
//       { $sort: { score: -1, createdAt: -1 } },
//       { $limit: limit },
//       {
//         $lookup: {
//           from: "users",
//           localField: "author",
//           foreignField: "_id",
//           as: "author"
//         }
//       },
//       { $unwind: "$author" },
//       {
//         $lookup: {
//           from: "attachments",
//           localField: "attachments",
//           foreignField: "_id",
//           as: "attachments"
//         }
//       },
//       {
//         $lookup: {
//           from: "communities",
//           localField: "community",
//           foreignField: "_id",
//           as: "community"
//         }
//       },
//       { $unwind: "$community" },
//       {
//         $project: {
//           "author.password": 0,
//           "author.refreshToken": 0,
//           "author.googleAccessToken": 0,
//           "author.googleRefreshToken": 0
//         }
//       }
//     ];

//     const posts = await Post.aggregate(pipeline);

//     const nextCursor =
//       posts.length > 0 ? posts[posts.length - 1]._id.toString() : null;

//     res.status(200).json({ posts, nextCursor });
//   } catch (error) {
//     console.error("Error fetching dynamic feed posts:", error);
//     res
//       .status(500)
//       .json({ message: "Error fetching feed posts: " + error.message });
//   }
// };

module.exports.getDynamicFeedPosts = async (req, res) => {
  try {
    const userId = req.userId;
    const limit = parseInt(req.query.limit) || 10;
    const cursor = req.query.cursor || null;

    const excludeIdsParam = req.query.excludeIds || "";
    const excludeIds = excludeIdsParam
      .split(",")
      .filter(id => id.trim() !== "")
      .map(id =>
        mongoose.Types.ObjectId.isValid(id.trim())
          ? new mongoose.Types.ObjectId(id.trim())
          : null
      )
      .filter(id => id !== null);

    // CONFIG: adjust to taste
    const freshWindowDays = 14;              // 7–14 recommended
    const halfLifeHours = 36;                // decay half-life for backfill
    const freshThreshold = new Date(Date.now() - freshWindowDays * 24 * 60 * 60 * 1000);

    // Optional: fetch likes to slightly reduce ranking for already-liked items
    const likedPostDocs = await Like.find({ user: userId }).select("post").lean();
    const likedPostIds = new Set(likedPostDocs.map(l => l.post.toString()));

    // Base match and optional cursor
    const baseMatch = {
      isDeleted: false,
      _id: { $nin: excludeIds }
    };
    if (cursor && mongoose.Types.ObjectId.isValid(cursor)) {
      baseMatch._id = { ...baseMatch._id, $lt: new mongoose.Types.ObjectId(cursor) };
    }

    // Phase A: Fresh posts (within window), reverse-chronological
    const freshPipeline = [
      { $match: { ...baseMatch, createdAt: { $gte: freshThreshold } } },
      { $sort: { _id: -1 } }, // ObjectId time-order aligns with reverse chronological
      { $limit: limit },
      {
        $lookup: { from: "users", localField: "author", foreignField: "_id", as: "author" }
      },
      { $unwind: "$author" },
      {
        $lookup: { from: "attachments", localField: "attachments", foreignField: "_id", as: "attachments" }
      },
      {
        $lookup: { from: "communities", localField: "community", foreignField: "_id", as: "community" }
      },
      { $unwind: "$community" },
      {
        $project: {
          "author.password": 0,
          "author.refreshToken": 0,
          "author.googleAccessToken": 0,
          "author.googleRefreshToken": 0
        }
      }
    ];
    const fresh = await Post.aggregate(freshPipeline);

    // If fresh filled the page, return early
    if (fresh.length >= limit) {
      const nextCursor = fresh.length > 0 ? fresh[fresh.length - 1]._id.toString() : null;
      return res.status(200).json({ posts: fresh, nextCursor });
    }

    // Phase B: Backfill older posts with time-decayed quality score
    // Assumes denormalized counts exist (likesCount, commentsCount, sharesCount, viewsCount).
    // If not, replace with $lookup/$count or set missing to 0 via $ifNull.
    const remaining = limit - fresh.length;

    const backfillPipeline = [
      { $match: { ...baseMatch, createdAt: { $lt: freshThreshold } } },
      {
        $addFields: {
          hoursSince: {
            $divide: [{ $subtract: [new Date(), "$createdAt"] }, 1000 * 60 * 60]
          },
          // Engagement proxy; adjust weights per product needs
          likesCount: { $ifNull: ["$likesCount", 0] },
          commentsCount: { $ifNull: ["$commentsCount", 0] },
          sharesCount: { $ifNull: ["$sharesCount", 0] },
          viewsCount: { $ifNull: ["$viewsCount", 0] },
        }
      },
      {
        $addFields: {
          engagement: {
            $add: [
              "$likesCount",
              { $multiply: ["$commentsCount", 2] },
              { $multiply: ["$sharesCount", 3] },
              { $multiply: ["$viewsCount", 0.05] }
            ]
          },
          // optional small penalty for already-liked-by-user to surface new content
          likedPenalty: {
            $cond: [{ $in: ["$_id", Array.from(likedPostIds).map(id => new mongoose.Types.ObjectId(id))] }, -0.5, 0]
          }
        }
      },
      {
        $addFields: {
          decay: {
            $exp: {
              $multiply: [
                { $divide: [{ $multiply: [-Math.log(2), "$hoursSince"] }, halfLifeHours] },
                1
              ]
            }
          },
          randJitter: { $rand: {} }
        }
      },
      {
        $addFields: {
          score: {
            $add: [
              { $multiply: ["$engagement", "$decay"] },
              "$likedPenalty",
              { $multiply: ["$randJitter", 0.1] } // tiny exploration
            ]
          }
        }
      },
      { $sort: { score: -1, createdAt: -1 } },
      { $limit: remaining },
      {
        $lookup: { from: "users", localField: "author", foreignField: "_id", as: "author" }
      },
      { $unwind: "$author" },
      {
        $lookup: { from: "attachments", localField: "attachments", foreignField: "_id", as: "attachments" }
      },
      {
        $lookup: { from: "communities", localField: "community", foreignField: "_id", as: "community" }
      },
      { $unwind: "$community" },
      {
        $project: {
          "author.password": 0,
          "author.refreshToken": 0,
          "author.googleAccessToken": 0,
          "author.googleRefreshToken": 0
        }
      }
    ];

    const backfill = await Post.aggregate(backfillPipeline);

    const posts = [...fresh, ...backfill];
    const nextCursor = posts.length > 0 ? posts[posts.length - 1]._id.toString() : null;

    res.status(200).json({ posts, nextCursor });
  } catch (error) {
    console.error("Error fetching dynamic feed posts:", error);
    res.status(500).json({ message: "Error fetching feed posts: " + error.message });
  }
};

module.exports.getTrendingPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const posts = await Post.aggregate([
      {
        $match: {
          isDeleted: false,
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $addFields: {
          commentCount: { $size: "$comments" },
        },
      },
      {
        $addFields: {
          trendingScore: {
            $add: [
              { $multiply: ["$likeCount", 3] },
              { $multiply: ["$commentCount", 4] },
              { $multiply: ["$shares", 2] },
              { $multiply: ["$views", 0.5] },
            ],
          },
        },
      },
      { $sort: { trendingScore: -1, createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "author",
        },
      },
      { $unwind: "$author" },
      {
        $lookup: {
          from: "attachments",
          localField: "attachments",
          foreignField: "_id",
          as: "attachments",
        },
      },
      {
        $lookup: {
          from: "communities",
          localField: "community",
          foreignField: "_id",
          as: "community",
        },
      },
      { $unwind: "$community" },
      {
        $project: {
          "author.password": 0,
          "author.refreshToken": 0,
          "author.googleAccessToken": 0,
          "author.googleRefreshToken": 0,
        },
      },
    ]);

    const total = await Post.countDocuments({
      isDeleted: false,
      createdAt: { $gte: sevenDaysAgo },
    });

    res.status(200).json({ posts, total });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching trending posts: " + error.message });
  }
};