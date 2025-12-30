const mongoose = require("mongoose");

const authorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    position: { type: String },
    imageUrl: { type: String },
    bio: { type: String },
  },
  { _id: false }
);

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, default: "Uncategorized" },
  content: { type: String, required: true },
  tags: [{ type: String }],
  coverUrl: { type: String },
  status: { type: String, enum: ["draft", "published"], default: "draft" },
  author: { type: authorSchema, required: true },
  readTime: { type: String },
  publishedAt: { type: Date },
  slug: { type: String, unique: true },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

blogSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Blog", blogSchema);
