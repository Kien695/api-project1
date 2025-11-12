const express = require("express");
const router = express.Router();
const controller = require("../controller/client/order.controller");
const middleware = require("../middleware/auth.middleware");
router.post("/add", middleware.auth, controller.order);
router.get("/", middleware.auth, controller.getOrder);
router.patch("/updateStatus", middleware.auth, controller.updateStatus);
module.exports = router;
