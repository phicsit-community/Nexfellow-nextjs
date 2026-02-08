const LinkedInStrategy = require("passport-linkedin-oauth2").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const User = require("../models/userModel.js");
const Admin = require("../models/adminModel.js");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const querystring = require("querystring");
const randomStringGenerator = require("randomstring");
const Profile = require("../models/profileModel");
const tokenUtils = require("../utils/token");
const crypto = require("crypto");
const defaultProfilePicture =
  "https://nexfellow.b-cdn.net/defaults/default-profile.png";
const defaultBanner =
  "https://nexfellow.b-cdn.net/defaults/default-banner.png";

// Temporary storage for OAuth auth codes (in production, use Redis)
const oauthAuthCodes = new Map();

// Helper function to generate and store a temporary auth code
const generateOAuthCode = (userId, accessToken, refreshToken, isAdmin = false) => {
  const code = crypto.randomBytes(32).toString('hex');
  oauthAuthCodes.set(code, {
    userId,
    accessToken,
    refreshToken,
    isAdmin,
    expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
  });

  // Clean up expired codes
  setTimeout(() => oauthAuthCodes.delete(code), 5 * 60 * 1000);

  return code;
};

// Exchange OAuth code for cookies
module.exports.exchangeOAuthCode = async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ message: "Code is required" });
  }

  const authData = oauthAuthCodes.get(code);

  if (!authData || authData.expiresAt < Date.now()) {
    oauthAuthCodes.delete(code);
    return res.status(401).json({ message: "Invalid or expired code" });
  }

  // Delete the code immediately (one-time use)
  oauthAuthCodes.delete(code);

  // Set the cookies
  tokenUtils.setAuthCookies(res, authData.accessToken, authData.refreshToken);

  // Also set the legacy cookie for backward compatibility
  res.cookie(
    "userjwt",
    { token: authData.accessToken, expiresIn: new Date(Date.now() + 15 * 60 * 1000) },
    {
      httpOnly: true,
      maxAge: 15 * 60 * 1000,
      secure: process.env.NODE_ENV === "production",
      signed: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    }
  );

  let payload;
  if (authData.isAdmin) {
    const admin = await Admin.findById(authData.userId);
    payload = {
      id: admin._id,
      name: admin.username,
      username: admin.username,
      email: admin.email,
      picture: admin.picture,
      isAdmin: true,
    };
  } else {
    // Get user details
    const user = await User.findById(authData.userId);

    payload = {
      id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      picture: user.picture,
      banner: user.banner,
      profile: user.profile,
      verified: user.verified,
    };
  }

  res.status(200).json({
    success: true,
    payload,
    token: authData.accessToken,
    expiresIn: new Date(Date.now() + 15 * 60 * 1000),
    redirect: "/feed",
  });
};

const {
  LINKEDIN_CLIENT_ID,
  LINKEDIN_CLIENT_SECRET,
  LINKEDIN_REDIRECT_URI,
  BACKEND_DOMAIN,
  SITE_URL,
} = process.env;

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_DOMAIN}/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      // Store tokens along with profile data
      profile.accessToken = accessToken;
      profile.refreshToken = refreshToken;
      done(null, profile);
    }
  )
);

passport.use(
  new LinkedInStrategy(
    {
      clientID: LINKEDIN_CLIENT_ID,
      clientSecret: LINKEDIN_CLIENT_SECRET,
      callbackURL: `${BACKEND_DOMAIN}/auth/linkedin/callback`,
      scope: ["openid", "profile", "email"],
      state: true,
    },
    async (accessToken, refreshToken, profile, done) => {
      profile.accessToken = accessToken;
      profile.refreshToken = refreshToken;
      return done(null, profile);
    }
  )
);

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_DOMAIN}/auth/github/callback`,
      scope: ["user:email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      profile.accessToken = accessToken;
      profile.refreshToken = refreshToken;
      done(null, profile);
    }
  )
);

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      callbackURL: `${BACKEND_DOMAIN}/auth/facebook/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      // Store tokens along with profile data
      profile.accessToken = accessToken;
      profile.refreshToken = refreshToken;
      profile.facebookAccessToken = accessToken;
      profile.facebookRefreshToken = refreshToken;
      return done(null, profile);
    }
  )
);

passport.serializeUser(function (user, callback) {
  callback(null, user._id);
});

passport.deserializeUser(function (id, callback) {
  User.findById(id, function (err, user) {
    callback(err, user);
  });
});

