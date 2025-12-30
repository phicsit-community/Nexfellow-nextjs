const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const attachmentSchema = new Schema({
  filename: { 
    type: String, 
    required: true 
  },
  fileType: { 
    type: String, 
    required: true 
  },
  fileUrl: { 
    type: String, 
    required: true 
  },
},
  { timestamps : true }
);

module.exports = mongoose.model("Attachment", attachmentSchema);
