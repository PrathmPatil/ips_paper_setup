import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    const dateFolder = new Date().toISOString().slice(0, 10);
    const dir = path.join(process.cwd(), "uploads", "questions", dateFolder);
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (_, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/\s+/g, "_");
    cb(null, `${Date.now()}-${uuidv4()}-${base}${ext}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    const allowed = /\.(jpe?g|png|webp|gif)$/i;
    if (!allowed.test(file.originalname)) return cb(new Error("Invalid file type"));
    cb(null, true);
  },
});
