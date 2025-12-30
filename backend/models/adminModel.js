const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AdminSchema = new Schema({
  username: {
    type: String,
    required: true,
    min: 6,
  },

  email: {
    type: String,
    required: true,
    unique: true,
    min: 6,
    max: 255,
  },

  password: {
    type: String,
    required: true,
    min: 6,
    max: 1024,
  },
  picture: {
    type: String,
    default: "",
  },
});

module.exports = mongoose.model("Admin", AdminSchema);
