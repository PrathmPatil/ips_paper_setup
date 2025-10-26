import { RequestHandler } from "express";
import { GeneratedPaper } from "../../shared/types";

const papers: GeneratedPaper[] = [];

export const handleCreatePaper: RequestHandler = (req, res) => {
  const payload = req.body as Omit<GeneratedPaper, "id" | "createdAt">;
  if (
    !payload ||
    !payload.title ||
    !payload.gradeId ||
    !payload.sectionId ||
    !payload.subjectIds?.length
  ) {
    return res
      .status(400)
      .json({ error: "title, gradeId, sectionId, subjectIds are required" });
  }

  const paper: GeneratedPaper = {
    ...payload,
    id: `p_${Date.now().toString(36)}`,
    createdAt: new Date().toISOString(),
  };
  papers.push(paper);
  res.status(201).json(paper);
};

export const handleListPapers: RequestHandler = (_req, res) => {
  res.status(200).json({ papers });
};

export const handleGetPaper: RequestHandler = (req, res) => {
  const { id } = req.params as { id: string };
  const paper = papers.find((p) => p.id === id);
  if (!paper) return res.status(404).json({ error: "Not found" });
  res.status(200).json(paper);
};

export const handleUpdatePaper: RequestHandler = (req, res) => {
  const { id } = req.params as { id: string };
  const idx = papers.findIndex((p) => p.id === id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  const payload = req.body as Partial<GeneratedPaper>;
  const updated = { ...papers[idx], ...payload } as GeneratedPaper;
  papers[idx] = updated;
  res.status(200).json(updated);
};
