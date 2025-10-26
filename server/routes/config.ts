import { RequestHandler } from "express";
import { examPattern } from "../../shared/data";

export const handleGetConfig: RequestHandler = (_req, res) => {
  res.status(200).json(examPattern);
};
