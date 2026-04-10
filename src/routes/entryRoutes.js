const express = require("express");
const router = express.Router();
const { startSession } = require("../controllers/entryController");

router.get("/start", startSession);

module.exports = router;