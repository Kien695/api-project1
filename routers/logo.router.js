const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer();
const controller = require("../controller/admin/logo.controller");
const middleware = require("../middleware/auth.middleware");
const uploadCloud = require("../middleware/uploadCloud.midleware");
router.get("/", controller.getLogo);
router.post(
  "/add",
  upload.single("images"),
  uploadCloud.uploadOne,
  controller.add
);
module.exports = router;
