const Order = require("../../model/order.model");
const Notification = require("../../model/notification.model");
const UserNotification = require("../../model/userReadNotifies.mode.js");
const { getIO } = require("../../socket");
//get order
module.exports.getOrder = async (req, res) => {
  try {
    const orders = await Order.find({ deleted: false })
      .sort({ createdAt: -1 })
      .populate("productItems.productId", "_id name images brand size")
      .populate("userId", "name email mobile");

    if (!orders || orders.length === 0) {
      return res.json({
        success: false,
        message: "Không có đơn hàng nào.",
      });
    }

    // Lọc productItems chưa bị xóa
    const filteredOrders = orders
      .map((order) => ({
        ...order._doc,
        productItems: order.productItems.filter(
          (item) => item.deleted !== true,
        ),
      }))
      .filter((order) => order.productItems.length > 0); // chỉ giữ order còn productItem

    res.json({
      success: true,
      data: filteredOrders,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: true,
    });
  }
};

//update status order
module.exports.updateStatus = async (req, res) => {
  try {
    const orderId = req.body.orderId;
    const productId = req.body.productId;
    const size = req.body.size || "";
    const action = req.body.action;
    const order = await Order.findById(orderId).populate(
      "productItems.productId",
      "_id name images brand size",
    );

    let message = "";
    if (order) {
      const index = order.productItems.findIndex(
        (item) =>
          item.productId._id.toString() === productId && item.size == size,
      );
      if (index === -1) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy sản phẩm trong đơn hàng",
        });
      }
      if (action == "delivering") {
        order.productItems[index].order_status = "delivering";
        message = "Đơn hàng đang được vận chuyển!";
      }
      if (action == "delivered") {
        order.productItems[index].order_status = "delivered";
        order.payment_status = "yes";
        message = "Đơn hàng đã được giao thành công!";
      }
      await order.save();
      const noties = await Notification.create({
        title: "Trạng thái đơn hàng",
        receptor: order.userId.toString(),
        content: message,
        product: productId,
        type: "system",
        targetRole: "user",
      });
      await UserNotification.create({
        user: order.userId,
        notification: noties._id,
        isRead: false,
      });
      const populatedNoties = await Notification.findById(noties._id).populate(
        "product",
        "name images",
      );

      const io = getIO();
      io.to(order.userId.toString()).emit("ORDER_STATUS", populatedNoties);

      return res.status(200).json({
        success: true,
        message: "Cập nhật trạng thái thành công!",
        data: order,
      });
    }
    return res
      .status(404)
      .json({ success: false, message: "Đơn hàng không tìm thấy" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: true,
    });
  }
};
//delete order cancelled
module.exports.deleteOrder = async (req, res) => {
  try {
    const orderId = req.body.orderId;
    const productId = req.body.productId;
    const size = req.body.size || "";
    const action = req.body.action;

    const order = await Order.findById(orderId);
    if (order) {
      const index = order.productItems.findIndex(
        (item) => item.productId.toString() === productId && item.size == size,
      );
      if (index === -1) {
        return res.status(404).json({
          message: "Sản phẩm không có trong giỏ hàng",
          success: false,
          error: true,
        });
      }
      if (action == "cancelled") {
        order.productItems[index].deleted = true;
        res.json({
          success: true,
          message: "Xóa sản phẩm trong đơn hàng thành công!",
        });
        await order.save();
        const allDeleted = order.productItems.every((item) => item.deleted);
        if (allDeleted) {
          await Order.findByIdAndUpdate(
            orderId,
            { deleted: true },
            { new: true },
          );
        }
      }
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: true,
    });
  }
};
