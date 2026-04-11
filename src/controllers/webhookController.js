const pool = require("../config/db");
const {sendWhatsApp} = require("../service/whatsappService");
const { sendButtons } = require("../service/whatsappService");
const { sendMenuButton } = require("../service/whatsappService");
const {sendCTA} = require("../service/whatsappService")
const crypto = require("crypto");

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

    if (!value.messages) {
      return res.sendStatus(200);
    }

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

    console.log("Message ID:", messageId);
    console.log("Incoming Type:", message.type);

    // ... rest of your code


    console.log("Incoming Type:", message.type);

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
const phone = message.from;
const name = value.contacts?.[0]?.profile?.name || "Guest";

// upsert user
const userResult = await pool.query(
  `INSERT INTO users (phone_number, display_name)
   VALUES ($1, $2)
   ON CONFLICT (phone_number)
   DO UPDATE SET display_name = EXCLUDED.display_name
   RETURNING *`,
  [phone, name]
);

const user = userResult.rows[0];
    // ✅ HANDLE TEXT
    if (message.type === "text") {
      const userMsg = message.text.body.toLowerCase();

      console.log("User:", userMsg);

      if (userMsg === "hi" || userMsg === "hello") {
        await sendButtons(
          from,
          `Welcome to ${branch.name} 👋\n\nPlease choose an option:`
        );
        return;
      }

      await sendWhatsApp(from, "Type 'hi' to start ordering.");
      return;
    }

    // ✅ HANDLE BUTTON CLICK
    if (message.type === "interactive") {
      const buttonReply = message.interactive.button_reply.id;

      console.log("Button Click:", buttonReply);

      if (buttonReply === "takeaway") {

         // ✅ CREATE SESSION
//   await pool.query(
//     `INSERT INTO sessions (user_phone, branch_id, order_type)
//      VALUES ($1, $2, $3)`,
//     [from, branch.id, "takeaway"]
//   );
// await pool.query(
//   `INSERT INTO sessions (user_id, branch_id, order_type)
//    VALUES ($1, $2, $3)`,
//   [user.id, branch.id, "takeaway"]
// );
const token = crypto.randomBytes(16).toString("hex");

await pool.query(
  `INSERT INTO sessions (user_id, branch_id, order_type, token)
   VALUES ($1, $2, $3, $4)`,
  [user.id, branch.id, "takeaway", token]
);
        // await sendWhatsApp(
        //   from,
        //   "You selected Takeaway 🍽️\nMenu: https://your-link"
        // );
        // await sendMenuButton(from, "Takeaway");
        const baseURL = process.env.FRONTEND_URL;

const menuURL = `${baseURL}/menu/takeaway?token=${token}`
        await sendCTA(
  from,
  "You selected Takeaway 🍽️",
  "View Menu",
  menuURL
);
        return;
      }

      if (buttonReply === "delivery") {

// await pool.query(
//   `INSERT INTO sessions (user_id, branch_id, order_type)
//    VALUES ($1, $2, $3)`,
//   [user.id, branch.id, "delivery"]
// );       

// const baseURL = process.env.FRONTEND_URL;

// const menuURL = `${baseURL}/menu/takeaway?token=${token}`;

// await sendCTA(
//   from,
//   "You selected Takeaway 🍽️",
//   "View Menu",
//   menuURL
// );
const token = crypto.randomBytes(16).toString("hex"); // ✅ CREATE TOKEN

await pool.query(
  `INSERT INTO sessions (user_id, branch_id, order_type, token)
   VALUES ($1, $2, $3, $4)`,
  [user.id, branch.id, "delivery", token]
);

const baseURL = process.env.FRONTEND_URL;

const menuURL = `${baseURL}/menu/delivery?token=${token}`; // ✅ correct route

await sendCTA(
  from,
  "You selected Home Delivery 🚚",
  "View Menu",
  menuURL
);
        return;
      }
    }

  } catch (err) {
    console.error(err);
  }
};