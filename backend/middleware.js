const User = require("./models/userModel");
const jwt = require("jsonwebtoken");
const Admin = require("./models/adminModel");
const Community = require("./models/communityModel");
const Challenge = require("./models/challengeModel");
const Event = require("./models/eventModel");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const tokenUtils = require("./utils/token");

const isAuthenticated = async (req, res, next) => {
  try {
    // Check for access token in cookies
    const accessToken = req.cookies.accessToken;
    const refreshToken = req.cookies.refreshToken;

    if (!accessToken && !refreshToken) {
      return res.status(401).json({ message: "Unauthorized. Please log in." });
    }

    // First try to use the access token
    if (accessToken) {
      const decoded = tokenUtils.verifyAccessToken(accessToken);

      if (decoded) {
        // Access token is valid
        const user = await User.findById(decoded.id);

        if (!user) {
          return res.status(401).json({ message: "User not found." });
        }

        // Attach user to request object
        req.userId = user.id;
        req.user = user;
        return next();
      }
    }

    // If we get here, access token is invalid or expired
    // Try to use refresh token to get a new access token
    if (refreshToken) {
      const decoded = tokenUtils.verifyRefreshToken(refreshToken);

      if (!decoded) {
        return res.status(401).json({
          message: "Session expired. Please log in again.",
        });
      }

      // Find user and check if refresh token matches
      const user = await User.findById(decoded.id);

      if (
        !user ||
        user.refreshToken !== refreshToken ||
        !user.refreshTokenExpiry ||
        user.refreshTokenExpiry < new Date()
      ) {
        return res.status(401).json({
          message: "Invalid session. Please log in again.",
        });
      }

      // Generate new access token
      const newAccessToken = tokenUtils.generateAccessToken(user);

      // Calculate expiration time
      const expiresIn = new Date();
      expiresIn.setTime(expiresIn.getTime() + 2 * 60 * 60 * 1000); // 2 hours

      // Set the new access token as a cookie
      res.cookie("accessToken", newAccessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 2 * 60 * 60 * 1000, // 2 hours
      });

      // For backward compatibility
      res.cookie(
        "userjwt",
        {
          token: newAccessToken,
          expiresIn,
        },
        {
          httpOnly: true,
          maxAge: 2 * 60 * 60 * 1000, // 2 hours
          secure: true,
          signed: true,
          sameSite: "none",
        }
      );

      // Attach user to request object
      req.userId = user.id;
      req.user = user;
      return next();
    }

    // If we get here, both tokens are invalid
    return res.status(401).json({
      message: "Authentication failed. Please log in again.",
    });
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(500).json({
      message: "Authentication error occurred.",
    });
  }
};

// Legacy middleware for backward compatibility
const isClient = async (req, res, next) => {
  try {
    // Check for access token in cookies
    const accessToken = req.cookies.accessToken;
    const refreshToken = req.cookies.refreshToken;

    if (!accessToken && !refreshToken && !req.signedCookies.userjwt) {
      return res.status(401).json("Not Logged In");
    }

    // First try to use the access token
    if (accessToken) {
      const decoded = tokenUtils.verifyAccessToken(accessToken);

      if (decoded) {
        // Access token is valid
        const user = await User.findById(decoded.id);

        if (!user) {
          return res.status(401).json("User not found");
        }

        // Attach user to request object
        req.userId = user.id;
        req.user = user;
        return next();
      }
    }

    // If we get here, access token is invalid or expired
    // Try to use refresh token to get a new access token
    if (refreshToken) {
      const decoded = tokenUtils.verifyRefreshToken(refreshToken);

      if (!decoded) {
        // Try old cookie as last resort
        return tryOldCookie();
      }

      // Find user and check if refresh token matches
      const user = await User.findById(decoded.id);

      if (
        !user ||
        user.refreshToken !== refreshToken ||
        !user.refreshTokenExpiry ||
        user.refreshTokenExpiry < new Date()
      ) {
        // Try old cookie as last resort
        return tryOldCookie();
      }

      // Generate new access token
      const newAccessToken = tokenUtils.generateAccessToken(user);

      // Calculate expiration time
      const expiresIn = new Date();
      expiresIn.setTime(expiresIn.getTime() + 2 * 60 * 60 * 1000); // 2 hours

      // Set the new access token as a cookie
      res.cookie("accessToken", newAccessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 2 * 60 * 60 * 1000, // 2 hours
      });

      // For backward compatibility
      res.cookie(
        "userjwt",
        {
          token: newAccessToken,
          expiresIn,
        },
        {
          httpOnly: true,
          maxAge: 2 * 60 * 60 * 1000, // 2 hours
          secure: true,
          signed: true,
          sameSite: "none",
        }
      );

      // Attach user to request object
      req.userId = user.id;
      req.user = user;
      return next();
    }

    // Fall back to old cookie method
    return tryOldCookie();

    // Helper function to try old cookie auth method
    function tryOldCookie() {
      const cookie = req.signedCookies.userjwt;

      if (!cookie) {
        return res.status(401).json("Not Logged In");
      }

      try {
        const token = cookie.token;
        const expiresIn = cookie.expiresIn;
        const decoded = jwt.verify(token, process.env.USER_SECRET);

        User.findById(decoded.id)
          .then((user) => {
            if (!user) {
              return res.status(401).json("Unauthorized");
            }

            req.userId = user.id;
            req.user = user;
            req.expIn = expiresIn;

            // Generate refresh token if it doesn't exist to keep the user logged in
            if (
              !user.refreshToken ||
              !user.refreshTokenExpiry ||
              user.refreshTokenExpiry < new Date()
            ) {
              const refreshToken = tokenUtils.generateRefreshToken(user);
              tokenUtils.storeRefreshToken(user._id, refreshToken);

              // Set the refresh token as a cookie
              res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: "none",
                maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
              });
            }

            next();
          })
          .catch((err) => {
            console.error("User lookup error:", err);
            return res.status(401).json("Unauthorized");
          });
      } catch (e) {
        console.error("Token verification error:", e);
        return res.status(401).json("Unauthorized");
      }
    }
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(500).json("Authentication error occurred");
  }
};

