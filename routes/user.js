const express = require("express");
const router = express.Router();
const userController = require("../controllers/user");
//const { isAuth } = require("../controllers/auth");

router.post("/auth", userController.authenticateUser);

router.post("/signup", userController.createNewUser);

module.exports = router;
