const MyList = require("../../model/myList.model");
//thêm
module.exports.addToMyList = async (req, res) => {
  try {
    const userId = res.locals.userId;
    const productId = req.params.id;

    const myList = new MyList({ userId: userId, product: productId });
    const save = await myList.save();
    return res.status(200).json({
      data: save,
      message: "Sản phẩm được thêm vào danh sách yêu thích",
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
//xóa
module.exports.deleteMyList = async (req, res) => {
  try {
    console.log(req.params.id);
    const myListItem = await MyList.findById(req.params.id);
    if (!myListItem) {
      res.status(400).json({
        message: "Không tìm thấy",
        error: true,
        success: false,
      });
    }
    const deleteItem = await MyList.findByIdAndDelete(req.params.id);
    return res.status(200).json({
      message: "Sản phẩm được xóa khỏi danh sách yêu thích",
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
//xóa tất cả
module.exports.deleteAllMyList = async (req, res) => {
  try {
    const userId = res.locals.userId;
    const deleteAll = await MyList.deleteMany({ userId: userId });
    return res.status(200).json({
      message: "Đã xóa tất cả sản phẩm khỏi danh sách yêu thích",
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
//lấy
module.exports.getMyList = async (req, res) => {
  try {
    const countList = await MyList.countDocuments({
      userId: res.locals.userId,
    });
    const myList = await MyList.find({
      userId: res.locals.userId,
    }).populate("product");
    res.status(200).json({
      data: myList,
      countList: countList,
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
