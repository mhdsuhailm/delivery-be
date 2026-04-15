const express = require("express");
const router = express.Router();
const { razorpayWebhook } = require("../controllers/PaymentWebhook");

// ⚠️ RAW BODY REQUIRED
router.post("/webhook", express.json(), razorpayWebhook);

module.exports = router;