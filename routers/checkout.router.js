const express = require("express");
const router = express.Router();
const controller = require("../controller/client/checkout.controller");
const validate = require("../validates/client/checkout.validate");
const middleware = require("../middleware/auth.middleware");
router.post("/payment", validate.checkout, middleware.auth, controller.payMent);
router.post(
  "/payment-momo",
  validate.checkout,
  middleware.auth,
  controller.paymentMomo,
);
router.get("/result", middleware.auth, controller.resultPayment);
router.post("/result-momo", middleware.auth, controller.resultPaymentMomo);
module.exports = router;
