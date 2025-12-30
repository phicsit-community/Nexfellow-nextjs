const ShortenedUrl = require("../models/shortenedUrlModel");
const ExpressError = require("../utils/ExpressError");
const axios = require("axios");

// Create a shortened URL
exports.createShortUrl = async (req, res) => {
  try {
    const { url, postId, communityId } = req.body;

    // Validate URL
    if (!url || !isValidUrl(url)) {
      return res.status(400).json({ error: "Invalid URL provided" });
    }

    // Create shortened URL
    const shortenedUrl = await ShortenedUrl.createShortUrl(
      url,
      req.userId,
      postId,
      communityId
    );

    // Return the shortened URL
    res.status(201).json({
      originalUrl: shortenedUrl.originalUrl,
      shortUrl: `${req.protocol}://${req.get("host")}/link/${
        shortenedUrl.shortCode
      }`,
      shortCode: shortenedUrl.shortCode,
    });
  } catch (error) {
    console.error("Error creating shortened URL:", error);
    res.status(500).json({ error: "Failed to create shortened URL" });
  }
};

// Redirect from short URL to original URL
exports.redirectToOriginalUrl = async (req, res) => {
  try {
    const { shortCode } = req.params;

    // Find the shortened URL
    const shortenedUrl = await ShortenedUrl.findOne({
      shortCode,
      active: true,
    });

    if (!shortenedUrl) {
      return res.status(404).json({ error: "URL not found or has expired" });
    }

    // Collect information about the click
    const clickData = {
      timestamp: new Date(),
      ip:
        req.ip ||
        req.headers["x-forwarded-for"] ||
        req.connection.remoteAddress,
      userAgent: req.headers["user-agent"],
      referrer: req.headers.referer || req.headers.referrer || "Direct",
    };

    // Try to get location data with improved handling
    try {
      // For local development/testing, provide some test data if the IP is local
      if (
        clickData.ip === "127.0.0.1" ||
        clickData.ip === "::1" ||
        clickData.ip.startsWith("192.168.") ||
        clickData.ip.startsWith("10.")
      ) {
        console.log("Using test location data for local IP:", clickData.ip);
        clickData.country = "Test Country";
        clickData.city = "Test City";
        clickData.region = "Test Region";
      } else {
        // Handle IPv6 addresses
        let ipToCheck = clickData.ip;
        if (ipToCheck.includes(":")) {
          const ipv4Part = ipToCheck.split(":").pop();
          if (ipv4Part && ipv4Part.includes(".")) {
            ipToCheck = ipv4Part;
          }
        }

        console.log("Getting location data for IP:", ipToCheck);

        // Make the API call with a timeout to avoid hanging
        const response = await axios.get(
          `https://ipapi.co/${ipToCheck}/json/`,
          {
            timeout: 3000,
          }
        );

        if (response.data && !response.data.error) {
          clickData.country = response.data.country_name;
          clickData.city = response.data.city;
          clickData.region = response.data.region;
          console.log(
            `Location data retrieved: ${clickData.city}, ${clickData.country}`
          );
        } else {
          console.log("API returned an error or no data");
        }
      }
    } catch (err) {
      console.error("Error fetching location data:", err.message);
      // Continue with the redirect even if location lookup fails
    }

    // IMPORTANT: Use the model's static method to record the click
    // We await this to ensure the click is recorded before redirecting
    try {
      await ShortenedUrl.recordClick(shortCode, clickData);
      console.log("Click recorded successfully for:", shortCode);
    } catch (err) {
      console.error("Error recording click:", err.message);
      // Continue with the redirect even if click recording fails
    }

    // Redirect to the original URL
    console.log("Redirecting to:", shortenedUrl.originalUrl);
    return res.redirect(shortenedUrl.originalUrl);
  } catch (error) {
    console.error("Error in redirect process:", error);
    res.status(500).json({ error: "Failed to redirect to original URL" });
  }
};

