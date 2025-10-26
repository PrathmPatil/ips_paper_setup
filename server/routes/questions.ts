import { RequestHandler } from "express";
import { questions } from "../../shared/data";
import { QuestionSearchFilters } from "../../shared/types";

export const handleSearchQuestions: RequestHandler = (req, res) => {
  const filters = req.body as QuestionSearchFilters;

  if (
    !filters ||
    !filters.gradeId ||
    !filters.sectionId ||
    !filters.subjectIds?.length
  ) {
    return res
      .status(400)
      .json({ error: "gradeId, sectionId and subjectIds are required" });
  }

  const result = questions.filter((q) => {
    if (q.gradeId !== filters.gradeId) return false;
    if (q.sectionId !== filters.sectionId) return false;
    if (!filters.subjectIds.includes(q.subjectId)) return false;
    if (
      filters.topicIds &&
      filters.topicIds.length &&
      !filters.topicIds.includes(q.topicId)
    )
      return false;
    if (filters.subtopicIds && filters.subtopicIds.length) {
      if (!q.subtopicId || !filters.subtopicIds.includes(q.subtopicId))
        return false;
    }
    if (
      filters.skills &&
      filters.skills.length &&
      !filters.skills.includes(q.skill)
    )
      return false;
    if (
      filters.types &&
      filters.types.length &&
      !filters.types.includes(q.type)
    )
      return false;
    return true;
  });

  res.status(200).json({ questions: result });
};

export const handleGetQuestion: RequestHandler = (req, res) => {
  const { id } = req.params as { id: string };
  const q = questions.find((x) => x.id === id);
  if (!q) return res.status(404).json({ error: "Not found" });
  res.status(200).json(q);
};
