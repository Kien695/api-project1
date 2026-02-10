const express = require("express");

const router = express.Router();
const middleware = require("../middleware/auth.middleware");
const multer = require("multer");
const upload = multer();
const uploadToCloud = require("../middleware/uploadCloud.midleware");
const controller = require("../controller/admin/userAdmin.controller");
const validate = require("../validates/admin/auth.validate");
router.post("/register", validate.register, controller.register);
router.post("/login", validate.login, controller.login);
router.post("/verifyEmail", validate.verify, controller.verifyEmail);
router.put("/updateInfo", middleware.auth, controller.updateUser);
router.post(
  "/user-avatar",
  middleware.auth,
  upload.single("avatar"),

  uploadToCloud.uploadOne,
  controller.userAvatar,
);
router.get("/", middleware.auth, controller.getAccount);
router.get("/notApproved", middleware.auth, controller.getNotApproved);
router.post("/notApproved/:id", middleware.auth, controller.updateApproved);
router.patch("/updateRole/:id", middleware.auth, controller.updateRoleUser);
router.delete("/deleteAccount/:id", middleware.auth, controller.deleteAccount);
router.get("/user-detail", middleware.auth, controller.userDetail);
router.post("/logout", middleware.auth, controller.logout);
module.exports = router;
