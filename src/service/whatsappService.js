const axios = require("axios");

const sendWhatsApp = async (to, message) => {
  try {
    await axios.post(
      `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to,
        text: { body: message },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err) {
    console.log("WhatsApp Error:", err.response?.data || err.message);
  }
};

const sendButtons = async (to, bodyText) => {
  try {
    await axios.post(
      `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to,
        type: "interactive",
        interactive: {
          type: "button",
          body: {
            text: bodyText,
          },
          action: {
            buttons: [
              {
                type: "reply",
                reply: {
                  id: "takeaway",
                  title: "Takeaway",
                },
              },
              {
                type: "reply",
                reply: {
                  id: "delivery",
                  title: "Home Delivery",
                },
              },
            ],
          },
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err) {
    console.log("Button Error:", err.response?.data || err.message);
  }
};

const sendMenuButton = async (to, orderType) => {
  try {
    await axios.post(
      `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
          name: "menu_template",
          language: {
            code: "en"
          },
          components: [
            {
              type: "body",
              parameters: [
                {
                  type: "text",
                  text: orderType // 👈 dynamic value
                }
              ]
            }
          ]
        }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );
  } catch (err) {
    console.log("Template Error:", err.response?.data || err.message);
  }
};
const sendCTA = async (to, text, buttonText, urlLink) => {
  try {
    await axios.post(
      `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to,
        type: "interactive",
        interactive: {
          type: "cta_url",
          body: { text },
          action: {
            name: "cta_url",
            parameters: {
              display_text: buttonText,
              url: urlLink
            }
          }
        }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );
  } catch (err) {
    console.log("CTA Error:", err.response?.data || err.message);
  }
};
const sendAddressButtons = async (to, lastAddress = null) => {
  const buttons = [];

  if (lastAddress) {
    buttons.push({
      type: "reply",
      reply: {
        id: "use_last_address",
        title: "Use Last Address"
      }
    });
  }

  buttons.push(
    {
      type: "reply",
      reply: {
        id: "share_location",
        title: "Share Location"
      }
    },
    {
      type: "reply",
      reply: {
        id: "enter_address",
        title: "Enter Address"
      }
    }
  );

  await axios.post(
    `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
    {
      messaging_product: "whatsapp",
      to,
      type: "interactive",
      interactive: {
        type: "button",
        body: {
          text: lastAddress
            ? `Use your last address?\n${lastAddress}`
            : "Please choose how to provide your address:"
        },
        action: { buttons }
      }
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
        "Content-Type": "application/json"
      }
    }
  );
};

const sendImage = async (to, imageUrl, caption = "") => {
  try {
    await axios.post(
      `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to,
        type: "image",
        image: {
          link: imageUrl,
          caption: caption
        }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );
  } catch (err) {
    console.error("Image send error:", err.response?.data || err.message);
  }
};

module.exports = { sendWhatsApp,sendButtons,sendMenuButton,sendCTA,sendAddressButtons,sendImage };

