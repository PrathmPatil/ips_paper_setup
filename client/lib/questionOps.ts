// lib/questionOps.ts
import { Question, QuestionSearchFilters } from "@shared/types";

export function toggleQuestion(
  q: Question,
  checked: boolean,
  prev: Record<string, any>,
) {
  const next = { ...prev };
  if (checked) {
    if (!(q.id in next)) next[q.id] = "";
  } else {
    delete next[q.id];
  }
  return next;
}

export function answerChange(
  q: Question,
  answer: string | string[],
  prev: Record<string, any>,
) {
  return { ...prev, [q.id]: answer };
}

export async function fetchQuestions(filters: QuestionSearchFilters) {
  const res = await fetch("/api/questions/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(filters),
  });
  const json = await res.json();
  return json.questions as Question[];
}
