const Product = require("../../model/product.model");
const User = require("../../model/user.model");
const Order = require("../../model/order.model");
const Category = require("../../model/category.model");
//[get]
module.exports.dashboard = async (req, res) => {
  try {
    const statistics = {
      products: { total: 0 },
      category: { total: 0 },
      user: { total: 0 },
      order: { total: 0 },
    };
    //product
    statistics.products.total = await Product.countDocuments({
      deleted: false,
    });
    //category
    statistics.category.total = await Category.countDocuments();
    //user
    statistics.user.total = await User.countDocuments();
    //order
    statistics.order.total = await Order.countDocuments();
    res.status(200).json({
      error: false,
      success: true,
      data: statistics,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};
