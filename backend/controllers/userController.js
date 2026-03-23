const User = require("../models/userModel");
const Community = require("../models/communityModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const Mailgen = require("mailgen");
const randomStringGenerator = require("randomstring");
const ExpressError = require("../utils/ExpressError");
const mailSender = require("../utils/mailSender");
const Profile = require("../models/profileModel");
const Request = require("../models/Request");
const mongoose = require("mongoose");
const NotificationService = require("../utils/notificationService");
const fs = require("fs");
const { getIo } = require("../utils/websocket");
const tokenUtils = require("../utils/token");
const otpManager = require("../utils/otpManager");
const backendURL = process.env.BACKEND_DOMAIN;
const { uploadOnBunny, removeFromBunny } = require("../utils/attachments");
const defaultProfilePicture =
  "https://nexfellow.b-cdn.net/defaults/default-profile.png";
const defaultBanner = "https://nexfellow.b-cdn.net/defaults/default-banner.png";
const {
  FOLLOWER_MILESTONES,
  MILESTONE_MESSAGES,
} = require("../utils/milestone");

module.exports.sendProfileDetails = async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) {
    throw new ExpressError("user not found", 400);
  }
  const userDetails = await user.populate("profile");
  const userFullDetails = {
    name: user.name,
    username: user.username,
    rating: userDetails.profile.rating,
    text: userDetails.profile.bio,
    professions: userDetails.profile.professions,
    platformLink: userDetails.profile.platformLinks,
    occupation: userDetails.profile.occupation,
    phoneNo: userDetails.profile.phoneNumber,
    dob: userDetails.profile.dateOfBirth,
    profilePhoto: user.picture,
    banner: user.banner,
    bio: userDetails.profile.bio,
    referralCodeString: userDetails.profile.referralCodeString,
    country: user.country,
    coin: userDetails.profile.coin,
  };
  //console.log(userFullDetails);
  res.status(200).json(userFullDetails);
};

module.exports.login = async (req, res) => {
  let { email, password } = req.body;
  if (!email || !password) throw new ExpressError("missing fields", 400);

  email = email.toLowerCase();
  // ⬇️ password + email are select:false → explicitly include them
  const user = await User.findOne({ email }).select("+password +email +isOtpVerified");

  if (!user) throw new ExpressError("invalid credentials", 400);

  // Check if user has a password (OAuth users might not have one)
  if (!user.password) {
    throw new ExpressError("This account uses social login (Google/LinkedIn/GitHub). Please sign in using that method.", 400);
  }

  if (!bcrypt.compareSync(password, user.password)) {
    throw new ExpressError("invalid credentials password", 400);
  }

  if (typeof user.isOtpVerified === "undefined") {
    user.isOtpVerified = false;
    await user.save();
  }

  // 🔐 OTP step
  if (!user.isOtpVerified) {
    const { otp, expiry } = await otpManager.storeOTPForUser(
      user._id,
      otpManager.generateOTP()
    );

    await otpManager.storeOTPForUser(user._id, otp);
    await otpManager.sendOTPEmail(user.email, user, otp, "login");

    return res.status(200).json({
      message: "OTP sent to your email. Please verify to proceed.",
      email: user.email,
      otpRequired: true,
      expiresAt: expiry,
    });
  }

  // ✅ Issue tokens
  const accessToken = tokenUtils.generateAccessToken(user);
  const refreshToken = tokenUtils.generateRefreshToken(user);

  await tokenUtils.storeRefreshToken(user._id, refreshToken);
  tokenUtils.setAuthCookies(res, accessToken, refreshToken);

  const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000);

  res.cookie("userjwt",
    { token: accessToken, expiresIn: expiresAt },
    {
      signed: true,
      httpOnly: true,
      sameSite: "none",
      maxAge: 2 * 60 * 60 * 1000,
      secure: true,
    }
  );

  const payload = {
    id: user._id,
    name: user.name,
    username: user.username,
    email: user.email,
    picture: user.picture,
    googleId: user.googleId,
    profile: user.profile,
    registeredQuizzes: user.registeredQuizzes,
    followedCommunities: user.followedCommunities,
    themePreference: user.themePreference,
    owner: user?.createdCommunity,
    verified: user.verified,
    verificationBadge: user.verificationBadge,
    isCommunityAccount: user.isCommunityAccount
  };

  const redirectUrl = req.signedCookies.redirectUrl || "/feed";
  res.clearCookie("redirectUrl", { signed: true, httpOnly: true });

  return res.status(200).json({
    payload,
    token: accessToken,
    redirect: redirectUrl,
    expiresIn: expiresAt.toISOString(),
    tokenExpiry: {
      accessToken: tokenUtils.ACCESS_TOKEN_EXPIRY,
      refreshToken: tokenUtils.REFRESH_TOKEN_EXPIRY,
    },
  });
};

module.exports.updateThemePreference = async (req, res) => {
  const { theme } = req.body;
  if (!theme || !["light", "dark", "system"].includes(theme)) {
    return res.status(400).json({ msg: "Invalid theme" });
  }

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { themePreference: theme },
    { new: true }
  ).select("themePreference");

  res.status(200).json(user.themePreference);
};

