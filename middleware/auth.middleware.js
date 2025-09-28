const jwt = require("jsonwebtoken");
module.exports.auth = async (req, res, next) => {
  try {
    var token =
      req.cookies.accessToken || req?.headers?.authorization?.split(" ")[1];

    if (!token) {
      token = req.query.token;
    }

    const decode = await jwt.verify(token, process.env.SECRET_KEY_ACCESS_TOKEN);
    if (!decode) {
      return res.status(401).json({
        error: true,
        success: false,
        message: "unauthorized success",
      });
    }

    res.locals.userId = decode.id;
    next();
  } catch (error) {
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message || error,
    });
  }
};
