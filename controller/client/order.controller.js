const Cart = require("../../model/cartproduct.model");
const Product = require("../../model/product.model");
const Order = require("../../model/order.model");
const User = require("../../model/user.model");
//add
module.exports.order = async (req, res) => {
  try {
    const userId = res.locals.userId;
    const payment_status = req.body.payment_status || "no";
    const paymentMethod = req.body.paymentMethod || "cod";
    const delivery_address = req.body.delivery_address || "";
    const productItems = req.body.productItems || [];
    const totalAmount = req.body.totalAmount;
    const buyMethod = req.body.buyMethod;
    // Tạo đơn hàng mới
    const order = await Order.create({
      userId,
      productItems,
      paymentMethod,
      delivery_address,
      totalAmount,
      payment_status,
    });

    if (buyMethod == "indirect") {
      // Xóa giỏ hàng trong Cart
      await Cart.deleteMany({ userId });
      // Cập nhật số lượng đã bán cho từng sản phẩm
      for (const item of productItems) {
        await Product.findOneAndUpdate(
          {
            _id: item.productId,
            countInStock: { $gte: item.quantity },
          },
          {
            $inc: { countInStock: -item.quantity },
          },
        );
      }
    }

    res.status(201).json({
      success: true,
      message: "Đặt hàng thành công",
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      detail: error.message,
    });
  }
};
//get order
module.exports.getOrder = async (req, res) => {
  try {
    const userId = res.locals.userId;

    const order = await Order.find({ userId: userId })
      .populate(
        "productItems.productId",
        "_id name images brand price discountPercentage",
      )
      .sort({ createdAt: -1 });

    if (!order || order.length === 0) {
      return res.json({
        success: false,
        message: "Không có đơn hàng nào.",
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: true,
    });
  }
};
//update status order
module.exports.updateStatus = async (req, res) => {
  try {
    const userId = res.locals.userId;
    const productId = req.body.productId;
    const size = req.body.size || "";
    const action = req.body.action;
    console.log(action);
    const orders = await Order.find({ userId: userId });
    if (!orders || orders.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy đơn hàng nào" });
    }
    // lặp từng đơn
    for (let order of orders) {
      const index = order.productItems.findIndex(
        (item) => item.productId.toString() === productId && item.size === size,
      );

      if (index !== -1) {
        if (action === "cancel") {
          order.productItems[index].order_status = "cancelled";
        }

        await order.save();
      }
    }
    return res.status(200).json({
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: true,
    });
  }
};
