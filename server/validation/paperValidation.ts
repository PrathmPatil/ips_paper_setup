import Joi from 'joi';

const typeSchema = Joi.object({
  id: Joi.string().required(),
  name: Joi.string().required(),
});

export const markingItemSchema = Joi.object({
  type: typeSchema.required(),
  positive: Joi.number().required(),
  negative: Joi.number().required(),
});

export const questionSchema = Joi.object({
  id: Joi.number().required(),
  question: Joi.string().required(),
  option_a: Joi.string().allow(''),
  option_b: Joi.string().allow(''),
  option_c: Joi.string().allow(''),
  option_d: Joi.string().allow(''),
  option_e: Joi.string().allow(''),
  answer: Joi.string().required(),
  marks: Joi.string().required(),
  mode: Joi.string().required(),
});

export const answerSchema = Joi.object({
  id: Joi.number().required(),
  answer: Joi.string().required(),
});

export const paperSchema = Joi.object({
  title: Joi.string().min(1).max(255).required(),
  gradeId: Joi.number().required(),
  sectionId: Joi.number().required(),
  subjectIds: Joi.array().items(Joi.string()).min(1).required(),
  topicIds: Joi.array().items(Joi.string()),
  skills: Joi.array().items(Joi.string()),
  types: Joi.array().items(Joi.string()),
  marking: Joi.array().items(markingItemSchema).required(),

  // ✅ FIXED: selectedQuestions = { subject: [ questionSchema ] }
  selectedQuestions: Joi.object()
    .pattern(Joi.string(), Joi.array().items(questionSchema))
    .required(),

  // ✅ FIXED: selectedAnswers = { subject: [ answerSchema ] }
  selectedAnswers: Joi.object()
    .pattern(Joi.string(), Joi.array().items(answerSchema))
    .required(),
});

export const validatePaper = (data: any) =>
  paperSchema.validate(data, { abortEarly: false });
