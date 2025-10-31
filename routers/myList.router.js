const express = require("express");
const router = express.Router();
const controller = require("../controller/client/myList.controller");
const middleware = require("../middleware/auth.middleware");
router.post("/add/:id", middleware.auth, controller.addToMyList);
router.delete("/remove/:id", middleware.auth, controller.deleteMyList);
router.delete("/removeAll", middleware.auth, controller.deleteAllMyList);
router.get("/", middleware.auth, controller.getMyList);
module.exports = router;