// Get statistics for a shortened URL
exports.getUrlStats = async (req, res) => {
  try {
    const { shortCode } = req.params;

    // Find the shortened URL with click details
    const shortenedUrl = await ShortenedUrl.findOne({ shortCode }).populate(
      "creator",
      "name username picture"
    );

    if (!shortenedUrl) {
      return res.status(404).json({ error: "URL not found" });
    }

    // Prepare statistics
    const stats = {
      originalUrl: shortenedUrl.originalUrl,
      shortUrl: `${process.env.SITE_URL}/link/${
        shortenedUrl.shortCode
      }`,
      shortCode: shortenedUrl.shortCode,
      clicks: shortenedUrl.clicks,
      creator: shortenedUrl.creator,
      createdAt: shortenedUrl.createdAt,
      clickDetails: shortenedUrl.clickDetails,
    };

    res.status(200).json(stats);
  } catch (error) {
    console.error("Error fetching URL statistics:", error);
    res.status(500).json({ error: "Failed to fetch URL statistics" });
  }
};

// Fetch shortened URLs created by the current user
exports.getUserUrls = async (req, res) => {
  try {
    const urls = await ShortenedUrl.find({ creator: req.userId })
      .sort({ createdAt: -1 })
      .select("originalUrl shortCode clicks createdAt");

    const formattedUrls = urls.map((url) => ({
      originalUrl: url.originalUrl,
      shortUrl: `${req.protocol}://${req.get("host")}/link/${url.shortCode}`,
      shortCode: url.shortCode,
      clicks: url.clicks,
      createdAt: url.createdAt,
    }));

    res.status(200).json(formattedUrls);
  } catch (error) {
    console.error("Error fetching user URLs:", error);
    res.status(500).json({ error: "Failed to fetch user URLs" });
  }
};

// Get redirect information for a shortened URL without redirecting
exports.getRedirectInfo = async (req, res) => {
  try {
    const { shortCode } = req.params;

    // Find the shortened URL
    const shortenedUrl = await ShortenedUrl.findOne({
      shortCode,
      active: true,
    });

    if (!shortenedUrl) {
      return res.status(404).json({ error: "URL not found or has expired" });
    }

    // Return redirect information without actually redirecting
    res.status(200).json({
      shortCode: shortenedUrl.shortCode,
      originalUrl: shortenedUrl.originalUrl,
    });
  } catch (error) {
    console.error("Error getting redirect info:", error);
    res.status(500).json({ error: "Failed to get redirect information" });
  }
};

// Track click with location data provided from frontend
exports.trackClickWithClientData = async (req, res) => {
  try {
    const { shortCode } = req.params;
    const clickData = req.body;

    // Validate shortCode
    if (!shortCode) {
      return res.status(400).json({ error: "Missing shortCode parameter" });
    }

    // Find the shortened URL
    const shortenedUrl = await ShortenedUrl.findOne({
      shortCode,
      active: true,
    });

    if (!shortenedUrl) {
      return res.status(404).json({ error: "URL not found or has expired" });
    }

    // Log the click data received from frontend
    console.log(
      `Tracking click for ${shortCode} with frontend data:`,
      `IP: ${clickData.ip || "Not provided"}, ` +
        `Location: ${clickData.city || "Unknown"}, ${
          clickData.country || "Unknown"
        }`
    );

    // Record the click using data provided by the frontend
    try {
      // Add timestamp if not provided
      if (!clickData.timestamp) {
        clickData.timestamp = new Date();
      }

      // Use findOneAndUpdate for atomic operation
      await ShortenedUrl.findOneAndUpdate(
        { shortCode, active: true },
        {
          $inc: { clicks: 1 },
          $push: { clickDetails: clickData },
        }
      );

      console.log(
        `Click recorded successfully for ${shortCode} with frontend data`
      );
    } catch (err) {
      console.error("Error recording click with frontend data:", err.message);
      // Continue with redirect even if click recording fails
    }

    // Return the original URL for redirection
    return res.status(200).json({
      shortCode: shortenedUrl.shortCode,
      originalUrl: shortenedUrl.originalUrl,
    });
  } catch (error) {
    console.error("Error tracking click with frontend data:", error);
    res.status(500).json({ error: "Failed to track click" });
  }
};

