import { ExamPattern, Question, SkillLevel, ExamType } from "./types";

export const examPattern: ExamPattern = {
  grades: [
    { id: "g6", name: "Grade 6" },
    { id: "g7", name: "Grade 7" },
    { id: "g8", name: "Grade 8" },
    { id: "g9", name: "Grade 9" },
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
    "g9:a": ["math", "sci", "eng"],
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
    chemistry: ["atoms", "reactions", "mixtures"],
    biology: ["cells", "ecosystems", "human_body"],
    grammar: ["tenses", "punctuation", "sentence_structure"],
    literature: ["poetry", "prose", "drama"],
    comprehension: ["unseen", "summary", "inference"],
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

function slugify(...parts: Array<string | undefined | null>) {
  return parts
    .filter(Boolean)
    .join("_")
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

function pick<T>(arr: T[], idx: number) {
  return arr.length ? arr[idx % arr.length] : (undefined as unknown as T);
}

// Generate a large but manageable question bank programmatically. Adjust perCombo to scale size.
export function generateQuestions(
  pattern: ExamPattern,
  perCombo = 1,
): Question[] {
  const out: Question[] = [];
  let counter = 1;

  for (const grade of pattern.grades) {
    for (const section of pattern.sections) {
      const key = `${grade.id}:${section.id}`;
      const subjects = pattern.subjectsByGradeSection[key] ?? [];
      for (const subjectId of subjects) {
        const topics = pattern.topicsBySubject[subjectId] ?? ["general"];
        for (const topic of topics) {
          const subtopics = pattern.subtopicsByTopic[topic] ?? ["general"];
          for (const subtopic of subtopics) {
            for (const skill of pattern.skillLevels) {
              for (const type of pattern.examTypes) {
                for (let i = 0; i < perCombo; i++) {
                  const id = `q_${slugify(grade.id, section.id, subjectId, topic, subtopic, skill, type, String(counter))}`;
                  const baseText = `${grade.name} · ${section.name} — ${subjectId.toUpperCase()} / ${topic.replace(/_/g, " ")} / ${subtopic.replace(/_/g, " ")} [${skill}] (${type.replace(/_/g, " ")})`;

                  let text = "";
                  const options: string[] | undefined =
                    type === "MCQ" ? [] : undefined;
                  if (type === "MCQ") {
                    // Create a simple arithmetic or factual MCQ depending on subject
                    if (subjectId === "math") {
                      const a = (counter % 9) + 1;
                      const b = ((counter + 3) % 9) + 1;
                      const correct = a + b;
                      const opts = [
                        String(correct),
                        String(correct + 1),
                        String(Math.max(1, correct - 1)),
                        String(correct + 2),
                      ];
                      text = `What is ${a} + ${b}?`;
                      options.push(...opts);
                    } else if (subjectId === "sci") {
                      text = `Which of the following best describes ${topic.replace(/_/g, " ")}?`;
                      options.push(
                        "Definition A",
                        "Definition B",
                        "Definition C",
                        "Definition D",
                      );
                    } else {
                      text = `Choose the correct option related to ${topic.replace(/_/g, " ")}.`;
                      options.push(
                        "Option A",
                        "Option B",
                        "Option C",
                        "Option D",
                      );
                    }
                  } else if (type === "SHORT_ANSWER") {
                    text = `Short: Explain briefly about ${subtopic.replace(/_/g, " ")}.`;
                  } else if (type === "LONG_ANSWER") {
                    text = `Long: Discuss in detail the concept of ${topic.replace(/_/g, " ")} with examples.`;
                  } else {
                    text = `Competency task: Demonstrate an activity related to ${subtopic.replace(/_/g, " ")}.`;
                  }

                  const q: Question = {
                    id,
                    gradeId: grade.id,
                    sectionId: section.id,
                    subjectId,
                    topicId: topic,
                    subtopicId: subtopic,
                    skill: skill as SkillLevel,
                    type: type as ExamType,
                    text: `${baseText} — ${text}`,
                    options: options && options.length ? options : undefined,
                    correctAnswer:
                      options && options.length ? options[0] : undefined,
                  };

                  out.push(q);
                  counter++;
                }
              }
            }
          }
        }
      }
    }
  }
  return out;
}

// Default generated questions: 1 per combination (adjust the second parameter to scale up)
export const questions: Question[] = generateQuestions(examPattern, 1);

export const allSkills: SkillLevel[] = examPattern.skillLevels;
export const allExamTypes: ExamType[] = examPattern.examTypes;
