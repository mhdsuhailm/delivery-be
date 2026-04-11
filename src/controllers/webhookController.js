// const pool = require("../config/db");
// const {sendWhatsApp} = require("../service/whatsappService");
// const { sendButtons } = require("../service/whatsappService");
// const { sendMenuButton } = require("../service/whatsappService");
// const {sendCTA} = require("../service/whatsappService")
// const crypto = require("crypto");
// const {sendAddressButtons} = require("../service/whatsappService")

// exports.webhookVerify = (req, res) => {
//   const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
//   const mode = req.query["hub.mode"];
//   const token = req.query["hub.verify_token"];
//   const challenge = req.query["hub.challenge"];

//   if (mode && token === VERIFY_TOKEN) {
//     res.status(200).send(challenge);
//   } else {
//     res.sendStatus(403);
//   }
// };



// const processedMessages = new Set();

// exports.webhookHandler = async (req, res) => {
//   try {
//     const entry = req.body.entry?.[0];
//     const changes = entry?.changes?.[0];
//     const value = changes?.value;

//     if (!value.messages) {
//       return res.sendStatus(200);
//     }

//     res.sendStatus(200);

//     const message = value.messages[0];
//     const messageId = message.id;

//     // ✅ DUPLICATE FILTER
//     if (processedMessages.has(messageId)) {
//       console.log("Duplicate ignored:", messageId);
//       return;
//     }

//     processedMessages.add(messageId);

//     const from = message.from;
//     const phoneNumberId = value.metadata?.phone_number_id;

//     console.log("Message ID:", messageId);
//     console.log("Incoming Type:", message.type);

//     // ... rest of your code


//     console.log("Incoming Type:", message.type);

//     // 🔍 FIND BRANCH
//     const branchResult = await pool.query(
//       "SELECT * FROM branches WHERE whatsapp_phone_number_id = $1",
//       [phoneNumberId]
//     );

//     if (branchResult.rows.length === 0) {
//       await sendWhatsApp(from, "Service not configured ❌");
//       return;
//     }

//     const branch = branchResult.rows[0];
// const phone = message.from;
// const name = value.contacts?.[0]?.profile?.name || "Guest";

// // upsert user
// const userResult = await pool.query(
//   `INSERT INTO users (phone_number, display_name)
//    VALUES ($1, $2)
//    ON CONFLICT (phone_number)
//    DO UPDATE SET display_name = EXCLUDED.display_name
//    RETURNING *`,
//   [phone, name]
// );

// const user = userResult.rows[0];
//     // ✅ HANDLE TEXT
//     if (message.type === "text") {
//       const userMsg = message.text.body.toLowerCase();

//       console.log("User:", userMsg);

//       if (userMsg === "hi" || userMsg === "hello") {
//         await sendButtons(
//           from,
//           `Welcome to ${branch.name} 👋\n\nPlease choose an option:`
//         );
//         return;
//       }

//       await sendWhatsApp(from, "Type 'hi' to start ordering.");
//       return;
//     }

//     // ✅ HANDLE BUTTON CLICK
//     if (message.type === "interactive") {
//       const buttonReply = message.interactive.button_reply.id;

//       console.log("Button Click:", buttonReply);

//       if (buttonReply === "takeaway") {

//          // ✅ CREATE SESSION
// //   await pool.query(
// //     `INSERT INTO sessions (user_phone, branch_id, order_type)
// //      VALUES ($1, $2, $3)`,
// //     [from, branch.id, "takeaway"]
// //   );
// // await pool.query(
// //   `INSERT INTO sessions (user_id, branch_id, order_type)
// //    VALUES ($1, $2, $3)`,
// //   [user.id, branch.id, "takeaway"]
// // );
// const token = crypto.randomBytes(16).toString("hex");

// await pool.query(
//   `INSERT INTO sessions (user_id, branch_id, order_type, token)
//    VALUES ($1, $2, $3, $4)`,
//   [user.id, branch.id, "takeaway", token]
// );
//         // await sendWhatsApp(
//         //   from,
//         //   "You selected Takeaway 🍽️\nMenu: https://your-link"
//         // );
//         // await sendMenuButton(from, "Takeaway");
//         const baseURL = process.env.FRONTEND_URL;

// const menuURL = `${baseURL}/menu/takeaway?token=${token}`
//         await sendCTA(
//   from,
//   "You selected Takeaway 🍽️",
//   "View Menu",
//   menuURL
// );
//         return;
//       }

