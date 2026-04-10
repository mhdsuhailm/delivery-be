// const pool = require("../config/db");
// const { sendWhatsApp } = require("../service/whatsappService");

// exports.createOrder = async (req, res) => {
//   try {
//     const { phone, items } = req.body;

//     // 🔍 Step 1: Get user
//     const userResult = await pool.query(
//       "SELECT * FROM users WHERE phone_number = $1",
//       [phone]
//     );

//     if (userResult.rows.length === 0) {
//       return res.status(400).json({ message: "User not found" });
//     }

//     const user = userResult.rows[0];

//     // 🔍 Step 2: Get latest session
//     const sessionResult = await pool.query(
//       `SELECT * FROM sessions 
//        WHERE user_id = $1 
//        ORDER BY created_at DESC 
//        LIMIT 1`,
//       [user.id]
//     );

//     if (sessionResult.rows.length === 0) {
//       return res.status(400).json({ message: "No active session" });
//     }

//     const session = sessionResult.rows[0];

//     // 🔥 Step 3: Create Order
//     const orderResult = await pool.query(
//       `INSERT INTO orders (
//         order_number,
//         branch_id,
//         customer_id,
//         order_type
//       )
//       VALUES ($1, $2, $3, $4)
//       RETURNING *`,
//       [
//         "ORD-" + Date.now(),
//         session.branch_id,
//         user.id,
//         session.order_type
//       ]
//     );

//     const order = orderResult.rows[0];

//     let totalAmount = 0;

//     // 🔥 Step 4: Insert Order Items
//     for (let item of items) {
//       // get item details
//       const itemData = await pool.query(
//         "SELECT * FROM menu_items WHERE id = $1",
//         [item.id]
//       );

//       const menuItem = itemData.rows[0];

//       const itemTotal = menuItem.price * item.qty;
//       totalAmount += itemTotal;

//       await pool.query(
//         `INSERT INTO order_items (
//           order_id,
//           menu_item_id,
//           item_name,
//           quantity,
//           unit_price,
//           total_price
//         )
//         VALUES ($1, $2, $3, $4, $5, $6)`,
//         [
//           order.id,
//           menuItem.id,
//           menuItem.name,
//           item.qty,
//           menuItem.price,
//           itemTotal
//         ]
//       );
//     }

//     // 🔥 Step 5: Update Order Total
//     await pool.query(
//       `UPDATE orders 
//        SET total_amount = $1 
//        WHERE id = $2`,
//       [totalAmount, order.id]
//     );

//     // 📤 Step 6: Send WhatsApp Confirmation
//     await sendWhatsApp(
//       phone,
//       `✅ Order Placed!\n\nOrder ID: ${order.order_number}\nTotal: ₹${totalAmount}`
//     );

//     res.json({
//       success: true,
//       order_id: order.id
//     });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Server error" });
//   }
// };
const pool = require("../config/db");
const { sendWhatsApp } = require("../service/whatsappService");

exports.createOrder = async (req, res) => {
  try {
    const { phone, items } = req.body;

    // 🔍 1. GET USER
    const userResult = await pool.query(
      "SELECT * FROM users WHERE phone_number = $1",
      [phone]
    );

    if (userResult.rows.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const user = userResult.rows[0];

    // 🔍 2. GET SESSION
    const sessionResult = await pool.query(
      `SELECT * FROM sessions 
       WHERE user_id = $1 AND status = 'active'
       ORDER BY created_at DESC LIMIT 1`,
      [user.id]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(400).json({ message: "No active session" });
    }

    const session = sessionResult.rows[0];

    // 🔥 3. CREATE ORDER
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
        user.id,
        session.order_type
      ]
    );

    const order = orderResult.rows[0];

    let totalAmount = 0;
    let orderSummary = "";

    // 🔥 4. INSERT ORDER ITEMS
    for (let item of items) {

      const itemData = await pool.query(
        `SELECT mi.name, ip.price
         FROM item_portions ip
         JOIN menu_items mi ON mi.id = ip.menu_item_id
         WHERE ip.id = $1`,
        [item.portion_id]
      );

      if (itemData.rows.length === 0) continue;

      const menuItem = itemData.rows[0];

      const itemTotal = menuItem.price * item.qty;
      totalAmount += itemTotal;

      orderSummary += `• ${menuItem.name} x${item.qty} = ₹${itemTotal}\n`;

      await pool.query(
        `INSERT INTO order_items (
          order_id,
          menu_item_id,
          item_name,
          quantity,
          unit_price,
          total_price
        )
        VALUES ($1,$2,$3,$4,$5,$6)`,
        [
          order.id,
          item.item_id,
          menuItem.name,
          item.qty,
          menuItem.price,
          itemTotal
        ]
      );
    }

    // 🔥 5. UPDATE TOTAL
    await pool.query(
      `UPDATE orders SET total_amount = $1 WHERE id = $2`,
      [totalAmount, order.id]
    );

    // 📤 6. WHATSAPP MESSAGE
    await sendWhatsApp(
      phone,
      `✅ *Order Confirmed!*\n\n${orderSummary}\n💰 Total: ₹${totalAmount}`
    );

    res.json({
      success: true,
      order_id: order.id
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};