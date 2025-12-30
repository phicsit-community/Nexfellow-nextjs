const jwt = require("jsonwebtoken");
const User = require("../../models/userModel");

// Token durations
const ACCESS_TOKEN_EXPIRY = "2h"; // 2 hours instead of 15 minutes
const REFRESH_TOKEN_EXPIRY = "30d"; // 30 days

/**
 * Generate JWT access token
 * @param {Object} user - User object
 * @returns {String} access token
 */
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id },
    process.env.ACCESS_TOKEN_SECRET || process.env.USER_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
};

/**
 * Generate JWT refresh token
 * @param {Object} user - User object
 * @returns {String} refresh token
 */
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    process.env.REFRESH_TOKEN_SECRET || process.env.USER_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );
};

/**
 * Verify access token
 * @param {String} token - JWT token
 * @returns {Object} decoded token or null
 */
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET || process.env.USER_SECRET
    );
  } catch (error) {
    return null;
  }
};

/**
 * Verify refresh token
 * @param {String} token - JWT token
 * @returns {Object} decoded token or null
 */
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(
      token,
      process.env.REFRESH_TOKEN_SECRET || process.env.USER_SECRET
    );
  } catch (error) {
    return null;
  }
};

/**
 * Store refresh token in database
 * @param {String} userId - User ID
 * @param {String} refreshToken - JWT refresh token
 */
const storeRefreshToken = async (userId, refreshToken) => {
  const refreshTokenExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
  await User.findByIdAndUpdate(userId, {
    refreshToken,
    refreshTokenExpiry,
  });
};

/**
 * Set authentication cookies
 * @param {Object} res - Express response object
 * @param {String} accessToken - JWT access token
 * @param {String} refreshToken - JWT refresh token
 */
const setAuthCookies = (res, accessToken, refreshToken) => {
  // Set access token cookie - short-lived
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: true, // Use in production with HTTPS
    sameSite: "none", // For cross-site requests
    maxAge: 2 * 60 * 60 * 1000, // 2 hours
  });

  // Set refresh token cookie - longer lived
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true, // Use in production with HTTPS
    sameSite: "none", // For cross-site requests
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
};

/**
 * Clear authentication cookies
 * @param {Object} res - Express response object
 */
const clearAuthCookies = (res) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });

  // Also clear the old cookie for backward compatibility
  res.clearCookie("userjwt", {
    signed: true,
    httpOnly: true,
    sameSite: "none",
    secure: true,
  });
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  storeRefreshToken,
  setAuthCookies,
  clearAuthCookies,
  ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_EXPIRY,
};
