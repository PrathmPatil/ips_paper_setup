import { paperService } from "../services/paperService.ts";

export const paperController = {
  async create(req, res) {
    try {
      const paper = await paperService.createPaper(req.body);
      res.status(201).json({ status: "success", data: paper });
    } catch (err) {
      res.status(err.status || 500).json({
        status: "error",
        message: err.message || "Failed to create paper",
        errors: err.errors || [],
      });
    }
  },

  async getAll(req, res) {
    try {
      const papers = await paperService.getAllPapers();
      res.json({ status: "success", data: papers });
    } catch (err) {
      res.status(500).json({ status: "error", message: err.message });
    }
  },

  async getByFilter(req, res) {
    try {
      const filters = req.body;
      const allPapers = await paperService.getPapersByFilter(filters || {});;
      res.json({ status: "success", data: allPapers });
    } catch (err) {
      res.status(500).json({ status: "error", message: err.message });
    }
  },
  async getById(req, res) {
    try {
      const { id } = req.params;
      const paper = await paperService.getPaperById(Number(id));
      res.json({ status: "success", data: paper });
    } catch (err) {
      res.status(err.status || 500).json({
        status: "error",
        message: err.message,
      });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const updated = await paperService.updatePaper(Number(id), req.body);
      res.json({ status: "success", data: updated });
    } catch (err) {
      res.status(err.status || 500).json({
        status: "error",
        message: err.message,
      });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;
      await paperService.deletePaper(Number(id));
      res.json({ status: "success", message: "Paper deleted" });
    } catch (err) {
      res.status(err.status || 500).json({
        status: "error",
        message: err.message,
      });
    }
  },
};
