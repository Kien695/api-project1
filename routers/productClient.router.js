const express = require("express");
const router = express.Router();
const controller = require("../controller/client/product.controller");
router.get("/", controller.getProduct);
router.get("/all", controller.getAllProduct);
router.get("/:id", controller.detailProduct);
module.exports = router;
