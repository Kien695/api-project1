const express = require("express");
const router = express.Router();
const middleware = require("../middleware/auth.middleware");
const controller = require("../controller/user.controller");
// const upload = require("../middleware/multer");
const multer = require("multer");
const upload = multer();
const uploadToCloud = require("../middleware/uploadCloud.midleware");
router.post("/register", controller.register);
router.post("/verifyEmail", controller.verifyEmail);
router.post("/login", controller.login);
router.post("/logout", middleware.auth, controller.logout);
router.put(
  "/user-avatar",
  middleware.auth,
  upload.single("avatar"),
  uploadToCloud.uploadOne,
  controller.userAvatar
);
router.delete("/deleteImage", middleware.auth, controller.removeImage);
router.put("/:id", middleware.auth, controller.updateUser);
router.post("/forgot-password", controller.forgotPassword);
router.post("/verify-password", controller.verifyForgotPassword);
router.post("/reset-password", controller.resetPassword);
router.post("/refresh-token", controller.refreshToken);
router.get("/user-detail", middleware.auth, controller.userDetail);
module.exports = router;
