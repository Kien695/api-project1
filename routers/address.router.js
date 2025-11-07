const express = require("express");
const router = express.Router();
const controller = require("../controller/client/address.controller");
const middleware = require("../middleware/auth.middleware");
router.patch("/add/", middleware.auth, controller.putAddress);
router.get("/", middleware.auth, controller.getAddress);
module.exports = router;
