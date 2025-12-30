const Bookmark = require("../models/bookmarkModel");
const Post = require("../models/postModel");
const Community = require("../models/communityModel");
const CommunityQuiz = require("../models/communityQuiz");
const mongoose = require('mongoose');
const modelMap = {
  Post: Post,
  Community: Community,
  CommunityQuiz: CommunityQuiz,
};

const normalizeItemType = (itemType) => {
  const lowerType = itemType.toLowerCase();
  return lowerType === "communitycontest" ? "CommunityQuiz" : itemType;
};

module.exports = {
  createBookmark: async (req, res) => {
    try {
      let { itemType, itemId } = req.params;
      itemType = normalizeItemType(itemType);
      const userId = req.user._id;

      if (!modelMap[itemType]) {
        return res.status(400).json({ message: "Invalid bookmark type" });
      }

      const ItemModel = modelMap[itemType];
      const item = await ItemModel.findById(itemId);
      if (!item) {
        return res.status(404).json({ message: `${itemType} not found` });
      }

      const existingBookmark = await Bookmark.findOne({
        user: userId,
        bookmarkItem: itemId,
        itemType,
      });

      if (existingBookmark) {
        return res.status(400).json({ message: "Already bookmarked" });
      }

      const newBookmark = new Bookmark({
        user: userId,
        bookmarkItem: itemId,
        itemType,
      });

      await newBookmark.save();
      item.bookmarkCounter += 1;
      await item.save();

      res.status(201).json({ message: "Bookmark created successfully" });
    } catch (error) {
      console.error("Bookmark error:", error);
      res.status(500).json({ message: "Server error" });
    }
  },

  deleteBookmark: async (req, res) => {
    try {
      let { itemType, itemId } = req.params;
      itemType = normalizeItemType(itemType);
      const userId = req.user._id;

      const bookmark = await Bookmark.findOneAndDelete({
        user: userId,
        bookmarkItem: itemId,
        itemType,
      });

      if (!bookmark) {
        return res.status(404).json({ message: "Bookmark not found" });
      }

      const ItemModel = modelMap[itemType];
      await ItemModel.findByIdAndUpdate(itemId, {
        $inc: { bookmarkCounter: -1 },
      });

      res.status(200).json({ message: "Bookmark removed" });
    } catch (error) {
      console.error("Delete error:", error);
      res.status(500).json({ message: "Server error" });
    }
  },

  getBookmarksForItem: async (req, res) => {
    try {
      let { itemType, itemId } = req.params;
      itemType = normalizeItemType(itemType);

      const bookmarks = await Bookmark.find({
        itemType,
        bookmarkItem: itemId,
      }).populate("user", "name username");

      res.status(200).json({ bookmarks });
    } catch (error) {
      console.error("Fetch error:", error);
      res.status(500).json({ message: "Server error" });
    }
  },

  getUserBookmarks: async (req, res) => {
    try {
      const userId = req.user._id;
      let { itemType } = req.query;

      if (itemType) {
        itemType = normalizeItemType(itemType);
      }

      const filter = { user: userId };
      if (itemType) {
        filter.itemType = itemType;
      }

      const modelFields = {
        Post: "title content author community private views shares likeCount pinned attachments comments createdAt",
        CommunityQuiz:
          "title description startTime endTime totalRegistered User_profile_Image creatorId",
        Community: "name description owner category",
        Resource: "title description link",
      };

      function getNestedPopulate(type) {
        switch (type) {
          case "Post":
            return [
              { path: "author" },
              { path: "community" },
              { path: "comments" },
              { path: "attachments" },
            ];
          case "CommunityQuiz":
            return [
              {
                path: "creatorId",
                populate: {
                  path: "owner",
                  select: "name picture username banner followers",
                },
              },
            ];
          case "Community":
            return [
              {
                path: "owner",
                select: "name picture username banner followers",
              },
            ];
          default:
            return [];
        }
      }

      if (itemType) {
        const selectFields = modelFields[itemType] || "";
        const populateObj = {
          path: "bookmarkItem",
          select: selectFields,
          options: { strictPopulate: false },
          populate: getNestedPopulate(itemType),
        };

        const bookmarks = await Bookmark.find(filter).populate(populateObj);
        return res.status(200).json({ bookmarks });
      }

      const bookmarks = await Bookmark.find(filter)
        .populate({
          path: "bookmarkItem",
          select: modelFields.Post,
          match: { __t: "Post" },
          options: { strictPopulate: false },
          populate: getNestedPopulate("Post"),
        })
        .populate({
          path: "bookmarkItem",
          select: modelFields.CommunityQuiz,
          match: { __t: "CommunityQuiz" },
          options: { strictPopulate: false },
          populate: getNestedPopulate("CommunityQuiz"),
        })
        .populate({
          path: "bookmarkItem",
          select: modelFields.Community,
          match: { __t: "Community" },
          options: { strictPopulate: false },
          populate: getNestedPopulate("Community"),
        })
        .populate({
          path: "bookmarkItem",
          select: modelFields.Resource,
          match: { __t: "Resource" },
          options: { strictPopulate: false },
        });

      res.status(200).json({ bookmarks });
    } catch (error) {
      console.error("User bookmarks error:", error);
      res.status(500).json({ message: "Server error" });
    }
  },

  checkBookmarkExists: async (req, res) => {
    try {
      let { itemType, itemId } = req.params;
      itemType = normalizeItemType(itemType);
      const userId = req.user._id;

      // Validate itemId: must be a valid ObjectId and not string "null"
      if (!itemId || itemId === "null" || !mongoose.Types.ObjectId.isValid(itemId)) {
        return res.status(400).json({ message: "Invalid itemId" });
      }

      const bookmark = await Bookmark.findOne({
        user: userId,
        bookmarkItem: itemId,
        itemType,
      });

      return res.status(200).json({ isBookmarked: !!bookmark });
    } catch (error) {
      console.error('Bookmark check error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

};
