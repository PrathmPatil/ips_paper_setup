import * as XLSX from "xlsx";

export const readExcelAllSheetsGroupedDynamic = async (file: File) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });

        // ✅ Validate filename format
        const nameWithoutExt = file.name.split(".")[0].trim();
        const match = nameWithoutExt.match(/^(\d+)(st|nd|rd|th)?\s+Class\s+(.+)$/i);

        if (!match) {
          reject(`❌ Invalid filename format: "${file.name}". Expected like "6th Class English.xlsx"`);
          return;
        }

        const className = `class_${match[1]}`;
        const subject = match[3].trim().toLowerCase();

        let finalData: Record<string, any[]> = {};
        let sheetErrors: string[] = [];

        workbook.SheetNames.forEach((sheetName) => {
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

          if (!jsonData.length) return;

          const headers = Object.keys(jsonData[0]);

          // ✅ Check for mandatory columns
          const requiredColumns = [
            "Q No.",
            "Question",
            "Question Text",
            "Option A",
            "Option B",
            "Option C",
            "Option D",
          ];

          const hasQuestionCol = headers.some((h) =>
            /question\s*text?|ques|__EMPTY_1/i.test(h)
          );

          const hasOptionCols = headers.some((h) =>
            /(option\s*[a-e]?|__EMPTY_\d+)/i.test(h)
          );

          if (!hasQuestionCol) {
            sheetErrors.push(`❌ Missing 'Question' column in sheet "${sheetName}"`);
            return;
          }
          if (!hasOptionCols) {
            sheetErrors.push(`❌ Missing 'Option A-E' columns in sheet "${sheetName}"`);
            return;
          }

          const optionKeys = headers.filter((h) =>
            /option\s*[a-e]?/i.test(h) || /^[A-E]$/i.test(h) || /__EMPTY_\d+/.test(h)
          );

          const getOptionValue = (row: any, index: number) => {
            const key = optionKeys[index];
            return key ? String(row[key] || "").trim() : "";
          };

          const topicData = jsonData
            .filter((row: any) => {
              const question =
                row["Question"] ||
                row["Question Text"] ||
                row["Ques"] ||
                row["__EMPTY_1"] ||
                "";
              return String(question).trim() !== "";
            })
            .map((row: any, i: number) => ({
              id: row["Q No."] || row["No"] || row["ID"] || i + 1,
              question:
                row["Question"] ||
                row["Question Text"] ||
                row["Ques"] ||
                row["__EMPTY_1"] ||
                "",
              option_a: getOptionValue(row, 0),
              option_b: getOptionValue(row, 1),
              option_c: getOptionValue(row, 2),
              option_d: getOptionValue(row, 3),
              option_e: getOptionValue(row, 4),
              answer: row["Answer"] || row["Ans"] || "",
              skill: row["Skill"] || "",
              marks: row["Marks"] || "",
              mode: row["Mode"] || "",
              subject,
              className,
            }));

          if (topicData.length > 0) {
            finalData[sheetName] = topicData;
          }
        });

        if (sheetErrors.length > 0) {
          reject(sheetErrors.join("\n"));
          return;
        }

        if (Object.keys(finalData).length === 0) {
          reject("❌ No valid sheets or questions found in file!");
          return;
        }

        resolve(finalData);
      } catch (error) {
        reject(`❌ Error reading file: ${error}`);
      }
    };

    reader.onerror = () => reject("❌ Failed to read Excel file.");
    reader.readAsArrayBuffer(file);
  });
};
