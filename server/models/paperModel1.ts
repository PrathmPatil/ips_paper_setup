import { createConnection } from "../../shared/db.ts";

const db = await createConnection();

const PaperModel = {
  tableName: "papers",

  async createTableIfNotExists() {
    const query = `
      CREATE TABLE IF NOT EXISTS \`${this.tableName}\` (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title TEXT,
        gradeId INT,
        sectionId INT,
        subjectIds JSON,
        topicIds JSON,
        skills JSON,
        types JSON,
        marking JSON,
        selectedQuestions JSON,
        selectedAnswers JSON,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;
    await db.query(query);
  },

  async insertPaper(paperData: Record<string, any>) {
    const keys = Object.keys(paperData);
    const values = keys.map((k) => paperData[k]);
    const placeholders = keys.map(() => "?").join(",");

    const sql = `
      INSERT INTO \`${this.tableName}\`
      (${keys.map((k) => `\`${k}\``).join(",")})
      VALUES (${placeholders})
    `;

    await db.query(sql, values);
  },

  async getAllPapers() {
    const [rows] = await db.query(`SELECT * FROM \`${this.tableName}\` ORDER BY createdAt DESC`);
    return rows;
  },

  async getPaperById(id: number) {
    const [rows] = await db.query(`SELECT * FROM \`${this.tableName}\` WHERE id = ?`, [id]);
    return rows[0] || null;
  },

  async getPapersByGrade(gradeId: number) {
    const [rows] = await db.query(
      `SELECT * FROM \`${this.tableName}\` WHERE gradeId = ? ORDER BY createdAt DESC`,
      [gradeId]
    );
    return rows;
  },

  async updatePaper(id: number, paperData: Record<string, any>) {
    const keys = Object.keys(paperData);
    const values = keys.map((k) => paperData[k]);
    const setQuery = keys.map((k) => `\`${k}\` = ?`).join(",");

    const sql = `
      UPDATE \`${this.tableName}\`
      SET ${setQuery}, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    await db.query(sql, [...values, id]);
  },

  async deletePaper(id: number) {
    await db.query(`DELETE FROM \`${this.tableName}\` WHERE id = ?`, [id]);
  },
};

export default PaperModel;
