require("dotenv").config();
const express = require("express");
const cors = require("cors");
require("./config/db");
const webhookRoutes = require("./routes/webhookRoutes");


const app = express();
const tenantRoutes = require("./routes/tenantRoutes");
const entryRoutes = require("./routes/entryRoutes");
const orderRoutes = require("./routes/orderRoutes");
const menuRoutes = require("./routes/menuRoutes");

app.use(cors());
app.use(express.json());
app.use("/", webhookRoutes);

app.use("/api/tenant", tenantRoutes);
app.use("/", entryRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/menu", menuRoutes);

app.get("/", (req, res) => {
  res.send("API Running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});