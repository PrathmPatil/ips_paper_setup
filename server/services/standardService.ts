import StandardModel from "../models/standardModel.ts";

const StandardService = {
  async saveData(className, allFormattedData) {
    if (
      !className ||
      !Array.isArray(allFormattedData) ||
      allFormattedData.length === 0
    ) {
      throw new Error("Invalid input data");
    }

    // ✅ Normalize class name for MySQL table
    const normalizedClassName = className
      .toLowerCase()
      .replace(/\s+/g, "_") // Replace spaces with underscores
      .replace(/[^a-z0-9_]/g, ""); // Remove invalid characters

    // ✅ Ensure class table exists
    await StandardModel.createClassTableIfNotExists(normalizedClassName);

    for (const topicData of allFormattedData) {
      const topicName = topicData.tableName
        .replace(`${className}_`, "")
        .replace(/_/g, " ");
      const questions = topicData.questions;

      if (!topicName || !Array.isArray(questions) || questions.length === 0)
        continue;

      // ✅ Step 1: Ensure topic exists
      const topicId = await StandardModel.createOrGetTopic(
        normalizedClassName,
        topicName,
      );

      // ✅ Step 2: Insert each question linked to topic
      for (const q of questions) {
        await StandardModel.insertQuestion(normalizedClassName, topicId, q);
      }
    }

    return {
      message: `✅ Saved ${allFormattedData.length} topics successfully for ${className}`,
    };
  },
  // ✅ Fetch all subjects for a given class
  async fetchSubjects(classParam) {
    // Normalize input (e.g. "6" -> "6th_class")
    const normalizedClass = classParam.includes("class")
      ? classParam.toLowerCase()
      : `${classParam.toLowerCase()}th_class`;

    const subjects = await StandardModel.getSubjectsForClass(normalizedClass);
    return subjects;
  },

  async fetchTopicsForSubject(className, subject) {
    const topics = await StandardModel.getTopicsForSubject(className, subject);
    return topics;
  },
  async fetchFilteredQuestions({
    classParam,
    subjects = [],
    type = [],
    mode = [],
    topics = [],
  }: {
    classParam: number;
    subjects?: string[];
    type?: string[];
    mode?: string[];
    topics?: string[];
  }) {
    const allQuestions: any[] = [];

    // Loop through each subject
    for (const subject of subjects) {
      // Extract topic IDs for this subject
      console.log(topics)
      const topicIdsForSubject = topics
        .filter((t) => t.startsWith(`${subject}__`))
        .map((t) => parseInt(t.split("__")[1]));
        console.log("Topic IDs for subject", subject, ":", topicIdsForSubject);

      // Fetch questions from model
      const questions = await StandardModel.getQuestionsForSubject({
        classParam,
        subject,
        type,
        mode,
        topicIds: topicIdsForSubject,
      });
      // ✅ Place Option 2 filter here
      const filtered = questions.filter((q) => {
        if (!q.question || q.question.trim().toLowerCase() === "question")
          return false;

        const options = [
          q.option_a,
          q.option_b,
          q.option_c,
          q.option_d,
          q.option_e,
        ];
        // skip if all options are "Question" or empty
        if (options.every((o) => !o || o.trim().toLowerCase() === "question"))
          return false;

        return true;
      });

      allQuestions.push(...filtered);
    }

    return allQuestions;
  },
};

export default StandardService;
