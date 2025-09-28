const mongoose = require("mongoose");
const AdminUserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Vui lòng nhập tên"],
    },
    email: {
      type: String,
      required: [true, "Vui lòng nhập email"],
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
    dateOfBirth: {
      type: Date,
      default: null,
    },
    province: {
      type: String,
      default: "",
    },
    district: {
      type: String,
      default: "",
    },
    ward: {
      type: String,
      default: "",
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
    deleted: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive", "prohibited"],
      default: "Active",
    },
    approved: { type: Boolean, default: false },
    role_id: String,
    deletedAt: Date,
  },
  {
    timestamps: true,
  }
);
const AdminUser = mongoose.model("AdminUser", AdminUserSchema, "Admin-user");
module.exports = AdminUser;
