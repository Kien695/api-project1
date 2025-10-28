const MyList = require("../../model/myList.model");
//thêm
module.exports.addToMyList = async (req, res) => {
  try {
    const userId = res.locals.userId;
    const item = await MyList.findOne({
      userId: userId,
      productId: req.body.productId,
    });

    if (item) {
      res.status(400).json({
        message: "Sản phẩm đã tồn tại trong danh sách yêu thich",
        error: true,
        success: false,
      });
    } else {
      const myList = new MyList({ userId, ...req.body });
      const save = await myList.save();
      return res.status(200).json({
        data: save,
        message: "Sản phẩm được thêm vào danh sách yêu thích",
        error: false,
        success: true,
      });
    }
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
//lấy
module.exports.getMyList = async (req, res) => {
  try {
    const myList = await MyList.find({
      userId: res.locals.userId,
    });
    res.status(200).json({
      data: myList,
      error: true,
      success: false,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};
