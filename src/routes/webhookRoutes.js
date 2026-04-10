const express = require("express");
const router = express.Router();
const { webhookVerify, webhookHandler } = require("../controllers/webhookController");

router.get("/webhook", webhookVerify);
router.post("/webhook", webhookHandler);

module.exports = router;