const Logo = require("../model/logo.model");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
  secure: true,
});
//get logo
module.exports.getLogo = async (req, res) => {
  try {
    const logo = await Logo.findOne();
    return res.status(200).json({
      error: false,
      success: true,
      data: logo,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};
//add logo
module.exports.add = async (req, res) => {
  try {
    const oldLogo = await Logo.findOne();
    if (oldLogo) {
      await Logo.deleteOne({ _id: oldLogo._id });
      cloudinary.uploader.destroy(oldLogo.images_public_id);
    }
    const logo = new Logo({
      images: req.body.avatar,
      images_public_id: req.body.avatar_public_id,
    });
    await logo.save();
    return res.status(200).json({
      message: "Thêm logo thành công",
      error: false,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};
