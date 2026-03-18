const User = require("../../model/user.model");
const bcryptjs = require("bcryptjs");

const jwt = require("jsonwebtoken");
const { sendMail } = require("../../config/sendEmail");
const { generateAccessToken } = require("../../utils/generatAccessToken");
const { generateRefreshToken } = require("../../utils/generateRefreshToken");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
  secure: true,
});
//list user
module.exports.getUser = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 6;

    const userList = await User.find()
      .skip((page - 1) * perPage)
      .limit(perPage);
    const totalUser = await User.countDocuments();
    const totalPage = Math.ceil(totalUser / perPage);
    if (!userList) {
      return res.status(400).json({
        message: "Không có khách hàng nào!",
        error: false,
        success: true,
      });
    }
    return res.status(200).json({
      error: false,
      success: true,
      data: userList,
      page: page,
      totalItem: totalUser,
      totalPage: totalPage,
      perPage: perPage,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};
//register
module.exports.register = async (req, res) => {
  try {
    let user;
    const { name, email, password } = req.body;

    user = await User.findOne({ email: email });
    if (user) {
      return res.status(400).json({
        message: "Tài khoản đã tồn tại",
        error: true,
        success: false,
      });
    }
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    const salt = await bcryptjs.genSalt(10);
    const hashPassword = await bcryptjs.hash(password, salt);
    user = new User({
      name: name,
      email: email,
      password: hashPassword,
      otp: verifyCode,
      otpExpires: Date.now() + 600000,
    });
    user.save();
    //send verification email
    const subject = "Mã OTP xác minh";
    const html = `Mã OTP xác minh là: <b style="color: green;">${user.otp}</b>. Thời hạn sử dụng là:${user.otpExpires}`;
    const verifyEmail = await sendMail(email, subject, html);
    //create a JWT token for vertification purpose
    const token = jwt.sign(
      {
        email: user.email,
        id: user._id,
      },
      process.env.JSON_WEB_TOKEN_SECRET_KEY,
    );
    return res.status(200).json({
      success: true,
      error: false,
      message: "Đăng kí thành công",
      token: token,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};
module.exports.verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email: email });
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
        message: "Xác minh Email thành công",
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
//[post]/login
module.exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(400).json({
        error: true,
        success: false,
        message: "Tài khoản chưa được đăng kí!",
      });
    }
    if (user.status !== "Active") {
      return res.status(400).json({
        error: true,
        success: false,
        message: "Tài khoản ngừng hoạt động!",
      });
    }
    if (user.verify_email !== true) {
      return res.status(400).json({
        error: true,
        success: false,
        message: "Vui lòng xác minh email của bạn!",
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
    const updateUser = await User.findByIdAndUpdate(user?._id, {
      last_login_date: new Date(),
    });
    const cookiesOption = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" ? true : false,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    };

    res.cookie("refreshToken", refreshToken, cookiesOption);
    res.cookie("accessToken", accessToken);
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
//[post]/logout
module.exports.logout = async (req, res) => {
  try {
    const userId = res.locals.userId;

    const cookiesOption = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" ? true : false,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    };

    res.clearCookie("refreshToken", cookiesOption);
    const removeRefreshToken = await User.findByIdAndUpdate(userId, {
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
//image upload
var imagesArr = [];
module.exports.userAvatar = async (req, res) => {
  try {
    const userId = res.locals.userId;
    let user = await User.findById(userId);
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
      error: false,
      success: true,
      message: "Cập nhật ảnh đại diện thành công",
      data: user.avatar,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

//update user detail
module.exports.updateUser = async (req, res) => {
  try {
    const userId = res.locals.userId;
    let { name, email, password, mobile } = req.body; // dùng let để có thể gán lại

    // Tìm user hiện tại
    const existUser = await User.findById(userId);
    if (!existUser) {
      return res.status(400).json({
        message: "Người dùng không tồn tại",
        error: true,
        success: false,
      });
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
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        name: name || existUser.name,
        mobile: mobile || existUser.mobile,
        email: emailToUse,
        verify_email: emailToUse !== existUser.email ? false : true,
        password: hashPassword,
        otp: verifyCode !== "" ? verifyCode : null,
        otpExpires: otpExpires,
      },
      { new: true },
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

//forgotPassword
module.exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(400).json({
        message: "Email không tồn tại",
        success: false,
        error: true,
      });
    }
    let verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    const userId = user._id;
    const updateUser = await User.findByIdAndUpdate(
      userId,
      {
        otp: verifyCode,
        otpExpires: Date.now() + 600000,
      },
      {
        new: true,
      },
    );
    const subject = "Mã OTP xác minh";
    const html = `Mã OTP lấy lại mật khẩu là: <b style="color: green;">${verifyCode}</b>. Thời hạn sử dụng là: ${updateUser.otpExpires}`;
    const verifyEmail = await sendMail(email, subject, html);
    return res.json({
      message: "Kiểm tra email của bạn",
      error: false,
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
//verify forgot-password
module.exports.verifyForgotPassword = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(400).json({
        message: "Email không tồn tại",
        success: false,
        error: true,
      });
    }
    if (otp !== user.otp) {
      return res.status(400).json({
        message: "OTP không hợp lệ",
        success: false,
        error: true,
      });
    }
    const currentTime = Date.now();
    if (user.otpExpires < currentTime) {
      return res.status(400).json({
        message: "OTP đã hết hạn",
        success: false,
        error: true,
      });
    }
    user.otp = "";
    user.otpExpires = "";
    await user.save();
    return res.status(200).json({
      error: false,
      success: true,
      message: "OTP đã được xác minh",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message || error,
    });
  }
};
//reset password
module.exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;

    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(400).json({
        message: "Email không tồn tại!",
        success: false,
        error: true,
      });
    }

    const salt = await bcryptjs.genSalt(10);
    const hashPassword = await bcryptjs.hash(newPassword, salt);
    user.password = hashPassword;
    await user.save();
    return res.status(200).json({
      error: false,
      success: true,
      message: "Đổi mật khẩu thành công!",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message || error,
    });
  }
};
//refresh-token
module.exports.refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        error: true,
        success: false,
        message: "Token không hợp lệ",
      });
    }
    const verifyToken = await jwt.verify(
      refreshToken,
      process.env.SECRET_KEY_REFRESH_TOKEN,
    );
    if (!verifyToken) {
      return res.status(401).json({
        error: true,
        success: false,
        message: "Token đã hết hạn",
      });
    }
    const userId = verifyToken?.id;
    const newAccessToken = await generateAccessToken(userId);

    return res.status(200).json({
      error: false,
      success: true,

      data: {
        accessToken: newAccessToken,
      },
    });
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: "Refresh token hết hạn hoặc không hợp lệ",
    });
  }
};
//get login user detail
module.exports.userDetail = async (req, res) => {
  try {
    const userId = res.locals.userId;

    const user = await User.findById(userId).select("-password -refresh_token");
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
//delete user
module.exports.deleteUser = async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({
        message: "Người dùng không tồn tại",
        error: true,

        success: false,
      });
    }
    return res.status(200).json({
      message: "Xóa thành công",
      error: false,

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
