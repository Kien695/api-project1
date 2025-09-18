const User = require("../model/user.model");
const bcryptjs = require("bcryptjs");

const jwt = require("jsonwebtoken");
const { sendMail } = require("../config/sendEmail");
const { generateAccessToken } = require("../utils/generatAccessToken");
const { generateRefreshToken } = require("../utils/generateRefreshToken");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
  secure: true,
});
module.exports.register = async (req, res) => {
  try {
    let user;
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Vui lòng nhập đầy đủ thông tin",
        error: true,
        success: false,
      });
    }
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
    const html = `Mã OTP lấy lại mật khẩu là: <b style="color: green;">${user.otp}</b>. Thời hạn sử dụng là:${user.otpExpires}`;
    const verifyEmail = await sendMail(email, subject, html);
    //create a JWT token for vertification purpose
    const token = jwt.sign(
      {
        email: user.email,
        id: user._id,
      },
      process.env.JSON_WEB_TOKEN_SECRET_KEY
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
    imagesArr = [];
    const userId = res.locals.userId;

    const img = req.files;
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(400).json({
        error: true,
        success: false,
        message: "Người dùng không tồn tại",
      });
    }
    //first remove image
    const imgUrl = user.avatar;
    const urlArr = imgUrl.split("/");
    const avatarImage = urlArr[urlArr.length - 1];
    const imageName = avatarImage.split(".")[0];
    if (imageName) {
      const results = await cloudinary.uploader.destroy(
        imageName,
        (error, result) => {}
      );
    }

    const options = {
      user_fileName: true,
      unique_fileName: false,
      overwrite: false,
    };
    for (let i = 0; i < img?.length; i++) {
      const img = await cloudinary.uploader.upload(
        req.files[i].path,
        options,
        function (error, result) {
          imagesArr.push(result.secure_url);
          fs.unlinkSync(`uploads/${req.files[i].filename}`);
        }
      );
    }
    user.avatar = imagesArr[0];
    await user.save();
    return res.status(200).json({
      _id: userId,
      avatar: imagesArr[0],
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

//removeImageFromCloudinary
module.exports.removeImage = async (req, res) => {
  const imgUrl = req.query.img;
  const urlArr = imgUrl.split("/");
  //https://res.cloudinary.com/dzyi6hnfr/image/upload/v1754130369/vltgswbyxwgx4u5suvdd.png
  // image = ["https","res.cloudinary.com","image","upload","v1754130369","vltgswbyxwgx4u5suvdd.png"];
  const image = urlArr[urlArr.length - 1];
  const imageName = image.split(".")[0];
  if (imageName) {
    const results = await cloudinary.uploader.destroy(
      imageName,
      (error, result) => {}
    );
    if (res) {
      return res.status(200).send(results);
    }
  }
};

//update user detail
module.exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, email, mobile, password } = req.body;
    const exitUser = await User.findById(userId);
    if (!exitUser) {
      return res.status(400).send("Tài khoản không được cập nhật");
    }
    let verifyCode = "";
    if (email !== exitUser.email) {
      verifyCode = Math.floor(100000 * Math.random() * 900000).toString();
    }
    let hashPassword = "";
    if (password) {
      const salt = await bcryptjs.genSalt(10);
      hashPassword = await bcryptjs.hash(password, salt);
    } else {
      hashPassword = exitUser.password;
    }
    const updateUser = await User.findByIdAndUpdate(
      userId,
      {
        name: name,
        mobile: mobile,
        email: email,
        verify_email: email !== exitUser.email ? false : true,
        password: hashPassword,
        otp: verifyCode !== "" ? verifyCode : null,
        otpExpires: verifyCode !== "" ? Date.now() + 600000 : "",
      },
      {
        new: true,
      }
    );

    if (email !== exitUser.email) {
      const subject = "Mã OTP xác minh";
      const html = `Mã OTP lấy lại mật khẩu là: <b style="color: green;">${verifyCode}</b>. Thời hạn sử dụng là: ${updateUser.otpExpires}`;
      const verifyEmail = await sendMail(email, subject, html);
    }

    return res.status(200).json({
      message: "Cập nhật tài khoản thành công",
      error: false,
      success: true,
      user: updateUser,
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
      }
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
    if (!otp || !email) {
      return res.status(400).json({
        message: "Vui lòng nhập đầy đủ",
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
    const currentTime = new Date().toISOString();
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
    if (!email || !newPassword || !confirmPassword) {
      return res.status(400).json({
        message: "Vui lòng nhập đầy đủ",
        success: false,
        error: true,
      });
    }
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(400).json({
        message: "Email không tồn tại!",
        success: false,
        error: true,
      });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "Mật khẩu và xác nhận mật khẩu chưa trung khớp!",
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
    const refreshToken =
      req.cookies.refreshToken || req?.headers?.authorization.split(" ")[1];
    if (!refreshToken) {
      return res.status(401).json({
        error: true,
        success: false,
        message: "Token không hợp lệ",
      });
    }
    const verifyToken = await jwt.verify(
      refreshToken,
      process.env.SECRET_KEY_REFRESH_TOKEN
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
    const cookiesOption = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    };
    res.cookie("accessToken", newAccessToken, cookiesOption);
    return res.status(200).json({
      error: false,
      success: true,
      message: "Token mới đã được tạo!",
      data: {
        accessToken: newAccessToken,
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
