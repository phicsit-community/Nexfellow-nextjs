const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const ExpressError = require('../utils/ExpressError');
const { 
  getAllActiveJobsCount,
  getEmailsByAdminIdCount 
} = require('../services/emailService');
const { 
  getAllContactsCount,
  getContactListsCount 
} = require('../services/contactListService');
 
module.exports.adminLogin = async (req, res) => {
  let { email, password } = req.body;

  if (!email || !password) {
    throw new ExpressError("Missing fields", 400);
  }

  email = email.toLowerCase();
  const user = await Admin.findOne({ email });

  if (!user) {
    throw new ExpressError("Invalid credentials", 400);
  }

  if (!bcrypt.compareSync(password, user.password)) {
    throw new ExpressError("Invalid credentials", 400);
  }

  const payload = {
    adminId: user._id,
    email: user.email,
    username: user.username,
  };

  const token = jwt.sign(payload, process.env.ADMIN_SECRET, { expiresIn: "3h" });

  res.cookie("adminjwt", token, {
    signed: true,
    httpOnly: true,
    sameSite:  process.env.NODE_ENV === 'production' ? "none" : "lax",
    path: "/",
    maxAge: 3 * 1000 * 60 * 60,
    secure: process.env.NODE_ENV === 'production',
  });

  res.status(200).json({
    token,
    user: user._id,
    expiresIn: new Date(Date.now() + 3 * 60 * 60 * 1000),
  });
};

// Admin logout controller
module.exports.adminLogout = (req, res) => {
  res.clearCookie("adminjwt").json("Logout successful");
};

module.exports.getHomePage = async (req, res) => {
  const { adminId } = req.query;
  const totalActiveScheduledMails = await getAllActiveJobsCount();
  const totalContacts = await getAllContactsCount(adminId);
  const totalContactList = await getContactListsCount(adminId);
  const mailsSent = await getEmailsByAdminIdCount(adminId);
  const response = {
    mailsSent: mailsSent,
    totalContacts: totalContacts,
    totalContactList: totalContactList,
    totalActiveScheduledMails: totalActiveScheduledMails,
  }
  res.status(200).json(response);
}
