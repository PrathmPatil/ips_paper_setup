import PaperModel from "../models/paperModel.ts";
import { validatePaper } from "../validation/paperValidation.ts";

export const paperService = {
  async createPaper(data: any) {
    // Validate request body
    const { error } = validatePaper(data);
    if (error) {
      throw {
        status: 400,
        message: "Failed to create paper",
        errors: error.details.map((d: any) => d.message),
      };
    }

    await PaperModel.createTableIfNotExists();

    // Prepare data for insertion (convert objects/arrays to JSON where needed)
    const record = {
      title: data.title,
      gradeId: data.gradeId,
      sectionId: data.sectionId,
      subjectIds: JSON.stringify(data.subjectIds),
      topicIds: JSON.stringify(data.topicIds || []),
      skills: JSON.stringify(data.skills || []),
      types: JSON.stringify(data.types || []),
      marking: JSON.stringify(data.marking),
      selectedQuestions: JSON.stringify(data.selectedQuestions),
      selectedAnswers: JSON.stringify(data.selectedAnswers),
    };

    const insertId = await PaperModel.insertPaper(record);
    return { id: insertId, ...data };
  },

  async getAllPapers() {
    await PaperModel.createTableIfNotExists();
    const rows = await PaperModel.getAllPapers();
    // Parse JSON fields
    return rows.map((r: any) => ({
      ...r,
      subjectIds: r.subjectIds || "[]",
      topicIds: r.topicIds || "[]",
      skills: r.skills || "[]",
      types: r.types || "[]",
      marking: r.marking || "[]",
      selectedQuestions: r.selectedQuestions || "{}",
      selectedAnswers: r.selectedAnswers || "{}",
    }));
  },

  async getPapersByFilter(filters: any) {
    const allPapers = await this.getAllPapers();
    const filteredPapers = allPapers.filter((paper) => {
      // If no filters are selected, return all papers
      const hasFilter =
        filters.gradeId ||
        filters.sectionId ||
        (filters.subjectIds && filters.subjectIds.length) ||
        (filters.topicIds && filters.topicIds.length) ||
        (filters.skills && filters.skills.length) ||
        (filters.types && filters.types.length);

      if (!hasFilter) return true; // No filters, include paper

      // Check for any match
      const gradeMatch = filters.gradeId && paper.gradeId === filters.gradeId;
      const sectionMatch =
        filters.sectionId && paper.sectionId === filters.sectionId;

      const arrayMatch = (filterKey: string, paperValue: string[] | string) => {
        if (!filters[filterKey] || !filters[filterKey].length) return false;
        const paperArr = Array.isArray(paperValue)
          ? paperValue
          : JSON.parse(paperValue || "[]");
        return filters[filterKey].some((val: string) => paperArr.includes(val));
      };

      const subjectMatch = arrayMatch("subjectIds", paper.subjectIds);
      const topicMatch = arrayMatch("topicIds", paper.topicIds);
      const skillsMatch = arrayMatch("skills", paper.skills);
      const typesMatch = arrayMatch("types", paper.types);

      // Return true if ANY filter matches
      return (
        gradeMatch ||
        sectionMatch ||
        subjectMatch ||
        topicMatch ||
        skillsMatch ||
        typesMatch
      );
    });

    return filteredPapers;
  },

  async getPaperById(id: number) {
    await PaperModel.createTableIfNotExists();
    const paper = await PaperModel.getPaperById(id);
    if (!paper) throw { status: 404, message: "Paper not found" };

    return {
      ...paper,
      subjectIds: paper.subjectIds || "[]",
      topicIds: paper.topicIds || "[]",
      skills: paper.skills || "[]",
      types: paper.types || "[]",
      marking: paper.marking || "[]",
      selectedQuestions: paper.selectedQuestions || "{}",
      selectedAnswers: paper.selectedAnswers || "{}",
    };
  },

  async updatePaper(id: number, data: any) {
    console.log(data)
    const { error } = validatePaper(data);
    if (error) {
      throw {
        status: 400,
        message: "Validation failed",
        errors: error.details.map((d: any) => d.message),
      };
    }

    const existing = await PaperModel.getPaperById(id);
    if (!existing) throw { status: 404, message: "Paper not found" };

    const record = {
      title: data.title,
      gradeId: data.gradeId,
      sectionId: data.sectionId,
      subjectIds: JSON.stringify(data.subjectIds),
      topicIds: JSON.stringify(data.topicIds || []),
      skills: JSON.stringify(data.skills || []),
      types: JSON.stringify(data.types || []),
      marking: JSON.stringify(data.marking),
      selectedQuestions: JSON.stringify(data.selectedQuestions),
      selectedAnswers: JSON.stringify(data.selectedAnswers),
    };

    await PaperModel.updatePaper(id, record);
    return { id, ...data };
  },

  async deletePaper(id: number) {
    const existing = await PaperModel.getPaperById(id);
    if (!existing) throw { status: 404, message: "Paper not found" };

    await PaperModel.deletePaper(id);
    return { success: true };
  },
};
