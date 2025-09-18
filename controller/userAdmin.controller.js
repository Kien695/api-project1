const UserAdmin = require("../model/userAdmin.model");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { generateAccessToken } = require("../utils/generatAccessToken");
const { generateRefreshToken } = require("../utils/generateRefreshToken");
//create
module.exports.create = async (req, res) => {
  try {
    let account;
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      res.status(400).json({
        message: "Vui lòng nhập đầy đủ thông tin",
        error: true,
        success: false,
      });
    }
    account = await UserAdmin.findOne({ email: email, deleted: false });
    if (account) {
      return res.status(400).json({
        message: "Tài khoản đã tồn tại",
        error: true,
        success: false,
      });
    }
    const salt = await bcryptjs.genSalt(10);
    const hashPassword = await bcryptjs.hash(password, salt);
    account = new UserAdmin({
      email: email,
      name: name,
      password: hashPassword,
    });
    account.save();
    const token = jwt.sign(
      {
        email: account.email,
        id: account._id,
      },
      process.env.JSON_WEB_TOKEN_SECRET_KEY
    );
    return res.status(200).json({
      message: "Tài khoản được tạo. VUi lòng chờ Admin chính phê duyệt",
      error: false,
      success: true,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || error, error: true, success: false });
  }
};
