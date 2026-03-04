const jwt = require("jsonwebtoken");
module.exports.generateAccessToken = async (userId) => {
  const token = jwt.sign({ id: userId }, process.env.SECRET_KEY_ACCESS_TOKEN, {
    expiresIn: "5s",
  });
  return token;
};
