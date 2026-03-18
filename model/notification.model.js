const mongoose = require("mongoose");
const NotificationSchema = new mongoose.Schema(
  {
    title: String,
    content: String,

    type: {
      type: String,
      enum: ["product-sale", "system", "order"],
      default: "system",
    },

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      default: null,
    },

    targetRole: {
      type: String,
      enum: ["all", "user", "admin"],
      default: "all",
    },
    receptor: String,
    startDate: Date,
    endDate: Date,

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);
const Notification = mongoose.model(
  "Notification",
  NotificationSchema,
  "notification",
);
module.exports = Notification;
