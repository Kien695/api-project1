const Address = require("../../model/address.model");
//[post]//add address
module.exports.putAddress = async (req, res) => {
  try {
    const userId = res.locals.userId;
    const bodyWithUser = { ...req.body, userId };

    // tìm địa chỉ của user
    const updatedAddress = await Address.findOneAndUpdate(
      { userId: userId },
      bodyWithUser, // dữ liệu cập nhật
      { new: true, upsert: true }, // new: trả về dữ liệu mới, upsert: nếu chưa có thì tạo mới
    );

    res.status(200).json({
      error: false,
      success: true,
      message: "Cập nhật địa chỉ thành công!",
    });
  } catch (error) {
    res.status(500).json({
      error: true,
      message: "Server Error",
      detail: error.message,
    });
  }
};

//[get]//get
module.exports.getAddress = async (req, res) => {
  try {
    const address = await Address.findOne({
      userId: res.locals.userId,
    }).populate("userId", "name mobile");
    res.status(200).json({
      data: address,
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
