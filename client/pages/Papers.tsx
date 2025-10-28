import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { MultiSelect } from "@/components/MultiSelect";
import {
  deletePaper,
  getAllPapers,
  getPapersByFilter,
  getSubjects,
} from "@/lib/apis";
import PaperTable from "@/components/PaperTable";
import { exam_pattern } from "@/data/subject_topic";
import { PaperPreview } from "@/components/PaperPreview";
import { savePaperFunction } from "@/data/static";
import { DynamicConfirmModal } from "@/components/DynamicConfirmModal";
import DynamicHeader from "@/components/DynamicHeader";

const Papers = () => {
  const [form, setForm] = useState({
    gradeId: "",
    sectionId: "",
    subjectIds: [],
    topicIds: [],
    skills: [],
    types: [],
  });

  const [subjectList, setSubjectList] = useState([]);
  const [topicList, setTopicList] = useState([]);
  const [papers, setPapers] = useState([]);
  const [isPreview, setIsPreview] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState({});
  const [selectPaper, setSelectPaper] = useState({});
  const [confirmPaper, setConfirmPaper] = useState(null);
  const navigate = useNavigate();

  const updateForm = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // Fetch subjects when grade changes
  useEffect(() => {
    if (!form.gradeId) {
      setSubjectList([]);
      setTopicList([]);
      return;
    }

    const fetchSubjects = async () => {
      try {
        const response = await getSubjects(form.gradeId);
        setSubjectList(response?.subjects || []);
      } catch (error) {
        console.error("Failed to fetch subjects:", error);
        setSubjectList([]);
      }
    };

    fetchSubjects();
  }, [form.gradeId]);

  // Fetch topics based on selected subjects safely
  useEffect(() => {
    if (!form.subjectIds.length) {
      setTopicList([]);
      return;
    }

    if (!exam_pattern.topicsBySubject) {
      setTopicList([]);
      return;
    }

    const topics = form.subjectIds.flatMap((s) => {
      // safe: only run Object.keys if topicsBySubject exists
      const key = Object.keys(exam_pattern.topicsBySubject).find(
        (k) => k.toLowerCase() === s.toLowerCase(),
      );
      return key ? exam_pattern.topicsBySubject[key] : [];
    });

    setTopicList(topics);
  }, [form.subjectIds]);

  // Fetch all papers on mount
  useEffect(() => {
    const fetchPapers = async () => {
      try {
        const response = await getAllPapers();
        if (response?.status === "success") {
          setPapers(response.data || []);
        } else {
          setPapers([]);
        }
      } catch (error) {
        console.error("Failed to fetch papers:", error);
        setPapers([]);
      }
    };

    // fetchPapers();
    handleFilter();
  }, []);

  // Clear all filters
  const clearFilters = () => {
    setForm({
      gradeId: "",
      sectionId: "",
      subjectIds: [],
      topicIds: [],
      skills: [],
      types: [],
    });
    handleFilter();
  };

  const handleFilter = async () => {
    try {
      const response = await getPapersByFilter(form);
      if (response?.status === "success") {
        setPapers(response.data || []);
      } else {
        setPapers([]);
      }
    } catch (error) {
      console.error("Failed to fetch papers:", error);
      setPapers([]);
    }
  };

  const handleEdit = (id) => navigate(`/papers/${id}`);
  const handlePreview = (data) => {
    setIsPreview(true);
    setSelectPaper(data);
    setSelectedQuestions(data.selectedQuestions || {});
  };

  const handleDelete = async () => {
    console.log("Deleting Paper ID:", confirmPaper);
    try {
      const responce = await deletePaper(confirmPaper.id);
      console.log(responce);
      const { status } = responce;
      if (status == "success") {
        setConfirmPaper(null);
        handleFilter();
      }
    } catch (error) {
      console.log(error);
    }
  };
  console.log(confirmPaper);
  // Map arrays to { label, value } for MultiSelect
  const subjectOptions = subjectList.map((s) => ({ label: s, value: s }));
  const topicOptions = topicList.map((t) => ({ label: t, value: t }));
  const skillOptions = exam_pattern.skill_progression_levels.map((s) => ({
    label: s.name,
    value: s.id,
  }));
  const typeOptions = exam_pattern.exam_types.map((t) => ({
    label: t.name,
    value: t.id,
  }));

  const updatePaper = async (questions) => {
    console.log("Selected Questions:", questions);

    const payload = {
      title: selectPaper.title,
      gradeId: selectPaper.gradeId,
      sectionId: selectPaper.sectionId,
      topicIds: selectPaper.topicIds,
      subjectIds: selectPaper.subjectIds,
      skills: selectPaper.skills,
      types: selectPaper.types,
      marking: selectPaper.marking,
      selectedQuestions: questions, // ✅ use passed value
      selectedAnswers: selectPaper.selectedAnswers,
      isEdit: true,
      paperId: selectPaper.id,
    };
    try {
      const response = await savePaperFunction(
        payload.title,
        payload.gradeId,
        payload.sectionId,
        payload.topicIds,
        payload.subjectIds,
        payload.skills,
        payload.types,
        payload.marking,
        payload.selectedQuestions,
        payload.selectedAnswers,
        payload.isEdit,
        payload.paperId,
      );

      const { status, data } = response;
      if (status == "success") {
        handleFilter();
      }
    } catch (error) {
      console.log(error);
    }
  };

  console.log(confirmPaper);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <div className="container py-6 space-y-4">
        {/* Header */}
        {/* <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <div className="h-8 w-8 rounded-md bg-primary" />
            Saved Papers
          </h1>
          <Link to="/">
            <Button variant="ghost">Create Paper</Button>
          </Link>
        </div> */}
        <DynamicHeader
          subTitle="Saved Papers"
          actions={[
            { label: "Create Paper", onClick: () => navigate("/") }
          ]}
        />

        {/* Filters */}
        <Card className="shadow-sm">
          <CardContent className="pt-6 space-y-4">
            <div className="grid md:grid-cols-3 gap-3">
              {/* Grade */}
              <div>
                <Label>Grade</Label>
                <Select
                  onValueChange={(val) => updateForm("gradeId", val)}
                  value={form.gradeId}
                >
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

              {/* Section */}
              <div>
                <Label>Section</Label>
                <Select
                  onValueChange={(val) => updateForm("sectionId", val)}
                  value={form.sectionId}
                >
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

              {/* Subjects */}
              <div>
                <Label>Subjects</Label>
                <MultiSelect
                  options={subjectOptions}
                  value={form.subjectIds}
                  onChange={(v) => updateForm("subjectIds", v)}
                  placeholder="Select subjects"
                  isMultiple
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-3">
              {/* Topics */}
              <div>
                <Label>Topics</Label>
                <MultiSelect
                  options={topicOptions}
                  value={form.topicIds}
                  onChange={(v) => updateForm("topicIds", v)}
                  placeholder="Select topics"
                  disabled={!form.subjectIds.length}
                  isChild
                />
              </div>

              {/* Skills */}
              <div>
                <Label>Skills</Label>
                <MultiSelect
                  options={skillOptions}
                  value={form.skills}
                  onChange={(v) => updateForm("skills", v)}
                  placeholder="Select skills"
                />
              </div>

              {/* Exam Types */}
              <div>
                <Label>Exam Types</Label>
                <MultiSelect
                  options={typeOptions}
                  value={form.types}
                  onChange={(v) => updateForm("types", v)}
                  placeholder="Select types"
                />
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="mt-3 flex gap-2">
              <Button variant="outline" onClick={clearFilters}>
                Clear filters
              </Button>
              <Button onClick={handleFilter}>Apply filters</Button>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">
              Papers Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <div className="overflow-x-auto">
              <PaperTable
                papers={papers}
                handleEdit={handleEdit}
                handlePreview={handlePreview}
                handleDelete={(data) => setConfirmPaper(data)}
              />
            </div>
          </CardContent>
        </Card>
      </div>
      {
        <PaperPreview
          selectedQuestions={selectedQuestions}
          setSelectedQuestions={setSelectedQuestions}
          isPreview={isPreview}
          setIsPreview={setIsPreview}
          isEdit={true}
          updatePaper={updatePaper}
        />
      }
      <DynamicConfirmModal
        open={confirmPaper != null}
        setOpen={() => setConfirmPaper(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default Papers;
