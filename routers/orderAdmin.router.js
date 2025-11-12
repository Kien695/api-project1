const express = require("express");
const router = express.Router();
const controller = require("../controller/admin/order.controller");
const middleware = require("../middleware/auth.middleware");

router.get("/", middleware.auth, controller.getOrder);
router.post("/changeStatus", middleware.auth, controller.updateStatus);
router.delete("/deleteOrder", middleware.auth, controller.deleteOrder);
module.exports = router;