const isCommunityCreator = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.isCommunityAccount) {
      return res
        .status(401)
        .json({ message: "Access restricted to community accounts only" });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

/**
 * Middleware to authorize based on owner or specified moderator roles
 * Tries communityId from: params → body → req.community → event → challenge
 */
function isOwnerOrModeratorWithRole(allowedRoles = []) {
  return async (req, res, next) => {
    try {
      // Try direct communityId sources first
      let communityId =
        req.params.communityId ||
        req.body.communityId ||
        (req.community && req.community._id?.toString());

      // Fallback 1: from event
      if (!communityId && req.params.eventId) {
        const event = await Event.findById(req.params.eventId);
        if (!event) {
          return res.status(404).json({ message: "Event not found" });
        }
        communityId = event.communityId?.toString();
      }

      // Fallback 2: from challenge
      if (!communityId && req.params.challengeId) {
        const challenge = await Challenge.findById(req.params.challengeId);
        if (!challenge) {
          return res.status(404).json({ message: "Challenge not found" });
        }
        communityId = challenge.community?.toString();
      }

      if (!communityId) {
        return res.status(400).json({ message: "Community ID is required" });
      }

      // Use req.community if already loaded, else fetch from DB
      let community = req.community;
      if (!community || community._id?.toString() !== communityId) {
        community = await Community.findById(communityId);
      }
      if (!community) {
        return res.status(404).json({ message: "Community not found" });
      }

      const userId = req.user._id.toString();
      const isOwner = community.owner?.toString() === userId;

      let matchedRole = null;
      const modEntry = (community.moderators || []).find(
        (mod) =>
          mod.user?.toString() === userId && allowedRoles.includes(mod.role)
      );
      if (modEntry) {
        matchedRole = modEntry.role;
      }

      if (!isOwner && !matchedRole) {
        return res.status(401).json({ message: "Not authorized" });
      }

      // Attach community and moderator role for downstream use
      req.community = community;
      req.communityModeratorRole = isOwner ? "creator" : matchedRole;

      return next();
    } catch (error) {
      res
        .status(500)
        .json({ message: "Authorization check failed", error: error.message });
    }
  };
}

const isAdmin = async (req, res, next) => {
  const token = req.signedCookies.adminjwt;
  console.log(req.signedCookies);
  if (!token) {
    return res.status(404).json("No token provided");
  }

  try {
    const decoded = jwt.verify(token, process.env.ADMIN_SECRET);
    if (!decoded) {
      return res.status(400).json("Invalid token");
    }
    const admin = await Admin.findById(decoded.adminId);
    if (!admin) {
      return res.status(420).json("Not an admin");
    }
    req.adminId = admin._id;
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json("Internal server error");
  }
};

const setUserIfLoggedIn = async (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken;
    const refreshToken = req.cookies.refreshToken;
    const userjwt = req.signedCookies.userjwt;

    if (accessToken) {
      const decoded = tokenUtils.verifyAccessToken(accessToken);
      if (decoded) {
        const user = await User.findById(decoded.id);
        if (user) {
          req.userId = user.id;
          req.user = user;
          return next();
        }
      }
    }

    if (refreshToken) {
      const decoded = tokenUtils.verifyRefreshToken(refreshToken);
      if (decoded) {
        const user = await User.findById(decoded.id);
        if (
          user &&
          user.refreshToken === refreshToken &&
          user.refreshTokenExpiry &&
          user.refreshTokenExpiry > new Date()
        ) {
          req.userId = user.id;
          req.user = user;
          return next();
        }
      }
    }

    if (userjwt) {
      try {
        const token = userjwt.token;
        const decoded = jwt.verify(token, process.env.USER_SECRET);
        const user = await User.findById(decoded.id);
        if (user) {
          req.userId = user.id;
          req.user = user;
          return next();
        }
      } catch (e) {
        // Invalid token, just continue
      }
    }

    next();
  } catch (error) {
    console.error("Soft auth error:", error);
    next();
  }
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 3 * 1024 * 1024 }, // 3MB
});

module.exports = {
  isAdmin,
  isClient,
  isCommunityCreator,
  isOwnerOrModeratorWithRole,
  upload,
  isAuthenticated,
  setUserIfLoggedIn,
};
