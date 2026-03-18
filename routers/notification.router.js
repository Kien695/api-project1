const express = require("express");
const router = express.Router();
const middleware = require("../middleware/auth.middleware");
const controller = require("../controller/client/notidication.controller");
router.get("/", middleware.auth, controller.getNotifi);
router.get("/unRead", middleware.auth, controller.getUnRead);
router.delete("/delete", middleware.auth, controller.deleteNotifi);
router.patch("/updateRead", middleware.auth, controller.updateIsRead);
module.exports = router;
