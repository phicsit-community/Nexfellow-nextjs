const mongoose = require('mongoose');

const UserDeviceTokenSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  token: { 
    type: String, 
    required: true,
    unique: true 
  },
  platform: { 
    type: String, 
    enum: ['ios', 'android', 'web'], 
    required: true 
  },
  lastUsed: { 
    type: Date, 
    default: Date.now 
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});
 
UserDeviceTokenSchema.index({ user: 1, platform: 1 });
UserDeviceTokenSchema.index({ token: 1 });

// Static method to register or update device token
UserDeviceTokenSchema.statics.registerToken = async function(userId, token, platform) { 
  let deviceToken = await this.findOne({ 
    user: userId, 
    platform: platform 
  });

  if (deviceToken) { 
    deviceToken.token = token;
    deviceToken.lastUsed = new Date();
    deviceToken.isActive = true;
    await deviceToken.save();
  } else { 
    deviceToken = new this({
      user: userId,
      token,
      platform
    });
    await deviceToken.save();
  }

  return deviceToken;
};
 
UserDeviceTokenSchema.statics.getTokensForUsers = async function(userIds) {
  return this.find({
    user: { $in: userIds },
    isActive: true
  }).select('token platform');
};

module.exports = mongoose.model('UserDeviceToken', UserDeviceTokenSchema);