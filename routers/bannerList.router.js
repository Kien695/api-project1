const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer();
const controller = require("../controller/admin/bannerList.controller");
const middleware = require("../middleware/auth.middleware");
const uploadCloud = require("../middleware/uploadCloud.midleware");
router.get("/", controller.getBanner);
router.post(
  "/create",
  upload.single("images"),
  uploadCloud.uploadOne,

  controller.create
);
router.put(
  "/edit/:id",
  upload.single("images"),
  uploadCloud.uploadOne,

  controller.edit
);
router.delete("/delete/:id", controller.delete);
router.post("/delete-all", controller.deleteAll);
module.exports = router;
