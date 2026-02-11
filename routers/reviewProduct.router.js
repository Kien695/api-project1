const express = require("express");
const router = express.Router();
const controller = require("../controller/client/reviewProduct.controller");
const middleware = require("../middleware/auth.middleware");
router.get("/product/:productId", controller.getReviewProduct);
router.post("/review-product", middleware.auth, controller.createReviewProduct);
module.exports = router;
