// hooks/useLoadEditPaper.ts
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Question } from "@shared/types";

export function useLoadEditPaper(
  setTitle: (t: string) => void,
  setGradeId: (id: string) => void,
  setSectionId: (id: string) => void,
  setSubjectIds: (ids: string[]) => void,
  setMarking: (m: any) => void,
  setQuestions: (qs: Question[]) => void,
  setSelectedAnswers: (s: Record<string, any>) => void,
) {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const editPaperId = (location.state as any)?.editPaperId;
    if (!editPaperId) return;

    (async () => {
      try {
        const res = await fetch(`/api/papers/${editPaperId}`);
        if (!res.ok) return;
        const data = await res.json();

        setTitle(data.title ?? "Question Paper");
        setGradeId(data.gradeId ?? "");
        setSectionId(data.sectionId ?? "");
        setSubjectIds(data.subjectIds ?? []);
        setMarking(data.marking ?? { items: [] });

        const selMap: Record<string, string> = {};
        data.selections?.forEach((s: any) => {
          selMap[s.questionId] = s.answer ?? "";
        });
        setSelectedAnswers(selMap);

        const qids = data.selections?.map((s: any) => s.questionId) ?? [];
        const qResults = (
          await Promise.all(
            qids.map((qid: string) =>
              fetch(`/api/questions/${qid}`)
                .then((r) => (r.ok ? r.json() : null))
                .catch(() => null),
            ),
          )
        ).filter(Boolean);

        setQuestions(qResults as Question[]);

        navigate(location.pathname, { replace: true, state: {} });
      } catch (err) {
        console.error("Failed to load paper for editing:", err);
      }
    })();
  }, [location.state]);
}
