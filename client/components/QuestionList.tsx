import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Question, SkillLevel } from "@shared/types";

interface Props {
  questions: any; // { subject, questions: { type: Question[] } }[]
  selected: Record<string, any>;
  ans: Record<string, any>;
  onToggle: (q: Question, checked: boolean, sub) => void;
  onAnswerChange: (q: Question, answer: string | string[],sub: string) => void;
  onSkillChange?: (q: Question, newSkill: SkillLevel, sub: string) => void;
}

export function QuestionList({
  questions,
  selected,
  ans,
  onToggle,
  onAnswerChange,
  onSkillChange,
}: Props) {
  // ✅ Normalize data: handle array or object
  let normalizedData: Record<string, any> = {};

  if (Array.isArray(questions)) {
    questions.forEach((item) => {
      if (item && item.subject && item.questions) {
        normalizedData[item.subject] = item.questions;
      }
    });
  } else if (typeof questions === "object" && questions !== null) {
    normalizedData = questions;
  }

  const subjects = Object.keys(normalizedData);

  // ✅ Handle no valid subjects
  if (subjects.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Questions</CardTitle>
        </CardHeader>
        <CardContent className="p-4 text-gray-500">
          No valid questions found.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Questions</CardTitle>
      </CardHeader>
      <CardContent className="p-0 h-[800px]">
        <ScrollArea className="h-full">
          <div className="p-4">
            <Accordion type="multiple" defaultValue={[]}>
              {subjects.map((subject) => {
                const typeMap = normalizedData[subject] || {};
                const totalQuestions = Object.values(typeMap).reduce(
                  (acc: number, arr: any) =>
                    acc + (Array.isArray(arr) ? arr.length : 0),
                  0,
                );

                return (
                  <AccordionItem key={subject} value={subject}>
                    <AccordionTrigger>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          {subject.charAt(0).toUpperCase() + subject.slice(1)}
                        </Badge>
                        <div className="text-sm text-muted-foreground">
                          {totalQuestions} questions
                        </div>
                      </div>
                    </AccordionTrigger>

                    <AccordionContent>
                      <div className="space-y-4 max-h-[360px] overflow-y-auto pr-2">
                        {Object.entries(typeMap).map(
                          ([type, qs]: [string, any]) => {
                            const arrQs = Array.isArray(qs) ? qs : [qs];
                            const validQuestions = arrQs.filter(Boolean);

                            return (
                              <div key={type} className="rounded-md border">
                                <div className="px-4 py-2 flex items-center justify-between bg-muted/5">
                                  <div className="font-medium capitalize">
                                    {type}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {validQuestions.length} items
                                  </div>
                                </div>

                                <div className="p-4 space-y-3">
                                  {validQuestions.map((q: Question) => {
                                    const checked =
                                      selected?.[subject]?.some(
                                        (item: Question) => item.id === q.id,
                                      ) || false;

                                    const answerObj = ans?.[subject]?.find(
                                      (item: any) => item.id === q.id,
                                    );
                                    const answer = answerObj?.answer || "";

                                    return (
                                      <div
                                        key={q.id}
                                        className="rounded-lg border p-3"
                                      >
                                        <div className="flex items-start gap-3">
                                          <Checkbox
                                            id={`q_${q.id}`}
                                            checked={checked}
                                            onCheckedChange={(v) =>
                                              onToggle(q, Boolean(v), subject)
                                            }
                                          />
                                          <div className="space-y-2 w-full">
                                            <div className="flex items-center justify-between">
                                              <label
                                                htmlFor={`q_${q.id}`}
                                                className="font-medium cursor-pointer"
                                              >
                                                {q.question}
                                              </label>
                                            </div>

                                            {checked && (
                                              <div className="mt-2">
                                                {q.option_a ? (
                                                  <div className="grid gap-2">
                                                    {[
                                                      "option_a",
                                                      "option_b",
                                                      "option_c",
                                                      "option_d",
                                                      "option_e",
                                                    ].map(
                                                      (optKey) =>
                                                        q[optKey] && (
                                                          <label
                                                            key={optKey}
                                                            className="flex items-center gap-2"
                                                          >
                                                            <input
                                                              type="radio"
                                                              name={`ans_${q.id}`}
                                                              checked={
                                                                answer ===
                                                                q[optKey]
                                                              }
                                                              onChange={() =>
                                                                onAnswerChange(
                                                                  q,
                                                                  q[optKey],
                                                                  subject,
                                                                )
                                                              }
                                                            />
                                                            <span>
                                                              {q[optKey]}
                                                            </span>
                                                          </label>
                                                        ),
                                                    )}
                                                  </div>
                                                ) : (
                                                  <Textarea
                                                    placeholder="Enter answer"
                                                    value={answer}
                                                    onChange={(e) =>
                                                      onAnswerChange(
                                                        q,
                                                        e.target.value,
                                                        subject,
                                                      )
                                                    }
                                                  />
                                                )}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}

                                  {/* {validQuestions.map((q: Question) => {
                                    const checked =
                                      selected?.[subject]?.some(
                                        (item: Question) => item.id === q.id,
                                      ) || false;
                                    const answer =
                                      ans?.[subject]?.filter(
                                        (item: any) => item.id === q.id,
                                      ) || [];
                                    console.log(answer);
                                    console.log(ans)
                                    return (
                                      <div
                                        key={q.id}
                                        className="rounded-lg border p-3"
                                      >
                                        <div className="flex items-start gap-3">
                                          <Checkbox
                                            id={`q_${q.id}`}
                                            checked={checked}
                                            onCheckedChange={(v) =>
                                              onToggle(q, Boolean(v), subject)
                                            }
                                          />
                                          <div className="space-y-2 w-full">
                                            <div className="flex items-center justify-between">
                                              <label
                                                htmlFor={`q_${q.id}`}
                                                className="font-medium cursor-pointer"
                                              >
                                                {q.question}
                                              </label>
                                            </div>

                                            {checked && (
                                              <div className="mt-2">
                                                {q.option_a ? (
                                                  <div className="grid gap-2">
                                                    {[
                                                      "option_a",
                                                      "option_b",
                                                      "option_c",
                                                      "option_d",
                                                      "option_e",
                                                    ].map(
                                                      (optKey) =>
                                                        q[optKey] && (
                                                          <label
                                                            key={optKey}
                                                            className="flex items-center gap-2"
                                                          >
                                                            {console.log(q[optKey], answer[0]["answer"], q[optKey] === answer["answer"])}
                                                            <input
                                                              type="radio"
                                                              name={`ans_${q.id}`}
                                                              checked={
                                                                answer.length > 0 && (answer[0]["answer"] ===
                                                                q[optKey])
                                                              }
                                                              onChange={() =>
                                                                onAnswerChange(
                                                                  q,
                                                                  q[optKey],
                                                                  subject,
                                                                )
                                                              }
                                                            />
                                                            <span>
                                                              {q[optKey]}
                                                            </span>
                                                          </label>
                                                        ),
                                                    )}
                                                  </div>
                                                ) : (
                                                  <Textarea
                                                    placeholder="Enter answer"
                                                    value={answer}
                                                    onChange={(e) =>
                                                      onAnswerChange(
                                                        q,
                                                        e.target.value,
                                                      )
                                                    }
                                                  />
                                                )}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })} */}
                                </div>
                              </div>
                            );
                          },
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
