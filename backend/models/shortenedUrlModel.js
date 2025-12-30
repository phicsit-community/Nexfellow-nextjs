const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ClickSchema = new Schema({
  timestamp: {
    type: Date,
    default: Date.now,
  },
  ip: {
    type: String,
  },
  country: {
    type: String,
  },
  city: {
    type: String,
  },
  region: {
    type: String,
  },
  userAgent: {
    type: String,
  },
  referrer: {
    type: String,
  },
});

const ShortenedUrlSchema = new Schema({
  originalUrl: {
    type: String,
    required: true,
  },
  shortCode: {
    type: String,
    required: true,
    unique: true,
    minlength: 8,
    maxlength: 8,
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  postId: {
    type: Schema.Types.ObjectId,
    ref: "Post",
  },
  communityId: {
    type: Schema.Types.ObjectId,
    ref: "Community",
  },
  clicks: {
    type: Number,
    default: 0,
  },
  clickDetails: [ClickSchema],
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60 * 60 * 24 * 365, // URLs expire after 1 year
  },
  active: {
    type: Boolean,
    default: true,
  },
});

// Static method to create a shortened URL
ShortenedUrlSchema.statics.createShortUrl = async function (
  originalUrl,
  creator,
  postId,
  communityId
) {
  // Generate a random 8-character code
  const shortCode = generateUniqueCode();

  // Check if code already exists
  let existingUrl = await this.findOne({ shortCode });

  // If code exists, generate a new one
  if (existingUrl) {
    return this.createShortUrl(originalUrl, creator, postId, communityId);
  }

  // Create and save the new shortened URL
  const shortenedUrl = new this({
    originalUrl,
    shortCode,
    creator,
    postId,
    communityId,
  });

  await shortenedUrl.save();
  return shortenedUrl;
};

// Static method to record a click on a shortened URL
ShortenedUrlSchema.statics.recordClick = async function (shortCode, clickData) {
  try {
    // Use findOneAndUpdate for atomic operation to avoid race conditions
    // This ensures we increment the counter reliably even with concurrent clicks
    const url = await this.findOneAndUpdate(
      { shortCode, active: true },
      {
        $inc: { clicks: 1 },
        $push: { clickDetails: clickData },
      },
      { new: true } // Return the updated document
    );

    if (!url) {
      console.error(
        `Click recording failed: No active URL found with code ${shortCode}`
      );
      return null;
    }

    console.log(
      `Click recorded for ${shortCode} - Total clicks: ${url.clicks}`
    );
    return url;
  } catch (error) {
    console.error(`Error in recordClick method: ${error.message}`);
    throw error;
  }
};

// Generate a random 8-character code
function generateUniqueCode() {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

module.exports = mongoose.model("ShortenedUrl", ShortenedUrlSchema);