module.exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) throw new ExpressError("Missing email or OTP", 400);

  // ⬇️ otpHash, otpSalt, otpExpiry are select:false
  const user = await User.findOne({ email: email.toLowerCase() })
    .select("+otpHash +otpSalt +otpExpiry +isOtpVerified +email");

  if (!user) throw new ExpressError("User not found", 404);

  if (!user.otpHash || !user.otpSalt || !user.otpExpiry)
    throw new ExpressError("OTP not requested", 400);

  if (otpManager.isOTPExpired(user.otpExpiry)) {
    throw new ExpressError("OTP has expired", 400);
  }

  const isValid = otpManager.verifyOTP(otp, user.otpHash, user.otpSalt);
  if (!isValid) throw new ExpressError("Invalid OTP", 400);

  user.isOtpVerified = true;
  user.otpHash = undefined;
  user.otpSalt = undefined;
  user.otpExpiry = undefined;
  await user.save();

  // ✅ Tokens
  const accessToken = tokenUtils.generateAccessToken(user);
  const refreshToken = tokenUtils.generateRefreshToken(user);

  await tokenUtils.storeRefreshToken(user._id, refreshToken);
  tokenUtils.setAuthCookies(res, accessToken, refreshToken);

  const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000);

  res.cookie("userjwt",
    { token: accessToken, expiresIn: expiresAt },
    {
      signed: true,
      httpOnly: true,
      sameSite: "none",
      maxAge: 2 * 60 * 60 * 1000,
      secure: true,
    }
  );

  const payload = {
    id: user._id,
    name: user.name,
    username: user.username,
    email: user.email,
    picture: user.picture,
    googleId: user.googleId,
    profile: user.profile,
    registeredQuizzes: user.registeredQuizzes,
    followedCommunities: user.followedCommunities,
    verified: user.verified,
    verificationBadge: user.verificationBadge,
    isCommunityAccount: user.isCommunityAccount,
  };

  const redirectUrl = req.signedCookies.redirectUrl || "/feed";
  res.clearCookie("redirectUrl", { signed: true, httpOnly: true });

  return res.status(200).json({
    message: "OTP verified successfully",
    otpVerified: true,
    payload,
    token: accessToken,
    redirect: redirectUrl,
    expiresIn: expiresAt.toISOString(),
    tokenExpiry: {
      accessToken: tokenUtils.ACCESS_TOKEN_EXPIRY,
      refreshToken: tokenUtils.REFRESH_TOKEN_EXPIRY,
    },
  });
};

// 🔹 RESEND OTP
module.exports.resendOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) throw new ExpressError("Email is required", 400);

  const user = await User.findOne({ email: email.toLowerCase() }).select("+isOtpVerified +email");
  if (!user) throw new ExpressError("User not found", 404);

  if (user.isOtpVerified) {
    return res.status(400).json({ message: "OTP already verified" });
  }

  const { otp, expiry } = await otpManager.storeOTPForUser(
    user._id,
    otpManager.generateOTP()
  );

  await otpManager.storeOTPForUser(user._id, otp);
  await otpManager.sendOTPEmail(user.email, user, otp);

  return res.status(200).json({
    message: "A new OTP has been sent to your email.",
    email: user.email,
    otpRequired: true,
    expiresAt: expiry,
  });
};

function generateUsername(fullName) {
  // Split the full name by spaces
  let nameParts = fullName.split(" ");
  let firstName = nameParts[0];
  let randomNumber = Math.floor(1000 + Math.random() * 9000);
  let username = firstName + randomNumber;

  return username;
}

module.exports.register = async (req, res) => {
  let { name, email, password, referralcode } = req.body;
  if (!name || !email || !password)
    throw new ExpressError("missing fields", 400);

  email = email.toLowerCase();
  const registeredEmail = await User.findOne({ email });
  if (registeredEmail) throw new ExpressError("email already registered", 400);

  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);

  const userData = { name, passwordHash: hash, referralcode };
  const otp = otpManager.generateOTP();
  const { expiry } = await otpManager.storeOTPForRegistration(email, otp, userData);

  await otpManager.sendOTPEmail(email, { username: name }, otp, "signup");

  res.status(200).json({
    message: "OTP sent to your email. Please verify to complete registration.",
    email,
    otpRequired: true,
    expiresAt: expiry,
  });
};

// 🔹 VERIFY REGISTRATION OTP
module.exports.verifyRegistrationOtp = async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) throw new ExpressError("Missing email or OTP", 400);

  const otpData = await otpManager.getRegistrationOTPData(email);
  if (!otpData) throw new ExpressError("OTP not requested or expired", 400);

  if (otpManager.isOTPExpired(otpData.otpExpiry)) {
    await otpManager.deleteRegistrationOTP(email);
    throw new ExpressError("OTP has expired", 400);
  }

  const isValid = otpManager.verifyOTP(otp, otpData.otpHash, otpData.otpSalt);
  if (!isValid) throw new ExpressError("Invalid OTP", 400);

  const { name, passwordHash, referralcode } = otpData.userData;
  let user = await User.findOne({ email: email.toLowerCase() });
  if (user) throw new ExpressError("email already registered", 400);

  const username = generateUsername(name);
  user = await User.create({
    name,
    username,
    email,
    password: passwordHash,
    picture: defaultProfilePicture,
    banner: defaultBanner,
  });

  const referralCodeString = randomStringGenerator.generate(7).toUpperCase();
  const profile = await Profile.create({
    userId: user._id,
    referralCodeString,
  });

  await profile.save();
  user.profile = profile._id;
  await user.save();

  if (referralcode) {
    const referrerExists = await Profile.findOne({ referralCodeString: referralcode });
    if (referrerExists) {
      await Profile.findOneAndUpdate(
        { referralCodeString: referralcode },
        { $inc: { totalUsersReferred: 1, coin: 1 } },
        { new: true }
      );
    }
  }

  await otpManager.deleteRegistrationOTP(email);

  res.status(200).json({ message: "Registration complete. Please log in." });
};

// 🔹 RESEND REGISTRATION OTP
module.exports.resendRegistrationOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) throw new ExpressError("Email is required", 400);

  const registeredEmail = await User.findOne({ email: email.toLowerCase() });
  if (registeredEmail) throw new ExpressError("Email already registered", 400);

  const otpData = await otpManager.getRegistrationOTPData(email);
  if (!otpData)
    throw new ExpressError("No pending registration found to resend OTP", 400);

  const otp = otpManager.generateOTP();
  const { expiry } = await otpManager.storeOTPForRegistration(
    email,
    otp,
    otpData.userData
  );

  await otpManager.sendOTPEmail(email, { username: otpData.userData.name }, otp);

  res.status(200).json({
    message: "A new OTP has been sent to your email.",
    email,
    otpRequired: true,
    expiresAt: expiry,
  });
};

