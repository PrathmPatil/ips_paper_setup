import express from "express";
import { paperController } from "../controllers/paperController.ts";

const router = express.Router();


router.get("/test/welcome", (req, res) => {
  res.json({ message: "Welcome to the Paper Setup API" });
});
router.post("/", paperController.create);
router.get("/", paperController.getAll);
router.get("/:id", paperController.getById);
router.put("/:id", paperController.update);
router.delete("/:id", paperController.delete);
router.post("/filter", paperController.getByFilter);

export default router;
