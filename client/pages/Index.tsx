import { useEffect, useState } from "react";
import { DesignForm, PreviewPanel } from "@/components/PaperStuctureForm";
import { QuestionList } from "@/components/QuestionList";
import { Button } from "@/components/ui/button";
import { exam_pattern } from "@/data/subject_topic";
import { getQuestions, getSubjects, getTopics } from "@/lib/apis";
import { exportPaperPdf, exportPaperExcel } from "@/lib/export";
import { savePaperFunction } from "@/data/static";
import { MarkingScheme, Question } from "@shared/types";
import { useNavigate } from "react-router-dom";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PaperPreview } from "@/components/PaperPreview";

export default function IndexPage() {
  const [title, setTitle] = useState("Question Paper");
  const [gradeId, setGradeId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [subjectIds, setSubjectIds] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>(["basic"]);
  const [types, setTypes] = useState<string[]>(["mcq"]);
  const [marking, setMarking] = useState<MarkingScheme>({ items: [] });
  const [subjectList, setSubjectList] = useState<string[]>([]);
  const [topicList, setTopicList] = useState<string[]>([]);
  const [allQuestions, setAllQuestions] = useState<any>({});
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, any>>({});
  const [topicIds, setTopicIds] = useState<string[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<Record<string, Question[]>>({});
  const [manualTopic, setManualTopic] = useState<string>("");
  const [canSave, setCanSave] = useState(false);
  const [isPreview, setIsPreview] = useState(false);

  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingNav, setPendingNav] = useState<string>("");
  const [subtopicIds, setSubtopicIds] = useState<string[]>([]);

  const navigate = useNavigate();

  // Fetch subjects when grade changes
  useEffect(() => {
    if (!gradeId) return;

    async function fetchSubjects() {
      try {
        const res = await getSubjects(gradeId);
        if (res?.subjects) setSubjectList(res.subjects);
      } catch (err) {
        console.error("Failed to fetch subjects:", err);
      }
    }

    fetchSubjects();
  }, [gradeId]);

  // Fetch topics when subjects change
  useEffect(() => {
    if (subjectIds.length === 0 || !gradeId) {
      setAllQuestions({});
      setTopicIds([]);
      return;
    }
    fetchTopics(gradeId, subjectIds);
  }, [subjectIds.length]);

  const fetchTopics = async (className: string, subjects: string[]) => {
    try {
      const res = await getTopics(className, subjects);
      setTopicList(res?.topics || {});
    } catch (err) {
      console.error("Failed to fetch topics:", err);
    }
  };

  // Fetch questions
  const fetchQuestions = async () => {
    if (!gradeId || !subjectIds.length) return;

    const payload = {
      class: gradeId,
      subjects: subjectIds,
      type: skills,
      mode: types,
      topics: topicIds.length ? topicIds : manualTopic ? [manualTopic] : [],
    };

    try {
      const res = await getQuestions(payload);
      if (!res?.questions) {
        setAllQuestions({});
        return;
      }
      setAllQuestions(res.questions);
      setSelectedAnswers({});
      setSelectedQuestions({});
    } catch (err) {
      console.error("Error fetching questions:", err);
    }
  };

  // Toggle question selection
  const handleToggle = (q: Question, checked: boolean, sub: string) => {
    setSelectedQuestions((prev) => {
      const updated = { ...prev };
      if (checked) {
        if (!updated[sub]) updated[sub] = [];
        const exists = updated[sub].some((item) => item.id === q.id);
        if (!exists) {
          const existingAns = selectedAnswers?.[sub]?.find((a: any) => a.id === q.id)?.answer;
          const questionWithAnswer = existingAns ? { ...q, answer: existingAns } : { ...q };
          updated[sub] = [...updated[sub], questionWithAnswer];
        }
      } else {
        if (updated[sub]) {
          updated[sub] = updated[sub].filter((item) => item.id !== q.id);
          if (updated[sub].length === 0) delete updated[sub];
        }
        setSelectedAnswers((ansPrev) => {
          const ansUpdated = { ...ansPrev };
          if (ansUpdated[sub]) {
            ansUpdated[sub] = ansUpdated[sub].filter((item: any) => item.id !== q.id);
            if (ansUpdated[sub].length === 0) delete ansUpdated[sub];
          }
          return ansUpdated;
        });
      }
      return updated;
    });
    setCanSave(true);
  };

  // Handle answer input
  const handleAnswerChange = (q: Question, answer: string | string[], sub: string) => {
    setSelectedAnswers((prev) => {
      const updated = { ...prev };
      if (!updated[sub]) updated[sub] = [];
      const index = updated[sub].findIndex((item) => item.id === q.id);
      if (index >= 0) updated[sub][index] = { ...updated[sub][index], answer };
      else updated[sub].push({ id: q.id, answer });
      return updated;
    });

    setSelectedQuestions((prev) => {
      const updated = { ...prev };
      if (!updated[sub]) updated[sub] = [];
      const qIndex = updated[sub].findIndex((item) => item.id === q.id);
      if (qIndex >= 0) updated[sub][qIndex] = { ...updated[sub][qIndex], answer };
      else updated[sub] = [...updated[sub], { ...q, answer }];
      return updated;
    });
  };

  // Handle navigation with unsaved changes
  const handleNavigate = (path: string) => {
    if (canSave) {
      setPendingNav(path);
      setShowConfirm(true);
    } else {
      navigate(path);
    }
  };

  const handleSaveThenNavigate = async () => {
    try {
      await savePaperFunction(
        title,
        gradeId,
        sectionId,
        topicIds,
        subjectIds,
        skills,
        types,
        marking,
        selectedQuestions,
        selectedAnswers,
      );
      setCanSave(false);
      setShowConfirm(false);
      navigate(pendingNav);
    } catch (err) {
      console.error("Error saving paper:", err);
    }
  };

  const handleDiscardThenNavigate = () => {
    setCanSave(false);
    setShowConfirm(false);
    navigate(pendingNav);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      {/* HEADER */}
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary" />
            <span className="font-extrabold tracking-tight text-xl">PaperForge</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => handleNavigate("/papers")}>Papers</Button>
            <Button variant="outline" disabled={!Object.keys(selectedQuestions).length} onClick={() => setIsPreview(true)}>Preview</Button>
            <Button variant="outline" onClick={() => exportPaperPdf(title, selectedQuestions, selectedAnswers)} disabled={!Object.keys(selectedQuestions).length}>Export PDF</Button>
            <Button variant="outline" onClick={() => exportPaperExcel(title, selectedQuestions, selectedAnswers)} disabled={!Object.keys(selectedQuestions).length}>Export Excel</Button>
            <Button onClick={async () => {
              await savePaperFunction(title, gradeId, sectionId, topicIds, subjectIds, skills, types, marking, selectedQuestions, selectedAnswers);
              setCanSave(false);
            }} disabled={!canSave}>Save</Button>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="mx-12 py-6 grid gap-6 lg:grid-cols-5">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-1 grid gap-6">
          <DesignForm
            config={{ grades: exam_pattern.grades, sections: [], subjects: [], examTypes: [] }}
            subjectList={subjectList}
            topicList={topicList}
            title={title}
            setTitle={setTitle}
            gradeId={gradeId}
            setGradeId={setGradeId}
            sectionId={sectionId}
            setSectionId={setSectionId}
            subjectIds={subjectIds}
            setSubjectIds={setSubjectIds}
            skills={skills}
            setSkills={setSkills}
            types={types}
            setTypes={setTypes}
            marking={marking}
            setMarking={setMarking}
            canSearch={!!(gradeId && subjectIds.length > 0)}
            fetchQuestions={fetchQuestions}
            selectedQuestions={selectedQuestions}
            setTopicIds={setTopicIds}
            setManualTopic={setManualTopic}
            setSubtopicIds={setSubtopicIds}
          />
          <PreviewPanel
            config={{ grades: exam_pattern.grades, sections: [] }}
            gradeId={gradeId}
            sectionId={sectionId}
            subjectIds={subjectIds}
            selectedQuestions={selectedQuestions}
          />
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-4 grid gap-6">
          <QuestionList
            questions={allQuestions}
            selected={selectedQuestions}
            ans={selectedAnswers}
            onToggle={handleToggle}
            onAnswerChange={handleAnswerChange}
          />
        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t">
        <div className="container py-6 text-xs text-muted-foreground flex items-center justify-between">
          <span>© PaperForge</span>
          <span>Build dynamic question papers with dependent selections and exports.</span>
        </div>
      </footer>

      {/* PREVIEW */}
      {isPreview && (
        <PaperPreview
          selectedQuestions={selectedQuestions}
          setSelectedQuestions={setSelectedQuestions}
          isPreview={isPreview}
          setIsPreview={setIsPreview}
        />
      )}

      {/* CONFIRM DIALOG */}
      <ConfirmDialog
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onSave={handleSaveThenNavigate}
        onDiscard={handleDiscardThenNavigate}
      />
    </div>
  );
}