module.exports.forgotPassword = async (req, res) => {
  let { email } = req.body;
  email = email.toLowerCase();

  const user = await User.findOne({ email }).select("+password +email");
  if (user) {
    const secret = `${process.env.USER_SECRET}${user.password}`;
    const token = jwt.sign({ id: user._id }, secret, { expiresIn: "5m" });

    let config = {
      host: "smtp.hostinger.com",
      port: 465,
      secure: true,
      auth: { user: process.env.EMAIL, pass: process.env.PASSWORD },
    };
    let transporter = nodemailer.createTransport(config);

    let MailGenerator = new Mailgen({
      theme: "default",
      product: {
        name: "NexFellow",
        link: process.env.SITE_URL,
        logo: "https://nexfellow.b-cdn.net/defaults/nexfellowlogo.png",
        copyright: `Copyright © ${new Date().getFullYear()} NexFellow. All rights reserved.`,
      },
    });

    var response = {
      body: {
        name: `${user.username}`,
        intro: "You requested a password reset.",
        action: {
          instructions: "Click the button below to reset your password:",
          button: {
            color: "#5cd7d1",
            text: "Click here",
            link: `${process.env.BACKEND_DOMAIN}/user/resetpassword/${user._id}/${token}`,
          },
        },
        outro: "If you did not request a reset, ignore this email.",
      },
    };

    var emailBody = MailGenerator.generate(response);
    let message = {
      from: `${process.env.EMAIL}`,
      to: `${email}`,
      subject: "Password Reset Request",
      html: emailBody,
    };

    transporter
      .sendMail(message)
      .then(() => res.status(201).json("email sent"))
      .catch((err) => res.status(400).json(err));
  } else {
    res.status(400).json("email not registered");
  }
};

module.exports.logout = (req, res) => {
  console.log("In Logout");

  tokenUtils.clearAuthCookies(res); // Clear the old cookie for backward compatibility
  res.status(200).json("logout");
};

module.exports.profile = async (req, res) => {
  // console.log('Inside profile');
  const user = await User.findById(req.userId);
  if (!user) {
    throw new ExpressError("user not found", 400);
  }
  const userDetails = await user.populate("profile");
  const userFullDetails = {
    id: user._id,
    name: user.name,
    username: user.username,
    rating: userDetails.profile.rating,
    text: userDetails.profile.bio,
    professions: userDetails.profile.professions,
    platformLink: userDetails.profile.platformLinks,
    occupation: userDetails.profile.occupation,
    phoneNo: userDetails.profile.phoneNumber,
    email: user.email,
    description: user.createdCommunity
      ? user.createdCommunity.description
      : null,
    dob: userDetails.profile.dateOfBirth,
    profilePhoto: user.picture,
    banner: user.banner,
    createdCommunity: user.createdCommunity,
    bio: userDetails.profile.bio,
    referralCodeString: userDetails.profile.referralCodeString,
    country: user.country,
    coin: userDetails.profile.coin,
    bookmarks: userDetails.profile.bookmarks,
    premiumBadge: userDetails.premiumBadge,
    verificationBadge: userDetails.verificationBadge,
    isCommunityAccount: user.isCommunityAccount,
    followedCommunities: user.followedCommunities,
  };
  res.status(200).json(userFullDetails);
};

module.exports.getProfile = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.id !== id) {
      throw new ExpressError("Unauthorized access", 403);
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await User.findById(id)
      .populate("profile")
      .populate("createdCommunity")
      .populate("followers")
      .lean();

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const userFullDetails = {
      ...user,
      ...(user.profile || {}),
      ...(user.createdCommunity || {}),
      ...(user.followers || {}),
    };

    res.status(200).json(userFullDetails);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

module.exports.getPublicProfile = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await User.findById(id)
      .populate("profile")
      .populate("createdCommunity")
      .populate("followers")
      .lean();

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const userFullDetails = {
      ...user,
      ...(user.profile || {}),
      ...(user.createdCommunity || {}),
      ...(user.followers || {}),
    };

    res.status(200).json(userFullDetails);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

module.exports.getProfileByUsername = async (req, res) => {
  const { username } = req.params;

  // If the logged-in user is NOT requesting their own profile
  if (req.user.username !== username) {
    // Fetch the requested user's public info
    const user = await User.findOne({ username })
      .populate("profile")
      .populate("createdCommunity")
      .populate("followers")
      .lean();

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Decide redirect target based on user type
    if (user.isCommunityAccount && user.createdCommunity) {
      // Community account: redirect to /community/:username
      return res.status(200).json({
        redirect: `/community/${username}`,
        message: "Redirect to community page",
      });
    } else {
      // Regular user: redirect to /user/:username
      return res.status(200).json({
        redirect: `/user/${username}`,
        message: "Redirect to user profile",
      });
    }
  }

  // If the user matches, return normal profile data
  const user = await User.findOne({ username })
    .select("+email +dateOfBirth")
    .populate("profile")
    .populate("createdCommunity")
    .populate("followers")
    .lean();

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const userFullDetails = {
    ...user,
    ...(user.profile || {}),
    ...(user.createdCommunity || {}),
    ...(user.followers || {}),
  };

  res.status(200).json(userFullDetails);
};

module.exports.getPublicProfileByUsername = async (req, res) => {
  const { username } = req.params;

  const user = await User.findOne({ username })
    .populate("profile")
    .populate("createdCommunity")
    .populate("followers")
    .lean();

  if (!user) {
    throw new ExpressError("User not found", 400);
  }

  const userFullDetails = {
    ...user,
    ...(user.profile || {}),
    ...(user.createdCommunity || {}),
    ...(user.followers || {}),
  };

  res.status(200).json(userFullDetails);
};

module.exports.resetPassword = async (req, res) => {
  const { id, token } = req.params;
  const { password } = req.body;
  // Explicitly select resetPasswordOtpVerified for the flow
  const oldUser = await User.findById(id).select("+resetPasswordOtpVerified");
  const redirectUrl = `${process.env.SITE_URL}/login`;

  if (!oldUser) {
    return res.status(400).json("user not found");
  }

  if (!oldUser.resetPasswordOtpVerified) {
    const secret = `${process.env.USER_SECRET}${oldUser.password}`;
    try {
      jwt.verify(token, secret);
    } catch (err) {
      return res.status(400).json("invalid token");
    }
  }

  oldUser.password = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
  // Reset OTP verified flag after successful password reset
  oldUser.resetPasswordOtpVerified = false;
  await oldUser.save();

  return res.render("successfulReset.ejs", { redirectUrl });
};

module.exports.verifyResetPasswordOtp = async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) throw new ExpressError("Missing email or OTP", 400);

  const user = await User.findOne({ email: email.toLowerCase() })
    .select("+otpHash +otpSalt +otpExpiry +resetPasswordOtpVerified +email");

  if (!user) throw new ExpressError("User not found", 404);
  if (!user.otpHash || !user.otpSalt || !user.otpExpiry)
    throw new ExpressError("OTP not requested", 400);
  if (otpManager.isOTPExpired(user.otpExpiry)) throw new ExpressError("OTP has expired", 400);

  const isValid = otpManager.verifyOTP(otp, user.otpHash, user.otpSalt);
  if (!isValid) throw new ExpressError("Invalid OTP", 400);

  user.resetPasswordOtpVerified = true;
  user.otpHash = undefined;
  user.otpSalt = undefined;
  user.otpExpiry = undefined;
  await user.save();

  return res.status(200).json({
    message: "Reset password OTP verified successfully",
    resetPasswordOtpVerified: true,
  });
};

