// utils/getPlatformAdminId.js
const Admin = require("../models/adminModel");

let cachedAdminId = null;

async function getPlatformAdminId() {
  if (cachedAdminId) return cachedAdminId;
  const admin = await Admin.findOne({ email: "phicsit.community@gmail.com" });
  if (!admin) throw new Error("Platform admin not found!");
  cachedAdminId = admin._id;
  return cachedAdminId;
}

module.exports = getPlatformAdminId;
