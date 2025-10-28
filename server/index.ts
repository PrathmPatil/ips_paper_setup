import "dotenv/config";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import path from "path";

import { handleDemo } from "./routes/demo.js";
import { handleGetConfig } from "./routes/config.js";
import { handleSearchQuestions, handleGetQuestion } from "./routes/questions.js";
import {
  handleCreatePaper,
  handleGetPaper,
  handleListPapers,
  handleUpdatePaper,
} from "./routes/papers.js";

import standardRoutes from "./routes/standardRoutes.js";
import paperRoutes from "./routes/paperRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js"; // ✅ new
import imageRoutes from "./routes/imageRoutes.js";
import authRoutes from "./routes/auth.js"
import AuthModel from "./models/authModel.js"
export async function createServer() {
  const app = express();

  // ✅ Middleware
  app.use(cors());
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));
  app.use(bodyParser.json({ limit: "50mb" }));
  app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

  await AuthModel.createTableIfNotExists()

  // ✅ Serve static uploads
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

  // ✅ Health check
  app.get("/api/ping", (_req, res) => {
    res.json({ message: process.env.PING_MESSAGE ?? "ping" });
  });

  // ✅ Core routes
  app.use("/api/standard", standardRoutes);
  app.use("/api/papers", paperRoutes);

  // ✅ Upload route
  app.use("/api/upload", uploadRoutes);
  app.use("/api/images", imageRoutes);

  // ✅ Demo/config/questions
  app.get("/api/demo", handleDemo);
  app.get("/api/config", handleGetConfig);
  app.post("/api/questions/search", handleSearchQuestions);
  app.get("/api/questions/:id", handleGetQuestion);

  app.use("/api/auth", authRoutes);

  app.get("/api/welcome", (_, res) => res.send("welcome"));

  return app;
}
