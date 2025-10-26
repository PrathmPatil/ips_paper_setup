import { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { MultiSelect, MultiSelectOption } from "@/components/MultiSelect";
import { MarkingSchemeForm } from "@/components/MarkingSchemeForm";
import { QuestionList } from "@/components/QuestionList";
import { exportPaperExcel, exportPaperPdf } from "@/lib/export";
import {
  ExamPattern,
  ExamType,
  MarkingScheme,
  Question,
  QuestionSearchFilters,
  SkillLevel,
} from "@shared/types";
import { defaultExamPattern } from "@/lib/staticConfig";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

function labelize(id: string) {
  return id.replace(/_/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}

export default function Index() {
  const [config, setConfig] = useState<ExamPattern | null>(defaultExamPattern);
  const [gradeId, setGradeId] = useState<string>("");
  const [sectionId, setSectionId] = useState<string>("");
  const [subjectIds, setSubjectIds] = useState<string[]>([]);
  const [topicIds, setTopicIds] = useState<string[]>([]);
  const [subtopicIds, setSubtopicIds] = useState<string[]>([]);
  const [skills, setSkills] = useState<SkillLevel[]>([]);
  const [types, setTypes] = useState<ExamType[]>([]);
  const [marking, setMarking] = useState<MarkingScheme>({ items: [] });
  const [manualTopic, setManualTopic] = useState<string>("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, string | string[] | undefined>
  >({});
  const [title, setTitle] = useState<string>("Question Paper");
  const canSearch = gradeId && sectionId && subjectIds.length > 0;

  // modal for removing selected question
  const [modalOpen, setModalOpen] = useState(false);
  const [modalQuestion, setModalQuestion] = useState<Question | null>(null);
  const [previewPaperModal, setPreviewPaperModal] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // prefill once using the static config; if server config arrives it will override
  const prefilled = useRef(false);

  // If navigation provided an editPaperId, load that paper into the create form
  useEffect(() => {
    const editPaperId = (location.state as any)?.editPaperId;
    if (!editPaperId) return;

    (async () => {
      try {
        const res = await fetch(`/api/papers/${editPaperId}`);
        if (!res.ok) return;
        const data = await res.json();
        // populate form
        setTitle(data.title ?? "Question Paper");
        setGradeId(data.gradeId ?? "");
        setSectionId(data.sectionId ?? "");
        setSubjectIds(data.subjectIds ?? []);
        setMarking(data.marking ?? marking);

        // selections -> selectedAnswers
        const selMap: Record<string, string | string[] | undefined> = {};
        data.selections?.forEach((s: any) => {
          selMap[s.questionId] = s.answer ?? "";
        });
        setSelectedAnswers(selMap);

        // fetch question details
        const qids = data.selections?.map((s: any) => s.questionId) ?? [];
        const qPromises = qids.map((qid: string) =>
          fetch(`/api/questions/${qid}`)
            .then((r) => (r.ok ? r.json() : null))
            .catch(() => null),
        );
        const qResults = (await Promise.all(qPromises)).filter(
          Boolean,
        ) as Question[];
        setQuestions(qResults);

        // clear navigation state so re-entering doesn't reload unexpectedly
        try {
          navigate(location.pathname, { replace: true, state: {} });
        } catch (e) {
          // ignore
        }
      } catch (err) {
        console.error("Failed to load paper for editing:", err);
      }
    })();
  }, [location.state]);

  useEffect(() => {
    // Set initial marking from static config
    setMarking(defaultExamPattern.defaultMarkingScheme);

    // Attempt to fetch server config and override
    fetch("/api/config")
      .then((r) => r.json())
      .then((json: ExamPattern) => {
        setConfig(json);
        setMarking(json.defaultMarkingScheme);
      })
      .catch(() => {
        // ignore; we'll use static config
      });
  }, []);

  useEffect(() => {
    if (!config || prefilled.current) return;
    prefilled.current = true;
    const json = config;

    // Prefill dummy selections using the first available items
    const g = json.grades?.[0]?.id ?? "";
    const s = json.sections?.[0]?.id ?? "";
    setGradeId(g);
    setSectionId(s);

    const subjKey = `${g}:${s}`;
    const subs = json.subjectsByGradeSection?.[subjKey] ?? [];
    const selectedSub = subs.length ? [subs[0]] : [];
    setSubjectIds(selectedSub);

    // topics and subtopics for the first subject
    const topics = selectedSub.flatMap(
      (sid) => json.topicsBySubject?.[sid] ?? [],
    );
    const selectedTopic = topics.length ? [topics[0]] : [];
    setTopicIds(selectedTopic);

    const subtopics = selectedTopic.flatMap(
      (tid) => json.subtopicsByTopic?.[tid] ?? [],
    );
    const selectedSubtopic = subtopics.length ? [subtopics[0]] : [];
    setSubtopicIds(selectedSubtopic);

    // default to first two skills and exam types (if available)
    setSkills(json.skillLevels?.slice(0, 2) ?? []);
    setTypes(json.examTypes?.slice(0, 2) ?? []);

    // Fetch questions for these dummy filters and preselect the first question
    (async () => {
      try {
        const filters: QuestionSearchFilters = {
          gradeId: g,
          sectionId: s,
          subjectIds: selectedSub,
          topicIds: selectedTopic,
          subtopicIds: selectedSubtopic,
          skills: json.skillLevels?.slice(0, 2) as SkillLevel[],
          types: json.examTypes?.slice(0, 2) as ExamType[],
        };
        const res = await fetch("/api/questions/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(filters),
        });
        const qjson = await res.json();
        const qs = (qjson.questions as Question[]) ?? [];
        setQuestions(qs);
        if (qs.length > 0) {
          // preselect up to first 3 questions for convenience
          const sel: Record<string, string | string[] | undefined> = {};
          qs.slice(0, 3).forEach((q) => {
            sel[q.id] = q.type === "MCQ" ? (q.options?.[0] ?? "") : "";
          });
          setSelectedAnswers(sel);
        }
      } catch (err) {
        console.error("Failed to load dummy questions:", err);
      }
    })();
  }, [config]);

  const subjectOptions: MultiSelectOption[] = useMemo(() => {
    if (!config || !gradeId || !sectionId) return [];
    const key = `${gradeId}:${sectionId}`;
    const ids = config.subjectsByGradeSection[key] ?? [];
    return ids.map((id) => ({ value: id, label: labelize(id) }));
  }, [config, gradeId, sectionId]);

  const topicOptions: MultiSelectOption[] = useMemo(() => {
    if (!config || subjectIds.length === 0) return [];
    const all: string[] = [];
    subjectIds.forEach((sid) => {
      const arr = config.topicsBySubject[sid] ?? [];
      all.push(...arr);
    });
    const unique = Array.from(new Set(all));
    return unique.map((id) => ({ value: id, label: labelize(id) }));
  }, [config, subjectIds]);

  const subtopicOptions: MultiSelectOption[] = useMemo(() => {
    if (!config || topicIds.length === 0) return [];
    const all: string[] = [];
    topicIds.forEach((tid) => {
      const arr = config.subtopicsByTopic[tid] ?? [];
      all.push(...arr);
    });
    const unique = Array.from(new Set(all));
    return unique.map((id) => ({ value: id, label: labelize(id) }));
  }, [config, topicIds]);

  const skillOptions: MultiSelectOption[] = useMemo(
    () =>
      config ? config.skillLevels.map((s) => ({ value: s, label: s })) : [],
    [config],
  );
  const typeOptions: MultiSelectOption[] = useMemo(
    () =>
      config
        ? config.examTypes.map((t) => ({
            value: t,
            label: t.replace(/_/g, " "),
          }))
        : [],
    [config],
  );

  useEffect(() => {
    // reset downstream selections when upstream changes
    setSubjectIds([]);
    setTopicIds([]);
    setSubtopicIds([]);
    setSkills([]);
    setTypes([]);
    setQuestions([]);
    setSelectedAnswers({});
  }, [gradeId, sectionId]);

  useEffect(() => {
    setTopicIds([]);
    setSubtopicIds([]);
    setQuestions([]);
    setSelectedAnswers({});
  }, [subjectIds]);

  useEffect(() => {
    setSubtopicIds([]);
    setQuestions([]);
    setSelectedAnswers({});
  }, [topicIds]);

  const onToggleQuestion = (q: Question, checked: boolean) => {
    setSelectedAnswers((prev) => {
      const next = { ...prev };
      if (checked) {
        if (!(q.id in next)) next[q.id] = "";
      } else {
        delete next[q.id];
      }
      return next;
    });
  };

  const onAnswerChange = (q: Question, answer: string | string[]) => {
    setSelectedAnswers((prev) => ({ ...prev, [q.id]: answer }));
  };

  const addManualTopic = () => {
    if (!manualTopic || subjectIds.length === 0 || !config) return;
    const t = manualTopic.trim().toLowerCase().replace(/\s+/g, "_");
    const next = { ...config.topicsBySubject };
    subjectIds.forEach((sid) => {
      const arr = next[sid] ?? [];
      if (!arr.includes(t)) arr.push(t);
      next[sid] = Array.from(new Set(arr));
    });
    setConfig({ ...config, topicsBySubject: next });
    setManualTopic("");
  };

  const fetchQuestions = async () => {
    const filters: QuestionSearchFilters = {
      gradeId,
      sectionId,
      subjectIds,
      topicIds,
      subtopicIds,
      skills,
      types,
    };
    const res = await fetch("/api/questions/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(filters),
    });
    const json = await res.json();
    setQuestions(json.questions as Question[]);
  };

  const savePaper = async () => {
    const payload = {
      title,
      gradeId,
      sectionId,
      subjectIds,
      marking,
      selections: Object.keys(selectedAnswers).map((qid) => ({
        questionId: qid,
        answer: selectedAnswers[qid],
      })),
    };

    try {
      const res = await fetch("/api/papers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error("Failed to save paper", err);
        alert("Failed to save paper");
        return;
      }
      const saved = await res.json();
      // Navigate to papers list to show saved papers
      navigate("/papers");
    } catch (err) {
      console.error("Save error", err);
      alert("Failed to save paper");
    }
  };

  const selectedQuestions = useMemo(
    () => questions.filter((q) => q.id in selectedAnswers),
    [questions, selectedAnswers],
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary" />
            <span className="font-extrabold tracking-tight text-xl">
              PaperForge
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setPreviewPaperModal(true)}
              disabled={selectedQuestions.length === 0}
            >
              Preview
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                exportPaperPdf(title, selectedQuestions, selectedAnswers)
              }
              disabled={selectedQuestions.length === 0}
            >
              Export PDF
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                exportPaperExcel(title, selectedQuestions, selectedAnswers)
              }
              disabled={selectedQuestions.length === 0}
            >
              Export Excel
            </Button>
            <Button
              onClick={savePaper}
              disabled={!canSearch || selectedQuestions.length === 0}
            >
              Save
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Design your paper</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Grade</Label>
                  <Select onValueChange={(v) => setGradeId(v)} value={gradeId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select grade" />
                    </SelectTrigger>
                    <SelectContent>
                      {config?.grades.map((g) => (
                        <SelectItem key={g.id} value={g.id}>
                          {g.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Section</Label>
                  <Select
                    onValueChange={(v) => setSectionId(v)}
                    value={sectionId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select section" />
                    </SelectTrigger>
                    <SelectContent>
                      {config?.sections.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Subjects</Label>
                <MultiSelect
                  options={subjectOptions}
                  value={subjectIds}
                  onChange={setSubjectIds}
                  placeholder="Select subjects"
                  disabled={!gradeId || !sectionId}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Topics</Label>
                  <MultiSelect
                    options={topicOptions}
                    value={topicIds}
                    onChange={setTopicIds}
                    placeholder="Select topics"
                    disabled={subjectIds.length === 0}
                  />
                </div>
                <div>
                  <Label>Subtopics</Label>
                  <MultiSelect
                    options={subtopicOptions}
                    value={subtopicIds}
                    onChange={setSubtopicIds}
                    placeholder="Select subtopics"
                    disabled={topicIds.length === 0}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Skill levels</Label>
                  <MultiSelect
                    options={skillOptions}
                    value={skills}
                    onChange={setSkills}
                    placeholder="Select skills"
                  />
                </div>
                <div>
                  <Label>Exam types</Label>
                  <MultiSelect
                    options={typeOptions}
                    value={types}
                    onChange={setTypes}
                    placeholder="Select types"
                  />
                </div>
              </div>

              <Tabs defaultValue="fetch">
                <TabsList className="grid grid-cols-2 w-full">
                  <TabsTrigger value="fetch">Questions</TabsTrigger>
                  <TabsTrigger value="marking">Marking</TabsTrigger>
                </TabsList>
                <TabsContent value="fetch" className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add manual topic"
                      value={manualTopic}
                      onChange={(e) => setManualTopic(e.target.value)}
                    />
                    <Button
                      variant="secondary"
                      onClick={addManualTopic}
                      disabled={!manualTopic || subjectIds.length === 0}
                    >
                      Add
                    </Button>
                  </div>
                  <Button
                    className="w-full"
                    onClick={fetchQuestions}
                    disabled={!canSearch}
                  >
                    Fetch questions
                  </Button>
                </TabsContent>
                <TabsContent value="marking">
                  {config && (
                    <MarkingSchemeForm
                      types={config.examTypes}
                      value={marking}
                      onChange={setMarking}
                    />
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-muted-foreground">
                {config && gradeId && sectionId
                  ? `${config.grades.find((g) => g.id === gradeId)?.name} �� ${config.sections.find((s) => s.id === sectionId)?.name}`
                  : "Select grade and section"}
              </div>
              <div className="space-y-2">
                <div className="text-xs font-medium">Subjects</div>
                <div className="flex flex-wrap gap-2">
                  {subjectIds.map((id) => (
                    <Badge key={id} variant="secondary">
                      {labelize(id)}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-xs font-medium">Topics</div>
                <div className="flex flex-wrap gap-2">
                  {topicIds.map((id) => (
                    <Badge key={id} variant="secondary">
                      {labelize(id)}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-xs font-medium">Subtopics</div>
                <div className="flex flex-wrap gap-2">
                  {subtopicIds.map((id) => (
                    <Badge key={id} variant="secondary">
                      {labelize(id)}
                    </Badge>
                  ))}
                </div>
              </div>
              <Separator />
              <div className="flex justify-between text-sm">
                <span>Selected questions</span>
                <span className="font-semibold">
                  {selectedQuestions.length}
                </span>
              </div>
            </CardContent>
          </Card>

          <Dialog open={previewPaperModal} onOpenChange={setPreviewPaperModal}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Selected Questions</DialogTitle>
                <DialogDescription>
                  Are you sure you want to review the question from the paper?
                </DialogDescription>
              </DialogHeader>
              <div className="pt-2">
                <Card>
                  <CardContent>
                    <div className="space-y-3">
                      {(() => {
                        const bySubject = new Map<string, Question[]>();
                        selectedQuestions.forEach((q) => {
                          const arr = bySubject.get(q.subjectId) ?? [];
                          arr.push(q);
                          bySubject.set(q.subjectId, arr);
                        });

                        const skillOrder: SkillLevel[] = [
                          "BASIC",
                          "INTERMEDIATE",
                          "ADVANCED",
                          "EXPERT",
                        ];

                        return Array.from(bySubject.entries()).map(
                          ([sid, qs]) => (
                            <div key={sid} className="border rounded-md p-3">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <Badge variant="secondary">
                                    {labelize(sid)}
                                  </Badge>
                                  <div className="text-sm text-muted-foreground">
                                    {qs.length} selected
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-2">
                                {skillOrder.map((skill) => {
                                  const list = qs.filter(
                                    (q) => q.skill === skill,
                                  );
                                  if (!list.length) return null;
                                  return (
                                    <div key={skill} className="p-2">
                                      <div className="text-sm font-medium">
                                        {skill} ({list.length})
                                      </div>
                                      <div className="mt-2 space-y-2">
                                        {list.map((q) => (
                                          <div
                                            key={q.id}
                                            className="flex items-center justify-between border rounded p-2"
                                          >
                                            <div className="text-sm">
                                              {q.text}
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <Button
                                                variant="outline"
                                                onClick={() => {
                                                  setModalQuestion(q);
                                                  setModalOpen(true);
                                                }}
                                              >
                                                Remove
                                              </Button>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ),
                        );
                      })()}
                    </div>
                  </CardContent>
                </Card>{" "}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Remove confirmation modal */}
          <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Remove question</DialogTitle>
                <DialogDescription>
                  Are you sure you want to remove this question from the paper?
                </DialogDescription>
              </DialogHeader>
              <div className="pt-2">
                <div className="text-sm">{modalQuestion?.text}</div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (modalQuestion) {
                      setSelectedAnswers((prev) => {
                        const next = { ...prev };
                        delete next[modalQuestion.id];
                        return next;
                      });
                    }
                    setModalOpen(false);
                  }}
                >
                  Remove
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="lg:col-span-2 grid gap-6">
          <QuestionList
            questions={questions}
            selected={selectedAnswers}
            onToggle={onToggleQuestion}
            onAnswerChange={onAnswerChange}
            onSkillChange={(q, newSkill) => {
              setQuestions((prev) =>
                prev.map((item) =>
                  item.id === q.id ? { ...item, skill: newSkill } : item,
                ),
              );
            }}
          />
        </div>
      </main>

      <footer className="border-t">
        <div className="container py-6 text-xs text-muted-foreground flex items-center justify-between">
          <span>© PaperForge</span>
          <span>
            Build dynamic question papers with dependent selections and exports.
          </span>
        </div>
      </footer>
    </div>
  );
}
