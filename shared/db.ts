import mysql from "mysql2/promise";

const DB_NAME = process.env.DB_NAME || "questions_db";

let pool;

export const createConnection = async () => {
  // Create pool only once
  if (!pool) {
    // First, connect without selecting a database
    const initConnection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "Patil@2000",
      multipleStatements: true,
    });

    // Ensure database exists
    await initConnection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\``);
    console.log(`✅ Database "${DB_NAME}" is ready`);
    await initConnection.end();

    // Create connection pool for future use
    pool = mysql.createPool({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "Patil@2000",
      database: DB_NAME,
      waitForConnections: true,
      connectionLimit: 5, // Safe for free-tier Render
      queueLimit: 0,
      multipleStatements: true,
    });

    console.log("✅ MySQL connection pool created");
  }

  return pool;
};
