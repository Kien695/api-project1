const mongoose = require("mongoose");
const bannerHomeSchema = new mongoose.Schema(
  {
    images: {
      type: String,
      default: "",
    },
    images_public_id: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);
const BannerHome = mongoose.model(
  "BannerHome",
  bannerHomeSchema,
  "banner-home"
);
module.exports = BannerHome;
