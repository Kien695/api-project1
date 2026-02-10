const Role = require("../../model/role.model");

//get
module.exports.getRole = async (req, res) => {
  try {
    const role = await Role.find({ deleted: false });
    return res.status(200).json({
      error: false,
      success: true,
      data: role,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};
//add
module.exports.create = async (req, res) => {
  try {
    const role = new Role(req.body);
    await role.save();
    return res.status(200).json({
      message: "Tạo nhóm quyền thành công!",
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
//edit
module.exports.edit = async (req, res) => {
  try {
    const role = await Role.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    return res.status(200).json({
      message: "Cập nhật nhóm quyền thành công!",
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
//delete
module.exports.delete = async (req, res) => {
  try {
    const role = await Role.findByIdAndDelete(req.params.id);
    return res.status(200).json({
      message: "Xóa nhóm quyền thành công!",
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
//permissions
module.exports.permission = async (req, res) => {
  try {
    const permissions = req.body;

    for (const item of permissions) {
      await Role.updateOne({ _id: item.id }, { permissions: item.permissions });
    }
    return res.status(200).json({
      message: "Cập nhật phân quyền thành công!",
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
