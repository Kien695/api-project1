const User = require("../model/user.model");
const jwt = require("jsonwebtoken");
module.exports.generateRefreshToken = async (userId) => {
  const token = await jwt.sign(
    { id: userId },
    process.env.SECRET_KEY_REFRESH_TOKEN,
    {
      expiresIn: "7d",
    }
  );
  await User.updateOne(
    { _id: userId },
    {
      refresh_token: token,
    }
  );
  return token;
};
