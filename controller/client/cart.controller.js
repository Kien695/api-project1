const Cart = require("../../model/cartproduct.model");
const User = require("../../model/user.model");
//thêm vào giỏ hàng
module.exports.addToCart = async (req, res) => {
  try {
    const userId = res.locals.userId;
    const productId = req.body.productId;
    const quantity = parseInt(req.body.quantity);
    const size = req.body.size;
    console.log(size);
    if (!productId) {
      return res.status(400).json({
        message: "Không tìm thấy sản phẩm",
        error: false,
        success: false,
      });
    }
    const checkItemCart = await Cart.findOne({
      userId: userId,
      productId: productId,
    });
    if (checkItemCart && size === checkItemCart.size) {
      checkItemCart.quantity += quantity;
      const updated = await checkItemCart.save();
      res.status(200).json({
        message: "Thêm số lượng vào giỏ hàng",
        data: updated,
        success: true,
        error: false,
      });
    } else {
      const cartItem = new Cart({
        quantity: quantity,
        size: size,
        userId: userId,
        productId: productId,
      });
      const save = await cartItem.save();
      const updateCartUser = await User.updateOne(
        { _id: userId },
        {
          $push: { shopping_Cart: productId },
        }
      );
      return res.status(200).json({
        data: save,
        message: "Thêm sản phẩm thành công",
        error: false,
        success: true,
      });
    }
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
    let countCart = await Cart.countDocuments({ userId: userId });
    const itemCart = await Cart.find({
      userId: userId,
    }).populate("productId");
    return res.status(200).json({
      data: itemCart,
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
    const { _id, quantity } = req.body;
    if (!_id || !quantity) {
      res.status(400).json({
        message: "Vui lòng cung cấp đủ thông tin",
      });
    }
    const updateCart = await Cart.updateOne(
      { _id: _id, userId: userId },
      { quantity: quantity }
    );
    return res.status(200).json({
      message: "Cập nhật giỏ hàng thành công!",
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
    const id = req.params.id;
    const productId = req.body.productId;
    console.log(productId);
    console.log(id);
    const deleteItemCart = await Cart.deleteOne({ _id: id, userId: userId });
    if (!deleteItemCart) {
      res.status(400).json({
        message: "Sản phẩm trong giỏ hàng không được tìm thấy",
        error: true,
        success: false,
      });
    }
    const user = await User.findOne({
      _id: userId,
    });
    const cartItem = user?.shopping_Cart;
    const updateUserCart = [
      ...cartItem.slice(0, cartItem.indexOf(productId)),
      ...cartItem.slice(cartItem.indexOf(productId) + 1),
    ];
    user.shopping_Cart = updateUserCart;
    await user.save();
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
