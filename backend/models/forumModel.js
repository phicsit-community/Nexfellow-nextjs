const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const forumSchema = new Schema({
  name: { type: String, required: true },
  discussions: [{ type: Schema.Types.ObjectId, ref: "Discussion" }],
  deletedAt: {
    type: Date,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("Forum", forumSchema);
