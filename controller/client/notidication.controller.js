const Notification = require("../../model/notification.model");
const UserNotification = require("../../model/userReadNotifies.mode.js");
const { getIO } = require("../../socket");
//get
module.exports.getNotifi = async (req, res) => {
  try {
    const userId = res.locals.userId;

    const notifies = await Notification.find({
      $or: [{ receptor: userId }, { targetRole: "all" }],
    })
      .populate("product", "name images")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      error: false,
      success: true,
      data: notifies,
    });
  } catch (err) {
    return res.status(500).json({
      error: true,
      success: false,
      message: err.message,
    });
  }
};
//get noti sent to all
module.exports.getNotiAll = async (req, res) => {
  try {
    const notifies = await Notification.find({
      targetRole: "all",
    });
    if (!notifies) {
      return res.json({
        message: "Chưa có thông báo nào",
        error: true,
        success: false,
      });
    }

    return res.status(200).json({
      error: false,
      success: true,
      data: notifies,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

//get notifi unread
module.exports.getUnRead = async (req, res) => {
  try {
    const unreadCount = await UserNotification.countDocuments({
      user: res.locals.userId,
      isRead: false,
    });
    return res.status(200).json({
      success: true,
      error: false,
      unreadCount,
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message,
    });
  }
};
//delete
module.exports.deleteNotifi = async (req, res) => {
  try {
    await Notification.deleteMany({
      receptor: res.locals.userId,
    });
    return res.status(200).json({
      error: false,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message,
    });
  }
};
//update isRead
module.exports.updateIsRead = async (req, res) => {
  try {
    // Cập nhật isRead = true cho notification đó
    const updated = await UserNotification.updateMany(
      { user: res.locals.userId, isRead: false },
      { isRead: true },
    );

    return res.status(200).json({ success: true, error: false });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
//create noti
module.exports.create = async (req, res) => {
  try {
    console.log(req.body);
    const { title, content } = req.body;
    const noti = await Notification.create({
      title: title,
      content: content,
      type: "product",
      targetRole: "all",
    });
    const io = getIO();
    io.emit("NOTI_STATUS", noti);
    return res.status(201).json({
      error: false,
      success: true,
      data: noti,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
//delete
module.exports.deleted = async (req, res) => {
  try {
    console.log(req.params.id);
    const oldNoti = await Notification.findById(req.params.id);

    if (!oldNoti) {
      return res.status(404).json({
        message: "Thông báo không không tồn tại",
        error: true,
        success: false,
      });
    }

    const deleted = await Notification.findByIdAndDelete(req.params.id);
    res.status(200).json({
      message: "Xóa thông báo thành công!",
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
