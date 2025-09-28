const express = require("express");

const router = express.Router();
const middleware = require("../middleware/auth.middleware");
const multer = require("multer");
const upload = multer();
const uploadToCloud = require("../middleware/uploadCloud.midleware");
const controller = require("../controller/userAdmin.controller");
router.post("/register", controller.register);
router.post("/login", controller.login);
router.post("/verifyEmail", controller.verifyEmail);
router.put("/:id", middleware.auth, controller.updateUser);
router.post(
  "/user-avatar",
  middleware.auth,
  upload.single("avatar"),

  uploadToCloud.uploadOne,
  controller.userAvatar
);
router.get("/user-detail", middleware.auth, controller.userDetail);
router.post("/logout", middleware.auth, controller.logout);
module.exports = router;