module.exports.requestPasswordResetOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  const user = await User.findOne({ email: email.toLowerCase() }).select("+email");
  if (!user) return res.status(404).json({ message: "User not found" });

  if (user.isOtpVerified)
    return res.status(400).json({ message: "OTP already verified" });

  const { otp, expiry } = await otpManager.storeOTPForUser(
    user._id,
    otpManager.generateOTP()
  );

  await otpManager.sendOTPEmail(user.email, user, otp, "reset");

  return res.status(200).json({
    message: "OTP sent to your email.",
    expiresAt: expiry,
  });
};

module.exports.sendUserVerificationEmail = async (req, res) => {
  const { userid } = req.params;
  const user = await User.findOne({ _id: userid });

  if (!user) {
    throw new ExpressError("user not found", 400);
  }

  if (user.verified) {
    throw new ExpressError("user already verified", 400);
  }

  await sendVerificationEmail(user.email, user);
  return res.json("email sent");
};

const sendVerificationEmail = async (email, user) => {
  const secret = process.env.SECRET;
  const token = jwt.sign({ id: User._id }, secret, { expiresIn: "120m" });

  let config = {
    host: "smtp.hostinger.com", // Hostinger SMTP server
    port: 465, // Port for secure SMTP
    secure: true, // True for 465, false for other ports
    auth: {
      user: process.env.EMAIL, // Hostinger email user
      pass: process.env.PASSWORD, // Hostinger email password
    },
  };

  let transporter = nodemailer.createTransport(config);
  let MailGenerator = new Mailgen({
    theme: "default",
    product: {
      name: "NexFellow",
      link: process.env.SITE_URL,
      logo: "https://nexfellow.b-cdn.net/defaults/nexfellowlogo.png",
      copyright: `Copyright © ${new Date().getFullYear()} NexFellow. All rights reserved.`,
    },
  });

  var response = {
    body: {
      name: `${user.username}`,
      intro:
        "Thank you for registering on NexFellow. Please verify your email address by clicking on the link below:",
      action: {
        instructions: "Click the button below to verify your email:",
        button: {
          color: "#5cd7d1",
          text: "Continue to verification",
          link: `${process.env.BACKEND_DOMAIN}/user/verifyEmail/${user._id}/${token}`,
        },
      },

      outro:
        "If you did not request a verification email, no further action is required on your part.",
    },
  };

  var emailBody = MailGenerator.generate(response);
  let message = {
    from: `${process.env.EMAIL}`,
    to: `${email}`,
    subject: "Email Verification",
    html: emailBody,
  };

  transporter
    .sendMail(message)
    .then(() => console.log("email sent"))
    .catch((err) => console.log(err));
};

module.exports.verifyUser = async (req, res) => {
  const { userid, token } = req.params;
  const user = await User.findById(userid);
  const redirectUrl = `${process.env.SITE_URL}`;

  if (!user) {
    return res.status(400).json("user not found");
  } else {
    const secret = `${process.env.SECRET}`;
    if (jwt.verify(token, secret)) {
      user.verified = true;
      await user.save();
      res.render("verifyEmail.ejs", { redirectUrl });
    } else {
      return res.status(400).json("invalid token");
    }
  }
};

module.exports.contactUs = async (req, res) => {
  const { firstName, lastName, email, phoneNumber, subject, message } =
    req.body;
  if (
    !firstName ||
    !lastName ||
    !email ||
    !phoneNumber ||
    !subject ||
    !message
  ) {
    throw new ExpressError("missing fields", 400);
  }
  const emailBody = `Name: ${firstName} ${lastName}\nEmail: ${email}\nPhone Number: ${phoneNumber}\nMessage: ${message}`;
  const receiver = process.env.CONTACT_EMAIL || email;
  mailSender(receiver, subject, emailBody);
  res.status(200).json("contact us");
};

const getBunnyStoragePath = (cdnUrl) => {
  try {
    const url = new URL(cdnUrl);
    return url.pathname.startsWith("/") ? url.pathname.slice(1) : url.pathname;
  } catch {
    return null;
  }
};

