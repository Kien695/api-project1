const mongoose = require("mongoose");
const logoSchema = new mongoose.Schema(
  {
    images: {
      type: String,
      default: "",
    },
    images_public_id: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);
const LogoSchema = mongoose.model("LogoSchema", logoSchema, "logo");
module.exports = LogoSchema;
