const express = require("express");
const router = express.Router();

const controller = require("../controller/admin/role.controller");
const middleware = require("../middleware/auth.middleware");

router.get("/", controller.getRole);
router.post("/create", controller.create);
router.patch("/edit/:id", controller.edit);
router.delete("/deleted/:id", controller.delete);
router.patch("/permissions", controller.permission);
module.exports = router;
