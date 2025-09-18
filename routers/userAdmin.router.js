const express = require("express");
const router = express.Router();
const controller = require("../controller/userAdmin.controller");
router.post("/register", controller.create);
module.exports = router;
