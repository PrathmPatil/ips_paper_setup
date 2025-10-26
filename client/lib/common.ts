// utils/gradeUtils.ts

// Converts Roman numeral (I, II, III, IV...) or number to numeric value
export const romanToNumber = (roman: string): number | string => {
  const romanMap: { [key: string]: number } = {
    I: 1,
    II: 2,
    III: 3,
    IV: 4,
    V: 5,
    VI: 6,
    VII: 7,
    VIII: 8,
    IX: 9,
    X: 10,
  };

  if (roman.toUpperCase() in romanMap) return romanMap[roman.toUpperCase()];
  if (roman.toUpperCase() === "LKG" || roman.toUpperCase() === "UKG") return roman.toUpperCase();

  const num = parseInt(roman);
  return isNaN(num) ? roman : num;
};

// Returns ordinal grade like "1st", "2nd", "3rd", "4th", "LKG", "UKG"
export const getStandardWithSuffix = (gradeName: string): string => {
  const standard = romanToNumber(gradeName);

  if (standard === "LKG" || standard === "UKG") return standard;

  if (typeof standard === "number") {
    if (standard % 10 === 1 && standard % 100 !== 11) return `${standard}st`;
    if (standard % 10 === 2 && standard % 100 !== 12) return `${standard}nd`;
    if (standard % 10 === 3 && standard % 100 !== 13) return `${standard}rd`;
    return `${standard}th`;
  }

  return String(standard);
};


/** ✅ Convert grouped Excel data into DB insertable format */
export function transformExcelDataToDBFormat(rawData, tableName = "class_7") {
  const timestamp = new Date().toISOString();

  const data = rawData.map((item, index) => {
    const safe = (v) =>
      v === undefined || v === null ? "" : String(v).trim();

    // Dynamically get options
    const options = Object.keys(item)
      .filter((k) => k.toLowerCase().startsWith("option"))
      .reduce((acc, key) => {
        const optKey = key.toLowerCase().replace(/\s/g, "_");
        acc[optKey] = safe(item[key]);
        return acc;
      }, {});

    return {
      id: index + 1,
      question: safe(item["Question Text"] || item["question"]),
      ...options,
      answer: safe(item["Answer"] || ""),
      marks: safe(item["Marks"] || ""),
      subject: safe(item["subject"] || "unknown"),
      className: safe(item["className"] || tableName.split("_")[0]),
      mode: safe(item["mode"] || "mcq"),
      type: safe(item["type"] || "basic"),
      created_at: timestamp,
    };
  });

  return { tableName, data };
}


export const totalCount =(selectedQuestions : any)=>{return  Object.values(selectedQuestions)
  .reduce((sum, subjectArray) => sum + subjectArray?.length, 0)}

// const perSubjectCount = Object.entries(selectedQuestions)
//   .map(([subject, arr]) => ({ subject, count: arr.length }));
export const perSubjectCount = (selectedQuestions : any) => Object.entries(selectedQuestions).map(([subject, arr]) => ({ subject, count: arr.length }));
