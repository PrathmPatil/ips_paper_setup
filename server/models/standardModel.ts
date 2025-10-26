import { createConnection } from "../../shared/db.ts";

const db = await createConnection();

interface GetQuestionsParams {
  classParam: number;
  subject: string;
  type?: string[];
  mode?: string[];
  topicIds?: number[];
}

const StandardModel = {
  async createClassTableIfNotExists(className) {
    const topicsTable = `${className}_topics`;
    const questionsTable = `${className}_questions`;

    await db.query(`
      CREATE TABLE IF NOT EXISTS ${topicsTable} (
        id INT AUTO_INCREMENT PRIMARY KEY,
        topic_name VARCHAR(255) UNIQUE
      );
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS ${questionsTable} (
        id INT AUTO_INCREMENT PRIMARY KEY,
        topic_id INT,
        question_text TEXT,
        option_a TEXT,
        option_b TEXT,
        option_c TEXT,
        option_d TEXT,
        option_e TEXT,
        correct_answer VARCHAR(255),
        type VARCHAR(50),
        mode VARCHAR(50),
        subject VARCHAR(255),
        FOREIGN KEY (topic_id) REFERENCES ${topicsTable}(id) ON DELETE CASCADE
      );
    `);
  },

  async createOrGetTopic(className, topicName) {
    const table = `${className}_topics`;
    const [rows] = await db.query(
      `SELECT id FROM ${table} WHERE topic_name = ?`,
      [topicName],
    );
    if (rows.length > 0) return rows[0].id;

    const [result] = await db.query(
      `INSERT INTO ${table} (topic_name) VALUES (?)`,
      [topicName],
    );
    return result.insertId;
  },

  async insertQuestion(className, topicId, q) {
    const table = `\`${className}_questions\``;

    const questionText = q.question || q["Question Text"] || "";
    const optionA = q.option_a || q["Option A"] || "";
    const optionB = q.option_b || q["Option B"] || "";
    const optionC = q.option_c || q["Option C"] || "";
    const optionD = q.option_d || q["Option D"] || "";
    const optionE = q.option_e || q["Option E"] || "";
    const correctAnswer = q.answer || q["Correct Answer"] || "";
    const type = q.type || "basic";
    const mode = q.mode || "mcq";
    const subject = q.subject || "";

    // ✅ Check if question already exists for this topic
    const [existing] = await db.query(
      `SELECT id FROM ${table} WHERE topic_id = ? AND question_text = ?`,
      [topicId, questionText],
    );

    if (existing.length > 0) {
      // ✅ Update existing
      await db.query(
        `UPDATE ${table} SET
        option_a = ?, option_b = ?, option_c = ?, option_d = ?, option_e = ?,
        correct_answer = ?, type = ?, mode = ?, subject = ?
       WHERE id = ?`,
        [
          optionA,
          optionB,
          optionC,
          optionD,
          optionE,
          correctAnswer,
          type,
          mode,
          subject,
          existing[0].id,
        ],
      );
    } else {
      // ✅ Insert new
      await db.query(
        `INSERT INTO ${table}
       (topic_id, question_text, option_a, option_b, option_c, option_d, option_e, correct_answer, type, mode, subject)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          topicId,
          questionText,
          optionA,
          optionB,
          optionC,
          optionD,
          optionE,
          correctAnswer,
          type,
          mode,
          subject,
        ],
      );
    }
  },
  async getSubjectsForClass(classParam) {
    try {
      const [rows] = await db.query(
        `SHOW TABLES LIKE '${classParam}_%_questions'`,
      );

      if (!rows || rows.length === 0) return [];

      // Extract subjects from table names
      const subjects = rows
        .map((row) => {
          const tableName = Object.values(row)[0]; // e.g. "6th_class_chemistry_questions"
          const match = tableName.match(
            /^(\d+(?:th|st|nd|rd)?_class)_(.*?)_questions$/,
          );
          return match ? match[2] : null; // e.g. "chemistry"
        })
        .filter(Boolean);

      return subjects;
    } catch (error) {
      console.error("❌ Error fetching subjects:", error);
      throw new Error("Failed to fetch subjects");
    }
  },
  async getTopicsForSubject(className, subject) {
    // Add 'th_class' to match your table names
    const normalizedClass =
      className
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/[^a-z0-9_]/g, "") + "th_class";
    const normalizedSubject = subject
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "");
    const tableName = `${normalizedClass}_${normalizedSubject}_topics`;

    console.log("Fetching topics from table:", tableName);

    const [exists] = await db.query(`SHOW TABLES LIKE ?`, [tableName]);
    if (exists.length === 0) return [];

    const [topics] = await db.query(
      `SELECT id, topic_name FROM \`${tableName}\``,
    );
    return topics;
  },
  async getQuestionsForSubject({
    classParam,
    subject,
    type = [],
    mode = [],
    topicIds = [],
  }: GetQuestionsParams) {
    // Table names
    const questionsTable = `${classParam}th_class_${subject}_questions`;
    const topicsTable = `${classParam}th_class_${subject}_topics`;

    // Check if questions table exists
    const [exists] = await db.query(`SHOW TABLES LIKE ?`, [questionsTable]);
    if (exists.length === 0) return [];

    // Build WHERE clauses
    const whereClauses: string[] = [];
    const params: any[] = [];

    // Type filter
    if (type.length > 0) {
      whereClauses.push(`q.type IN (${type.map(() => "?").join(",")})`);
      params.push(...type);
    }

    // Mode filter
    if (mode.length > 0) {
      whereClauses.push(`q.mode IN (${mode.map(() => "?").join(",")})`);
      params.push(...mode);
    }

    console.log(topicIds);
    
    // Topic filter
    if (topicIds.length > 0) {
      whereClauses.push(`q.topic_id IN (${topicIds.map(() => "?").join(",")})`);
      params.push(...topicIds);
    }

    const whereSQL =
      whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

    // Query with join to topics table (ensures topic exists)
    const [questions] = await db.query(
      `
    SELECT 
      q.id, 
      q.topic_id, 
      t.topic_name, 
      q.question_text AS question, 
      q.option_a, 
      q.option_b, 
      q.option_c, 
      q.option_d, 
      q.option_e, 
      q.correct_answer, 
      q.type, 
      q.mode, 
      q.subject
    FROM \`${questionsTable}\` q
    JOIN \`${topicsTable}\` t ON q.topic_id = t.id
    ${whereSQL}
    `,
      params,
    );

    // Filter out dummy questions (optional)
    const filtered = questions.filter((q: any) => {
      if (!q.question || q.question.trim().toLowerCase() === "question")
        return false;
      const options = [
        q.option_a,
        q.option_b,
        q.option_c,
        q.option_d,
        q.option_e,
      ];
      if (options.every((o) => !o || o.trim().toLowerCase() === "question"))
        return false;
      return true;
    });

    return filtered;
  },
};

export default StandardModel;
