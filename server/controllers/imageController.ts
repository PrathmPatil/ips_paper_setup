import { createConnection } from "../../shared/db.ts";

const db = await createConnection();

import fs from "fs";
import path from "path"; // ✅ this line was missing
import { Request, Response } from "express";

export const processImageFolder = async (req: Request, res: Response) => {
  try {
    const { className } = req.body;
    if (!className)
      return res.status(400).json({ message: "Class name is required" });

    const tableName = className.toLowerCase().replace(/\s+/g, "") + "_images";

    // ✅ Ensure DB table exists
    await db.query(`
      CREATE TABLE IF NOT EXISTS ${tableName} (
        id INT AUTO_INCREMENT PRIMARY KEY,
        class_name VARCHAR(50),
        subject VARCHAR(100),
        level VARCHAR(50),
        topic VARCHAR(255),
        image_path TEXT
      )
    `);

    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0)
      return res.status(400).json({ message: "No files uploaded" });

    // ✅ Create upload directory if not exists
    const uploadBase = path.join("uploads", tableName);
    if (!fs.existsSync(uploadBase)) fs.mkdirSync(uploadBase, { recursive: true });

    const insertPromises = files.map(async (file) => {
      const relativePath = file.originalname.replaceAll("\\", "/");
      const parts = relativePath.split("/");

      const subject = (parts[1] || "unknown").toLowerCase();
      const level = (parts[2] || "unknown").toLowerCase();
      const topic = (parts[3] || "unknown").toLowerCase();
      const fileName = (parts[4] || file.originalname).toLowerCase();

      const localPath = path.join(uploadBase, fileName);

      // ✅ Use copy instead of rename to avoid file-lock issues
      await fs.promises.copyFile(file.path, localPath);

      // ✅ Delete temp file (safe cleanup)
      try {
        await fs.promises.unlink(file.path);
      } catch (cleanupErr) {
        console.warn("⚠️ Cleanup failed for temp file:", cleanupErr);
      }

      // ✅ Store in database
      await db.query(
        `INSERT INTO ${tableName} (class_name, subject, level, topic, image_path)
         VALUES (?, ?, ?, ?, ?)`,
        [
          className.toLowerCase(),
          subject,
          level,
          topic,
          localPath.toLowerCase(),
        ]
      );
    });

    await Promise.all(insertPromises);

    res.status(200).json({
      message: "✅ Images processed and stored successfully",
      total: files.length,
    });
  } catch (err: any) {
    console.error("❌ Error processing folder:", err);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: err.message });
  }
};