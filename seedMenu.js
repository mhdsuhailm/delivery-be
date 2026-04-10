require("dotenv").config();

const pool = require("./src/config/db");
const menu = require("./menu.json");

const BRANCH_ID = "0bd6f52f-ea69-4e9e-9b96-205421495c52"; // 🔥 replace this

const seedMenu = async () => {
  try {
    for (let item of menu) {

      // 🔥 1. INSERT CATEGORY (IF NOT EXISTS)
      const categoryResult = await pool.query(
        `INSERT INTO menu_categories (branch_id, name)
         VALUES ($1, $2)
         ON CONFLICT (branch_id, name) DO NOTHING
         RETURNING id`,
        [BRANCH_ID, item.category]
      );

      let categoryId;

      if (categoryResult.rows.length > 0) {
        categoryId = categoryResult.rows[0].id;
      } else {
        const existing = await pool.query(
          `SELECT id FROM menu_categories 
           WHERE name = $1 AND branch_id = $2`,
          [item.category, BRANCH_ID]
        );
        categoryId = existing.rows[0].id;
      }

      // 🔥 2. INSERT MENU ITEM (NO PRICE HERE)
      const itemResult = await pool.query(
  `INSERT INTO menu_items (
    branch_id,
    category_id,
    item_code,
    name,
    description,
    image_urls,
    food_type,
    is_popular,
    is_available,
    available_in,
    chef_note,
    ingredients,
    rating,
    is_bestseller
  )
  VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
  RETURNING id`,
        [
          BRANCH_ID,
          categoryId,
          "ITEM_" + Date.now() + Math.random(),
          item.name,
          item.description,
          [item.image],
          item.type === "non-veg" ? "non_veg" : "veg",
          item.bestseller || false,
          item.available,
          item.availableIn || [],          // ✅
  item.chefnote || null,           // ✅
  item.ingredients || [],          // ✅
  item.rating || null,             // ✅
  item.bestseller || false
        ]
      );

      const menuItemId = itemResult.rows[0].id;

      // 🔥 3. INSERT PORTION (THIS HOLDS PRICE)
      await pool.query(
        `INSERT INTO item_portions (
          menu_item_id,
          portion_name,
          price,
          is_default
        )
        VALUES ($1,$2,$3,$4)`,
        [
          menuItemId,
          "regular",
          item.price,
          true
        ]
      );
    }

    console.log("✅ Menu seeded successfully with portions!");
    process.exit();

  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
};

seedMenu();