//       if (buttonReply === "delivery") {


// // const token = crypto.randomBytes(16).toString("hex"); // ✅ CREATE TOKEN

// // await pool.query(
// //   `INSERT INTO sessions (user_id, branch_id, order_type, token)
// //    VALUES ($1, $2, $3, $4)`,
// //   [user.id, branch.id, "delivery", token]
// // );

// // const baseURL = process.env.FRONTEND_URL;

// // const menuURL = `${baseURL}/menu/delivery?token=${token}`; // ✅ correct route

// // await sendCTA(
// //   from,
// //   "You selected Home Delivery 🚚",
// //   "View Menu",
// //   menuURL
// // );
// //         return;
// // 🔍 CHECK IF USER HAS ADDRESS
// const addressResult = await pool.query(
//   `SELECT * FROM delivery_addresses 
//    WHERE user_id = $1 
//    ORDER BY created_at DESC 
//    LIMIT 1`,
//   [user.id]
// );

// const token = crypto.randomBytes(16).toString("hex");

// await pool.query(
//   `INSERT INTO sessions (user_id, branch_id, order_type, token, step)
//    VALUES ($1, $2, $3, $4, $5)`,
//   [user.id, branch.id, "delivery", token, "WAITING_FOR_ADDRESS"]
// );

// if (addressResult.rows.length === 0) {
//   // 🆕 NEW USER
//   await sendAddressButtons(from);
// } else {
//   // 👤 EXISTING USER
//   const lastAddress = addressResult.rows[0].address;

//   await sendAddressButtons(from, lastAddress);
// }
// if (buttonReply === "use_last_address") {
//   await sendMenuCTA(from, token);
//   return;
// }

// if (buttonReply === "share_location") {
//   await sendWhatsApp(from, "Please share your location 📍");
//   return;
// }

// if (buttonReply === "enter_address") {
//   await sendWhatsApp(from, "Please type your full address ✍️");
//   return;
// }
//       }
//       if (buttonReply === "use_last_address") {
//   await sendMenuCTA(from, token);
//   return;
// }

// if (buttonReply === "share_location") {
//   await sendWhatsApp(from, "Please share your location 📍");
//   return;
// }

// if (buttonReply === "enter_address") {
//   await sendWhatsApp(from, "Please type your full address ✍️");
//   return;
// }
// if (message.type === "text") {
//   const text = message.text.body;

//   if (session.step === "WAITING_FOR_ADDRESS") {
//     await pool.query(
//       `INSERT INTO delivery_addresses (user_id, address, is_default)
//        VALUES ($1,$2,true)`,
//       [user.id, text]
//     );

//     await sendMenuCTA(from, token);
//     return;
//   }
// }
//     }

//   } catch (err) {
//     console.error(err);
//   }
// };
const pool = require("../config/db");
const {
  sendWhatsApp,
  sendButtons,
  sendCTA,
  sendAddressButtons
} = require("../service/whatsappService");

const crypto = require("crypto");

// ✅ GET SESSION
const getSession = async (userId) => {
  const result = await pool.query(
    `SELECT * FROM sessions 
     WHERE user_id = $1 
     ORDER BY created_at DESC 
     LIMIT 1`,
    [userId]
  );
  return result.rows[0];
};

// ✅ SEND MENU CTA
const sendMenuCTA = async (to, token, type = "delivery") => {
  const baseURL = process.env.FRONTEND_URL;
  const menuURL = `${baseURL}/menu/${type}?token=${token}`;

  await sendCTA(
    to,
    "Click below to view menu 🍽️",
    "View Menu",
    menuURL
  );
};

exports.webhookVerify = (req, res) => {
  const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token === VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
};

const processedMessages = new Set();

