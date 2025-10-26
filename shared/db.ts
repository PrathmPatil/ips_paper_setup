import mysql from "mysql2/promise";

const DB_NAME = process.env.DB_NAME || "questions_db";

export const createConnection = async () => {
  // First, connect without selecting a database
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "Patil@2000",
    multipleStatements: true,
  });

  // Create database if it does not exist
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\``);
  console.log(`✅ Database "${DB_NAME}" is ready`);

  // Now connect with the database
  const db = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "Patil@2000",
    database: DB_NAME,
    multipleStatements: true,
  });

  return db;
};
