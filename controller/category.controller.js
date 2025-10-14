const Category = require("../model/category.model");
const categoryTree = require("../Helper/categoryTree");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
  secure: true,
});
//create category
module.exports.createCategory = async (req, res) => {
  try {
    let category = new Category({
      name: req.body.name,
      images: req.body.avatar,
      images_public_id: req.body.avatar_public_id,
      parentId: req.body.parentId,
      parentCatName: req.body.parentCatName,
    });
    if (!category) {
      return res.status(400).json({
        message: "Danh mục không tạo được",
        error: true,
        success: false,
      });
    }
    await category.save();
    return res.status(200).json({
      category: category,
      message: "Tạo danh mục thành công",
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
//getCategory
module.exports.getCategory = async (req, res) => {
  try {
    const categories = await Category.find().lean();
    const tree = categoryTree(categories);
    return res.status(200).json({
      error: false,
      success: true,
      data: tree,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Lỗi server",
      error: true,
      success: false,
    });
  }
};
//get category count
module.exports.getCategoryCount = async (req, res) => {
  try {
    const countCategories = await Category.countDocuments({
      parentId: null,
    });
    if (!countCategories) {
      res.status(500).json({ success: false, error: true });
    } else {
      res.send({
        countCategories: countCategories,
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};
//get sub category count
module.exports.subGetCategoryCount = async (req, res) => {
  try {
    const Categories = await Category.find();
    if (!Categories) {
      res.status(500).json({ success: false, error: true });
    } else {
      let subCatList = [];
      for (let cat of Categories) {
        if (cat.parentId !== null) {
          subCatList.push(cat);
        }
      }
      res.send({
        subCountCategories: subCatList.length,
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};
//get single category
module.exports.getSingleCategory = async (req, res) => {
  try {
    const Categories = await Category.findById(req.params.id);
    if (!Categories) {
      res.status(500).json({
        success: false,
        error: true,
        message: "Danh mục không được tìm thấy",
      });
    }
    return res.status(200).json({
      success: true,
      error: false,
      category: Categories,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

//delete category
module.exports.deleteCategory = async (req, res) => {
  try {
    const hasChildren = await Category.findOne({ parentId: req.params.id });
    if (hasChildren) {
      return res.status(400).json({
        error: true,
        success: false,
        message: "Không thể xóa danh mục này vì tồn tại danh mục con!",
      });
    }

    const deleteCat = await Category.findByIdAndDelete(req.params.id);

    if (!deleteCat) {
      return res.status(404).json({
        error: true,
        success: false,
        message: "Danh mục không được tìm thấy",
      });
    }
    if (deleteCat.avatar_public_id) {
      await cloudinary.uploader.destroy(deleteCat.avatar_public_id);
    }
    return res.status(200).json({
      success: true,
      error: false,
      message: "Danh mục đã được xóa",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};
//updateCategory
module.exports.updateCategory = async (req, res) => {
  try {
    const oldCategory = await Category.findById(req.params.id);
    if (!oldCategory) {
      return res.status(404).json({
        message: "Danh mục không tồn tại",
        error: true,
        success: false,
      });
    }
    const updateData = {};
    if (req.body.name) updateData.name = req.body.name;
    if (req.body.avatar) updateData.images = req.body.avatar;
    if (req.body.avatar_public_id)
      updateData.images_public_id = req.body.avatar_public_id;
    if (req.body.parentId) updateData.parentId = req.body.parentId;
    if (req.body.parentCatName)
      updateData.parentCatName = req.body.parentCatName;
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
      }
    );

    if (!category) {
      res.status(400).json({
        message: "Cập nhật danh mục thất bại",
        success: false,
        error: true,
      });
    }
    // Xóa ảnh cũ nếu có
    if (req.body.avatar_public_id && oldCategory.images_public_id) {
      cloudinary.uploader.destroy(oldCategory.images_public_id);
    }
    res.status(200).json({
      message: "Cập nhật danh mục thành công",
      error: false,
      success: true,
      category: category,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};
//updateSubCategory
module.exports.updateSubCategory = async (req, res) => {
  try {
    const { name, parentId } = req.body;
    const id = req.params.id;
    const category = await Category.findById(id);
    if (!category) {
      return res.status(400).json({
        message: "Danh mục cha không hợp lệ",
        error: true,
        success: false,
      });
    }
    category.name = name || category.name;
    category.parentId = parentId || null;
    await category.save();
    return res.status(200).json({
      message: "Cập nhật danh mục con thành công",
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
