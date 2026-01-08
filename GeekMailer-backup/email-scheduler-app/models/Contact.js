const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String },
  email: { type: String, required: true, unique: true },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
},{
    timestamps: true
});

const Contact = mongoose.model("Contact", contactSchema);

module.exports = Contact;