async function generateUsername(fullName) {
  let firstWord = (String(fullName || "").trim().split(/\s+/)[0] || "user");
  let base = firstWord.replace(/[^a-zA-Z0-9_]/g, "").toLowerCase();
  if (!base) base = "user";

  const maxAttempts = 20;

  for (let i = 0; i < maxAttempts; i++) {
    const suffix = Math.floor(1000 + Math.random() * 9000);
    const candidate = `${base}${suffix}`;
    const exists = await User.exists({ username: candidate });
    if (!exists) return candidate;
  }

  return `${base}${Date.now().toString().slice(-6)}`;
}

module.exports.googleCallback = async (req, res) => {
  console.log("\n******** Inside handleGoogleLoginCallback function ********");

  const { state } = req.query;

  // Get Google tokens from the profile object
  const googleAccessToken = req.user.accessToken;
  const googleRefreshToken = req.user.refreshToken;

  if (state === "admin") {
    console.log("Processing Admin Google Login");
    const email = req.user._json.email;
    let existingAdmin = await Admin.findOne({ email });

    if (!existingAdmin) {
      console.log("Creating potentially new Unregistered Admin via Google");
      const randomPassword = crypto.randomBytes(16).toString("hex");
      const username =
        req.user._json.name.replace(/[^a-zA-Z0-9]/g, "").toLowerCase() +
        Math.floor(Math.random() * 1000);

      existingAdmin = await Admin.create({
        username,
        email,
        password: randomPassword,
        picture: req.user._json.picture || defaultProfilePicture,
      });
    }

    // Generate Admin Token signed with ADMIN_SECRET
    const adminToken = jwt.sign(
      { adminId: existingAdmin._id },
      process.env.ADMIN_SECRET,
      { expiresIn: "24h" }
    );

    // Generate Auth Code (isAdmin = true)
    const authCode = generateOAuthCode(
      existingAdmin._id,
      adminToken,
      null, // No refresh token needed for admin session duration managed by token logic
      true
    );

    // Redirect to frontend with auth code
    const redirectUrl = `${process.env.SITE_URL}/auth/callback?code=${authCode}`;
    return res.redirect(redirectUrl);
  }

  // Regular User Flow
  let existingUser = await User.findOne({ email: req.user._json.email });

  if (existingUser) {
    if (!existingUser.googleId) {
      existingUser.googleId = req.user._json.sub;
    }

    // Update Google tokens
    existingUser.googleAccessToken = googleAccessToken;
    existingUser.googleRefreshToken = googleRefreshToken;
    await existingUser.save();
  } else {
    console.log("Creating new Unregistered User");
    username = await generateUsername(req.user._json.name);
    existingUser = await User.create({
      name: req.user._json.name,
      email: req.user._json.email,
      picture: defaultProfilePicture,
      banner: defaultBanner,
      googleId: req.user._json.sub,
      googleAccessToken,
      googleRefreshToken,
      verified: true,
      username: username,
    });

    const referralCodeString = randomStringGenerator.generate(7).toUpperCase();
    const profile = await Profile.create({
      userId: existingUser._id,
      referralCodeString: referralCodeString,
    });

    await profile.save();
    existingUser.profile = profile._id;
    await existingUser.save();
  }

  // Generate access and refresh tokens
  const accessToken = tokenUtils.generateAccessToken(existingUser);
  const refreshToken = tokenUtils.generateRefreshToken(existingUser);

  // Store refresh token in database
  await tokenUtils.storeRefreshToken(existingUser._id, refreshToken);

  // Generate a temporary auth code for cross-domain auth
  const authCode = generateOAuthCode(
    existingUser._id,
    accessToken,
    refreshToken
  );

  // Redirect to frontend with auth code
  const redirectUrl = `${process.env.SITE_URL}/auth/callback?code=${authCode}`;
  return res.redirect(redirectUrl);
};

module.exports.githubCallback = async (req, res) => {
  console.log("\n******** Inside handleGitHubLoginCallback function ********");

  const githubAccessToken = req.user.accessToken;
  const githubRefreshToken = req.user.refreshToken; // usually undefined

  const email =
    req.user.emails?.[0]?.value || `${req.user.username}@github.com`;

  let existingUser = await User.findOne({ email });

  if (existingUser) {
    if (!existingUser.githubId) {
      existingUser.githubId = req.user.id;
    }

    existingUser.githubAccessToken = githubAccessToken;
    await existingUser.save();
  } else {
    console.log("Creating new Unregistered GitHub User");
    const username = await generateUsername(
      req.user.displayName || req.user.username
    );

    existingUser = await User.create({
      name: req.user.displayName || req.user.username,
      email,
      picture: defaultProfilePicture,
      banner: defaultBanner,
      githubId: req.user.id,
      githubAccessToken,
      verified: true,
      username: username,
    });

    const referralCodeString = randomStringGenerator.generate(7).toUpperCase();
    const profile = await Profile.create({
      userId: existingUser._id,
      referralCodeString,
    });

    await profile.save();
    existingUser.profile = profile._id;
    await existingUser.save();
  }

  const accessToken = tokenUtils.generateAccessToken(existingUser);
  const refreshToken = tokenUtils.generateRefreshToken(existingUser);
  await tokenUtils.storeRefreshToken(existingUser._id, refreshToken);

  // Generate a temporary auth code for cross-domain auth
  const authCode = generateOAuthCode(existingUser._id, accessToken, refreshToken);

  // Redirect to frontend with auth code
  const redirectUrl = `${process.env.SITE_URL}/auth/callback?code=${authCode}`;
  return res.redirect(redirectUrl);
};