module.exports.updateProfile = async (req, res) => {
  try {
    const {
      username,
      name,
      description,
      category,
      email,
      country,
      dob,
      accountType,
    } = req.body;

    // Fetch user with profile and community populated
    const user = await User.findById(req.userId)
      .populate("profile")
      .populate("createdCommunity");

    if (!user) {
      if (req.file?.path) fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: "User not found" });
    }

    // Check username uniqueness if changed
    if (username && username !== user.username) {
      const usernameExists = await User.findOne({ username });
      if (
        usernameExists &&
        usernameExists._id.toString() !== user._id.toString()
      ) {
        if (req.file?.path) fs.unlinkSync(req.file.path);
        return res.status(400).json({ error: "Username already exists" });
      }
      user.username = username;
    }

    // Update user fields
    user.name = name || user.name;
    user.email = email || user.email;
    user.country = country || user.country;

    // Update profile fields
    const profile = user.profile;
    if (!profile) {
      if (req.file?.path) fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: "Profile not found" });
    }
    profile.dateOfBirth = dob || profile.dateOfBirth;

    // Community update logic (only if user owns a community)
    if (user.isCommunityAccount && user.createdCommunity) {
      let badgeChanged = false;
      if (accountType && ["Individual", "Organization"].includes(accountType)) {
        user.createdCommunity.accountType = accountType;

        // Update badges according to accountType
        if (accountType === "Individual") {
          if (!user.verificationBadge || user.communityBadge)
            badgeChanged = true;
          user.verificationBadge = true;
          user.communityBadge = false;
        } else if (accountType === "Organization") {
          if (!user.communityBadge || user.verificationBadge)
            badgeChanged = true;
          user.communityBadge = true;
          user.verificationBadge = false;
        }
      }
      user.createdCommunity.description =
        description || user.createdCommunity.description;
      user.createdCommunity.category =
        category || user.createdCommunity.category;
      await user.createdCommunity.save();
      if (badgeChanged) await user.save();
      await user.populate("createdCommunity");
    } else {
      // If no community, update profile bio
      profile.bio = description || profile.bio;
    }

    // Handle profile photo upload
    let photoPath = req.files?.photo?.[0]?.path;
    let profilePhotoUrl = req.body.photo;
    if (photoPath) {
      try {
        const uploadedPhoto = await uploadOnBunny(photoPath);
        if (uploadedPhoto && uploadedPhoto.url) {
          if (user.picture) {
            const storagePath = getBunnyStoragePath(user.picture);
            if (storagePath) await removeFromBunny(storagePath);
          }
          user.picture = uploadedPhoto.url;
        } else {
          throw new Error("Photo upload failed");
        }
      } catch (err) {
        console.error("Error uploading profile photo:", err);
        return res
          .status(500)
          .json({ error: "Failed to upload profile photo" });
      }
    } else if (profilePhotoUrl) {
      user.picture = profilePhotoUrl;
    }

    // Handle banner upload
    let bannerPath = req.files?.banner?.[0]?.path;
    let bannerUrl = req.body.banner;
    if (bannerPath) {
      try {
        const uploadedBanner = await uploadOnBunny(bannerPath);
        if (uploadedBanner && uploadedBanner.url) {
          if (user.banner) {
            const bannerStoragePath = getBunnyStoragePath(user.banner);
            if (bannerStoragePath) await removeFromBunny(bannerStoragePath);
          }
          user.banner = uploadedBanner.url;
        } else {
          throw new Error("Banner upload failed");
        }
      } catch (err) {
        console.error("Error uploading banner:", err);
        return res.status(500).json({ error: "Failed to upload banner" });
      }
    } else if (bannerUrl) {
      user.banner = bannerUrl;
    }

    await user.save();
    await profile.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user,
      accountType: user.createdCommunity
        ? user.createdCommunity.accountType
        : null,
      verificationBadge: user.verificationBadge,
      communityBadge: user.communityBadge,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports.getUsers = async (req, res) => {
  const name = req.query.name;
  console.log(name);
  try {
    const user = await User.findOne({ username: name });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userDetails = await user.populate("profile");
    const userFullDetails = {
      name: userDetails.name,
      username: userDetails.username,
      rating: userDetails.profile.rating,
      text: userDetails.profile.bio,
      professions: userDetails.profile.professions,
      platformLink: userDetails.profile.platformLinks,
      occupation: userDetails.profile.occupation,
      phoneNo: userDetails.profile.phoneNumber,
      dob: userDetails.profile.dateOfBirth,
      profilePhoto: user.picture,
      banner: user.banner,
      createdCommunity: userDetails.createdCommunity,
      bio: userDetails.profile.bio,
      referralCodeString: userDetails.profile.referralCodeString,
      country: user.country,
      premiumBadge: userDetails.premiumBadge,
      verificationBadge: userDetails.verificationBadge,
    };
    res.status(200).json({ userFullDetails });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

module.exports.getUsersbyFilters = async (req, res) => {
  try {
    const filters = {};

    if (req.query.followedCommunities) {
      filters.followedCommunities = {
        $in: req.query.followedCommunities.split(","),
      };
    }

    if (req.query.registeredQuizzes) {
      filters.registeredQuizzes = {
        $in: req.query.registeredQuizzes.split(","),
      };
    }

    if (req.query.joinedChallenges) {
      filters.joinedChallenges = { $in: req.query.joinedChallenges.split(",") };
    }

    if (req.query.isVerified !== undefined) {
      filters.verified = req.query.isVerified === "true";
    }

    if (req.query.subscriptionTier) {
      filters.subscriptionTier = req.query.subscriptionTier;
    }

    if (req.query.country) {
      filters.country = req.query.country;
    }

    if (req.query.role) {
      filters.role = req.query.role;
    }

    if (req.query.isCommunityAccount !== undefined) {
      filters.isCommunityAccount = req.query.isCommunityAccount === "true";
    }

    const users = await User.find(filters);

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports.requestCommunityCreator = async (req, res) => {
  try {
    const userId = req.userId;
    const { action } = req.body;
    const newRequest = await Request.create({
      action,
      userId,
    });

    res.status(200).json({
      success: true,
      data: newRequest,
      message: "Request sent, please wait for further instructions.",
    });
  } catch (error) {
    console.error("Error submitting request:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports.uploadImages = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) throw new Error("User not found");

    if (!req.files || (!req.files.photo && !req.files.banner)) {
      throw new Error("No files uploaded");
    }

    let photo = req.files?.photo?.[0]?.path || null;
    let profilePhotoUrl = req.body.photo || null;
    let banner = req.files?.banner?.[0]?.path || null;
    let bannerUrl = req.body.banner || null;

    if (photo) {
      if (user.picture) {
        const storagePath = getBunnyStoragePath(user.picture);
        if (storagePath) {
          await removeFromBunny(storagePath);
        }
      }
      const uploadedPhoto = await uploadOnBunny(photo);
      user.picture = uploadedPhoto.url;
    } else if (typeof profilePhotoUrl === "string") {
      user.picture = profilePhotoUrl;
    }

    if (banner) {
      if (user.banner) {
        const bannerStoragePath = getBunnyStoragePath(user.banner);
        if (bannerStoragePath) {
          await removeFromBunny(bannerStoragePath);
        }
      }
      const uploadedBanner = await uploadOnBunny(banner);
      user.banner = uploadedBanner.url;
    } else if (typeof bannerUrl === "string") {
      user.banner = bannerUrl;
    }

    await user.save();
    await Profile.save();

    res
      .status(200)
      .json({ message: "Profile images updated successfully", user });
  } catch (error) {
    res
      .status(error.status || 500)
      .json({ message: error.message || "Internal Server Error" });
  }
};

// Get following count for a user
module.exports.getUserFollowings = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ followings: user.followedCommunities.length });
  } catch (error) {
    console.error("Error fetching user followings:", error);
    res.status(500).json({ message: "Error fetching followings count", error });
  }
};

async function syncCommunityMembersWithFollowers(userId, session = null) {
  const user = await User.findById(userId)
    .select("followers createdCommunity")
    .lean();
  const communityId = user?.createdCommunity;
  if (!communityId) return;

  const followers = user.followers.map((id) => id.toString());
  const memberSet = new Set([...followers, userId.toString()]);

  await Community.findByIdAndUpdate(
    communityId,
    { members: Array.from(memberSet) },
    session ? { session } : {}
  );
}

module.exports.toggleFollowUser = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const userId = req.userId; // Logged-in user
    const targetUserId = req.params.userId;
    const { action } = req.body;
    const io = getIo();

    if (!userId) throw new ExpressError("Unauthorized: No user ID found.", 401);
    if (!targetUserId)
      throw new ExpressError("Target user ID is missing.", 400);

    const user = await User.findById(userId).session(session);
    const targetUser = await User.findById(targetUserId).session(session);

    if (!user) throw new ExpressError("User not found.", 404);
    if (!targetUser) throw new ExpressError("Target user not found.", 404);

    let message;

    if (action === "follow") {
      if (user.following.includes(targetUserId))
        throw new ExpressError("Already following this user.", 400);

      const updates = [];

      // Update following/followers
      updates.push(
        User.findByIdAndUpdate(
          userId,
          { $push: { following: targetUserId } },
          { session }
        )
      );
      updates.push(
        User.findByIdAndUpdate(
          targetUserId,
          { $push: { followers: userId } },
          { session }
        )
      );

      // Update followedCommunities if target user has a community
      if (
        targetUser.createdCommunity &&
        !user.followedCommunities.includes(targetUser.createdCommunity)
      ) {
        updates.push(
          User.findByIdAndUpdate(
            userId,
            { $push: { followedCommunities: targetUser.createdCommunity } },
            { session }
          )
        );
      }

      // Add follower to community members if community exists
      if (targetUser.createdCommunity) {
        updates.push(
          Community.findByIdAndUpdate(
            targetUser.createdCommunity,
            { $addToSet: { members: userId } },
            { session }
          )
        );
      }

      await Promise.all(updates);
      await session.commitTransaction();

      // Synchronize community members precisely with followers + owner
      await syncCommunityMembersWithFollowers(targetUserId);

      // Follower milestone logic
      await targetUser.populate("followers");
      for (const milestone of FOLLOWER_MILESTONES) {
        if (
          targetUser.followers.length >= milestone &&
          (!targetUser.milestones ||
            !targetUser.milestones.followers ||
            !targetUser.milestones.followers.includes(milestone))
        ) {
          targetUser.milestones = targetUser.milestones || {};
          targetUser.milestones.followers =
            targetUser.milestones.followers || [];
          targetUser.milestones.followers.push(milestone);
          await targetUser.save();

          // Get personalized milestone message
          const milestoneData = MILESTONE_MESSAGES.followers[milestone];

          const milestoneNotification = {
            title: milestoneData.title,
            message: `${milestoneData.message} ${milestoneData.emoji} <a href="${process.env.SITE_URL}/user/${targetUser.username}" target="_blank" style="color: #007bff; text-decoration: underline;">View Profile</a>`,
            senderId: null,
            senderModel: "System",
            recipients: [targetUserId],
            type: "milestone",
            priority: "high",
          };

          await NotificationService.createAndSendNotification(
            milestoneNotification
          );
        }
      }

      try {
        io.emit("followUser", { follower: userId, followed: targetUserId });
      } catch (e) {
        console.error("Socket.IO follow error:", e.message);
      }

      // Notify target user if not self-follow
      if (userId !== targetUserId) {
        const profilePath =
          user.isCommunityAccount && user.createdCommunity
            ? `${process.env.SITE_URL}/community/${user.username}`
            : `${process.env.SITE_URL}/user/${user.username}`;

        await NotificationService.createAndSendNotification({
          title: "New Follower!",
          message: `${user.username} started following you. <a href="${profilePath}" target="_blank" style="color: #007bff; text-decoration: underline;">View Profile</a>`,
          senderId: userId,
          senderModel: "User",
          recipients: [targetUserId],
          type: "system",
          priority: "normal",
        });
      }

      message = `Successfully followed ${userId === targetUserId ? "yourself" : "the user"
        }.`;
    } else if (action === "unfollow") {
      if (!user.following.includes(targetUserId))
        throw new ExpressError("You are not following this user.", 400);

      const updates = [];

      // Remove following/followers
      updates.push(
        User.findByIdAndUpdate(
          userId,
          { $pull: { following: targetUserId } },
          { session }
        )
      );
      updates.push(
        User.findByIdAndUpdate(
          targetUserId,
          { $pull: { followers: userId } },
          { session }
        )
      );

      // Remove from followedCommunities if needed
      if (
        targetUser.createdCommunity &&
        user.followedCommunities.includes(targetUser.createdCommunity)
      ) {
        updates.push(
          User.findByIdAndUpdate(
            userId,
            { $pull: { followedCommunities: targetUser.createdCommunity } },
            { session }
          )
        );
      }

      // Remove follower from community members
      if (targetUser.createdCommunity) {
        updates.push(
          Community.findByIdAndUpdate(
            targetUser.createdCommunity,
            { $pull: { members: userId } },
            { session }
          )
        );

        // Revoke moderator role if follower is moderator of the community
        updates.push(
          User.findByIdAndUpdate(
            userId,
            {
              $pull: {
                communityRoles: { communityId: targetUser.createdCommunity },
              },
            },
            { session }
          )
        );

        updates.push(
          Community.findByIdAndUpdate(
            targetUser.createdCommunity,
            { $pull: { moderators: userId } },
            { session }
          )
        );
      }

      await Promise.all(updates);
      await session.commitTransaction();

      // Synchronize community members precisely with followers + owner
      await syncCommunityMembersWithFollowers(targetUserId);

      try {
        io.emit("unfollowUser", {
          follower: userId,
          unfollowed: targetUserId,
        });
      } catch (e) {
        console.error("Socket.IO unfollow error:", e.message);
      }

      message = `Successfully unfollowed ${userId === targetUserId ? "yourself" : "the user"
        }.`;
    } else {
      throw new ExpressError("Invalid action.", 400);
    }

    return res.status(200).json({ message });
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    res.status(error.statusCode || 500).json({
      message: "Error following/unfollowing user: " + error.message,
    });
  } finally {
    session.endSession();
  }
};

