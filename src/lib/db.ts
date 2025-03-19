import mysql from "mysql2/promise";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const db = mysql.createPool({
  host: process.env.HOST_NAME || "",
  port: 11473,
  user: process.env.USERDB || "",
  password: process.env.PASSWORDDB || "",
  database: process.env.DATABASE || "",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000, // ✅ Increase timeout to 10s
});

// ✅ Test connection
db.getConnection()
  .then((conn) => {
    console.log("✅ Database connected successfully!");
    conn.release(); // Release connection after test
  })
  .catch((error) => {
    console.error("❌ Database connection failed:", error);
  });

export default db;
