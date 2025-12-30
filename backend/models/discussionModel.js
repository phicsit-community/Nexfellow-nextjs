const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const discussionSchema = new Schema({
  title: { type: String, required: true },
});

module.exports = mongoose.model("Discussion", discussionSchema);