module.exports.syncCommunityMembersWithFollowers =
  syncCommunityMembersWithFollowers;

// Check follow status
module.exports.checkFollowStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found." });
    }

    const isFollowing = targetUser.followers.includes(currentUserId);
    return res.status(200).json({ isFollowing });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
};

module.exports.getMutualConnections = async (req, res) => {
  try {
    const { userId, otherUserId } = req.params;

    // Fetch both users
    const user1 = await User.findById(userId).populate("following");
    const user2 = await User.findById(otherUserId).populate("following");

    if (!user1 || !user2) {
      return res.status(404).json({ message: "User not found" });
    }

    // Convert following lists to sets for quick lookup
    const user1FollowingSet = new Set(
      user1.following.map((user) => user._id.toString())
    );
    const user2FollowingSet = new Set(
      user2.following.map((user) => user._id.toString())
    );

    // Find mutual connections (users that exist in both sets)
    const mutualConnections = user1.following.filter((user) =>
      user2FollowingSet.has(user._id.toString())
    );

    res.status(200).json({ mutualConnections });
  } catch (error) {
    console.error("Error fetching mutual connections:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.muteUser = async (req, res) => {
  try {
    const currentUserId = req.userId; // The user performing the mute action
    const targetUserId = req.params.userId; // The user being muted

    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    // Make sure user isn't trying to mute themselves
    if (currentUserId === targetUserId) {
      return res.status(400).json({ message: "You cannot mute yourself" });
    }

    const user = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!targetUser) {
      return res.status(404).json({ message: "User to mute not found" });
    }

    // Check if user is already muted
    if (user.mutedUsers.includes(targetUserId)) {
      return res.status(400).json({ message: "User is already muted" });
    }

    // Add target user to muted list
    user.mutedUsers.push(targetUserId);
    await user.save();

    return res.status(200).json({
      message: `User ${targetUser.username} has been muted successfully`,
      mutedUserId: targetUserId,
    });
  } catch (error) {
    console.error("Error muting user:", error);
    return res.status(500).json({
      message: "An error occurred while muting the user",
      error: error.message,
    });
  }
};

module.exports.unmuteUser = async (req, res) => {
  try {
    const currentUserId = req.userId;
    const targetUserId = req.params.userId;

    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    const user = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!targetUser) {
      return res.status(404).json({ message: "User to unmute not found" });
    }

    // Check if user is actually muted
    if (!user.mutedUsers.includes(targetUserId)) {
      return res.status(400).json({ message: "User is not muted" });
    }

    // Remove target user from muted list
    user.mutedUsers = user.mutedUsers.filter(
      (id) => id.toString() !== targetUserId
    );
    await user.save();

    return res.status(200).json({
      message: `User ${targetUser.username} has been unmuted successfully`,
      unmutedUserId: targetUserId,
    });
  } catch (error) {
    console.error("Error unmuting user:", error);
    return res.status(500).json({
      message: "An error occurred while unmuting the user",
      error: error.message,
    });
  }
};

