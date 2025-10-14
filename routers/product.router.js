const express = require("express");
const router = express.Router();
const multer = require("multer");
const controller = require("../controller/product.controller");
const middleware = require("../middleware/auth.middleware");
const upload = multer();
const uploadToCloud = require("../middleware/uploadCloud.midleware");

router.get("/", controller.getProduct);
router.get("/getProductByCategory/:id", controller.getProductByCategoryId);
router.get("/getProductByCategory/", controller.getProductByCategoryName);
router.get("/getProductBySubCategory/", controller.getProductBySubCategoryName);
router.get(
  "/getProductBySubCategory/:id",
  controller.getProductBySubCategoryId
);
router.get(
  "/getProductByThirdSubCategory/",
  controller.getProductByThirdSubCategoryName
);
router.get(
  "/getProductByThirdSubCategory/:id",
  controller.getProductByThirdSubCategoryId
);
router.get("/getProductByPrice", controller.getProductByPrice);
router.get("/getProductByRating", controller.getProductByRating);
router.get("/getProductCount", controller.productCount);
router.get("/getProductFeatured", controller.getProductByFeatured);
router.delete("/deleteProduct/:id", controller.deleteProduct);
router.get("/:id", controller.getSingleProduct);
router.post(
  "/create",
  upload.array("images", 5),
  uploadToCloud.upload,
  controller.createProduct
);
router.patch(
  "/update/:id",
  upload.array("images", 5),
  uploadToCloud.upload,
  middleware.auth,

  controller.updateProduct
);
module.exports = router;
