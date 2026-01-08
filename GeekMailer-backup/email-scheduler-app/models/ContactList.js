const mongoose = require('mongoose');
const Contact = require('./Contact');  // Import the Contact model

const contactListSchema = new mongoose.Schema({
  listName: { type: String, required: true },
  contacts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact',
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true,
  },
}, {
  timestamps: true,
});

const ContactList = mongoose.model('ContactList', contactListSchema);

module.exports = ContactList;