module.exports.getMutedUsers = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId).populate(
      "mutedUsers",
      "name username picture"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "Muted users retrieved successfully",
      mutedUsers: user.mutedUsers,
    });
  } catch (error) {
    console.error("Error getting muted users:", error);
    return res.status(500).json({
      message: "An error occurred while retrieving muted users",
      error: error.message,
    });
  }
};

// Block user controller method
module.exports.blockUser = async (req, res) => {
  try {
    const currentUserId = req.userId; // The user performing the block action
    const targetUserId = req.params.userId; // The user being blocked

    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    // Make sure user isn't trying to block themselves
    if (currentUserId === targetUserId) {
      return res.status(400).json({ message: "You cannot block yourself" });
    }

    const user = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!targetUser) {
      return res.status(404).json({ message: "User to block not found" });
    }

    // Check if user is already blocked
    if (user.blockedUsers.includes(targetUserId)) {
      return res.status(400).json({ message: "User is already blocked" });
    }

    // Start a transaction to ensure all operations complete together
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Add target user to blocked list
      user.blockedUsers.push(targetUserId);

      // Remove any following/follower relationships
      user.following = user.following.filter(
        (id) => id.toString() !== targetUserId
      );
      user.followers = user.followers.filter(
        (id) => id.toString() !== targetUserId
      );

      targetUser.following = targetUser.following.filter(
        (id) => id.toString() !== currentUserId
      );
      targetUser.followers = targetUser.followers.filter(
        (id) => id.toString() !== currentUserId
      );

      await user.save({ session });
      await targetUser.save({ session });

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }

    return res.status(200).json({
      message: `User ${targetUser.username} has been blocked successfully`,
      blockedUserId: targetUserId,
    });
  } catch (error) {
    console.error("Error blocking user:", error);
    return res.status(500).json({
      message: "An error occurred while blocking the user",
      error: error.message,
    });
  }
};

// Unblock user controller method
module.exports.unblockUser = async (req, res) => {
  try {
    const currentUserId = req.userId;
    const targetUserId = req.params.userId;

    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    const user = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!targetUser) {
      return res.status(404).json({ message: "User to unblock not found" });
    }

    // Check if user is actually blocked
    if (!user.blockedUsers.includes(targetUserId)) {
      return res.status(400).json({ message: "User is not blocked" });
    }

    // Remove target user from blocked list
    user.blockedUsers = user.blockedUsers.filter(
      (id) => id.toString() !== targetUserId
    );
    await user.save();

    return res.status(200).json({
      message: `User ${targetUser.username} has been unblocked successfully`,
      unblockedUserId: targetUserId,
    });
  } catch (error) {
    console.error("Error unblocking user:", error);
    return res.status(500).json({
      message: "An error occurred while unblocking the user",
      error: error.message,
    });
  }
};

// Get blocked users controller method
module.exports.getBlockedUsers = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId).populate(
      "blockedUsers",
      "name username picture"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "Blocked users retrieved successfully",
      blockedUsers: user.blockedUsers,
    });
  } catch (error) {
    console.error("Error getting blocked users:", error);
    return res.status(500).json({
      message: "An error occurred while retrieving blocked users",
      error: error.message,
    });
  }
};

