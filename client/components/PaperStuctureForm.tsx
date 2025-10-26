import React, { useEffect, useState } from "react";
import { MarkingSchemeForm } from "@/components/MarkingSchemeForm";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { MultiSelect } from "./MultiSelect";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { labelize, transformTopicsToOptions } from "@/lib/utils";
import { exam_pattern } from "@/data/subject_topic";
import { excel_data } from "@/data/excel_data";
import {
  getStandardWithSuffix,
  perSubjectCount,
  totalCount,
} from "@/lib/common";
import { MultiSelectChild } from "./MultiSelectchild";

// ----------------- Excel Utils -----------------
function getFilteredData(gradeId: string | null, subjectIds: string[] = []) {
  if (!gradeId) return [];

  const gradeValue = exam_pattern.grades.find((g) => g.id === gradeId);
  if (!gradeValue) return [];

  const standardWithth = getStandardWithSuffix(gradeValue.name);
  const classData = excel_data?.[0]?.[standardWithth] || [];

  if (!Array.isArray(classData)) return [];

  return subjectIds.length > 0
    ? classData.filter((item) => subjectIds.includes(item.subject))
    : classData;
}

function combineByLevel(data: any[] = []) {
  const combined: Record<
    string,
    {
      basic: string[];
      intermediate: string[];
      advance: string[];
      expert: string[];
    }
  > = {};

  data.forEach((row) => {
    if (!row || !row.subject) return;

    if (!combined[row.subject]) {
      combined[row.subject] = {
        basic: [],
        intermediate: [],
        advance: [],
        expert: [],
      };
    }

    ["basic", "intermediate", "advance", "expert"].forEach((level) => {
      combined[row.subject][level] = [
        ...new Set([...combined[row.subject][level], ...(row[level] || [])]),
      ];
    });
  });

  return combined;
}

const DEFAULT_MARKING: MarkingScheme = {
  items: [
    {
      type: { id: "mcq", name: "MCQ" },
      positive: 2,
      negative: -1,
    },
    {
      type: { id: "short answer", name: "SHORT ANSWER" },
      positive: 1,
      negative: 0,
    },
    {
      type: { id: "long answer", name: "LONG ANSWER" },
      positive: 1,
      negative: 0,
    },
    {
      type: { id: "competency based", name: "COMPETENCY BASED" },
      positive: 1,
      negative: 0,
    },
  ],
};

