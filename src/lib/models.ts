import db from "./db";
import { v4 as uuidv4 } from "uuid";

export async function initializeDatabase() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS products (
        id CHAR(36) PRIMARY KEY,
        old_images TEXT,
        new_images TEXT,
        old_name VARCHAR(255),
        new_name VARCHAR(255),
        description TEXT,
        next_redirect_url VARCHAR(255) DEFAULT NULL,
        theme VARCHAR(50) DEFAULT 'light',
        generated_link VARCHAR(255) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Optionally, you can run ALTER statements to add columns if needed.
    console.log("✅ Products table is ready");
  } catch (error) {
    console.error("❌ Error creating table:", error);
  }
}

export async function insertProduct(
  old_name: string,
  new_name: string,
  description: string,
  old_images: string[],
  new_images: string[],
  nextRedirectUrl: string,
  theme: string,
  generatedLink: string = ""
) {
  const id = uuidv4(); // Generate a new UUID for the product
  try {
    const [result] = await db.query(
      `INSERT INTO products 
        (id, old_images, new_images, old_name, new_name, description, next_redirect_url, theme, generated_link)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        JSON.stringify(old_images),
        JSON.stringify(new_images),
        old_name,
        new_name,
        description,
        nextRedirectUrl,
        theme,
        generatedLink,
      ]
    );
    return { result, id };
  } catch (error) {
    console.error("❌ Error inserting product:", error);
    throw error;
  }
}
