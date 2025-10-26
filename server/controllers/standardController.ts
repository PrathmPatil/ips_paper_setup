import { filterAndSortBySubject } from "../lib/common.ts";
import StandardService from "../services/standardService.ts";

const StandardController = {
  async saveStandardData(req, res) {
    const { tableName, data } = req.body;

    try {
      const result = await StandardService.saveData(tableName, data);
      res.status(200).json(result);
    } catch (error) {
      console.error("❌ Controller Error:", error.message);
      res.status(500).json({ error: error.message || "Failed to save data" });
    }
  },

  async getSubjects(req, res) {
    try {
      const { classParam } = req.params;
      const subjects = await StandardService.fetchSubjects(classParam);

      if (!subjects || subjects.length === 0) {
        return res
          .status(404)
          .json({ error: `No subjects found for class ${classParam}` });
      }

      res.status(200).json({
        class: classParam,
        subjects,
      });
    } catch (error) {
      console.error("❌ Controller Error:", error);
      res
        .status(500)
        .json({ error: error.message || "Failed to fetch subjects" });
    }
  },

  async getFilteredQuestions(req, res) {
    try {
      const { class: classParam, subjects, type, mode, topics } = req.body;
      if (!classParam)
        return res.status(400).json({ error: "Class is required" });

      const result = await StandardService.fetchFilteredQuestions({
        classParam,
        subjects,
        type,
        mode,
        topics
      });

      const filterAndSortBySubjectArray = (result) => {
        const grouped = filterAndSortBySubject(result);
        return Object.entries(grouped).map(([subject, questions]) => ({
          subject,
          questions,
        }));
      };

      res.json({
        class: `class_${classParam}`,
        total: result.length,
        questions: filterAndSortBySubjectArray(result) || [],
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
async getTopics(req, res) {
  try {
    const { className } = req.params;
    const { subjects } = req.body; // now expecting subjects in body

    if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
      return res.status(400).json({ error: "Subjects array is required" });
    }

    const topicsBySubject = {};

    for (const subject of subjects) {
      try {
        const topics = await StandardService.fetchTopicsForSubject(
          className,
          subject
        );
        topicsBySubject[subject] = topics;
      } catch (err) {
        topicsBySubject[subject] = [];
      }
    }

    res.status(200).json({
      class: className,
      subjects: subjects,
      topics: topicsBySubject,
    });
  } catch (error) {
    console.error("❌ Controller Error:", error);
    res
      .status(500)
      .json({ error: error.message || "Failed to fetch topics" });
  }
}

};

export default StandardController;