module.exports.facebookCallback = async (req, res) => {
  console.log(
    "\n******** Inside handleFacebookLoginCallback function ********"
  );

  // Get Facebook tokens from the profile object
  const facebookAccessToken = req.user.accessToken;
  const facebookRefreshToken = req.user.refreshToken;

  // Facebook doesn't always provide email, so we might need to use a fallback
  const email =
    req.user.emails?.[0]?.value || `${req.user.username}@facebook.user`;

  let existingUser = await User.findOne({
    $or: [{ email }, { facebookId: req.user.id }],
  });

  if (existingUser) {
    if (!existingUser.facebookId) {
      existingUser.facebookId = req.user.id;
    }

    // Update Facebook tokens
    existingUser.facebookAccessToken = facebookAccessToken;
    existingUser.facebookRefreshToken = facebookRefreshToken;
    await existingUser.save();
  } else {
    console.log("Creating new Unregistered Facebook User");
    const username = await generateUsername(
      req.user.displayName || req.user.username
    );

    existingUser = await User.create({
      name: req.user.displayName || req.user.username,
      email,
      picture: defaultProfilePicture,
      banner: defaultBanner,
      facebookId: req.user.id,
      facebookAccessToken,
      facebookRefreshToken,
      verified: true,
      username: username,
    });

    const referralCodeString = randomStringGenerator.generate(7).toUpperCase();
    const profile = await Profile.create({
      userId: existingUser._id,
      referralCodeString,
    });

    await profile.save();
    existingUser.profile = profile._id;
    await existingUser.save();
  }

  // Generate access and refresh tokens
  const accessToken = tokenUtils.generateAccessToken(existingUser);
  const refreshToken = tokenUtils.generateRefreshToken(existingUser);

  // Store refresh token in database
  await tokenUtils.storeRefreshToken(existingUser._id, refreshToken);

  // Generate a temporary auth code for cross-domain auth
  const authCode = generateOAuthCode(existingUser._id, accessToken, refreshToken);

  // Redirect to frontend with auth code
  const redirectUrl = `${process.env.SITE_URL}/auth/callback?code=${authCode}`;
  return res.redirect(redirectUrl);
};

exports.getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const payload = {
      id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      picture: user.picture,
      banner: user.banner,
      googleId: user.googleId,
      profile: user.profile,
      registeredQuizzes: user.registeredQuizzes,
      verified: user.verified,
    };

    // Calculate token expiration times
    const accessExpiry = new Date();
    accessExpiry.setTime(accessExpiry.getTime() + 2 * 60 * 60 * 1000); // 2 hours from now

    // Return user details with token expiry information
    res.status(200).json({
      payload: payload,
      expiresIn: accessExpiry.toISOString(),
      tokenExpiry: {
        accessToken: "2h",
        refreshToken: "30d",
      },
      redirect: "/feed",
    });
  } catch (error) {
    console.error("Error retrieving user details:", error);
    res.status(500).json({ message: "Failed to retrieve user details" });
  }
};

module.exports.logout = (req, res) => {
  // Clear all auth cookies
  tokenUtils.clearAuthCookies(res);

  // Update user to invalidate refresh token
  if (req.userId) {
    User.findByIdAndUpdate(req.userId, {
      refreshToken: null,
      refreshTokenExpiry: null,
    }).catch((err) => console.error("Error clearing refresh token:", err));
  }

  const redirectUrl = `${process.env.SITE_URL}/login`;
  res.redirect(redirectUrl);
};

/**
 * Refresh access token using the refresh token
 */
