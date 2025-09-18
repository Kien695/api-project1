const { error } = require("console");
const Category = require("../model/category.model");
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
      images: req.body.images,
      parentId: req.body.parentId,
      parentCatName: req.body.parentCatName,
    });
    if (!category) {
      return res.status(500).json({
        message: "Category không tạo được",
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
//get category
module.exports.getCategory = async (req, res) => {
  try {
    const categories = await Category.find();
    const categoryMap = {};
    categories.forEach((category) => {
      categoryMap[category._id] = { ...category._doc, children: [] };
    });
    const rootCategories = [];
    categories.forEach((category) => {
      if (category.parentId) {
        categoryMap[category.parentId].children.push(categoryMap[category._id]);
      } else {
        rootCategories.push(categoryMap[category._id]);
      }
    });
    return res.status(200).json({
      message: "Tạo danh mục thành công",
      error: false,
      success: true,
      data: rootCategories,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
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
//removeImageFromCloudinary
var imagesArr = [];
module.exports.removeImage = async (req, res) => {
  const imgUrl = req.query.img;
  const urlArr = imgUrl.split("/");
  //https://res.cloudinary.com/dzyi6hnfr/image/upload/v1754130369/vltgswbyxwgx4u5suvdd.png
  // image = ["https","res.cloudinary.com","image","upload","v1754130369","vltgswbyxwgx4u5suvdd.png"];
  const image = urlArr[urlArr.length - 1];
  const imageName = image.split(".")[0];
  if (imageName) {
    const results = await cloudinary.uploader.destroy(
      imageName,
      (error, result) => {}
    );
    if (res) {
      return res.status(200).send(results);
    }
  }
};
//delete category
module.exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    const images = category.images;
    for (let img of images) {
      const imgUrl = img;
      const UrlArr = imgUrl.split("/");
      const image = UrlArr[UrlArr.length - 1];
      const imageName = image.split(".")[0];
      if (imageName) {
        cloudinary.uploader.destroy(imageName, (error, result) => {});
      }
    }
    const subCategory = await Category.find({
      parentId: req.params.id,
    });
    for (let i = 0; i < subCategory.length; i++) {
      const thirdCategory = await Category.find({
        parentId: subCategory[i]._id,
      });
      for (let i = 0; i < thirdCategory.length; i++) {
        const deleteThirdCategory = await Category.findByIdAndDelete(
          thirdCategory[i]._id
        );
      }
      const deleteSubCat = await Category.findByIdAndDelete(subCategory[i]._id);
    }
    const deleteCat = await Category.findByIdAndDelete(req.params.id);
    if (!deleteCat) {
      res.status(404).json({
        error: true,
        success: false,
        message: "Danh mục không được tìm thấy",
      });
    }
    res.status(200).json({
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
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        images: req.body.images,
        parentId: req.body.parentId,
        parentCatName: req.body.parentCatName,
      },
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
    res.status(200).json({
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
