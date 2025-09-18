const mongoose = require("mongoose");
const addressSchema = new mongoose.Schema(
  {
    address_line: {
      type: String,
      default: "",
    },
    city: {
      type: String,
      default: "",
    },
    fullName: {
      type: String,
      default: "",
    },
    pinCode: {
      type: String,
    },
    typeAddress: {
      type: String,
      default: "Home",
    },
    mobile: {
      type: String,
      default: null,
    },
    status: {
      type: Boolean,
      default: true,
    },
    userId: {
      type: mongoose.Schema.ObjectId,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);
const Address = mongoose.model("Address", addressSchema, "address");
module.exports = Address;
