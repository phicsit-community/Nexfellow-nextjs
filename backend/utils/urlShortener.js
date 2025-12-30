const ShortenedUrl = require("../models/shortenedUrlModel");

/**
 * Utility functions for URL extraction and shortening
 */

/**
 * Extract URLs from a text string
 * @param {string} text - The text to extract URLs from
 * @returns {string[]} - Array of extracted URLs
 */
exports.extractUrls = (text) => {
  if (!text) return [];

  // Regular expression to match URLs
  const urlRegex = /(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/g;

  // Extract all matches
  return text.match(urlRegex) || [];
};

/**
 * Shorten a single URL
 * @param {string} url - The URL to shorten
 * @param {string} userId - User ID of the creator
 * @param {string} postId - Post ID associated with the URL
 * @param {string} communityId - Community ID associated with the URL
 * @returns {Promise<{originalUrl: string, shortUrl: string, shortCode: string}>} - The shortened URL data
 */
exports.shortenUrl = async (url, userId, postId, communityId) => {
  try {
    // Check if this URL has already been shortened
    const existingUrl = await ShortenedUrl.findOne({ originalUrl: url });

    if (existingUrl) {
      return {
        originalUrl: existingUrl.originalUrl,
        shortCode: existingUrl.shortCode,
        shortUrl: `${process.env.SITE_URL}/link/${existingUrl.shortCode}`,
      };
    }

    // Create a new shortened URL
    const shortenedUrl = await ShortenedUrl.createShortUrl(
      url,
      userId,
      postId,
      communityId
    );

    return {
      originalUrl: shortenedUrl.originalUrl,
      shortCode: shortenedUrl.shortCode,
      shortUrl: `${process.env.SITE_URL}/link/${shortenedUrl.shortCode}`,
    };
  } catch (error) {
    console.error("Error shortening URL:", error);
    throw error;
  }
};

/**
 * Process text content and replace all URLs with shortened versions
 * @param {string} content - The content containing URLs to shorten
 * @param {string} userId - User ID of the creator
 * @param {string} postId - Post ID associated with the URL
 * @param {string} communityId - Community ID associated with the URL
 * @returns {Promise<{processedContent: string, shortenedUrls: Array}>} - Processed content with shortened URLs and list of shortened URLs
 */
exports.processAndShortenUrls = async (
  content,
  userId,
  postId,
  communityId
) => {
  try {
    const urls = this.extractUrls(content);
    let processedContent = content;
    const shortenedUrls = [];

    // Process each URL in sequence
    for (const url of urls) {
      const shortened = await this.shortenUrl(url, userId, postId, communityId);
      shortenedUrls.push(shortened);

      // Replace the original URL with the shortened URL in the content
      processedContent = processedContent.replace(url, shortened.shortUrl);
    }

    return {
      processedContent,
      shortenedUrls,
    };
  } catch (error) {
    console.error("Error processing URLs:", error);
    throw error;
  }
};
