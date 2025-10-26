import React, { useState } from "react";
import * as XLSX from "xlsx";
import { transformExcelDataToDBFormat } from "@/lib/common";
import { saveQuestions } from "@/lib/apis";
import {
  readExcelAllSheets,
  readExcelAllSheetsGroupedDynamic,
} from "@/lib/readExcelAllSheets";
import UploadQuestions from "@/components/UploadQuestions";
import UploadImageFolder from "@/components/UploadQuestions";

const Dashboard: React.FC = () => {
  const [paperFiles, setPaperFiles] = useState<File[]>([]);
  const [paperData, setPaperData] = useState<any[]>([]);
  const [className, setClassName] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  const safeString = (val: any) =>
    val === undefined || val === null ? "" : String(val).trim();

  /** ✅ Extract class name and subject from filename */
  const extractInfoFromFilename = (filename: string) => {
    const nameWithoutExt = filename.split(".")[0].trim();
    const parts = nameWithoutExt.split(" ");
    const classIndex = parts.findIndex((p) => p.toLowerCase() === "class");

    let className = "";
    let subject = "";

    if (classIndex !== -1 && parts[classIndex + 1]) {
      className = `class_${parts[classIndex + 1]}`; // e.g. class_7
      subject = parts
        .slice(classIndex + 2)
        .join(" ")
        .trim()
        .toLowerCase(); // ✅ lowercase subject
    } else {
      className = "unknown_class";
      subject = "unknown_subject";
    }

    return { className, subject };
  };

  /** ✅ Reads a single Excel file and returns clean JSON (excluding empty Question Text) */
  const readExcelFile = (file: File): Promise<any[]> => {
    return new Promise((resolve) => {
      const { className, subject } = extractInfoFromFilename(file.name);
      const reader = new FileReader();

      reader.onload = (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
        console.log("Raw data from", file.name, ":", jsonData);
        const cleanedData = jsonData.map((row: any) => {
          const cleanRow: any = {};
          Object.keys(row).forEach((key) => {
            if (!key.startsWith("__EMPTY")) cleanRow[key.trim()] = row[key];
          });
          return cleanRow;
        });
        console.log(cleanedData);
        // ✅ Filter out rows where "Question Text" is empty
        const filteredData = cleanedData.filter(
          (row) => safeString(row["Question Text"]) !== "",
        );
        console.log(filteredData);
        const finalData = filteredData.map((row: any) => ({
          ...row,
          subject,
          type: row.type && row.type.trim() !== "" ? row.type.trim() : "basic",
          mode: "mcq",
        }));

        resolve([{ _tableName: className }, ...finalData]);
      };

      reader.readAsArrayBuffer(file);
    });
  };

  /** ✅ Handle multi-file upload */
  const handlePaperFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    // Extract classes
    const extractedClasses = files.map(
      (f) => extractInfoFromFilename(f.name).className,
    );
    const uniqueClasses = [...new Set(extractedClasses)];

    // ❌ Reject if files belong to different classes
    if (uniqueClasses.length > 1) {
      alert(
        `❌ Multiple classes detected: ${uniqueClasses.join(
          ", ",
        )}. Upload files for one class only.`,
      );
      return;
    }
    console.log(uniqueClasses);
    setClassName(uniqueClasses[0]);
    setPaperFiles(files);

    // ✅ Read all files concurrently
    const allDataArrays = await Promise.all(files.map(readExcelFile));

    // ✅ Combine all subject data for same class
    const combined = allDataArrays.flat();
    setPaperData(combined);
  };

  const handleExcelUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    console.log(file);
    setClassName(file.name.split(".")[0]);
    try {
      const data = await readExcelAllSheetsGroupedDynamic(file);
      setPaperData(data);
      console.log("✅ Final Parsed Data:", data);
    } catch (error) {
      console.error(error);
      alert(error);
    }
  };

  /** ✅ Save all data for that class into backend */
  /** ✅ Handle Save with Grouped Topic Data */
  const handleSaveToDatabase = async () => {
    if (!paperData || Object.keys(paperData).length === 0) {
      alert("❌ No valid data to save!");
      return;
    }

    try {
      let allFormattedData = [];

      for (const [topic, questions] of Object.entries(paperData)) {
        if (!Array.isArray(questions) || questions.length === 0) continue;

        const formatted = {
          tableName: `${className}_${topic.replace(/\s+/g, "_").toLowerCase()}`,
          questions,
        };

        allFormattedData.push(formatted);
      }

      const payload = {
        tableName: className, // ✅ expected by backend
        data: allFormattedData, // ✅ expected by backend
      };

      const response = await saveQuestions(payload);
      console.log("✅ Save response:", response);
      alert(response.message || "✅ Saved successfully!");
    } catch (error) {
      console.error("❌ Save failed:", error);
      alert("❌ Failed to save data");
    }
  };

  /** ✅ Render grouped topics as badges + tables */
  const renderTable = (groupedData: Record<string, any[]>) => {
    if (!groupedData || Object.keys(groupedData).length === 0) return null;

    const topics = Object.keys(groupedData);

    // Default to first topic if none selected
    const activeTopic = selectedTopic || topics[0];
    const activeData = groupedData[activeTopic] || [];
    const rows = activeData;
    const headers = Object.keys(rows[0] || {});

    return (
      <div className="mt-6">
        {/* ✅ Topic Badges / Tabs */}
        <div className="flex flex-wrap gap-2 mb-4">
          {topics.map((topic, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedTopic(topic)}
              className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors duration-150 ${
                activeTopic === topic
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-gray-100 hover:bg-blue-100 border-gray-300"
              }`}
            >
              {topic}
            </button>
          ))}
        </div>

        {/* ✅ Table for Selected Topic */}
        <div className="overflow-x-auto border rounded-lg shadow-sm bg-white">
          <h2 className="text-lg font-semibold mb-2 px-3 py-2 bg-gray-50 border-b">
            {activeTopic}
          </h2>
          <table className="table-auto w-full border-collapse">
            <thead className="bg-gray-100">
              <tr>
                {headers.map((h, idx) => (
                  <th key={idx} className="border px-3 py-2 text-left">
                    {safeString(h)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rIdx) => (
                <tr
                  key={rIdx}
                  className="hover:bg-gray-50 transition-colors duration-100"
                >
                  {headers.map((h, cIdx) => (
                    <td key={cIdx} className="border px-3 py-1 text-sm">
                      {safeString(row[h])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-4">Excel Uploader (Multi-File)</h1>
        <UploadImageFolder />
        <div className="mb-4">
          <label className="block mb-1 font-medium">Upload Excel Files</label>
          <input
            type="file"
            accept=".xlsx,.xls"
            multiple
            onChange={handleExcelUpload}
          />
          {className && (
            <p className="text-sm mt-1 text-green-700">
              ✅ Detected class: <b>{className}</b>
            </p>
          )}
        </div>

        <button
          onClick={handleSaveToDatabase}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mb-6"
        >
          Save All Subjects to Database
        </button>

        {paperData && renderTable(paperData)}
      </div>
    </div>
  );
};

export default Dashboard;
