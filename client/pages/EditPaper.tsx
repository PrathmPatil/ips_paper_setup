import { useEffect, useState } from "react";
import { DesignForm, PreviewPanel } from "@/components/PaperStuctureForm";
import { QuestionList } from "@/components/QuestionList";
import { Button } from "@/components/ui/button";
import { exam_pattern } from "@/data/subject_topic";
import { getQuestions, getSubjects, getTopics, getPaperById } from "@/lib/apis";
import { exportPaperPdf, exportPaperExcel } from "@/lib/export";
import { savePaperFunction } from "@/data/static";
import { MarkingScheme, Question } from "@shared/types";
import { PaperPreview } from "@/components/PaperPreview";
import { useNavigate, useParams } from "react-router-dom";
import { DynamicConfirmModal } from "@/components/DynamicConfirmModal";

export default function EditPaper() {
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
  const [subtopicIds, setSubtopicIds] = useState<string[]>([]);

  const { paperId } = useParams(); // assuming /paper/:paperId route
  const navigate = useNavigate();

  // ------------------ LOAD PAPER DATA ------------------
  useEffect(() => {
    if (!paperId) return;

    async function fetchPaper() {
      try {
        const res = await getPaperById(paperId);
        const paper = res?.data;
        if (!paper) return;

        // populate states
        setTitle(paper.title);
        setGradeId(String(paper.gradeId));
        console.log(paper.gradeId)
        setSectionId(String(paper.sectionId));
        setSubjectIds(paper.subjectIds);
        setTopicIds(paper.topicIds);
        setSkills(paper.skills?.length ? paper.skills : ["basic"]);
        setTypes(paper.types?.length ? paper.types : ["mcq"]);
        setMarking({ items: paper.marking });

        setSelectedQuestions(paper.selectedQuestions || {});
        setSelectedAnswers(paper.selectedAnswers || {});
        setCanSave(false);
      } catch (err) {
        console.error("Failed to load paper:", err);
      }
    }

    fetchPaper();
  }, [paperId]);
  console.log(paperId,gradeId)

  // ------------------ FETCH SUBJECTS ------------------
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

  // ------------------ FETCH TOPICS ------------------
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
      setTopicList(res?.topics || []);
    } catch (err) {
      console.error("Failed to fetch topics:", err);
    }
  };

  // ------------------ FETCH QUESTIONS ------------------
  const fetchQuestions = async (append = false) => {
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
        if (!append) setAllQuestions({});
        return;
      }

      const merged = append
        ? mergeQuestions(allQuestions, res.questions)
        : res.questions;

      setAllQuestions(merged);
    } catch (err) {
      console.error("Error fetching questions:", err);
    }
  };

  // ------------------ MERGE QUESTIONS ------------------
  const mergeQuestions = (oldData: any, newData: any) => {
    const merged = { ...oldData };
    newData.forEach((group: any) => {
      if (merged[group.subject]) {
        const existingIds = new Set(merged[group.subject].map((q: any) => q.id));
        const uniqueNew = group.questions.filter((q: any) => !existingIds.has(q.id));
        merged[group.subject] = [...merged[group.subject], ...uniqueNew];
      } else {
        merged[group.subject] = group.questions;
      }
    });
    return merged;
  };

  // ------------------ SELECT & ANSWER HANDLERS ------------------
  const handleToggle = (q: Question, checked: boolean, sub: string) => {
    setSelectedQuestions((prev) => {
      const updated = { ...prev };
      if (checked) {
        if (!updated[sub]) updated[sub] = [];
        if (!updated[sub].some((item) => item.id === q.id)) {
          updated[sub] = [...updated[sub], q];
        }
      } else {
        if (updated[sub]) {
          updated[sub] = updated[sub].filter((item) => item.id !== q.id);
          if (updated[sub].length === 0) delete updated[sub];
        }
      }
      return updated;
    });
    setCanSave(true);
  };

  const handleAnswerChange = (q: Question, answer: string | string[], sub: string) => {
    setSelectedAnswers((prev) => {
      const updated = { ...prev };
      if (!updated[sub]) updated[sub] = [];
      const idx = updated[sub].findIndex((item: any) => item.id === q.id);
      if (idx >= 0) updated[sub][idx].answer = answer;
      else updated[sub].push({ id: q.id, answer });
      return updated;
    });
  };

  // ------------------ SAVE HANDLER ------------------
  const handleSavePaper = async () => {
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
      selectedAnswers
    );
    setCanSave(false);
  };

  // ------------------ NAVIGATION WITH CONFIRMATION ------------------
  const handleGoToPapers = () => {
    if (canSave) setShowConfirm(true);
    else navigate("/papers");
  };

  // ------------------ RENDER ------------------
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      {/* HEADER */}
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
        <div className="container py-4 flex items-center justify-between">
          <h1 className="font-extrabold tracking-tight text-xl">PaperForge</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleGoToPapers}>Papers</Button>
            <Button variant="outline" onClick={() => fetchQuestions(true)}>Add More Questions</Button>
            <Button variant="outline" onClick={() => setIsPreview(true)} disabled={!Object.keys(selectedQuestions).length}>Preview</Button>
            <Button variant="outline" onClick={() => exportPaperPdf(title, selectedQuestions, selectedAnswers)} disabled={!Object.keys(selectedQuestions).length}>Export PDF</Button>
            <Button variant="outline" onClick={() => exportPaperExcel(title, selectedQuestions, selectedAnswers)} disabled={!Object.keys(selectedQuestions).length}>Export Excel</Button>
            <Button onClick={handleSavePaper} disabled={!canSave}>Save</Button>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="container py-6 grid gap-6 lg:grid-cols-3">
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
          <PreviewPanel config={{ grades: exam_pattern.grades, sections: [] }} gradeId={gradeId} sectionId={sectionId} subjectIds={subjectIds} selectedQuestions={selectedQuestions} />
        </div>

        <div className="lg:col-span-2 grid gap-6">
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
          <span>Dynamic question papers with save & merge.</span>
        </div>
      </footer>

      {/* MODALS */}
      <DynamicConfirmModal
        open={showConfirm}
        setOpen={setShowConfirm}
        title="Unsaved Paper"
        description="You have unsaved changes. Do you want to save before leaving?"
        confirmText="Save"
        cancelText="Discard"
        onConfirm={() => {
          handleSavePaper();
          navigate("/papers");
        }}
      />

      {isPreview && (
        <PaperPreview selectedQuestions={selectedQuestions} setSelectedQuestions={setSelectedQuestions} isPreview={isPreview} setIsPreview={setIsPreview} />
      )}
    </div>
  );
}
