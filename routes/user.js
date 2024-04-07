const express = require("express");
const router = express.Router();
const userController = require("../controllers/user");

router.post("/auth", userController.authenticateUser);

router.post("/signup", userController.createNewUser);

module.exports = router;
