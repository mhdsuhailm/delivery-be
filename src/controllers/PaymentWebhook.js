const crypto = require("crypto");
const pool = require("../config/db");

exports.razorpayWebhook = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    const shasum = crypto.createHmac("sha256", secret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");

    const signature = req.headers["x-razorpay-signature"];

    if (digest !== signature) {
      return res.status(400).send("Invalid signature");
    }

    const event = req.body.event;

    // ✅ PAYMENT SUCCESS
    if (event === "payment_link.paid") {
      const payment = req.body.payload.payment_link.entity;

      const orderId = payment.notes.order_id;

      await pool.query(
        `UPDATE orders 
         SET payment_status = 'paid', status = 'confirmed'
         WHERE id = $1`,
        [orderId]
      );

      console.log("✅ Payment success for order:", orderId);
    }

    res.json({ status: "ok" });

  } catch (err) {
    console.error(err);
    res.status(500).send("Webhook error");
  }
};