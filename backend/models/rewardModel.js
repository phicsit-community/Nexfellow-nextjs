const mongoose = require("mongoose");
const schema = mongoose.Schema;

const rewardSchema = new schema({
  rewardName: {
    type: String,
    required: true,
  },
  rewardImage: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Reward", rewardSchema);
