import express from "express";
import multer from "multer";
import { processImageFolder } from "../controllers/imageController.js";

const router = express.Router();
const upload = multer({ dest: "uploads/tmp/" });

router.post("/upload-folder", upload.array("images"), processImageFolder);

export default router;
