module.exports.register = (req, res, next) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    res.status(400).json({
      message: "Vui lòng nhập đầy đủ thông tin",
      error: true,
      success: false,
    });
  }
  const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  if (!email.text(emailRegex)) {
    return res.status(400).json({
      message: "Email không đúng định dạng",
      error: true,
      success: false,
    });
  }
  const passwordRegex =
    /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[{\]};:'",.<>/?\\|]).{8,}$/;

  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      error: true,
      success: false,
      message:
        "Mật khẩu phải có ít nhất 8 ký tự, gồm 1 chữ hoa, 1 số và 1 ký tự đặc biệt!",
    });
  }
  next();
};
module.exports.verify = (req, res, next) => {
  const { email, otp } = req.body;
  if (!otp || !email) {
    res.status(400).json({
      message: "Vui lòng nhập đầy đủ thông tin",
      error: true,
      success: false,
    });
  }
  next();
};
module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      error: true,
      success: false,
      message: "Vui lòng nhập đầy đủ thông tin",
    });
  }
  next();
};
module.exports.resestPassword = (req, res, next) => {
  const { email, newPassword, confirmPassword } = req.body;
  if (!email || !newPassword || !confirmPassword) {
    return res.status(400).json({
      error: true,
      success: false,
      message: "Vui lòng nhập đầy đủ thông tin",
    });
  }
  if (newPassword !== confirmPassword) {
    return res.status(400).json({
      error: true,
      success: false,
      message: "Mật khẩu mới và xác nhận mật khẩu mới không trùng khớp",
    });
  }
  next();
};
