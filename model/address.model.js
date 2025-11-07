const mongoose = require("mongoose");
const addressSchema = new mongoose.Schema(
  {
    address_line: {
      type: String,
      default: "",
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

    pinCode: {
      type: String,
    },
    typeAddress: {
      type: String,
      default: "Home",
    },
    status: {
      type: Boolean,
      default: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);
const Address = mongoose.model("Address", addressSchema, "address");
module.exports = Address;
