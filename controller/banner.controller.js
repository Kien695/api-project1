const BannerHome = require("../model/bannerHome.model");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
  secure: true,
});
//get
module.exports.getBanner = async (req, res) => {
  try {
    const banner = await BannerHome.find();
    if (!banner) {
      return res.status(400).json({
        error: true,
        success: false,
      });
    }

    return res.status(200).json({
      data: banner,
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
//create
module.exports.create = async (req, res) => {
  try {
    let banner = new BannerHome({
      images: req.body.avatar,
      images_public_id: req.body.avatar_public_id,
    });
    if (!banner) {
      return res.status(400).json({
        message: "Banner không tạo được",
        error: true,
        success: false,
      });
    }
    await banner.save();
    return res.status(200).json({
      message: "Tạo banner chính thành công",
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
//edit
module.exports.edit = async (req, res) => {
  try {
    const oldBanner = await BannerHome.findById(req.params.id);
    if (!oldBanner) {
      return res.status(400).json({
        message: "Banner không được tìm thấy",
        error: true,
        success: false,
      });
    }
    const updated = await BannerHome.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (req.body.avatar_public_id && oldBanner.images_public_id) {
      cloudinary.uploader.destroy(oldBanner.images_public_id);
    }
    res.status(200).json({
      message: "Chỉnh sửa banner chính thành công!",
      error: false,
      success: true,
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};
//delete
module.exports.delete = async (req, res) => {
  try {
    const oldBanner = await BannerHome.findById(req.params.id);
    if (!oldBanner) {
      return res.status(400).json({
        message: "Banner không được tìm thấy",
        error: true,
        success: false,
      });
    }
    if (oldBanner.images_public_id) {
      cloudinary.uploader.destroy(oldBanner.images_public_id);
    }
    const deleted = await BannerHome.findByIdAndDelete(req.params.id);
    res.status(200).json({
      message: "Xóa banner chính thành công!",
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
