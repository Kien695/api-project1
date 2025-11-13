const BannerList = require("../../model/bannerList.model");
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
    const banner = await BannerList.find();
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
    let banner = new BannerList({
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
      message: "Tạo banner phụ thành công",
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
    const oldBanner = await BannerList.findById(req.params.id);
    if (!oldBanner) {
      return res.status(400).json({
        message: "Banner không được tìm thấy",
        error: true,
        success: false,
      });
    }
    const updateData = {};

    if (req.body.avatar) updateData.images = req.body.avatar;
    if (req.body.avatar_public_id)
      updateData.images_public_id = req.body.avatar_public_id;
    const updated = await BannerList.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    if (req.body.avatar_public_id && oldBanner.images_public_id) {
      cloudinary.uploader.destroy(oldBanner.images_public_id);
    }
    res.status(200).json({
      message: "Chỉnh sửa banner phụ thành công!",
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
    const oldBanner = await BannerList.findById(req.params.id);
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
    const deleted = await BannerList.findByIdAndDelete(req.params.id);
    res.status(200).json({
      message: "Xóa banner phụ thành công!",
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
//deleteALL
module.exports.deleteAll = async (req, res) => {
  try {
    const ids = req.body.ids;
    if (!ids || !ids.length)
      return res
        .status(400)
        .json({ success: false, message: "Không có ID nào được gửi." });

    // Lấy tất cả banner cần xóa
    const banners = await BannerList.find({ _id: { $in: ids } });

    // Lấy danh sách public_id
    const publicIds = banners.map((b) => b.images_public_id).filter(Boolean); // bỏ những cái null/undefined

    // Xóa song song trên Cloudinary
    await Promise.all(
      publicIds.map((pid) =>
        cloudinary.uploader
          .destroy(pid)
          .catch((err) => console.error("Cloudinary delete error:", err))
      )
    );

    // Sau khi xóa ảnh thì xóa trong DB
    await BannerList.deleteMany({ _id: { $in: ids } });
    res.json({ success: true, message: "Xóa banner phụ thành công!" });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};
