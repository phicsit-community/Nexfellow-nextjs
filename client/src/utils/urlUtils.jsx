/**
 * URL handling utilities for the client application
 */

/**
 * Parse content text and make URLs clickable
 * @param {string} content - Text content that may contain URLs
 * @returns {React.ReactNode} - Content with clickable links
 */
export const parseContent = (content) => {
  if (!content) return "";

  // Regular expression to match URLs
  const urlRegex = /(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/g;

  // Split content by URLs
  const parts = content.split(urlRegex);
  const matches = content.match(urlRegex) || [];

  // Combine parts and matches
  const result = [];
  for (let i = 0; i < parts.length; i++) {
    result.push(parts[i]);
    if (i < matches.length) {
      const url = matches[i];
      // If this is a shortened URL
      if (url.includes("/link/")) {
        // Extract the shortCode from the URL
        const shortCode = url.split("/link/")[1];

        result.push(
          <a
            href={url}
            key={i}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              // Don't navigate to stats page when clicking a link in a post
              // Instead, just redirect to the original URL
              e.preventDefault();

              // Redirect to the API endpoint which will handle the redirect and tracking
              window.open(
                `${import.meta.env.REACT_APP_API_URL || ""}/link/${shortCode}`,
                "_blank"
              );
            }}
            style={{ color: "#3355cc", textDecoration: "underline" }}
          >
            {url}
          </a>
        );
      } else {
        result.push(
          <a
            href={url}
            key={i}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#3355cc", textDecoration: "underline" }}
          >
            {url}
          </a>
        );
      }
    }
  }

  return result;
};

/**
 * Extract all URLs from content
 * @param {string} content - Text content that may contain URLs
 * @returns {string[]} - Array of URLs
 */
export const extractUrls = (content) => {
  if (!content) return [];

  // Regular expression to match URLs
  const urlRegex = /(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/g;

  // Extract all matches
  return content.match(urlRegex) || [];
};
