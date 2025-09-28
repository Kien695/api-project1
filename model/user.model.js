const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Vui lòng nhập tên"],
    },
    email: {
      type: String,
      required: [true, "Vui lòng nhập email"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Vui lòng nhập password"],
    },
    avatar: {
      type: String,
      default: "",
    },
    avatar_public_id: { type: String, default: "" },
    mobile: {
      type: String,
      default: null,
    },
    verify_email: {
      type: Boolean,
      default: false,
    },
    last_login_date: {
      type: Date,
      default: "",
    },
    access_token: {
      type: String,
      default: "",
    },
    refresh_token: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Active", "Inactive", "prohibited"],
      default: "Active",
    },
    address_details: {
      type: mongoose.Schema.ObjectId,
      ref: "address",
    },
    shopping_Cart: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "CartProduct",
      },
    ],
    orderHistory: {
      type: mongoose.Schema.ObjectId,
      ref: "order",
    },
    otp: {
      type: String,
    },
    otpExpires: {
      type: Date,
    },

    forgot_password_otp: {
      type: String,
      default: null,
    },
    forgot_password_expiry: {
      type: Date,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);
const User = mongoose.model("User", userSchema, "user");
module.exports = User;
