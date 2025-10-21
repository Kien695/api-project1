const UserAdmin = require("../model/userAdmin.model");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cloudinary = require("cloudinary").v2;
const { sendMail } = require("../config/sendEmail");
const { generateAccessToken } = require("../utils/generatAccessToken");
const { generateRefreshToken } = require("../utils/generateRefreshToken");
//create
module.exports.register = async (req, res) => {
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
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    const salt = await bcryptjs.genSalt(10);
    const hashPassword = await bcryptjs.hash(password, salt);
    account = new UserAdmin({
      email: email,
      name: name,
      password: hashPassword,
      otp: verifyCode,
      otpExpires: Date.now() + 600000,
    });
    account.save();
    const subject = "Mã OTP xác minh";
    const html = `Mã OTP lấy lại mật khẩu là: <b style="color: green;">${account.otp}</b>. Thời hạn sử dụng là:${account.otpExpires}`;
    const verifyEmail = await sendMail(email, subject, html);
    const token = jwt.sign(
      {
        email: account.email,
        id: account._id,
      },
      process.env.JSON_WEB_TOKEN_SECRET_KEY
    );
    return res.status(200).json({
      message: "Tài khoản được tạo. Vui lòng nhập mã OTP xác minh",
      error: false,
      success: true,
      token: token,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || error, error: true, success: false });
  }
};
//[post]/verify-email
module.exports.verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await UserAdmin.findOne({ email: email });
    if (!user) {
      return res.status(400).json({
        error: true,
        success: false,
        message: "Tài khoản không tồn tại",
      });
    }
    if (user.otp === otp && user.otpExpires > Date.now()) {
      user.verify_email = true;
      user.otp = null;
      user.otpExpires = null;
      await user.save();
      return res.status(200).json({
        error: false,
        success: true,
        message: "Xác minh Email thành công. Vui lòng chờ Admin phê duyệt",
      });
    } else if (user.otp !== otp) {
      return res.status(200).json({
        error: true,
        success: false,
        message: "Mã OTP không chính xác",
      });
    } else {
      return res.status(200).json({
        error: true,
        success: false,
        message: "Mã OTP đã hết hạn",
      });
    }
  } catch (error) {
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message || error,
    });
  }
};
//login
module.exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await UserAdmin.findOne({
      email: email,

      deleted: false,
    });
    if (!user) {
      return res.status(400).json({
        error: true,
        success: false,
        message: "Tài khoản không hợp lệ!",
      });
    }
    if (user.approved == false) {
      return res.status(400).json({
        error: true,
        success: false,
        message: "Tài khoản đang chờ được phê duyệt!",
      });
    }
    if (user.status !== "Active") {
      return res.status(400).json({
        error: true,
        success: false,
        message: "Tài khoản ngừng hoạt động!",
      });
    }

    const checkPassword = await bcryptjs.compare(password, user.password);
    if (!checkPassword) {
      return res.status(400).json({
        error: true,
        success: false,
        message: "Mật khẩu không chính xác!",
      });
    }
    const accessToken = await generateAccessToken(user._id);
    const refreshToken = await generateRefreshToken(user._id);
    const updateUser = await UserAdmin.findByIdAndUpdate(user?._id, {
      last_login_date: new Date(),
    });
    const cookiesOption = {
      httpOnly: true,
      secure: false, //deloy thì bật lại
      sameSite: "None",
    };
    res.cookie("accessToken", accessToken, cookiesOption);
    res.cookie("refreshToken", refreshToken, cookiesOption);
    return res.status(200).json({
      error: false,
      success: true,
      message: "Đăng nhập thành công",
      data: {
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message || error,
    });
  }
};
//[put] /avatar-user
module.exports.userAvatar = async (req, res) => {
  try {
    const userId = res.locals.userId;

    let user = await UserAdmin.findById(userId);
    if (!user) {
      return res.status(400).json({
        error: true,
        success: false,
        message: "Người dùng không tồn tại",
      });
    }

    // Xóa ảnh cũ nếu có
    if (user.avatar_public_id) {
      await cloudinary.uploader.destroy(user.avatar_public_id);
    }

    // Cập nhật avatar mới
    user.avatar = req.body.avatar;
    user.avatar_public_id = req.body.avatar_public_id;
    await user.save();

    return res.status(200).json({
      _id: user._id,
      avatar: user.avatar,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};
//[put] /update user
module.exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    let {
      name,
      dateOfBirth,
      email,
      mobile,
      password,
      province,
      district,
      ward,
    } = req.body;

    // Tìm user hiện tại
    const existUser = await UserAdmin.findById(userId);
    if (!existUser) {
      return res.status(400).send("Tài khoản không được cập nhật");
    }

    let verifyCode = "";
    let otpExpires = null;
    let emailToUse = email || existUser.email;

    // Nếu email thay đổi, tạo OTP và gửi email
    if (email && email !== existUser.email) {
      verifyCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6 chữ số
      otpExpires = Date.now() + 600000; // 10 phút
      const subject = "Mã OTP xác minh";
      const html = `Mã OTP lấy lại mật khẩu là: <b style="color: green;">${verifyCode}</b>. Thời hạn sử dụng là: ${otpExpires}`;
      await sendMail(email, subject, html);
      emailToUse = email; // sử dụng email mới
    }

    // Hash password nếu có
    let hashPassword = existUser.password;
    if (password) {
      const salt = await bcryptjs.genSalt(10);
      hashPassword = await bcryptjs.hash(password, salt);
    }

    // Cập nhật user
    const updatedUser = await UserAdmin.findByIdAndUpdate(
      userId,
      {
        name: name || existUser.name,
        mobile: mobile || existUser.mobile,
        dateOfBirth: dateOfBirth || existUser.dateOfBirth,
        email: emailToUse,
        province: province || existUser.province,
        district: district || existUser.district,
        ward: ward || existUser.ward,
        verify_email: emailToUse !== existUser.email ? false : true,
        password: hashPassword,
        otp: verifyCode !== "" ? verifyCode : null,
        otpExpires: otpExpires,
      },
      { new: true }
    );

    return res.status(200).json({
      message: "Cập nhật tài khoản thành công",
      error: false,
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message || error,
    });
  }
};
//get login user detail
module.exports.userDetail = async (req, res) => {
  try {
    const userId = res.locals.userId;

    const user = await UserAdmin.findById(userId)
      .select("-password -refresh_token")
      .populate("role");
    return res.status(200).json({
      message: "Chi tiết người dùng",
      error: false,
      data: user,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message || error,
    });
  }
};
//[post]/logout
module.exports.logout = async (req, res) => {
  try {
    const userId = res.locals.userId;

    const cookiesOption = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    };
    res.clearCookie("accessToken", cookiesOption);
    res.clearCookie("refreshToken", cookiesOption);
    const removeRefreshToken = await UserAdmin.findByIdAndUpdate(userId, {
      refresh_token: "",
    });
    return res.status(200).json({
      error: false,
      success: true,
      message: "Đăng xuất thành công",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message || error,
    });
  }
};
//[get] // get account
module.exports.getAccount = async (req, res) => {
  try {
    const account = await UserAdmin.find({ deleted: false, approved: true })
      .select("-password -access-token -otp -refresh-token")
      .populate("role");
    if (!account) {
      return res.json({
        error: true,
        success: false,
      });
    }
    return res.status(200).json({
      error: false,
      success: true,
      data: account,
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message || error,
    });
  }
};
//[get] // get account not approved
module.exports.getNotApproved = async (req, res) => {
  try {
    const account = await UserAdmin.find({
      deleted: false,
      approved: false,
    }).select("-password -access-token -otp -refresh-token");
    if (!account) {
      return res.json({
        error: true,
        success: false,
      });
    }
    return res.status(200).json({
      error: false,
      success: true,
      data: account,
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message || error,
    });
  }
};
//[post] //update approved
module.exports.updateApproved = async (req, res) => {
  try {
    const update = await UserAdmin.findByIdAndUpdate(
      req.params.id,
      { approved: true },
      { new: true }
    );
    return res.status(200).json({
      error: false,
      success: true,
      message: "Đã phê duyệt thành công",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message || error,
    });
  }
};
//[patch] //update role user
module.exports.updateRoleUser = async (req, res) => {
  try {
    const update = await UserAdmin.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    return res.status(200).json({
      error: false,
      success: true,
      message: "Cập nhật quyền thành công thành công",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message || error,
    });
  }
};
//[delete] /delete Account
module.exports.deleteAccount = async (req, res) => {
  try {
    // Tìm đúng tài khoản theo id
    const account = await UserAdmin.findById(req.params.id);

    // Nếu không tìm thấy
    if (!account) {
      return res.status(404).json({
        error: true,
        success: false,
        message: "Không tìm thấy tài khoản",
      });
    }

    // Kiểm tra approved
    if (!account.approved) {
      return res.status(403).json({
        error: true,
        success: false,
        message: "Không thể xóa tài khoản chưa được duyệt",
      });
    }

    // Nếu hợp lệ thì xóa
    await UserAdmin.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      error: false,
      success: true,
      message: "Xóa tài khoản thành công",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message || error,
    });
  }
};