// Hide a post
module.exports.hidePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.userId;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: "Invalid post ID" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if post is already hidden
    if (user.hiddenPosts.includes(postId)) {
      return res.status(400).json({ message: "Post is already hidden" });
    }

    // Add post to hidden posts
    user.hiddenPosts.push(postId);
    await user.save();

    return res.status(200).json({ message: "Post hidden successfully" });
  } catch (error) {
    console.error("Error hiding post:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Unhide a post
module.exports.unhidePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.userId;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: "Invalid post ID" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if post is in hidden posts
    if (!user.hiddenPosts.includes(postId)) {
      return res.status(400).json({ message: "Post is not hidden" });
    }

    // Remove post from hidden posts
    user.hiddenPosts = user.hiddenPosts.filter(
      (id) => id.toString() !== postId
    );
    await user.save();

    return res.status(200).json({ message: "Post unhidden successfully" });
  } catch (error) {
    console.error("Error unhiding post:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Get hidden posts
module.exports.getHiddenPosts = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId).populate({
      path: "hiddenPosts",
      populate: [
        {
          path: "author",
          select:
            "name username picture verified verificationBadge isCommunityAccount createdCommunity",
        },
      ],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ hiddenPosts: user.hiddenPosts });
  } catch (error) {
    console.error("Error getting hidden posts:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Check if a post is hidden
module.exports.isPostHidden = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.userId;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: "Invalid post ID" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isHidden = user.hiddenPosts.includes(postId);
    return res.status(200).json({ isHidden });
  } catch (error) {
    console.error("Error checking if post is hidden:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Check if a user is following a specific community/user
module.exports.checkFollowing = async (req, res) => {
  try {
    // Support both parameter names for flexibility
    const communityOrUserId = req.params.communityId || req.params.userId;
    const currentUserId = req.userId;

    if (!currentUserId) {
      return res.status(200).json({
        isFollowing: false,
        message: "User not logged in",
      });
    }

    // Handle invalid IDs gracefully
    if (!mongoose.Types.ObjectId.isValid(communityOrUserId)) {
      console.log(`Invalid ID format: ${communityOrUserId}`);
      return res.status(200).json({
        isFollowing: false,
        message: "Invalid ID format",
      });
    }

    const user = await User.findById(currentUserId);
    if (!user) {
      return res.status(200).json({
        isFollowing: false,
        message: "User not found",
      });
    }

    // Check if user is following the community/user
    const isFollowing =
      user.followedCommunities &&
      user.followedCommunities.some(
        (id) => id.toString() === communityOrUserId.toString()
      );

    return res.status(200).json({ isFollowing });
  } catch (error) {
    console.error("Error checking follow status:", error);
    // Return a safe response even on error
    return res.status(200).json({
      isFollowing: false,
      message: "Error checking follow status",
    });
  }
};

// Follow a community or user
module.exports.follow = async (req, res) => {
  try {
    const { communityId } = req.params;
    const currentUserId = req.userId;

    if (!currentUserId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: User not logged in" });
    }

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(communityId)) {
      return res
        .status(400)
        .json({ message: "Invalid community/user ID format" });
    }

    const user = await User.findById(currentUserId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user is already following
    if (user.followedCommunities.includes(communityId)) {
      return res
        .status(400)
        .json({ message: "Already following this community/user" });
    }

    // Add community to user's followed communities
    user.followedCommunities.push(communityId);
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Successfully followed",
      isFollowing: true,
    });
  } catch (error) {
    console.error("Error following community/user:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Unfollow a community or user
module.exports.unfollow = async (req, res) => {
  try {
    const { communityId } = req.params;
    const currentUserId = req.userId;

    if (!currentUserId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: User not logged in" });
    }

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(communityId)) {
      return res
        .status(400)
        .json({ message: "Invalid community/user ID format" });
    }

    const user = await User.findById(currentUserId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user is following
    if (!user.followedCommunities.includes(communityId)) {
      return res
        .status(400)
        .json({ message: "Not following this community/user" });
    }

    // Remove community from user's followed communities
    user.followedCommunities = user.followedCommunities.filter(
      (id) => id.toString() !== communityId
    );
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Successfully unfollowed",
      isFollowing: false,
    });
  } catch (error) {
    console.error("Error unfollowing community/user:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get privacy settings
module.exports.getPrivacySettings = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      privacySettings: user.privacySettings || {
        showEmail: true,
        showFollowers: true,
        showFollowing: true,
        showRegisteredQuizzes: true,
        showJoinedChallenges: true,
        allowDirectMessages: true,
        allowMentions: true,
      },
    });
  } catch (error) {
    console.error("Error getting privacy settings:", error);
    return res.status(500).json({
      message: "An error occurred while retrieving privacy settings",
      error: error.message,
    });
  }
};

// Update privacy settings
module.exports.updatePrivacySettings = async (req, res) => {
  try {
    const userId = req.userId;
    const { privacySettings } = req.body;

    if (!privacySettings || typeof privacySettings !== "object") {
      return res
        .status(400)
        .json({ message: "Invalid privacy settings format" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Merge new settings with existing settings
    user.privacySettings = {
      ...user.privacySettings,
      ...privacySettings,
    };

    await user.save();

    return res.status(200).json({
      message: "Privacy settings updated successfully",
      privacySettings: user.privacySettings,
    });
  } catch (error) {
    console.error("Error updating privacy settings:", error);
    return res.status(500).json({
      message: "An error occurred while updating privacy settings",
      error: error.message,
    });
  }
};

module.exports.checkUsernameAvailability = async (req, res) => {
  try {
    const { username } = req.params;
    const currentUserId = req.userId;

    // Validate username format and length
    if (!username || username.length < 3 || username.length > 20) {
      return res.status(400).json({
        success: false,
        message: "Username must be between 3 and 20 characters long",
      });
    }

    // Check if username contains only allowed characters (alphanumeric, underscore, hyphen)
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(username)) {
      return res.status(400).json({
        success: false,
        message:
          "Username can only contain letters, numbers, underscores, and hyphens",
      });
    }

    // Check if username already exists (excluding current user)
    const existingUser = await User.findOne({
      username: username,
      _id: { $ne: currentUserId },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Username is already taken",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Username is available",
    });
  } catch (error) {
    console.error("Error checking username availability:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while checking username availability",
    });
  }
};
