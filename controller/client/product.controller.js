const mongoose = require("mongoose");
const Product = require("../../model/product.model");
const categoryHelper = require("../../Helper/categoryAllFIlter");
const Category = require("../../model/category.model");
const searchHelper = require("../../Helper/Search");
//get product
module.exports.getProduct = async (req, res) => {
  try {
    const productFeatured = await Product.find({
      deleted: false,
      isFeatured: true,
    })
      .sort({
        createdAt: -1,
      })
      .limit(7);
    const productNew = await Product.find({
      deleted: false,
    })
      .sort({
        createdAt: -1,
      })
      .limit(7);
    const catId = req.query.catId;

    let find = {
      deleted: false,
    };
    const category = await Category.findOne({ _id: catId });
    if (category) {
      const categoryIds = await categoryHelper(category._id);
      find.category = { $in: categoryIds };
    }
    const productPopular = await Product.find(find)
      .sort({ sale: -1 })
      .populate("category")
      .limit(7);
    return res.json({
      dataFeatured: productFeatured,
      dataNew: productNew,
      dataSale: productPopular,
      success: true,
      error: false,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      success: false,
      error: true,
    });
  }
};
//get all product
module.exports.getAllProduct = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const maxPrice = parseInt(req.query?.maxPrice);
    const minPrice = parseInt(req.query?.minPrice);
    let find = {
      deleted: false,
    };
    //search
    const objectSearch = searchHelper(req.query);

    if (objectSearch.regex) {
      find.name = objectSearch.regex;
    }
    //price filter
    if (!isNaN(maxPrice) && !isNaN(minPrice)) {
      find.price = {};
      find.price.$gte = minPrice;
      find.price.$lte = maxPrice;
    }

    const catId = req.query.catId;

    let category;
    if (mongoose.Types.ObjectId.isValid(catId)) {
      category = await Category.findOne({ _id: catId });
    } else {
      category = await Category.findOne({ slug: catId });
    }
    if (category) {
      const categoryIds = await categoryHelper(category._id);
      find.category = { $in: categoryIds };
    }
    //sort
    let sort = {};
    if (req.query.sortKey && req.query.sortValue) {
      sort[req.query.sortKey] = req.query.sortValue;
    } else {
      sort.price = "asc";
    }
    //rating
    if (req.query.rating) {
      find.rating = req.query.rating;
    }
    const totalProduct = await Product.countDocuments(find);
    const totalPage = Math.ceil(totalProduct / 11);
    const product = await Product.find(find)
      .populate("category")
      .limit(11)
      .sort(sort)
      .skip((page - 1) * 11);
    res.json({
      data: product,
      page: page,
      totalPage: totalPage,
      totalProduct: totalProduct,
      error: false,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      success: false,
      error: true,
    });
  }
};
//detail
module.exports.detailProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(400).json({
        message: "Sản phẩm không được tìm thấy",
        error: true,
        success: false,
      });
    }

    const siblingCategories = await Category.findOne({
      _id: product.category,
    });

    const cateParent = await Category.findOne({
      _id: siblingCategories.parentId,
    });

    const categoryIds = await categoryHelper(cateParent._id);

    const relatedProducts = await Product.find({
      category: { $in: categoryIds },
      _id: { $ne: req.params.id },
    }).limit(8);
    return res.status(200).json({
      error: false,
      success: true,
      data: product,
      related: relatedProducts,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      success: false,
      error: true,
    });
  }
};
