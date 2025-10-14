const Product = require("../model/product.model");
const Category = require("../model/category.model");
const searchHelper = require("../Helper/Search");
const categoryHelper = require("../Helper/categoryAllFIlter");
const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
  secure: true,
});

//create Product
module.exports.createProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    if (!product) {
      res.status(400).json({
        error: true,
        success: false,
        message: "Sản phẩm không được tạo",
      });
    }
    res.status(200).json({
      message: "Tạo sản phẩm thành công",
      error: false,
      success: true,
      product: product.toObject(),
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      success: false,
      error: true,
    });
  }
};
//get Product
module.exports.getProduct = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 4;

    //search
    const objectSearch = searchHelper(req.query);
    let find = { deleted: false };
    if (objectSearch.regex) {
      find.name = objectSearch.regex;
    }
    //filter category
    const categoryName = req.query.category;

    const category = await Category.findOne({ name: categoryName });

    if (category) {
      const categoryIds = await categoryHelper(category._id);
      find.category = { $in: categoryIds };
    }
    // filter rating
    const rate = req.query.rate;
    if (rate) {
      find.rating = rate;
    }
    //sort
    let sort = {};
    if (req.query.sortKey && req.query.sortValue) {
      sort[req.query.sortKey] = req.query.sortValue;
    } else {
      sort.price = "desc";
    }
    const product = await Product.find(find)
      .populate("category")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort(sort)
      .exec();
    const totalProduct = await Product.countDocuments(find);
    const totalPage = Math.ceil(totalProduct / perPage);

    if (!product || product.length === 0) {
      res.status(400).json({
        message: "Sản phẩm không được tìm thấy!",
        error: true,
        success: false,
      });
    }
    res.status(200).json({
      success: true,
      error: false,
      products: product,
      perPage: perPage,
      page: page,
      totalItems: totalProduct,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};
//get product by category id
module.exports.getProductByCategoryId = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 4;
    const totalProduct = await Product.countDocuments({
      deleted: false,
      catId: req.params.id,
    });
    const totalPage = Math.ceil(totalProduct / perPage);

    const product = await Product.find({ deleted: false, catId: req.params.id })
      .populate("category")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();
    if (page > totalPage) {
      return res.status(400).json({
        message: "Trang không hợp lệ!",
        success: false,
        error: true,
      });
    }

    if (!product) {
      res.status(400).json({
        message: error.message || error,
        error: true,
        success: false,
      });
    }
    res.status(200).json({
      success: true,
      error: false,
      products: product,
      totalPages: totalPage,
      page: page,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};
//get product by category name
module.exports.getProductByCategoryName = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 4;
    const totalProduct = await Product.countDocuments({
      deleted: false,
      catName: req.query.catName,
    });

    const totalPage = Math.ceil(totalProduct / perPage);

    const product = await Product.find({
      deleted: false,
      catName: req.query.catName,
    })
      .populate("category")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();
    if (page > totalPage) {
      return res.status(400).json({
        message: "Trang không hợp lệ!",
        success: false,
        error: true,
      });
    }

    if (!product) {
      res.status(400).json({
        message: error.message || error,
        error: true,
        success: false,
      });
    }
    res.status(200).json({
      success: true,
      error: false,
      products: product,
      totalPages: totalPage,
      page: page,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};
//get product by sub category id
module.exports.getProductBySubCategoryId = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 4;
    const totalProduct = await Product.countDocuments({
      deleted: false,
      subCatId: req.query.id,
    });

    const totalPage = Math.ceil(totalProduct / perPage);

    const product = await Product.find({
      deleted: false,
      subCatId: req.query.subCatId,
    })
      .populate("category")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();
    if (page > totalPage) {
      return res.status(400).json({
        message: "Trang không hợp lệ!",
        success: false,
        error: true,
      });
    }

    if (!product) {
      res.status(400).json({
        message: error.message || error,
        error: true,
        success: false,
      });
    }
    res.status(200).json({
      success: true,
      error: false,
      products: product,
      totalPages: totalPage,
      page: page,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};
//get product by sub category name
module.exports.getProductBySubCategoryName = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 4;
    const totalProduct = await Product.countDocuments({
      deleted: false,
      subCat: req.query.catName,
    });

    console.log(Math.ceil(totalProduct / perPage));
    const totalPage = Math.ceil(totalProduct / perPage);

    const product = await Product.find({
      deleted: false,
      subCat: req.query.subCat,
    })
      .populate("category")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();
    if (page > totalPage) {
      return res.status(400).json({
        message: "Trang không hợp lệ!",
        success: false,
        error: true,
      });
    }

    if (!product) {
      res.status(400).json({
        message: error.message || error,
        error: true,
        success: false,
      });
    }
    res.status(200).json({
      success: true,
      error: false,
      products: product,
      totalPages: totalPage,
      page: page,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};
//get product by third sub category id
module.exports.getProductByThirdSubCategoryId = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 4;
    const totalProduct = await Product.countDocuments({
      deleted: false,
      thirdSubCatId: req.query.id,
    });

    const totalPage = Math.ceil(totalProduct / perPage);

    const product = await Product.find({
      deleted: false,
      thirdSubCatId: req.query.thirdSubCatId,
    })
      .populate("category")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();
    if (page > totalPage) {
      return res.status(400).json({
        message: "Trang không hợp lệ!",
        success: false,
        error: true,
      });
    }

    if (!product) {
      res.status(400).json({
        message: error.message || error,
        error: true,
        success: false,
      });
    }
    res.status(200).json({
      success: true,
      error: false,
      products: product,
      totalPages: totalPage,
      page: page,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};
//get product by third sub category name
module.exports.getProductByThirdSubCategoryName = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 4;
    const totalProduct = await Product.countDocuments({
      deleted: false,
      thirdSubCat: req.query.thirdSubCat,
    });

    const totalPage = Math.ceil(totalProduct / perPage);

    const product = await Product.find({
      deleted: false,
      thirdSubCat: req.query.thirdSubCat,
    })
      .populate("category")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();
    if (page > totalPage) {
      return res.status(400).json({
        message: "Trang không hợp lệ!",
        success: false,
        error: true,
      });
    }

    if (!product) {
      res.status(400).json({
        message: error.message || error,
        error: true,
        success: false,
      });
    }
    res.status(200).json({
      success: true,
      error: false,
      products: product,
      totalPages: totalPage,
      page: page,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};
//get product by price
module.exports.getProductByPrice = async (req, res) => {
  let productList = [];
  if (req.query.catId != "" && req.query.catId != undefined) {
    const productListArr = await Product.find({
      deleted: false,
      catId: req.query.catId,
    }).populate("category");
    productList = productListArr;
  }
  if (req.query.subCatId != "" && req.query.subCatId != undefined) {
    const productListArr = await Product.find({
      deleted: false,
      subCatId: req.query.subCatId,
    }).populate("category");
    productList = productListArr;
  }
  if (req.query.thirdSubCatId != "" && req.query.thirdSubCatId != undefined) {
    const productListArr = await Product.find({
      deleted: false,
      thirdSubCatId: req.query.thirdSubCatId,
    }).populate("category");
    productList = productListArr;
  }
  const filterProduct = productList.filter((product) => {
    if (req.query.minPrice && product.price < parseInt(+req.query.minPrice)) {
      return false;
    }
    if (req.query.maxPrice && product.price > parseInt(+req.query.maxPrice)) {
      return false;
    }
    return true;
  });
  res.status(200).json({
    error: false,
    success: true,
    products: filterProduct,
    totalPages: 0,
    page: 0,
  });
};
//get product by rating
module.exports.getProductByRating = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 4;
    const totalProduct = await Product.countDocuments({
      deleted: false,
      rating: req.query.rating,
    });

    const totalPage = Math.ceil(totalProduct / perPage);
    let product = [];
    if (req.query.catId !== undefined) {
      product = await Product.find({
        deleted: false,
        rating: req.query.rating,
        catId: req.query.catId,
      })
        .populate("category")
        .skip((page - 1) * perPage)
        .limit(perPage)
        .exec();
    }
    if (req.query.subCatId !== undefined) {
      product = await Product.find({
        deleted: false,
        rating: req.query.rating,

        subCatId: req.query.subCatId,
      })
        .populate("category")
        .skip((page - 1) * perPage)
        .limit(perPage)
        .exec();
    }
    if (req.query.thirdSubCatId !== undefined) {
      product = await Product.find({
        deleted: false,
        thirdSubCatId: req.query.thirdSubCatId,
      })
        .populate("category")
        .skip((page - 1) * perPage)
        .limit(perPage)
        .exec();
    }
    if (page > totalPage) {
      return res.status(400).json({
        message: "Trang không hợp lệ!",
        success: false,
        error: true,
      });
    }

    if (!product) {
      res.status(400).json({
        message: error.message || error,
        error: true,
        success: false,
      });
    }
    res.status(200).json({
      success: true,
      error: false,
      products: product,
      totalPages: totalPage,
      page: page,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};
//product count
module.exports.productCount = async (req, res) => {
  try {
    const productCount = await Product.countDocuments({ deleted: false });
    if (!productCount) {
      res.status(400).json({
        success: false,
        error: true,
      });
    }
    return res.status(200).json({
      error: false,
      success: true,
      countProduct: productCount,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};
//get product by featured
module.exports.getProductByFeatured = async (req, res) => {
  try {
    const product = await Product.find({
      deleted: false,
      isFeatured: true,
    }).populate("category");

    if (!product) {
      res.status(400).json({
        message: error.message || error,
        error: true,
        success: false,
      });
    }
    res.status(200).json({
      success: true,
      error: false,
      products: product,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};
//delete Product
module.exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("category");
    if (!product) {
      res.status(400).json({
        message: "Sản phẩm không được tìm thấy",
        error: true,
        success: false,
      });
    }
    if (product.public_id) {
      await cloudinary.uploader.destroy(product.public_id);
    }
    const deleteProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deleteProduct) {
      res.status(400).json({
        error: true,
        success: false,
        message: "Sản phẩm không được xóa!",
      });
    }
    if (deleteProduct.public_id) {
      await cloudinary.uploader.destroy(deleteProduct.public_id);
    }
    return res.status(200).json({
      error: false,
      success: true,
      message: "Xóa thành công!",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};
//get single product
module.exports.getSingleProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("category");
    if (!product) {
      res.status(400).json({
        message: "Sản phẩm không được tìm thấy",
        error: true,
        success: false,
      });
    }

    return res.status(200).json({
      error: false,
      success: true,
      product: product,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};
//
//update product
module.exports.updateProduct = async (req, res) => {
  try {
    const oldProduct = await Product.findById(req.params.id);
    if (!oldProduct) {
      return res
        .status(404)
        .json({ message: "Sản phẩm không tồn tại", success: false });
    }

    const newImages = req.body.images || [];

    // Xóa ảnh bị bỏ đi
    const imagesToDelete = oldProduct.images.filter(
      (oldImg) => !newImages.some((img) => img.public_id === oldImg.public_id)
    );
    for (const img of imagesToDelete) {
      if (img.public_id) await cloudinary.uploader.destroy(img.public_id);
    }

    // Update
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      { ...req.body, images: newImages },
      { new: true }
    );

    res.json({ success: true, product: updated });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};
