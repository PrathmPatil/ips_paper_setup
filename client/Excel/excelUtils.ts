// excelUtils.ts
import * as XLSX from "xlsx";

/**
 * Safely converts any value to string and trims whitespace
 */
const safeString = (val: any): string => {
  if (val === undefined || val === null) return "";
  return String(val).trim();
};

/**
 * Process a single sheet into structured JSON
 */
const processSheetData = (sheetData: any[], sheetName: string) => {
  const result: any[] = [];
  let currentEntry: any = null;

  sheetData.forEach((row, index) => {
    if (index < 2) return; // Skip first 2 header rows

    const hasSR = safeString(row.SR) !== "" && safeString(row.SR) !== "SR";
    const hasClass = safeString(row.Class) !== "";
    const hasSubject = safeString(row.Subject) !== "";
    const hasBookName = safeString(row["Book Name"]) !== "";

    if (hasSR || (hasClass && hasSubject && hasBookName)) {
      if (currentEntry) result.push(currentEntry);

      currentEntry = {
        class: safeString(row.Class),
        subject: safeString(row.Subject),
        book_name: safeString(row["Book Name"]),
        basic: [],
        intermediate: [],
        advance: [],
        expert: [],
      };
    }

    if (currentEntry) {
      const basicContent = safeString(row.Basic || row["Level 1"]);
      const intermediateContent = safeString(row.Intermediate || row["Level 2"]);
      const advanceContent = safeString(row.Advance || row["Level 3"]);
      const expertContent = safeString(row.Expert || row["Level 4"]);

      if (basicContent) currentEntry.basic.push(basicContent);
      if (intermediateContent) currentEntry.intermediate.push(intermediateContent);
      if (advanceContent) currentEntry.advance.push(advanceContent);
      if (expertContent) currentEntry.expert.push(expertContent);
    }
  });

  if (currentEntry) result.push(currentEntry);
  return result;
};

/**
 * Reads an Excel file and returns JSON for all sheets
 * @param file File object from input
 */
export const readExcelFile = (file: File): Promise<Record<string, any[]>> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array", cellText: false, cellDates: true });
        const allSheetsData: Record<string, any[]> = {};

        workbook.SheetNames.forEach((sheetName) => {
          const worksheet = workbook.Sheets[sheetName];

          // Convert sheet to JSON with forced headers
          const sheetData = XLSX.utils.sheet_to_json(worksheet, {
            defval: "",
            header: ["SR", "Class", "Subject", "Book Name", "Basic", "Intermediate", "Advance", "Expert"],
            range: 0,
          });

          allSheetsData[sheetName] = processSheetData(sheetData, sheetName);
        });

        resolve(allSheetsData);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
};
