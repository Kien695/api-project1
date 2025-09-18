const express = require("express");
const router = express.Router();
const controller = require("../controller/myList.controller");
const middleware = require("../middleware/auth.middleware");
router.post("/add", middleware.auth, controller.addToMyList);
router.delete("/remove/:id", middleware.auth, controller.deleteMyList);
router.get("/", middleware.auth, controller.getMyList);
module.exports = router;
