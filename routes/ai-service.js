const express = require("express");
const router = express.Router();
const aiServiceController = require("../controllers/ai-service");

router.post("/summarize", aiServiceController.summarize);

module.exports = router;