module.exports.refreshToken = async (req, res) => {
  try {
    // Get refresh token from cookies
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token not found" });
    }

    // Verify refresh token
    const decoded = tokenUtils.verifyRefreshToken(refreshToken);

    if (!decoded) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    // Find user and check if refresh token matches
    const user = await User.findById(decoded.id);

    if (
      !user ||
      user.refreshToken !== refreshToken ||
      !user.refreshTokenExpiry ||
      user.refreshTokenExpiry < new Date()
    ) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    // Generate new access token
    const newAccessToken = tokenUtils.generateAccessToken(user);

    // Calculate expiration time based on ACCESS_TOKEN_EXPIRY
    const expiresIn = new Date();
    expiresIn.setTime(expiresIn.getTime() + 2 * 60 * 60 * 1000); // 2 hours

    // Set the new access token as a cookie
    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 2 * 60 * 60 * 1000, // 2 hours, matching token expiry
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
        maxAge: 2 * 60 * 60 * 1000, // 2 hours,
        secure: process.env.NODE_ENV === "production",
        signed: true,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      }
    );

    return res.status(200).json({
      message: "Token refreshed successfully",
      expiresIn: expiresIn.toISOString(),
    });
  } catch (error) {
    console.error("Token refresh error:", error);
    return res.status(500).json({ message: "Failed to refresh token" });
  }
};

// Step 1: Redirect to LinkedIn's OAuth 2.0 authorization URL
exports.linkedinAuth = (req, res) => {
  const authorizationUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${LINKEDIN_CLIENT_ID}&redirect_uri=${encodeURIComponent(
    LINKEDIN_REDIRECT_URI
  )}&scope=openid%20profile%20email&state=random_state_string`;

  res.redirect(authorizationUrl);
};

// Step 2: Callback URL handling after user grants or denies permission
exports.linkedinCallback = async (req, res) => {
  const { code, state } = req.query;

  if (state !== "random_state_string") {
    return res.status(400).send("State mismatch");
  }

  try {
    // Get access token from LinkedIn
    const tokenResponse = await axios.post(
      "https://www.linkedin.com/oauth/v2/accessToken",
      querystring.stringify({
        grant_type: "authorization_code",
        code,
        client_id: LINKEDIN_CLIENT_ID,
        client_secret: LINKEDIN_CLIENT_SECRET,
        redirect_uri: LINKEDIN_REDIRECT_URI,
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const { access_token } = tokenResponse.data;

    // Get user profile from LinkedIn
    const profileResponse = await axios.get(
      "https://api.linkedin.com/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    const profile = profileResponse.data;
    const email = profile.email;
    const linkedinId = profile.sub;
    const name = profile.name || `${profile.given_name || ''} ${profile.family_name || ''}`.trim();

    let existingUser = await User.findOne({
      $or: [{ email }, { linkedinId }]
    });

    if (existingUser) {
      if (!existingUser.linkedinId) {
        existingUser.linkedinId = linkedinId;
      }
      existingUser.linkedinAccessToken = access_token;
      await existingUser.save();
    } else {
      console.log("Creating new LinkedIn User");
      const username = await generateUsername(name);

      existingUser = await User.create({
        name,
        email,
        picture: profile.picture || defaultProfilePicture,
        banner: defaultBanner,
        linkedinId,
        linkedinAccessToken: access_token,
        verified: true,
        username,
      });

      const referralCodeString = randomStringGenerator.generate(7).toUpperCase();
      const profileDoc = await Profile.create({
        userId: existingUser._id,
        referralCodeString,
      });

      await profileDoc.save();
      existingUser.profile = profileDoc._id;
      await existingUser.save();
    }

    // Generate access and refresh tokens
    const accessToken = tokenUtils.generateAccessToken(existingUser);
    const refreshToken = tokenUtils.generateRefreshToken(existingUser);

    // Store refresh token in database
    await tokenUtils.storeRefreshToken(existingUser._id, refreshToken);

    // Generate a temporary auth code for cross-domain auth
    const authCode = generateOAuthCode(existingUser._id, accessToken, refreshToken);

    // Redirect to frontend with auth code
    const redirectUrl = `${SITE_URL}/auth/callback?code=${authCode}`;
    return res.redirect(redirectUrl);
  } catch (error) {
    console.error(
      "Error in LinkedIn callback:",
      error.response?.data || error.message
    );
    res.redirect(`${SITE_URL}/login?error=linkedin_auth_failed`);
  }
};

// Step 4: Get profile using OpenID Connect userinfo endpoint
exports.getLinkedInProfile = async (req, res) => {
  const { access_token } = req.query;

  try {
    const profileResponse = await axios.get(
      "https://api.linkedin.com/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    res.json(profileResponse.data);
  } catch (error) {
    console.error("Error fetching LinkedIn profile:", error);
    res.status(500).send("Error fetching profile data");
  }
};

exports.refreshAccessToken = async (refreshToken) => {
  try {
    const response = await axios.post(
      "https://www.linkedin.com/oauth/v2/accessToken",
      querystring.stringify({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: LINKEDIN_CLIENT_ID,
        client_secret: LINKEDIN_CLIENT_SECRET,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error refreshing access token:", error);
    throw new Error("Unable to refresh access token");
  }
};
