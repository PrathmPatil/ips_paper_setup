import { ExamPattern } from "@shared/types";

export const defaultExamPattern: ExamPattern = {
  grades: [
    { id: "g6", name: "Grade 6" },
    { id: "g7", name: "Grade 7" },
    { id: "g8", name: "Grade 8" },
  ],
  sections: [
    { id: "a", name: "Section A" },
    { id: "b", name: "Section B" },
    { id: "c", name: "Section C" },
  ],
  subjectsByGradeSection: {
    "g6:a": ["math", "sci", "eng"],
    "g6:b": ["math", "sci"],
    "g6:c": ["eng"],
    "g7:a": ["math", "eng"],
    "g7:b": ["sci", "eng"],
    "g8:a": ["math", "sci", "eng"],
  },
  topicsBySubject: {
    math: ["algebra", "geometry", "statistics"],
    sci: ["physics", "chemistry", "biology"],
    eng: ["grammar", "literature", "comprehension"],
  },
  subtopicsByTopic: {
    algebra: ["linear_eq", "polynomials", "inequalities"],
    geometry: ["triangles", "circles", "coordinate_geometry"],
    statistics: ["mean_median", "graphs"],
    physics: ["motion", "force", "energy"],
    chemistry: ["atoms", "reactions"],
    biology: ["cells", "ecosystems"],
    grammar: ["tenses", "punctuation"],
    literature: ["poetry", "prose"],
    comprehension: ["unseen", "summary"],
  },
  skillLevels: ["BASIC", "INTERMEDIATE", "ADVANCED", "EXPERT"],
  examTypes: ["MCQ", "SHORT_ANSWER", "LONG_ANSWER", "COMPETENCY_BASED"],
  defaultMarkingScheme: {
    items: [
      { type: "MCQ", positive: 1, negative: 0 },
      { type: "SHORT_ANSWER", positive: 2, negative: 0 },
      { type: "LONG_ANSWER", positive: 5, negative: 0 },
      { type: "COMPETENCY_BASED", positive: 3, negative: 0 },
    ],
  },
};
