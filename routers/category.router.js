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
  upload.single("images"),
  uploadCloud.uploadOne,

  controller.createCategory
);
router.get("/get/count", controller.getCategoryCount);
router.get(
  "/get/count/subCat",

  controller.subGetCategoryCount
);
router.get("/:id", controller.getSingleCategory);

router.delete("/delete/:id", middleware.auth, controller.deleteCategory);
router.put(
  "/update/:id",
  upload.single("images"),
  uploadCloud.uploadOne,
  middleware.auth,

  controller.updateCategory
);
router.put(
  "/updateSub/:id",
  middleware.auth,

  controller.updateSubCategory
);
module.exports = router;
