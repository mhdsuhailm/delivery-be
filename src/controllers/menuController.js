const pool = require("../config/db");

exports.getMenu = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        mi.id,
        mi.name,
        mi.description,
        
         mi.available_in,
  mi.chef_note,
  mi.ingredients,
  mi.rating,
  mi.is_bestseller,
        mi.image_urls,
        mc.name AS category,
        ip.price
      FROM menu_items mi
      JOIN menu_categories mc ON mi.category_id = mc.id
      JOIN item_portions ip ON ip.menu_item_id = mi.id
      WHERE ip.is_default = true
      ORDER BY mc.name
    `);

    res.json({
      items: result.rows
    });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Server error" });
//   }
}catch (err) {
  console.error("MENU ERROR:", err);   // 👈 THIS LINE IS KEY
  res.status(500).json({ error: err.message });
}
};