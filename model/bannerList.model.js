const mongoose = require("mongoose");

const bannerListSchema = new mongoose.Schema(
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
const BannerList = mongoose.model(
  "BannerList",
  bannerListSchema,
  "banner-list"
);
module.exports = BannerList;
