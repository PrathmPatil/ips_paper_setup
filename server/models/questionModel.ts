import { createConnection } from "../../shared/db.ts";

const db = await createConnection();

export async function insertQuestions(questions: any[]) {
  const insertedIds: number[] = [];

  for (const q of questions) {
    const tableName = `${q.class}th_class_${q.subject}_questions`;

    const sql = `
      INSERT INTO \`${tableName}\`
      (topic_id, question_text, option_a, option_b, option_c, option_d, option_e, correct_answer, type, mode, subject)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      q.topic_id || null,
      q.question_text || null,
      q.option_a || null,
      q.option_b || null,
      q.option_c || null,
      q.option_d || null,
      q.option_e || null,
      q.correct_answer || null,
      q.type || null,
      q.mode || null,
      q.subject || null,
    ];

    const [result] = await db.query(sql, params);
    insertedIds.push((result as any).insertId);

    if (q.image_path) {
      await db.query(
        "INSERT INTO question_images (question_id, image_path) VALUES (?, ?)",
        [(result as any).insertId, q.image_path]
      );
    }
  }

  return insertedIds;
}
