// src/models/AuthModel.ts
import { createConnection } from "../../shared/db.ts";

const db = await createConnection();

const AuthModel = {
  tableName: "users",

  async createTableIfNotExists() {
    const query = `
      CREATE TABLE IF NOT EXISTS \`${this.tableName}\` (
        id INT AUTO_INCREMENT PRIMARY KEY,
        fullName VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        mobile VARCHAR(15),
        role ENUM('student', 'teacher', 'school', 'admin') DEFAULT 'student',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;
    await db.query(query);
  },

  async insertUser(userData: Record<string, any>) {
    // ✅ Ensure role is valid
    const validRoles = ["student", "teacher", "school", "admin"];
    if (!validRoles.includes(userData.role)) {
      userData.role = "student";
    }

    const keys = Object.keys(userData);
    const values = keys.map((k) => userData[k]);
    const placeholders = keys.map(() => "?").join(",");

    const sql = `
      INSERT INTO \`${this.tableName}\`
      (${keys.map((k) => `\`${k}\``).join(",")})
      VALUES (${placeholders})
    `;

    const [result]: any = await db.query(sql, values);
    return result.insertId;
  },

  async getUserByEmail(email: string) {
    const [rows]: any = await db.query(
      `SELECT * FROM \`${this.tableName}\` WHERE email = ?`,
      [email]
    );
    return rows[0] || null;
  },

  async getUserById(id: number) {
    const [rows]: any = await db.query(
      `SELECT * FROM \`${this.tableName}\` WHERE id = ?`,
      [id]
    );
    return rows[0] || null;
  },
};

export default AuthModel;