// ----------------- Design Form -----------------
export function DesignForm({
  title,
  setTitle,
  gradeId,
  setGradeId,
  sectionId,
  setSectionId,
  subjectIds = [],
  setSubjectIds,
  topicIds = [],
  setTopicIds,
  subtopicIds = [],
  setSubtopicIds,
  skills = [],
  setSkills,
  types = [],
  setTypes,
  manualTopic,
  setManualTopic,
  addManualTopic,
  marking,
  setMarking,
  canSearch,
  fetchQuestions,
  subjectList = [],
  topicList = {},
}) {
  const [subjectGrouped, setSubjectGrouped] = useState({});
  const options = transformTopicsToOptions(topicList);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  // ✅ Auto-reset marking if exam pattern changes
  useEffect(() => {
    if (!marking.items?.length) {
      setMarking(DEFAULT_MARKING);
    }
  }, [exam_pattern.exam_types]);

  // Build subject options
  const subjectOptions =
    subjectList?.length > 0
      ? subjectList.map((s) => ({ label: s, value: s }))
      : [];

  const filtered = getFilteredData(gradeId, subjectIds);
  const groupedData = combineByLevel(filtered);

  useEffect(() => {
    setSubjectGrouped(groupedData);
    setSectionId("");
    setTopicIds([]);
    setSubtopicIds([]);
    setManualTopic("");
    setSkills([]);
    setTypes([]);
    setSelectedTopics([])
  }, [gradeId]);

  useEffect(() => {
    setTopicIds(selectedTopics);
  }, [selectedTopics]);

  console.log(selectedTopics);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Design your paper</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Title */}
        <div>
          <Label>Title</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>

        {/* Grade + Section */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Grade</Label>
            <Select onValueChange={setGradeId} value={gradeId}>
              <SelectTrigger>
                <SelectValue placeholder="Select grade" />
              </SelectTrigger>
              <SelectContent>
                {exam_pattern.grades.map((g) => (
                  <SelectItem key={g.id} value={g.id}>
                    {g.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Section</Label>
            <Select onValueChange={setSectionId} value={sectionId}>
              <SelectTrigger>
                <SelectValue placeholder="Select section" />
              </SelectTrigger>
              <SelectContent>
                {exam_pattern.sections.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Subjects */}
        <div>
          <Label>Subjects</Label>
          <MultiSelect
            options={subjectOptions}
            value={subjectIds || []}
            onChange={setSubjectIds}
            placeholder="Select subjects"
            isMultiple={true}
          />
        </div>

        {/* Topics + Subtopics */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Topics</Label>
            <MultiSelectChild
              options={options || {}}
              value={selectedTopics}
              onChange={setSelectedTopics}
              placeholder="Select topics"
            />
          </div>
          <div>
            <Label>Subtopics</Label>
            <MultiSelect
              options={
                exam_pattern.subtopics?.map((st) => ({
                  label: st.name,
                  value: st.id,
                })) || []
              }
              value={subtopicIds || []}
              onChange={setSubtopicIds}
              placeholder="Select subtopics"
              disabled={!topicIds?.length}
            />
          </div>
        </div>

        {/* Skills + Types */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Skill levels</Label>
            <MultiSelect
              options={
                exam_pattern.skill_progression_levels?.map((s) => ({
                  label: s.name,
                  value: s.id,
                })) || []
              }
              value={skills || []}
              onChange={setSkills}
              placeholder="Select skills"
            />
          </div>
          <div>
            <Label>Exam types</Label>
            <MultiSelect
              options={
                exam_pattern.exam_types?.map((t) => ({
                  label: t.name,
                  value: t.id,
                })) || []
              }
              value={types || []}
              onChange={setTypes}
              placeholder="Select types"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="space-y-4">
          <Tabs defaultValue="fetch">
            <TabsList className="grid grid-cols-2 h-auto w-full">
              <TabsTrigger value="fetch">Questions</TabsTrigger>
              <TabsTrigger value="marking">Marking</TabsTrigger>
            </TabsList>

            {/* 🔹 Fetch Questions Tab */}
            <TabsContent value="fetch" className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Add manual topic"
                  value={manualTopic || ""}
                  onChange={(e) => setManualTopic(e.target.value)}
                />
                <Button
                  variant="secondary"
                  onClick={addManualTopic}
                  disabled={!manualTopic}
                >
                  Add
                </Button>
              </div>

              {subjectIds.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Selected Topics:</h4>
                  <ul className="list-disc list-inside text-sm">
                    {subjectIds.map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                </div>
              )}

              <Button className="w-full" onClick={fetchQuestions}>
                Fetch questions
              </Button>
            </TabsContent>

            {/* 🔹 Marking Scheme Tab */}
            <TabsContent value="marking">
              <MarkingSchemeForm
                types={exam_pattern.exam_types}
                value={marking}
                onChange={setMarking}
              />
            </TabsContent>
          </Tabs>
        </div>
        {/* <Tabs defaultValue="fetch">
          <TabsList className="grid grid-cols-2 h-auto w-full">
            <TabsTrigger value="fetch">Questions</TabsTrigger>
            <TabsTrigger value="marking">Marking</TabsTrigger>
          </TabsList>
          <TabsContent value="fetch" className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="Add manual topic"
                value={manualTopic || ""}
                onChange={(e) => setManualTopic(e.target.value)}
              />
              <Button
                variant="secondary"
                onClick={addManualTopic}
                disabled={!manualTopic || !subjectIds?.length}
              >
                Add
              </Button>
            </div>
            <Button className="w-full" onClick={fetchQuestions}>
              Fetch questions
            </Button>
          </TabsContent>
          <TabsContent value="marking">
            <MarkingSchemeForm
              types={exam_pattern.exam_types}
              value={marking}
              onChange={setMarking}
            />
          </TabsContent>
        </Tabs> */}
      </CardContent>
    </Card>
  );
}

// ----------------- Preview Panel -----------------
export function PreviewPanel({
  gradeId,
  sectionId,
  subjectIds = [],
  topicIds = [],
  subtopicIds = [],
  selectedQuestions = [],
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Preview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-sm text-muted-foreground">
          {gradeId && sectionId
            ? `${exam_pattern.grades.find((g) => g.id === gradeId)?.name || ""} · ${
                exam_pattern.sections.find((s) => s.id === sectionId)?.name ||
                ""
              }`
            : "Select grade and section"}
        </div>

        {/* Subjects */}
        <div className="space-y-2">
          <div className="text-xs font-medium">Subjects</div>
          <div className="flex flex-wrap gap-2">
            {(subjectIds || []).map((id) => (
              <Badge key={id} variant="secondary">
                {labelize(id, exam_pattern.subjects)}
              </Badge>
            ))}
          </div>
        </div>

        {/* Topics */}
        <div className="space-y-2">
          <div className="text-xs font-medium">Topics</div>
          <div className="flex flex-wrap gap-2">
            {(topicIds || []).map((id) => (
              <Badge key={id} variant="secondary">
                {labelize(id, exam_pattern.topics)}
              </Badge>
            ))}
          </div>
        </div>

        {/* Subtopics */}
        <div className="space-y-2">
          <div className="text-xs font-medium">Subtopics</div>
          <div className="flex flex-wrap gap-2">
            {(subtopicIds || []).map((id) => (
              <Badge key={id} variant="secondary">
                {labelize(id, exam_pattern.subtopics)}
              </Badge>
            ))}
          </div>
        </div>

        <Separator />
        <div className="flex justify-between text-sm">
          <span>Selected questions</span>
          <span className="font-semibold">
            {totalCount(selectedQuestions) || 0}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
