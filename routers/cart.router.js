const express = require("express");
const router = express.Router();
const middleware = require("../middleware/auth.middleware");
const controller = require("../controller/admin/cart.controller");
router.post("/add", middleware.auth, controller.addToCart);
router.get("/getItem", middleware.auth, controller.getCartItem);
router.put("/updateCart", middleware.auth, controller.updateQuantityCart);
router.delete("/deleteCart", middleware.auth, controller.deleteCartItem);
module.exports = router;