// Fetch shortened URLs by community ID
exports.getCommunityUrls = async (req, res) => {
  try {
    const { communityId } = req.params;

    if (!communityId) {
      return res.status(400).json({ error: "Community ID is required" });
    }

    const urls = await ShortenedUrl.find({ communityId })
      .sort({ createdAt: -1 })
      .select("originalUrl shortCode clicks createdAt")
      .populate("creator", "name username picture");

    const formattedUrls = urls.map((url) => ({
      id: url._id,
      originalUrl: url.originalUrl,
      shortUrl: `${process.env.SITE_URL}/link/${url.shortCode}`,
      shortCode: url.shortCode,
      clicks: url.clicks,
      createdAt: url.createdAt,
      creator: url.creator,
    }));

    res.status(200).json(formattedUrls);
  } catch (error) {
    console.error("Error fetching community URLs:", error);
    res.status(500).json({ error: "Failed to fetch community URLs" });
  }
};

// Get statistics for all links in a community with pagination and filtering
exports.getCommunityLinkStats = async (req, res) => {
  try {
    const { communityId } = req.params;
    const {
      page = 1,
      limit = 10,
      sortBy = "clicks",
      order = "desc",
      timeframe,
    } = req.query;

    if (!communityId) {
      return res.status(400).json({ error: "Community ID is required" });
    }

    // Build query
    const query = { communityId };

    // Add timeframe filter if specified
    if (timeframe) {
      const now = new Date();
      let startDate;

      switch (timeframe) {
        case "day":
          startDate = new Date(now.setDate(now.getDate() - 1));
          break;
        case "week":
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case "month":
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        case "quarter":
          startDate = new Date(now.setMonth(now.getMonth() - 3));
          break;
        case "half":
          startDate = new Date(now.setMonth(now.getMonth() - 6));
          break;
        case "year":
          startDate = new Date(now.setFullYear(now.getFullYear() - 1));
          break;
        default:
          // No filter for 'all'
          break;
      }

      if (startDate) {
        query.createdAt = { $gte: startDate };
      }
    }

    // Set up sorting
    const sortOptions = {};
    sortOptions[sortBy] = order === "asc" ? 1 : -1;

    // Count total documents for pagination
    const total = await ShortenedUrl.countDocuments(query);

    // Fetch paginated results
    const urls = await ShortenedUrl.find(query)
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select("originalUrl shortCode clicks createdAt clickDetails")
      .populate("creator", "name username picture");

    // Calculate summary stats
    const totalClicks = urls.reduce((sum, url) => sum + url.clicks, 0);

    // Get unique countries
    const countries = new Set();
    urls.forEach((url) => {
      url.clickDetails.forEach((click) => {
        if (click.country) {
          countries.add(click.country);
        }
      });
    });

    // Format URLs for response
    const formattedUrls = urls.map((url) => ({
      id: url._id,
      originalUrl: url.originalUrl,
      shortUrl: `${req.protocol}://${req.get("host")}/link/${url.shortCode}`,
      shortCode: url.shortCode,
      clicks: url.clicks,
      createdAt: url.createdAt,
    }));

    res.status(200).json({
      links: formattedUrls,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit),
      },
      stats: {
        totalLinks: total,
        totalClicks,
        uniqueCountries: countries.size,
      },
    });
  } catch (error) {
    console.error("Error fetching community link statistics:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch community link statistics" });
  }
};

