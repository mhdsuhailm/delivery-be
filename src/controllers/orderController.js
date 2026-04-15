const pool = require("../config/db");
const { sendWhatsApp } = require("../service/whatsappService");
const razorpay = require("../config/razorpay");
const { sendCTA } = require("../service/whatsappService");

exports.createOrder = async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No items provided" });
    }

    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(400).json({ message: "Token missing" });
    }

    // 🔥 GET SESSION + USER
    const sessionResult = await pool.query(
      `SELECT s.*, u.phone_number, u.id as user_id
      FROM sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.token = $1
      ORDER BY s.created_at DESC
      LIMIT 1`,
      [token]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(400).json({ message: "Invalid session" });
    }

    const session = sessionResult.rows[0];

    const userId = session.user_id;
    const phone = session.phone_number; // ✅ FIX

    // 🔥 CREATE ORDER
    const orderResult = await pool.query(
      `INSERT INTO orders (
        order_number,
        branch_id,
        customer_id,
        order_type
      )
      VALUES ($1, $2, $3, $4)
      RETURNING *`,
      [
        "ORD-" + Date.now(),
        session.branch_id,
        userId, // ✅ FIX
        session.order_type
      ]
    );

    const order = orderResult.rows[0];

    let totalAmount = 0;
    let orderSummary = "";

    // 🔥 INSERT ITEMS
    for (let item of items) {
      // const itemData = await pool.query(
      //   `SELECT mi.name, ip.price
      //    FROM item_portions ip
      //    JOIN menu_items mi ON mi.id = ip.menu_item_id
      //    WHERE ip.id = $1`,
      //   [item.portion_id]
      // );

      // if (itemData.rows.length === 0) continue;

      // const menuItem = itemData.rows[0];
      const itemData = await pool.query(
        `SELECT mi.id as menu_item_id, mi.name, ip.price
        FROM item_portions ip
        JOIN menu_items mi ON mi.id = ip.menu_item_id
        WHERE ip.id = $1`,
        [item.portion_id]
      );

      if (itemData.rows.length === 0) {
        console.log("❌ Invalid portion_id:", item.portion_id);
        continue;
      }

      const menuItem = itemData.rows[0];

      const itemTotal = Number(menuItem.price) * Number(item.qty);
      totalAmount += itemTotal;

      orderSummary += `• ${menuItem.name} x${item.qty} = ₹${itemTotal}\n`;

      // await pool.query(
      //   `INSERT INTO order_items (
      //     order_id,
      //     menu_item_id,
      //     item_name,
      //     quantity,
      //     unit_price,
      //     total_price
      //   )
      //   VALUES ($1,$2,$3,$4,$5,$6)`,
      //   [
      //     order.id,
      //     item.item_id,
      //     menuItem.name,
      //     item.qty,
      //     menuItem.price,
      //     itemTotal
      //   ]
      // );
      await pool.query(
        `INSERT INTO order_items (
        order_id,
        menu_item_id,
        item_name,
        portion_type,
        portion_price,
        special_instructions,
        quantity,
        unit_price,
        total_price,
        created_at
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,Now())`,
        [
          order.id,
          // item.item_id,
          menuItem.menu_item_id,
          menuItem.name,
          "regular", // 👈 for now static
          menuItem.price, // 👈 portion price
          item.qty,
          menuItem.price, // 👈 unit price
          itemTotal
        ]
      );
    }

    // 🔥 UPDATE TOTAL
    // await pool.query(
    //   `UPDATE orders SET total_amount = $1 WHERE id = $2`,
    //   [totalAmount, order.id]
    // );
    await pool.query(
      `UPDATE orders
        SET
          subtotal = $1,
          total_amount = $1,
          status = 'confirmed',
          confirmed_at = NOW()
        WHERE id = $2`,
      [totalAmount, order.id]
    );

    // 🔥 WHATSAPP MESSAGE
    await sendWhatsApp(
      phone,
      `🍽️ *Order Confirmed!*

🧾 Order ID: ${order.order_number}

📦 *Items:*
${orderSummary}

💰 *Total:* ₹${totalAmount}

⏳ Your order is being prepared...
Thank you for ordering 🙌`
    );

    // 🔥 CREATE PAYMENT LINK
    // const paymentLink = await razorpay.paymentLink.create({
    //   amount: totalAmount * 100, // paisa
    //   currency: "INR",
    //   description: `Order ${order.order_number}`,

    //   customer: {
    //     contact: phone,
    //   },

    //   notify: {
    //     sms: true,
    //     email: false,
    //   },

    //   reminder_enable: true,

    //   notes: {
    //     order_id: order.id, // 🔥 IMPORTANT
    //   }
    // });

    // PAYMENT LINK
    // await pool.query(
    //   `UPDATE orders
    //   SET metadata = jsonb_set(metadata, '{payment_link}', $1)
    //   WHERE id = $2`,
    //   [JSON.stringify(paymentLink.short_url), order.id]
    // );

// 🔥 SEND WHATSAPP BUTTON
// await sendCTA(
//   phone,
//   `🍽️ *Order Confirmed!*

// 🧾 Order ID: ${order.order_number}

// 📦 *Items:*
// ${orderSummary}

// 💰 *Total:* ₹${totalAmount}

// 👉 Click below to complete payment`,
//   "Pay Now 💳",
//   paymentLink.short_url
// );

    res.json({
      success: true,
      order_id: order.id
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
