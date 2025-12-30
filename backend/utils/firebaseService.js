const { getFirebaseAdmin } = require('../config/firebaseConfig');
const UserDeviceToken = require('../models/UserDeviceToken');

class FirebaseMessagingService {
  static async sendMulticastNotification(notification, recipientUserIds) {
    try {
      const admin = getFirebaseAdmin();
      
      const deviceTokens = await UserDeviceToken.getTokensForUsers(recipientUserIds);

      const message = {
        notification: {
          title: notification.title,
          body: notification.message
        },
        data: {
          notificationId: notification._id.toString(),
          communityId: notification.community.toString(),
          senderId: notification.sender.toString(),
          type: notification.type
        },
        tokens: deviceTokens.map(device => device.token)
      };
      console.log(admin.messaging());
      const response = await admin.messaging().sendEachForMulticast(message);

      console.log('FCM Notification Results:', {
        successCount: response.successCount,
        failureCount: response.failureCount
      });

      return response;
    } catch (error) {
      console.error('FCM Sending Error:', error);
      throw error;
    }
  }

  static async handleInvalidTokens(failedTokens) {
    for (const token of failedTokens) {
      await UserDeviceToken.findOneAndUpdate(
        { token: token },
        { isActive: false }
      );
    }
  }
}

module.exports = FirebaseMessagingService;