const express = require("express");
const router = express.Router();
const controller = require("../controller/client/checkout.controller");
const middleware = require("../middleware/auth.middleware");
router.get("/payment", controller.payMent);
router.get("/result", controller.resultPayment);
module.exports = router;
