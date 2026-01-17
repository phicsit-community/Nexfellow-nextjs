const mongoose = require('mongoose');
const schema = mongoose.Schema;

const AttachmentSchema = new schema({
    filename: {
        type: String,
        required: true
    },
    path: {
        type: String,  
        required: true
    },
    contentType: {
        type: String, 
        required: true
    }
});

const ScheduledEmailSchema = new schema({
    adminId: {
        type: mongoose.Types.ObjectId,
        ref: 'Admin',
        required: true
    },
    to: {
        type: [String],
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    schedule: {
        type: String,
        required: true
    },
    active: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['scheduled', 'sent', 'inactive', 'repeat'],
        default: 'scheduled'
    },
    attachments: [AttachmentSchema],
});

module.exports = mongoose.model('ScheduledEmail', ScheduledEmailSchema);
