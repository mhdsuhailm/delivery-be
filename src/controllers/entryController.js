const pool = require("../config/db");

exports.startSession = async (req, res) => {
  try {
    const { branch } = req.query;

    if (!branch) {
      return res.status(400).json({ message: "Branch missing" });
    }

    const result = await pool.query(
      "SELECT * FROM branches WHERE qr_code = $1",
      [branch]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Invalid QR" });
    }

    const branchData = result.rows[0];

    // For now we return JSON (later we connect chatbot)
    res.json({
      message: `Welcome to ${branchData.name} 👋`,
      options: ["Takeaway", "Home Delivery"],
      branch_id: branchData.id,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};