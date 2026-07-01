const admin = require("firebase-admin");
const User = require("../models/userModel");
const Notification = require("../models/notificationModel");

/**
 * Dispatches a push notification to a specific user via Firebase Cloud Messaging.
 * 
 * @param {string} userId The database ID of the user.
 * @param {string} title The notification title.
 * @param {string} body The notification body.
 * @param {object} data Optional custom data payload.
 */
exports.sendPushNotification = async (userId, title, body, data = {}) => {
  try {
    // 1. Save notification record in database first for inbox history
    try {
      await Notification.create({
        user: userId,
        title: title.replace(/[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, "").trim(), // Strip emojis for title
        body: body,
        type: data.type || "system",
        isRead: false
      });
    } catch (dbErr) {
      console.error(`Failed to store notification log in DB for user ${userId}:`, dbErr.message);
    }

    const user = await User.findById(userId);
    if (!user) {
      console.warn(`Push notification failed: User with ID ${userId} not found.`);
      return { success: false, reason: "User not found" };
    }

    if (!user.fcmToken) {
      console.log(`Push notification skipped: User ${user.firstName || user.phone} has no FCM token registered.`);
      return { success: false, reason: "No FCM token registered" };
    }

    // Prepare message payload
    const message = {
      notification: {
        title: title,
        body: body,
      },
      // Ensure all custom data fields are strings as required by FCM
      data: Object.keys(data).reduce((acc, key) => {
        acc[key] = String(data[key]);
        return acc;
      }, {}),
      token: user.fcmToken,
    };

    // Dispatch via Firebase
    const response = await admin.messaging().send(message);
    console.log(`FCM push notification sent successfully to user ${userId}. Response ID:`, response);
    return { success: true, response };

  } catch (err) {
    console.error(`Failed to send FCM push notification to user ${userId}:`, err.message);
    return { success: false, error: err.message };
  }
};
