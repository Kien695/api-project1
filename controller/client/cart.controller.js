const Cart = require("../../model/cartproduct.model");
const User = require("../../model/user.model");
//thêm vào giỏ hàng
module.exports.addToCart = async (req, res) => {
  try {
    const userId = res.locals.userId;
    const productId = req.body.productId;
    let quantity = parseInt(req.body.quantity);
    const size = req.body.size || "";
    let price = parseInt(req.body.price);

    if (!productId) {
      return res.status(400).json({
        message: "Không tìm thấy sản phẩm",
        error: false,
        success: false,
      });
    }
    let cart = await Cart.findOne({
      userId: userId,
    });
    if (!cart) {
      cart = new Cart({
        userId,
        itemCart: [{ productId, quantity, size, price }],
      });
    } else {
      const index = cart.itemCart.findIndex(
        (item) => item.productId.toString() === productId && item.size === size
      );
      if (index > -1) {
        cart.itemCart[index].quantity += quantity;
        cart.itemCart[index].price = price;
      } else {
        cart.itemCart.push({ productId, quantity, size, price });
      }
    }
    await cart.save();
    return res.status(200).json({
      message: "Thêm sản phẩm thành công",
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
//lấy giỏ hàng
module.exports.getCartItem = async (req, res) => {
  try {
    const userId = res.locals.userId;

    const cart = await Cart.findOne({
      userId: userId,
    }).populate("itemCart.productId");
    let countCart = 0;
    let items = [];
    if (cart && cart.itemCart.length > 0) {
      items = cart.itemCart;
      countCart = cart.itemCart.length;
    }
    return res.status(200).json({
      data: items,
      countCart: countCart,
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
//cập nhật số lượng
module.exports.updateQuantityCart = async (req, res) => {
  try {
    const userId = res.locals.userId;
    const { productId, quantity, size } = req.body;
    if (!productId || !quantity) {
      res.status(400).json({
        message: "Vui lòng cung cấp đủ thông tin",
      });
    }
    const cart = await Cart.findOne({ userId: userId });
    if (cart) {
      const index = cart.itemCart.findIndex(
        (item) => item.productId.toString() == productId && item?.size == size
      );
      if (index === -1) {
        return res.status(404).json({
          message: "Sản phẩm không có trong giỏ hàng",
          success: false,
          error: true,
        });
      }
      cart.itemCart[index].quantity = quantity;
      await cart.save();
    }
    return res.status(200).json({
      message: "Cập nhật số lượng thành công!",
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
//xóa sp trong giỏ hàng
module.exports.deleteCartItem = async (req, res) => {
  try {
    const userId = res.locals.userId;
    const productId = req.body.productId;
    const size = req.body.size || "";
    const cart = await Cart.findOne({ userId: userId });
    if (cart) {
      const index = cart.itemCart.findIndex(
        (item) => item.productId.toString() === productId && item.size == size
      );
      if (index === -1) {
        return res.status(404).json({
          message: "Sản phẩm không có trong giỏ hàng",
          success: false,
          error: true,
        });
      }
      cart.itemCart.splice(index, 1);
      await cart.save();
    }
    return res.status(200).json({
      message: "Sản phẩm đã được xóa khỏi giỏ hàng",
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
//delete all
module.exports.deleteCartAll = async (req, res) => {
  try {
    const userId = res.locals.userId;
    console.log(userId);
    await Cart.deleteMany({ userId: userId }); // xóa tất cả giỏ hàng của user

    return res.status(200).json({
      message: "Giỏ hàng đã được xóa toàn bộ",
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
