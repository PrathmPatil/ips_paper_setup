export type SkillLevel = "BASIC" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
export type ExamType =
  | "MCQ"
  | "SHORT_ANSWER"
  | "LONG_ANSWER"
  | "COMPETENCY_BASED";

export interface Grade {
  id: string;
  name: string; // e.g., Grade 6
}

export interface Section {
  id: string;
  name: string; // e.g., A, B
}

export interface Subject {
  id: string;
  name: string; // e.g., Mathematics
}

export interface Topic {
  id: string;
  subjectId: string;
  name: string;
}

export interface Subtopic {
  id: string;
  topicId: string;
  name: string;
}

export interface Question {
  id: string;
  gradeId: string;
  sectionId: string;
  subjectId: string;
  topicId: string;
  subtopicId: string | null;
  skill: SkillLevel;
  type: ExamType;
  text: string;
  options?: string[]; // for MCQ
  correctAnswer?: string | string[]; // for answer key
}

export interface ExamPattern {
  grades: Grade[];
  sections: Section[];
  subjectsByGradeSection: Record<string, string[]>; // key `${gradeId}:${sectionId}` -> subjectIds
  topicsBySubject: Record<string, string[]>; // subjectId -> topicIds
  subtopicsByTopic: Record<string, string[]>; // topicId -> subtopicIds
  skillLevels: SkillLevel[];
  examTypes: ExamType[];
  defaultMarkingScheme: MarkingScheme;
}

export interface MarkingSchemeItem {
  type: ExamType;
  positive: number;
  negative: number;
}

export interface MarkingScheme {
  items: MarkingSchemeItem[];
}

export interface QuestionSearchFilters {
  gradeId: string;
  sectionId: string;
  subjectIds: string[];
  topicIds?: string[];
  subtopicIds?: string[];
  skills?: SkillLevel[];
  types?: ExamType[];
}

export interface PaperQuestionSelection {
  questionId: string;
  answer?: string | string[];
}

export interface GeneratedPaper {
  id: string;
  title: string;
  gradeId: string;
  sectionId: string;
  subjectIds: string[];
  marking: MarkingScheme;
  selections: PaperQuestionSelection[];
  createdAt: string;
}
