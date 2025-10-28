const express = require("express");
const router = express.Router();
const multer = require("multer");
const controller = require("../controller/admin/product.controller");
const middleware = require("../middleware/auth.middleware");
const upload = multer();
const uploadToCloud = require("../middleware/uploadCloud.midleware");

router.get("/", controller.getProduct);

router.get("/trash", controller.getTrash);

router.patch("/deleteProduct/:id", middleware.auth, controller.deleteProduct);
router.delete("/trashDelete/:id", controller.deleteProductTrash);
router.patch("/restore/:id", controller.restoreProduct);
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
router.patch(
  "/change-multi",

  middleware.auth,

  controller.changeMulti
);
module.exports = router;
