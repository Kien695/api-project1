const Notification = require("../../model/notification.model");
const UserNotification = require("../../model/userReadNotifies.mode.js");
//get
module.exports.getNotifi = async (req, res) => {
  try {
    const notifies = await Notification.find({
      receptor: res.locals.userId,
    }).populate("product", "name images");
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
    console.log(updated);
    console.log("ok");
    return res.status(200).json({ success: true, error: false });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
