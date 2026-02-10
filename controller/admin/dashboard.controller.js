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
    statistics.order.total = await Order.countDocuments({ deleted: false });

    //get list order
    const limit = Number(req.query.limit) || 10;
    const orders = await Order.find({ deleted: false })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("productItems.productId", "_id name images brand size")
      .populate("userId", "name email mobile");

    if (!orders || orders.length === 0) {
      return res.json({
        success: false,
        message: "Không có đơn hàng nào.",
      });
    }
    //revenue
    const year = req.query.year || 2026;

    const revenueByMonth = await Order.aggregate([
      {
        $match: {
          payment_status: "yes",
          deleted: false,
          createdAt: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          total: { $sum: "$totalAmount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const result = revenueByMonth.map((item) => ({
      name: "Doanh số",
      Month: `Tháng ${item._id}`,
      value: item.total,
    }));

    res.status(200).json({
      error: false,
      success: true,
      data: statistics,
      revenue: result,
      order: orders,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};
