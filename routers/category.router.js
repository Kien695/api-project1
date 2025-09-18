const express = require("express");
const router = express.Router();
const multer = require("multer");
const controller = require("../controller/category.controller");
const middleware = require("../middleware/auth.middleware");
const uploadCloud = require("../middleware/uploadCloud.midleware");
const upload = multer();
router.get("/", controller.getCategory);
router.post(
  "/create",
  upload.array("images", 5),
  uploadCloud.upload,

  controller.createCategory
);
router.get("/get/count", middleware.auth, controller.getCategoryCount);
router.get(
  "/get/count/subCat",

  controller.subGetCategoryCount
);
router.get("/:id", controller.getSingleCategory);
router.delete("/deleteImage", middleware.auth, controller.removeImage);
router.delete("/delete/:id", middleware.auth, controller.deleteCategory);
router.put(
  "/update/:id",
  upload.array("images", 5),
  uploadCloud.upload,
  middleware.auth,

  controller.updateCategory
);
module.exports = router;
