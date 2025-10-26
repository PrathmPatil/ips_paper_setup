import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

/**
 * Flattens subject-wise data (like your JSON)
 * into a single array of questions with subject info.
 */
function flattenQuestions(data: Record<string, any[]>) {
  const result: any[] = [];
  Object.entries(data).forEach(([subject, questions]) => {
    questions.forEach((q) =>
      result.push({
        subject,
        ...q,
      }),
    );
  });
  return result;
}

export function exportPaperPdf(title: string, data: Record<string, any[]>) {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text(title, 14, 18);

  const allQuestions = flattenQuestions(data);

  const rows = allQuestions.map((q, idx) => [
    idx + 1,
    q.question,
    q.subject.charAt(0).toUpperCase() + q.subject.slice(1),
    q.mode?.toUpperCase() || "-",
    q.marks || "-",
  ]);

  autoTable(doc, {
    head: [["#", "Question", "Subject", "Mode", "Marks"]],
    body: rows,
    startY: 24,
    styles: { cellWidth: "wrap", fontSize: 10, valign: "middle" },
    columnStyles: { 1: { cellWidth: 120 } },
  });

  // ✅ New Page: Answer Key
  doc.addPage();
  doc.setFontSize(16);
  doc.text(`${title} - Answer Key`, 14, 18);

  const answerRows = allQuestions.map((q, idx) => [
    idx + 1,
    q.question,
    q.answer || "-",
  ]);

  autoTable(doc, {
    head: [["#", "Question", "Answer"]],
    body: answerRows,
    startY: 24,
    styles: { cellWidth: "wrap", fontSize: 10 },
    columnStyles: { 1: { cellWidth: 100 } },
  });

  doc.save(slugify(title) + ".pdf");
}

export function exportPaperExcel(title: string, data: Record<string, any[]>) {
  const allQuestions = flattenQuestions(data);

  // Sheet 1: Questions
  const sheetQuestions = XLSX.utils.json_to_sheet(
    allQuestions.map((q, idx) => ({
      No: idx + 1,
      Subject: q.subject,
      Question: q.question,
      Mode: q.mode || "-",
      Marks: q.marks || "-",
      Option_A: q.option_a || "",
      Option_B: q.option_b || "",
      Option_C: q.option_c || "",
      Option_D: q.option_d || "",
      Option_E: q.option_e || "",
    })),
  );

  // Sheet 2: Answers
  const sheetAnswers = XLSX.utils.json_to_sheet(
    allQuestions.map((q, idx) => ({
      No: idx + 1,
      Subject: q.subject,
      Question: q.question,
      Answer: q.answer || "",
    })),
  );

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, sheetQuestions, "Questions");
  XLSX.utils.book_append_sheet(wb, sheetAnswers, "Answer Key");

  XLSX.writeFile(wb, slugify(title) + ".xlsx");
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}
