// scripts/fixCommunityModerators.js
const mongoose = require("mongoose");
const Community = require("../models/communityModel");
require("dotenv").config();

mongoose.connect(process.env.DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function fixModerators() {
  const communities = await Community.find({});
  for (const comm of communities) {
    if (Array.isArray(comm.moderators)) {
      comm.moderators = comm.moderators.filter((m) => m.user && m.role);
      await comm.save();
    }
  }
  console.log("Fixed all communities!");
  process.exit();
}

fixModerators();
