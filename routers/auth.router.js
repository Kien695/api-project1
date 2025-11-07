const express = require("express");
const passport = require("passport");
const router = express.Router();
const jwt = require("jsonwebtoken");
const middleware = require("../middleware/auth.middleware");
require("../config/passport.js");

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false,
  }),
  (req, res) => {
    try {
      const token = jwt.sign(
        { id: req.user._id },
        process.env.SECRET_KEY_ACCESS_TOKEN,
        { expiresIn: "7d" }
      );
      res.redirect(`${process.env.CLIENT_URL}/auth-success?token=${token}`);
    } catch (error) {
      console.log("Google OAuth Error:", error);
      res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`);
    }
  }
);

router.get("/me", middleware.auth, (req, res) => {
  res.json({ success: true, user: req.user });
});
module.exports = router;