exports.webhookHandler = async (req, res) => {
  try {
    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;

    if (!value.messages) return res.sendStatus(200);

    res.sendStatus(200);

    const message = value.messages[0];
    const messageId = message.id;

    // ✅ DUPLICATE FILTER
    if (processedMessages.has(messageId)) {
      console.log("Duplicate ignored:", messageId);
      return;
    }
    processedMessages.add(messageId);

    const from = message.from;
    const phoneNumberId = value.metadata?.phone_number_id;

    // 🔍 FIND BRANCH
    const branchResult = await pool.query(
      "SELECT * FROM branches WHERE whatsapp_phone_number_id = $1",
      [phoneNumberId]
    );

    if (branchResult.rows.length === 0) {
      await sendWhatsApp(from, "Service not configured ❌");
      return;
    }

    const branch = branchResult.rows[0];

    // ✅ UPSERT USER
    const phone = message.from;
    const name = value.contacts?.[0]?.profile?.name || "Guest";

    const userResult = await pool.query(
      `INSERT INTO users (phone_number, display_name)
       VALUES ($1, $2)
       ON CONFLICT (phone_number)
       DO UPDATE SET display_name = EXCLUDED.display_name
       RETURNING *`,
      [phone, name]
    );

    const user = userResult.rows[0];

    // =========================
    // ✅ TEXT HANDLER
    // =========================
    if (message.type === "text") {
      const userMsg = message.text.body.toLowerCase();

      // 🔹 GREETING
      if (userMsg === "hi" || userMsg === "hello") {
        await sendButtons(
          from,
          `Welcome to ${branch.name} 👋\n\nPlease choose an option:`
        );
        return;
      }

      // 🔹 ADDRESS INPUT
      const session = await getSession(user.id);

      if (session?.step === "WAITING_FOR_ADDRESS") {
        // remove old default
        await pool.query(
          `UPDATE delivery_addresses 
           SET is_default = false 
           WHERE user_id = $1`,
          [user.id]
        );

        // insert new address
        await pool.query(
          `INSERT INTO delivery_addresses (user_id, address, is_default)
           VALUES ($1,$2,true)`,
          [user.id, message.text.body]
        );

        await sendMenuCTA(from, session.token);
        return;
      }

      await sendWhatsApp(from, "Type 'hi' to start ordering.");
      return;
    }

    // =========================
    // ✅ LOCATION HANDLER
    // =========================
    if (message.type === "location") {
      const session = await getSession(user.id);

      if (session?.step === "WAITING_FOR_ADDRESS") {
        await pool.query(
          `UPDATE delivery_addresses 
           SET is_default = false 
           WHERE user_id = $1`,
          [user.id]
        );

        await pool.query(
          `INSERT INTO delivery_addresses (user_id, latitude, longitude, is_default)
           VALUES ($1,$2,$3,true)`,
          [
            user.id,
            message.location.latitude,
            message.location.longitude
          ]
        );

        await sendMenuCTA(from, session.token);
        return;
      }
    }

    // =========================
    // ✅ BUTTON HANDLER
    // =========================
    if (message.type === "interactive") {
      const buttonReply = message.interactive.button_reply.id;

      console.log("Button Click:", buttonReply);

      // 🔹 TAKEAWAY
      if (buttonReply === "takeaway") {
        const token = crypto.randomBytes(16).toString("hex");

        await pool.query(
          `INSERT INTO sessions (user_id, branch_id, order_type, token)
           VALUES ($1, $2, $3, $4)`,
          [user.id, branch.id, "takeaway", token]
        );

        await sendMenuCTA(from, token, "takeaway");
        return;
      }

      // 🔹 DELIVERY (MAIN LOGIC)
      if (buttonReply === "delivery") {
        const addressResult = await pool.query(
          `SELECT * FROM delivery_addresses 
           WHERE user_id = $1 
           ORDER BY created_at DESC 
           LIMIT 1`,
          [user.id]
        );

        const token = crypto.randomBytes(16).toString("hex");

        await pool.query(
          `INSERT INTO sessions (user_id, branch_id, order_type, token, step)
           VALUES ($1, $2, $3, $4, $5)`,
          [user.id, branch.id, "delivery", token, "WAITING_FOR_ADDRESS"]
        );

        if (addressResult.rows.length === 0) {
          await sendAddressButtons(from);
        } else {
          await sendAddressButtons(from, addressResult.rows[0].address);
        }

        return;
      }

      // 🔹 USE LAST ADDRESS
      if (buttonReply === "use_last_address") {
        const session = await getSession(user.id);
        await sendMenuCTA(from, session.token);
        return;
      }

      // 🔹 SHARE LOCATION
      if (buttonReply === "share_location") {
        await sendWhatsApp(from, "Please share your location 📍");
        return;
      }

      // 🔹 ENTER ADDRESS
      if (buttonReply === "enter_address") {
        await sendWhatsApp(from, "Please type your full address ✍️");
        return;
      }
    }

  } catch (err) {
    console.error("WEBHOOK ERROR:", err);
  }
};