// Get top performing links in a community
exports.getTopCommunityLinks = async (req, res) => {
  try {
    const { communityId } = req.params;
    const { limit = 5, timeframe } = req.query;

    if (!communityId) {
      return res.status(400).json({ error: "Community ID is required" });
    }

    // Build query
    const query = { communityId };

    // Add timeframe filter if specified
    if (timeframe && timeframe !== "all") {
      const now = new Date();
      let startDate;

      switch (timeframe) {
        case "day":
          startDate = new Date(now.setDate(now.getDate() - 1));
          break;
        case "week":
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case "month":
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        case "quarter":
          startDate = new Date(now.setMonth(now.getMonth() - 3));
          break;
        case "half":
          startDate = new Date(now.setMonth(now.getMonth() - 6));
          break;
        case "year":
          startDate = new Date(now.setFullYear(now.getFullYear() - 1));
          break;
      }

      if (startDate) {
        query.createdAt = { $gte: startDate };
      }
    }

    // Fetch top performing links
    const topLinks = await ShortenedUrl.find(query)
      .sort({ clicks: -1 })
      .limit(Number(limit))
      .select("originalUrl shortCode clicks createdAt")
      .populate("creator", "name username picture")
      .populate("postId", "title");

    // Format links for response
    const formattedLinks = topLinks.map((link) => ({
      id: link._id,
      originalUrl: link.originalUrl,
      shortUrl: `${req.protocol}://${req.get("host")}/link/${link.shortCode}`,
      shortCode: link.shortCode,
      clicks: link.clicks,
      createdAt: link.createdAt,
      creator: link.creator,
      post: link.postId,
    }));

    res.status(200).json(formattedLinks);
  } catch (error) {
    console.error("Error fetching top community links:", error);
    res.status(500).json({ error: "Failed to fetch top community links" });
  }
};

// Helper functions
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

async function getLocationByIp(ip) {
  try {
    // Clean the IP address - handle IPv6 addresses
    let cleanIp = ip;

    // If it's localhost or a private IP, don't try to look it up
    if (
      ip === "127.0.0.1" ||
      ip === "::1" ||
      ip.startsWith("192.168.") ||
      ip.startsWith("10.") ||
      ip.startsWith("172.16.")
    ) {
      console.log("Not looking up private IP address:", ip);
      return {
        country_name: "Local",
        city: "Development",
        region: "Local Network",
      };
    }

    // Handle IPv6 format
    if (ip.includes(":")) {
      // Extract the last part of an IPv6 address (if it's in the format ::ffff:192.168.0.1)
      const ipv4Part = ip.split(":").pop();
      if (ipv4Part && ipv4Part.includes(".")) {
        cleanIp = ipv4Part;
      } else {
        // Pure IPv6 address - use a different strategy
        // Some APIs don't handle IPv6 well, so we'll provide dummy data
        console.log("IPv6 address detected, not all APIs support this:", ip);
        return {
          country_name: "Unknown (IPv6)",
          city: "Unknown",
          region: "Unknown",
        };
      }
    }

    console.log("Looking up location for IP:", cleanIp);

    // Use IP API to get location data with a timeout
    const response = await axios.get(`https://ipapi.co/${cleanIp}/json/`, {
      timeout: 3000, // 3-second timeout to prevent hanging
    });

    // Check if the API returned an error
    if (response.data && response.data.error) {
      console.log("IP API returned an error:", response.data.error);
      return null;
    }

    return response.data;
  } catch (error) {
    // Different error handling based on the error type
    if (error.code === "ECONNABORTED") {
      console.error("Timeout when fetching location data for IP:", ip);
    } else if (error.response) {
      // The request was made and the server responded with a non-2xx status
      console.error(
        "Error response from IP API:",
        error.response.status,
        error.response.data
      );
    } else if (error.request) {
      // The request was made but no response was received
      console.error("No response received when fetching location data");
    } else {
      // Something else happened while setting up the request
      console.error("Error fetching location data:", error.message);
    }

    // Return a null result so the application can continue
    return null;
  }
}
