const crypto = require("crypto");
const nodemailer = require("nodemailer");
const Mailgen = require("mailgen");
const User = require("../models/userModel");
const redis = require("./redisClient");

const OTP_EXPIRY_MINUTES = 5;
const REGISTRATION_OTP_PREFIX = "registration_otp:";

const otpManager = {
  generateOTP: () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  },

  hashOTP: (otp) => {
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto
      .createHash("sha256")
      .update(otp + salt)
      .digest("hex");
    return { hash, salt };
  },

  verifyOTP: (inputOTP, storedHash, storedSalt) => {
    const inputHash = crypto
      .createHash("sha256")
      .update(inputOTP + storedSalt)
      .digest("hex");
    return inputHash === storedHash;
  },

  storeOTPForUser: async (userId, otp) => {
    const { hash, salt } = otpManager.hashOTP(otp);
    const expiry = Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000;

    await User.findByIdAndUpdate(userId, {
      otpHash: hash,
      otpSalt: salt,
      otpExpiry: expiry,
      isOtpVerified: false,
    });

    return { otp, expiry };
  },

  isOTPExpired: (expiryTime) => {
    return Date.now() > expiryTime;
  },

  storeOTPForRegistration: async (email, otp, userData) => {
    const { hash, salt } = otpManager.hashOTP(otp);
    const expiry = Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000;

    await redis.set(
      REGISTRATION_OTP_PREFIX + email,
      JSON.stringify({
        otpHash: hash,
        otpSalt: salt,
        otpExpiry: expiry,
        userData,
      }),
      "PX",
      OTP_EXPIRY_MINUTES * 60 * 1000
    );

    return { otp, expiry };
  },

  getRegistrationOTPData: async (email) => {
    const data = await redis.get(REGISTRATION_OTP_PREFIX + email);
    if (!data) return null;

    try {
      return typeof data === "string" ? JSON.parse(data) : data;
    } catch (e) {
      console.error("[OTP] Failed to parse registration OTP data:", e);
      return null;
    }
  },

  deleteRegistrationOTP: async (email) => {
    await redis.del(REGISTRATION_OTP_PREFIX + email);
  },

  sendOTPEmail: async (email, user, otp, type = "signup") => {
    console.log(
      `[OTP EMAIL] Preparing to send OTP to: ${email}, OTP: ${otp}, Type: ${type}`
    );

    const transporter = nodemailer.createTransport({
      host: "smtp.hostinger.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });

    const mailGenerator = new Mailgen({
      theme: "default",
      product: {
        name: "NexFellow",
        link: process.env.SITE_URL,
        logo: "https://nexfellow.b-cdn.net/defaults/nexfellowlogo.png",
        copyright: `Copyright © ${new Date().getFullYear()} NexFellow. All rights reserved.`,
      },
    });

    let intro, instructions, subject;
    if (type === "login") {
      subject = "NexFellow | OTP for Login Verification";
      intro = `Your one-time password (OTP) for logging in is ${otp}.`;
      instructions = "Use the following OTP to complete your login:";
    } else if (type === "reset") {
      subject = "NexFellow | OTP for Password Reset Verification";
      intro = `Your one-time password (OTP) to verify your identity for password reset is ${otp}.`;
      instructions = "To reset your password, please enter the verification code below:";
    } else {
      subject = "NexFellow | OTP to Verify Your Email";
      intro = `Your one-time password (OTP) for email verification is ${otp}.`;
      instructions = "Verify your email to finish signing up. Use the code below:";
    }

    const emailBody = mailGenerator.generate({
      body: {
        name: user.username,
        intro,
        action: {
          instructions,
          button: {
            color: "#5cd7d1",
            text: `OTP: ${otp}`,
            link: process.env.SITE_URL,
          },
        },
        outro: `This OTP is valid for ${OTP_EXPIRY_MINUTES} minutes only & usable only once. T&C apply.
Please do not share this OTP with anyone for security reasons.`,
      },
    });

    const message = {
      from: process.env.EMAIL,
      to: email,
      subject,
      html: emailBody,
    };

    try {
      const info = await transporter.sendMail(message);
      console.log(`[OTP EMAIL] Sent to ${email}. MessageId: ${info.messageId}`);
    } catch (err) {
      console.error(`[OTP EMAIL] Failed to send to ${email}:`, err);
      throw err;
    }
  },
};

module.exports = otpManager;