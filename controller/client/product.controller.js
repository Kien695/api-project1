const Product = require("../../model/product.model");
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
    const productSale = await Product.find({
      deleted: false,
    })
      .sort({ sale: -1 })
      .limit(7);
    return res.json({
      dataFeatured: productFeatured,
      dataNew: productNew,
      dataSale: productSale,
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

    const totalProduct = await Product.countDocuments({ deleted: false });
    const totalPage = Math.ceil(totalProduct / 11);
    const product = await Product.find({ deleted: false })
      .populate("category")
      .limit(11)
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
      data: product,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      success: false,
      error: true,
    });
  }
};
