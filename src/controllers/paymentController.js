const razorpay = require("../config/razorpay");

exports.createPaymentLink = async (req, res) => {
  try {
    const { amount, phone, orderId } = req.body;

    const paymentLink = await razorpay.paymentLink.create({
      amount: amount * 100,
      currency: "INR",
      description: "Food Order Payment",
      customer: {
        contact: phone,
      },
      notify: {
        sms: true,
        email: false,
      },
      reminder_enable: true,
      notes: {
        order_id: orderId,
      },
    });

    res.json({
      success: true,
      link: paymentLink.short_url,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Payment link error" });
  }
};