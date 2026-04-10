const pool = require("../config/db");

exports.createTenant = async (req, res) => {
  try {
    const { name, tenant_code } = req.body;

    const result = await pool.query(
      "INSERT INTO tenants (name, tenant_code) VALUES ($1, $2) RETURNING *",
      [name, tenant_code]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};