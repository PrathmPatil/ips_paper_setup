import path from "path";
import { insertQuestions } from "../models/questionModel.js";

export const handleUploadImages = async (req, res) => {
  try {
    const mapping: Record<string, string> = {};
    for (const f of req.files || []) {
      const relative = path
        .relative(path.join(process.cwd(), "uploads"), f.path)
        .replace(/\\/g, "/");
      mapping[f.originalname] = `/uploads/${relative}`;
    }
    return res.json({ status: "success", uploaded: mapping });
  } catch (err) {
    console.error("upload error", err);
    res.status(500).json({ status: "error", message: err.message });
  }
};

export const handleUploadAndCreateQuestions = async (req, res) => {
  try {
    const mapping: Record<string, string> = {};
    for (const f of req.files || []) {
      const relative = path
        .relative(path.join(process.cwd(), "uploads"), f.path)
        .replace(/\\/g, "/");
      mapping[f.originalname] = `/uploads/${relative}`;
    }

    const metadataJson = req.body.metadata;
    const metadata = metadataJson ? JSON.parse(metadataJson) : {};
    const questions = metadata.questions || [];

    for (const q of questions) {
      if (q.imageOriginalName && mapping[q.imageOriginalName]) {
        q.image_path = mapping[q.imageOriginalName];
      }
    }

    const insertedIds = await insertQuestions(questions);
    return res.json({ status: "success", uploaded: mapping, inserted: insertedIds });
  } catch (err) {
    console.error("upload+create error", err);
    res.status(500).json({ status: "error", message: err.message });
  }
};
