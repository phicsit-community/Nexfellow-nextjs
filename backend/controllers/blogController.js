const Blog = require("../models/blogModel");
const { uploadOnBunny, removeFromBunny } = require("../utils/attachments");
const path = require("path");

const getBunnyStoragePath = (cdnUrl) => {
  try {
    const url = new URL(cdnUrl);
    return url.pathname.startsWith("/") ? url.pathname.slice(1) : url.pathname;
  } catch {
    return null;
  }
};

// GET all blogs (optionally with filtering, e.g., status)
exports.getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getBlogById = async (req, res) => {
  try {
    let blog = await Blog.findOne({ slug: req.params.id });
    if (!blog) {
      blog = await Blog.findById(req.params.id);
    }
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    res.json(blog);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getRandomBlogs = async (req, res) => {
  try {
    const blogs = await Blog.aggregate([{ $sample: { size: 3 } }]);
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// CREATE blog
exports.createBlog = async (req, res) => {
  try {
    // Collect text fields from req.body
    const {
      category,
      title,
      content,
      tags, // comma separated string
      status,
      readTime,
      publishedAt,
      authorName,
      authorPosition,
      authorBio,
    } = req.body;
    const tagsArray = tags
      ? tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [];

    // Handle image uploads
    let coverUrl = null;
    let authorImageUrl = null;

    // 'cover' and 'authorImage' expected as file fields in FormData
    if (req.files?.cover?.[0]?.path) {
      const uploaded = await uploadOnBunny(req.files.cover[0].path);
      if (!uploaded || !uploaded.url)
        throw new Error("Bunny cover upload failed");
      coverUrl = uploaded.url;
    }
    if (req.files?.authorImage?.[0]?.path) {
      const uploaded = await uploadOnBunny(req.files.authorImage[0].path);
      if (!uploaded || !uploaded.url)
        throw new Error("Bunny author image upload failed");
      authorImageUrl = uploaded.url;
    }

    // Prepare author object
    const author = {
      name: authorName,
      position: authorPosition,
      bio: authorBio,
      imageUrl: authorImageUrl,
    };

    const slug = title
      ? title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")
      : null;

    // Blog creation
    const blog = new Blog({
      title,
      category,
      content,
      tags: tagsArray,
      coverUrl,
      status: status || "draft",
      author,
      slug,
      readTime,
      // Set publishedAt when published; can be set manually from client, else leave undefined
      publishedAt:
        status === "published" && publishedAt ? publishedAt : undefined,
      adminId: req.adminId, // from auth middleware
    });

    await blog.save();
    res.status(201).json(blog);
  } catch (err) {
    console.error("CreateBlog Error:", err);
    res.status(500).json({ message: "Failed to create blog" });
  }
};

// UPDATE blog
exports.updateBlog = async (req, res) => {
  try {
    const {
      category,
      title,
      content,
      tags,
      status,
      readTime,
      publishedAt,
      authorName,
      authorPosition,
      authorBio,
    } = req.body;

    const tagsArray = tags
      ? tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [];

    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    // Update all fields
    if (category !== undefined) blog.category = category;
    if (title !== undefined) blog.title = title;
    if (content !== undefined) blog.content = content;
    if (tags !== undefined) blog.tags = tagsArray;
    if (status !== undefined) blog.status = status;
    if (readTime !== undefined) blog.readTime = readTime;
    if (publishedAt !== undefined) blog.publishedAt = publishedAt;

    // Update author subfields
    if (!blog.author) blog.author = {};
    if (authorName !== undefined) blog.author.name = authorName;
    if (authorPosition !== undefined) blog.author.position = authorPosition;
    if (authorBio !== undefined) blog.author.bio = authorBio;

    // Handle new cover image upload
    if (req.files?.cover?.[0]?.path) {
      if (blog.coverUrl) {
        const storagePath = getBunnyStoragePath(blog.coverUrl);
        if (storagePath) await removeFromBunny(storagePath);
      }
      const uploaded = await uploadOnBunny(req.files.cover[0].path);
      if (!uploaded || !uploaded.url)
        throw new Error("Bunny cover upload failed");
      blog.coverUrl = uploaded.url;
    }

    // Handle new author profile image upload
    if (req.files?.authorImage?.[0]?.path) {
      if (blog.author?.imageUrl) {
        const storagePath = getBunnyStoragePath(blog.author.imageUrl);
        if (storagePath) await removeFromBunny(storagePath);
      }
      const uploaded = await uploadOnBunny(req.files.authorImage[0].path);
      if (!uploaded || !uploaded.url)
        throw new Error("Bunny author image upload failed");
      blog.author.imageUrl = uploaded.url;
    }

    await blog.save();
    res.json(blog);
  } catch (err) {
    console.error("UpdateBlog Error:", err);
    res.status(500).json({ message: "Failed to update blog" });
  }
};

// DELETE blog
exports.deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    // Remove images from Bunny
    if (blog.coverUrl) {
      const storagePath = getBunnyStoragePath(blog.coverUrl);
      if (storagePath) await removeFromBunny(storagePath);
    }
    if (blog.author && blog.author.imageUrl) {
      const storagePath = getBunnyStoragePath(blog.author.imageUrl);
      if (storagePath) await removeFromBunny(storagePath);
    }

    await blog.deleteOne();
    res.json({ message: "Blog deleted" });
  } catch (err) {
    console.error("DeleteBlog Error:", err);
    res.status(500).json({ message: "Failed to delete blog" });
  }
};

// PUBLISH blog (mark status as published + set publishedAt)
exports.publishBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    blog.status = "published";
    blog.publishedAt = new Date(); // set (or overwrite) publishedAt timestamp
    await blog.save();
    res.json({ message: "Blog published", blog });
  } catch (err) {
    res.status(500).json({ message: "Failed to publish blog" });
  }
};

// UNPUBLISH blog (mark status as draft + clear publishedAt)
exports.unpublishBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    blog.status = "draft";
    blog.publishedAt = undefined;
    await blog.save();
    res.json({ message: "Blog unpublished", blog });
  } catch (err) {
    res.status(500).json({ message: "Failed to unpublish blog" });
  }
};
