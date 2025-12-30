const Advertisement = require("../models/advertisement");
const { uploadOnBunny, removeFromBunny } = require("../utils/attachments");
const fs = require("fs");
const path = require("path");

// Helper to extract Bunny storage path from CDN URL
const getBunnyStoragePath = (cdnUrl) => {
  try {
    const url = new URL(cdnUrl);
    return url.pathname.startsWith("/") ? url.pathname.slice(1) : url.pathname;
  } catch {
    return null;
  }
};

// ✅ Upload Ad
exports.uploadAdvertisement = async (req, res) => {
  try {
    const { position, title, targetUrl } = req.body;

    if (!position || !["top", "bottom"].includes(position)) {
      if (req.file?.path) fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: "Invalid or missing position" });
    }

    if (!req.file?.path) {
      return res.status(400).json({ error: "Image is required" });
    }

    const uploaded = await uploadOnBunny(req.file.path);

    if (!uploaded || !uploaded.url) {
      throw new Error("Bunny upload failed");
    }

    const ad = new Advertisement({
      imageUrl: uploaded.url,
      position,
      title: title?.trim() || "Untitled Advertisement",
      targetUrl: targetUrl?.trim() || null,
      isActive: true,
      uploadedBy: req.userId || null,
    });

    await ad.save();

    res.status(201).json({ message: "Advertisement uploaded", ad });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ✅ Get All Ads (optionally filtered by ?position=top|bottom)
exports.getAdvertisements = async (req, res) => {
  try {
    const { position } = req.query;
    const filter = {};

    if (position) {
      if (!["top", "bottom"].includes(position)) {
        return res.status(400).json({ error: "Invalid position" });
      }
      filter.position = position;
    }

    const ads = await Advertisement.find(filter).sort({ createdAt: -1 });
    res.status(200).json(ads);
  } catch (err) {
    console.error("Fetch ads error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ✅ Delete Ad
exports.deleteAdvertisement = async (req, res) => {
  try {
    const ad = await Advertisement.findById(req.params.id);

    if (!ad) {
      return res.status(404).json({ error: "Ad not found" });
    }

    if (ad.imageUrl) {
      const storagePath = getBunnyStoragePath(ad.imageUrl);
      if (storagePath) {
        await removeFromBunny(storagePath);
      }
    }

    await Advertisement.findByIdAndDelete(ad._id);

    res.status(200).json({ message: "Advertisement deleted" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.toggleAdStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    const ad = await Advertisement.findById(req.params.id);

    if (!ad) {
      return res.status(404).json({ error: "Advertisement not found" });
    }

    ad.isActive = isActive;
    await ad.save();

    res.status(200).json({ message: "Ad status updated", ad });
  } catch (err) {
    console.error("Toggle error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.updateAdPosition = async (req, res) => {
  try {
    const { position } = req.body;

    if (!["top", "bottom"].includes(position)) {
      return res.status(400).json({ error: "Invalid position value" });
    }

    const ad = await Advertisement.findById(req.params.id);

    if (!ad) {
      return res.status(404).json({ error: "Advertisement not found" });
    }

    ad.position = position;
    await ad.save();

    res.status(200).json({ message: "Ad position updated", ad });
  } catch (err) {
    console.error("Position update error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
