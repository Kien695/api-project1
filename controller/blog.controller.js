const Blog = require("../model/blog.model");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
  secure: true,
});
//get
module.exports.getBlog = async (req, res) => {
  try {
    const blog = await Blog.find();
    return res.status(200).json({
      data: blog,
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
    const blog = new Blog({
      title: req.body.title,
      images: req.body.avatar,
      images_public_id: req.body.avatar_public_id,
      description: req.body.description,
    });
    await blog.save();
    return res.status(200).json({
      message: "Tạo blog thành công",
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
//delete
module.exports.deleteBlog = async (req, res) => {
  try {
    const oldBlog = await Blog.findById(req.params.id);

    if (!oldBlog) {
      return req.status(400).json({
        message: "Blog không tồn tại",
        error: true,
        success: false,
      });
    }
    if (oldBlog.images_public_id) {
      cloudinary.uploader.destroy(oldBlog.images_public_id);
    }
    const deleted = await Blog.findByIdAndDelete(req.params.id);
    res.status(200).json({
      message: "Xóa blog thành công!",
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
module.exports.editBlog = async (req, res) => {
  try {
    const oldBlog = await Blog.findById(req.params.id);
    if (!oldBlog) {
      return res.status(400).json({
        message: "Blog không tồn tại",
        error: true,
        success: false,
      });
    }

    const updateData = {};
    if (req.body.title) updateData.title = req.body.title;
    if (req.body.avatar) updateData.images = req.body.avatar;
    if (req.body.avatar_public_id)
      updateData.images_public_id = req.body.avatar_public_id;
    if (req.body.description) updateData.description = req.body.description;
    if (oldBlog.images_public_id && req.body.avatar_public_id) {
      cloudinary.uploader.destroy(oldBlog.images_public_id);
    }
    const updated = await Blog.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });

    res.status(200).json({
      message: "Cập nhật blog thành công",
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
