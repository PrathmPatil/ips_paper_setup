import React, { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

export function SelectedQuestionsPreview({
  selectedQuestions = {},
  setSelectedQuestions = () => {},
}) {
  const [openDialog, setOpenDialog] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null); // { subject, id }

  const subjects = Object.keys(selectedQuestions || {});

  // Remove question by ID
  const handleRemoveQuestion = (subject, questionId) => {
    const updatedSubjectQuestions = selectedQuestions[subject].filter(
      (q) => q.id !== questionId
    );

    const updatedData =
      updatedSubjectQuestions.length === 0
        ? Object.fromEntries(
            Object.entries(selectedQuestions).filter(([key]) => key !== subject)
          )
        : { ...selectedQuestions, [subject]: updatedSubjectQuestions };

    setSelectedQuestions(updatedData);
  };

  if (subjects.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        No questions selected yet.
      </p>
    );
  }

  return (
    <>
      <Accordion
        type="multiple"
        defaultValue={[]}
        className="w-full max-h-[600px] overflow-y-scroll"
      >
        {subjects.map((subject) => {
          const questions = selectedQuestions[subject] || [];
          const totalQuestions = questions.length;

          return (
            <AccordionItem key={subject} value={subject}>
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {subject.charAt(0).toUpperCase() + subject.slice(1)}
                  </Badge>
                  <div className="text-sm text-muted-foreground">
                    {totalQuestions} question{totalQuestions > 1 ? "s" : ""}
                  </div>
                </div>
              </AccordionTrigger>

              <AccordionContent>
                <div className="space-y-4 max-h-[360px] overflow-y-auto pr-2">
                  {questions.map((q) => (
                    <div
                      key={q.id}
                      className="rounded-md border p-3 space-y-2 relative"
                    >
                      {/* ❌ Delete Confirmation Trigger */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                            onClick={() =>
                              setPendingDelete({ subject, id: q.id })
                            }
                          >
                            <X size={16} />
                          </Button>
                        </AlertDialogTrigger>

                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Remove Question?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This action will permanently remove this question
                              from the selected list.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => {
                                handleRemoveQuestion(subject, q.id);
                                setPendingDelete(null);
                              }}
                            >
                              Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      <div className="font-medium">{q.question}</div>
                      <div className="grid gap-1 text-sm text-muted-foreground">
                        {["option_a", "option_b", "option_c", "option_d", "option_e"].map(
                          (key) =>
                            q[key] && (
                              <div key={key} className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  name={`preview_${subject}_${q.id}`}
                                  checked={q.answer === q[key]}
                                  readOnly
                                />
                                <span>{q[key]}</span>
                              </div>
                            )
                        )}
                      </div>
                      <Separator />
                      <div className="text-xs text-muted-foreground">
                        <strong>Answer:</strong> {q.answer || "—"} &nbsp; | &nbsp;
                        <strong>Marks:</strong> {q.marks}
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </>
  );
}
