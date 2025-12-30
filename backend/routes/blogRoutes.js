const express = require("express");
const router = express.Router();
const {
  getAllBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  publishBlog,
  unpublishBlog,
} = require("../controllers/blogController");

const { isAdmin, upload } = require("../middleware.js");

// For accepting both cover (blog banner) and authorImage (author avatar)
const blogFileFields = upload.fields([
  { name: "cover", maxCount: 1 },
  { name: "authorImage", maxCount: 1 },
]);

// Get all blogs (public or admin panel)
router.get("/", getAllBlogs);

// Get single blog by ID
router.get("/:id", getBlogById);

// Create blog: needs admin, accepts cover and authorImage uploads
router.post("/", isAdmin, blogFileFields, createBlog);

// Update blog by ID: needs admin, accepts either/both file uploads
router.put("/:id", isAdmin, blogFileFields, updateBlog);

// Delete blog by ID
router.delete("/:id", isAdmin, deleteBlog);

// Publish blog by ID
router.post("/:id/publish", isAdmin, publishBlog);

// Unpublish blog by ID
router.post("/:id/unpublish", isAdmin, unpublishBlog);

module.exports = router;
