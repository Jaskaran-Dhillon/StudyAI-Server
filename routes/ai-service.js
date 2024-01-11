const express = require("express");
const router = express.Router();
const aiServiceController = require("../controllers/ai-service");
const { isAuth } = require("../controllers/auth");

router.post("/summarize", aiServiceController.summarize);

module.exports = router;
