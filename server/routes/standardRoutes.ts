import express from "express";
import StandardController from "../controllers/standardController.ts";

const router = express.Router();

router.post("/save_questions", StandardController.saveStandardData);
router.get("/:classParam", StandardController.getSubjects);
router.post("/questions", StandardController.getFilteredQuestions);
router.post("/topics/:className", StandardController.getTopics);



router.get("/test/welcome", (req, res) => {
    res.send("welcome");
});
export default router;
