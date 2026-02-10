const jwt = require("jsonwebtoken");
module.exports.auth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Thiếu access token" });
  }
  const accessToken = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(
      accessToken,
      process.env.SECRET_KEY_ACCESS_TOKEN,
    );
    res.locals.userId = decoded.id;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        code: "ACCESS_TOKEN_EXPIRED",
        message: "Access token hết hạn",
      });
    }
    return res.status(403).json({ message: "Access token không hợp lệ" });
  }
};
