const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer();
const controller = require("../controller/blog.controller");
const middleware = require("../middleware/auth.middleware");
const uploadCloud = require("../middleware/uploadCloud.midleware");
router.get("/", controller.getBlog);
router.post(
  "/create",
  upload.single("images"),
  uploadCloud.uploadOne,

  controller.create
);
router.patch(
  "/edit/:id",
  upload.single("images"),
  uploadCloud.uploadOne,

  controller.editBlog
);
router.delete("/deleteBlog/:id", controller.deleteBlog);
router.patch(
  "/change-multi",

  middleware.auth,

  controller.changeMulti
);
module.exports = router;
