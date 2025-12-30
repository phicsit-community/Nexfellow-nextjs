const crypto = require("crypto");

// Store preview tokens temporarily (In-memory or use a database)
const previewTokens = new Map(); // { token: { url, expiresAt } }

const generatePreviewLink = (req, res) => {
  const { url } = req.body; // The private page URL to share

  if (!url || !url.startsWith("http")) {
    return res.status(400).json({ message: "Invalid URL" });
  }

  // Generate a secure random token
  const token = crypto.randomBytes(16).toString("hex");
  const expiresAt = Date.now() + 15 * 60 * 1000; // Expires in 15 minutes

  // Store token and its associated URL
  previewTokens.set(token, { url, expiresAt });

  const baseUrl = req.protocol + "://" + req.get("host");
  const previewUrl = `${baseUrl}/preview/${token}`;

  return res.json({ previewUrl, expiresAt });
};

const validatePreviewToken = (req, res) => {
  const { token } = req.params;

  if (!previewTokens.has(token)) {
    return res
      .status(404)
      .json({ message: "Invalid or expired preview token" });
  }

  const { url, expiresAt } = previewTokens.get(token);

  if (Date.now() > expiresAt) {
    previewTokens.delete(token);
    return res.status(410).json({ message: "Preview token expired" });
  }

  return res.redirect(url);
};

// OG Image generation
const generateOGImage = async (req, res) => {
  try {
    const { type, id } = req.params;
    const baseUrl = req.protocol + "://" + req.get("host");
    let title, subtitle, imageUrl;

    switch (type) {
      case "community":
        // Get community data
        if (!id)
          return res.status(400).json({ message: "Community ID required" });

        const community = await require("../models/communityModel")
          .findById(id)
          .populate("owner", "name banner");
        if (!community)
          return res.status(404).json({ message: "Community not found" });

        title = community.owner?.name || "Community";
        subtitle = community.description || "Join our community";
        imageUrl =
          community.owner?.banner || `${baseUrl}/default-community.png`;
        break;

      case "challenge":
        // Get challenge data
        if (!id)
          return res.status(400).json({ message: "Challenge ID required" });

        const challenge = await require("../models/challengeModel").findById(
          id
        );
        if (!challenge)
          return res.status(404).json({ message: "Challenge not found" });

        title = challenge.name || "Challenge";
        subtitle = challenge.description || "Join this exciting challenge!";
        imageUrl = challenge.image || `${baseUrl}/default-challenge.png`;
        break;

      case "event":
        // Get event data
        if (!id) return res.status(400).json({ message: "Event ID required" });

        const event = await require("../models/eventModel").findById(id);
        if (!event) return res.status(404).json({ message: "Event not found" });

        title = event.title || "Event";
        subtitle = event.description || "Join this upcoming event!";
        imageUrl = event.imageUrl || `${baseUrl}/default-event.png`;
        break;

      case "quiz":
        // Get quiz/contest data
        if (!id)
          return res.status(400).json({ message: "Contest ID required" });

        const quizModel = require("../models/quizzes");
        const quiz = await quizModel.findById(id);
        if (!quiz)
          return res.status(404).json({ message: "Contest not found" });

        title = quiz.title || "Contest";
        subtitle = quiz.description || "Join this exciting contest!";
        // Try to get quiz image if available
        imageUrl = quiz.imageUrl || quiz.image || `${baseUrl}/contest.png`;

        break;

      default:
        title = "NexFellow";
        subtitle = "Join our platform for developers and tech enthusiasts";
        imageUrl = `${baseUrl}/default.png`;
    }

    // Generate SVG with the data
    console.log("OG imageUrl:", imageUrl);
    const svgContent = generateSVGTemplate(title, subtitle, imageUrl);

    // Set appropriate headers
    res.setHeader("Content-Type", "image/svg+xml");
    res.setHeader("Cache-Control", "public, max-age=86400"); // Cache for 24 hours

    // Send the SVG
    return res.send(svgContent);
  } catch (error) {
    console.error("Error generating OG image:", error);
    return res.status(500).json({ message: "Error generating image" });
  }
};

// SVG template generator
const generateSVGTemplate = (title, subtitle, imageUrl) => {
  // Truncate long titles and descriptions
  const truncatedTitle =
    title.length > 60 ? title.substring(0, 57) + "..." : title;
  const truncatedSubtitle =
    subtitle.length > 85 ? subtitle.substring(0, 82) + "..." : subtitle;

  return `<svg width="1200" height="630" viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <!-- Background color -->
    <rect width="1200" height="630" fill="#14131A"/>
    
    <!-- Defs for clipping -->
    <defs>
      <clipPath id="roundedImageClip">
        <rect x="32" y="32" width="1136" height="566" rx="16" />
      </clipPath>
      <linearGradient id="overlay" x1="600" y1="32" x2="600" y2="598" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#14131A" stop-opacity="0"/>
        <stop offset="40%" stop-color="#14131A" stop-opacity="0.6"/>
        <stop offset="80%" stop-color="#14131A" stop-opacity="0.9"/>
        <stop offset="100%" stop-color="#14131A" stop-opacity="1"/>
      </linearGradient>
    </defs>
    
    <!-- Background image with clip path and preserveAspectRatio -->
    <g clip-path="url(#roundedImageClip)">
      <image x="32" y="32" width="1136" height="566" preserveAspectRatio="xMidYMid slice" xlink:href="${imageUrl}"/>
    </g>
    
    <!-- Gradient overlay for better text readability -->
    <rect x="32" y="32" width="1136" height="566" rx="16" fill="url(#overlay)"/>
    
    <!-- Text elements -->
    <text x="96" y="480" font-family="'Helvetica Neue', Helvetica, Arial, sans-serif" font-size="48" font-weight="bold" fill="white">${truncatedTitle}</text>
    <text x="96" y="520" font-family="'Helvetica Neue', Helvetica, Arial, sans-serif" font-size="28" fill="#FFFFFF" opacity="0.9">${truncatedSubtitle}</text>
    <text x="96" y="560" font-family="'Helvetica Neue', Helvetica, Arial, sans-serif" font-size="22" fill="#BBBBBB">nexfellow.com</text>
  </svg>`;
};

module.exports = {
  generatePreviewLink,
  validatePreviewToken,
  generateOGImage,
};
