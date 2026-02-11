const express = require("express");
const router = express.Router();
const controller = require("../controller/client/order.controller");
const middleware = require("../middleware/auth.middleware");
const validate = require("../validates/client/checkout.validate");
router.post("/add", middleware.auth, validate.checkout, controller.order);
router.get("/", middleware.auth, controller.getOrder);
router.patch("/updateStatus", middleware.auth, controller.updateStatus);
module.exports = router;
