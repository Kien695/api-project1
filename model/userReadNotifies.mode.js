const mongoose = require("mongoose");
const UserNotificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    notification: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Notification",
    },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);
const UserNotification = mongoose.model(
  "UserNotification",
  UserNotificationSchema,
  "user-read-notification",
);
module.exports = UserNotification;
