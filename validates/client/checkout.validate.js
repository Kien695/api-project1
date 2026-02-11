module.exports.checkout = (req, res, next) => {
  const { delivery_address, mobile } = req.body;
  if (!delivery_address || !mobile) {
    return res.status(400).json({
      success: false,
      message: "Vui lòng điền đầy đủ thông tin giao hàng!",
    });
  }
  next();
};
