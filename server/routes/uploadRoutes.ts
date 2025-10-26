import express from "express";
import { upload } from "../utils/multerConfig.js";
import {
  handleUploadImages,
  handleUploadAndCreateQuestions,
} from "../controllers/uploadController.js";

const router = express.Router();

// POST /api/upload/images
router.post("/images", upload.array("images", 200), handleUploadImages);

// POST /api/upload/images-and-questions
router.post("/images-and-questions", upload.array("images", 200), handleUploadAndCreateQuestions);

export default router;
