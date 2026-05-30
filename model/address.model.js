const mongoose = require("mongoose");
const addressSchema = new mongoose.Schema(
  {
    address_line: {
      type: String,
      default: "",
    },
    province: String,
    provinceCode: String,

    district: String,
    districtCode: String,

    ward: String,
    wardCode: String,

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
  },
);
const Address = mongoose.model("Address", addressSchema, "address");
module.exports = Address;
