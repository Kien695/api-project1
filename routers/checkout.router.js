const express = require("express");
const router = express.Router();
const controller = require("../controller/client/checkout.controller");
const validate = require("../validates/client/checkout.validate");
const middleware = require("../middleware/auth.middleware");
router.get("/payment", middleware.auth, validate.checkout, controller.payMent);
router.get("/result", middleware.auth, controller.resultPayment);
module.exports = router;
