/* eslint-disable @typescript-eslint/no-explicit-any */
import db from "./db";
import bcrypt from "bcryptjs";

/**
 * Initializes the admin database by creating the users table if it doesn't exist.
 */
export async function initializeAdminDatabase() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ Users table is ready");
  } catch (error) {
    console.error("❌ Error creating users table:", error);
  }
}

/**
 * Retrieves a user by username.
 * @param username - The username to look up.
 * @returns The user record(s) from the database.
 */
export async function getUserByUsername(username: string) {
  const [rows] = await db.query("SELECT * FROM users WHERE username = ?", [
    username,
  ]);
  return rows;
}

/**
 * Seeds a default admin user if none exists.
 * This is useful for development or first-time deployment.
 */
export async function seedAdminUser() {
  await initializeAdminDatabase();
  const existingUsers = await getUserByUsername("admin");
  if (!existingUsers || (existingUsers as any[]).length === 0) {
    const defaultPassword = process.env.ADMIN_PASSWORD ?? "admin123"; // Change this in production
    const adminuser = process.env.ADMIN_USERNAME ?? "admin";
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    await db.query(
      "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
      [adminuser, hashedPassword, "admin"]
    );
    console.log(
      "✅ Default admin user created (username: admin, password: admin123)"
    );
  }
}
