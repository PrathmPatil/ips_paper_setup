import { savePaper, updatePaper } from "@/lib/apis";

export type Question = {
  id: string;
  text: string;
  options: string[];
  correct: string;
};

export type Paper = {
  id: string;
  title: string;
  subject: string;
  teacherEmail?: string;
  assignedTo?: string[]; // emails of students
  questions?: Question[];
  due?: string;
  marking?: any;
  results?: Result[];
  createdAt?: string;
  updatedAt?: string;
};

export type Result = {
  id: string;
  studentEmail: string;
  paperId: string;
  score: number; // 0-100
  correct: number;
  total: number;
  date: string;
  answers?: Record<string, string>; // questionId -> given answer
};

// Static users are defined in client/lib/auth.ts for auth

export const PAPERS: Paper[] = [
  {
    id: "p1",
    title: "Math Test 1",
    subject: "Math",
    teacherEmail: "teacher@innosat.test",
    assignedTo: ["student@innosat.test"],
    due: "2025-10-01",
    questions: [
      {
        id: "q1",
        text: "2 + 2 = ?",
        options: ["2", "3", "4", "5"],
        correct: "4",
      },
      {
        id: "q2",
        text: "5 * 3 = ?",
        options: ["8", "15", "10", "12"],
        correct: "15",
      },
    ],
  },
  {
    id: "p2",
    title: "Science Quiz",
    subject: "Science",
    teacherEmail: "teacher@innosat.test",
    assignedTo: ["student@innosat.test"],
    due: "2025-10-05",
    questions: [
      {
        id: "q1",
        text: "Planet closest to Sun?",
        options: ["Earth", "Venus", "Mercury", "Mars"],
        correct: "Mercury",
      },
    ],
  },
  {
    id: "p3",
    title: "Class Algebra",
    subject: "Math",
    teacherEmail: "teacher@innosat.test",
    assignedTo: [],
    questions: [
      {
        id: "q1",
        text: "Solve x: 2x+3=7",
        options: ["1", "2", "3", "4"],
        correct: "2",
      },
    ],
  },
];

const PAPERS_KEY = "innoexam_papers";

function loadPersistedPapers(): Paper[] {
  try {
    const raw = localStorage.getItem(PAPERS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Paper[];
  } catch (e) {
    return [];
  }
}

function savePersistedPaper(p: Paper) {
  try {
    const cur = loadPersistedPapers();
    cur.unshift(p);
    localStorage.setItem(PAPERS_KEY, JSON.stringify(cur));
  } catch (e) {
    // ignore
  }
}

export function getAllPapers(): Paper[] {
  const persisted = loadPersistedPapers();
  // persisted first so user-created override if same id
  return [...persisted, ...PAPERS];
}

export const RESULTS_KEY = "innoexam_results";

// Seed some results in localStorage if not present
function seedResults() {
  try {
    const raw = localStorage.getItem(RESULTS_KEY);
    if (raw) return;
    const seed: Result[] = [
      {
        id: "r1",
        studentEmail: "student@innosat.test",
        paperId: "p1",
        score: 75,
        correct: 3,
        total: 4,
        date: "2025-09-12",
        answers: { q1: "4", q2: "15" },
      },
    ];
    localStorage.setItem(RESULTS_KEY, JSON.stringify(seed));
  } catch (e) {
    // ignore
  }
}

seedResults();

export function getResultsByPaper(paperId: string) {
  try {
    const raw = localStorage.getItem(RESULTS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as Result[];
    return arr.filter((r) => r.paperId === paperId);
  } catch (e) {
    return [];
  }
}

export function getPapersForUser(email: string | undefined, role: Role) {
  if (!email) return [];
  const all = getAllPapers();
  if (role === "student") {
    return all.filter((p) => (p.assignedTo || []).includes(email));
  }
  if (role === "teacher") {
    return all.filter((p) => p.teacherEmail === email);
  }
  // school: return all
  return all;
}

export function getPaperById(id: string) {
  const all = getAllPapers();
  return all.find((p) => p.id === id) || null;
}

// for the savepaper get this all data
// title, gradeId, sectionId,subjectIds,topicIds, subjectIds,skills, types,  marking, selectedQuestions, selectedAnswers

export async function savePaperFunction(
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
  isEdit = false,
  paperId = "",
) {
  try {
    console.log(marking)
    const payload = {

      title,
      gradeId: Number(gradeId),
      sectionId: Number(sectionId),
      subjectIds,
      topicIds,
      skills,
      types,
      marking:isEdit ? marking?.map((m) => ({
        type: { id: m.type.id, name: m.type.name },
        positive: Number(m.positive),
        negative: Number(m.negative),
      })) : marking.items?.map((m) => ({
        type: { id: m.type.id, name: m.type.name },
        positive: Number(m.positive),
        negative: Number(m.negative),
      })),

      // ✅ FIXED
      selectedQuestions: Object.entries(selectedQuestions).reduce(
        (acc, [key, val]) => {
          acc[key] = val?.map((q) => ({
            id: q.id,
            question: q.question || "Untitled Question",
            option_a: q.option_a || "",
            option_b: q.option_b || "",
            option_c: q.option_c || "",
            option_d: q.option_d || "",
            option_e: q.option_e || "",
            answer: q.answer || "",
            marks: q.marks || "1",
            mode: q.mode || "mcq",
          }));
          return acc;
        },
        {},
      ),

      // ✅ if you still want selectedAnswers separately
      selectedAnswers: Object.entries(selectedQuestions).reduce(
        (acc, [key, val]) => {
          acc[key] = val?.map((q) => ({
            id: q.id,
            answer: q.answer || "",
          }));
          return acc;
        },
        {},
      ),
    };

    console.log("📦 Final Paper Payload:", payload);

    if (isEdit) {
      const response = await updatePaper(Number(paperId),payload);
      console.log("✅ Paper updated successfully:", response);
      return response;
    } else {
      const response = await savePaper(payload);
      console.log("✅ Paper saved successfully:", response);
      return response;
    }
  } catch (error) {
    console.error("❌ Error saving paper:", error);
  }
}

export function getResultsForUser(email: string | undefined, role: Role) {
  if (!email) return [];
  try {
    const raw = localStorage.getItem(RESULTS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as Result[];
    if (role === "student") {
      return arr.filter((r) => r.studentEmail === email);
    }
    if (role === "teacher") {
      // teacher sees results for their papers
      const teacherPapers = PAPERS.filter((p) => p.teacherEmail === email).map(
        (p) => p.id,
      );
      return arr.filter((r) => teacherPapers.includes(r.paperId));
    }
    // school: all results
    return arr;
  } catch (e) {
    return [];
  }
}

export function saveResult(result: Result) {
  try {
    const raw = localStorage.getItem(RESULTS_KEY);
    const arr = raw ? (JSON.parse(raw) as Result[]) : [];
    arr.unshift(result);
    localStorage.setItem(RESULTS_KEY, JSON.stringify(arr));
  } catch (e) {
    // ignore
  }
}

export function getResultById(id: string) {
  try {
    const raw = localStorage.getItem(RESULTS_KEY);
    if (!raw) return null;
    const arr = JSON.parse(raw) as Result[];
    return arr.find((r) => r.id === id) || null;
  } catch (e) {
    return null;
  }
}

// --- Accounts management (teachers & students for school role)
export type StandardHistoryEntry = {
  standard: string;
  from: string; // ISO date
  to?: string; // ISO date optional
};

export type Role = "student" | "teacher" | "school";

export type Account = {
  id: string;
  email: string;
  name?: string;
  role: Role; // 'student' | 'teacher' | 'school'
  standard?: string; // current standard
  features?: string[]; // extracurriculars or tags
  standardHistory?: StandardHistoryEntry[];
  meta?: Record<string, any>;
};

// helper to get account by id
export function getAccountById(id: string) {
  const all = loadAccounts();
  return all.find((a) => a.id === id) || null;
}

export function updateAccount(updated: Account) {
  try {
    const all = loadAccounts();
    const idx = all.findIndex((a) => a.id === updated.id);
    if (idx >= 0) {
      all[idx] = updated;
    } else {
      all.unshift(updated);
    }
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(all));
  } catch (e) {
    // ignore
  }
}

const ACCOUNTS_KEY = "innoexam_accounts";

function loadAccounts(): Account[] {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Account[];
  } catch (e) {
    return [];
  }
}

function savePersistedAccount(a: Account) {
  try {
    const cur = loadAccounts();
    cur.unshift(a);
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(cur));
  } catch (e) {
    // ignore
  }
}

export function getAccounts(): Account[] {
  return loadAccounts();
}

export function saveAccount(a: Account) {
  savePersistedAccount(a);
}

export function getStudentsByStandard(standard?: string) {
  const all = loadAccounts();
  return all.filter(
    (acc) => acc.role === "student" && (!standard || acc.standard === standard),
  );
}

export function addDummyStudentsForStandard(
  standard: string | undefined,
  features: string[] = [],
  count = 5,
) {
  const created: Account[] = [];
  for (let i = 0; i < count; i++) {
    const id = `a_student_${Date.now()}_${Math.floor(Math.random() * 10000)}_${i}`;
    const email = `student_${standard ? standard.replace(/\s+/g, "").toLowerCase() : "gen"}_${Math.floor(Math.random() * 1000)}@example.com`;
    const acc: Account = {
      id,
      email,
      name: `Student ${Math.floor(Math.random() * 1000)}`,
      role: "student",
      standard: standard || "General",
      features,
    };
    savePersistedAccount(acc);
    created.push(acc);
  }
  return created;
}

export function seedAccounts() {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    if (raw) return;
    const seed: Account[] = [
      {
        id: "a_school_1",
        email: "school@innosat.test",
        name: "Demo School",
        role: "school",
      },
      {
        id: "a_teacher_1",
        email: "teacher@innosat.test",
        name: "Demo Teacher",
        role: "teacher",
      },
      {
        id: "a_student_1",
        email: "student@innosat.test",
        name: "Demo Student",
        role: "student",
        standard: "Grade 5",
        features: ["sports"],
        standardHistory: [
          { standard: "Grade 3", from: "2021-06-01", to: "2022-03-31" },
          { standard: "Grade 4", from: "2022-04-01", to: "2023-03-31" },
          { standard: "Grade 5", from: "2023-04-01" },
        ],
      },
    ];
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(seed));
  } catch (e) {
    // ignore
  }
}

export function getResultsByStudent(email: string) {
  try {
    const raw = localStorage.getItem(RESULTS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as Result[];
    return arr.filter((r) => r.studentEmail === email);
  } catch (e) {
    return [];
  }
}

export function addDummyResultsForStudent(email: string, count = 3) {
  try {
    const papers = getAllPapers();
    const studentPapers = papers.filter((p) =>
      (p.assignedTo || []).includes(email),
    );
    const targetPapers = studentPapers.length
      ? studentPapers
      : papers.slice(0, Math.min(3, papers.length));
    const results: Result[] = [];
    for (let i = 0; i < count; i++) {
      for (const p of targetPapers) {
        const score = Math.floor(Math.random() * 50) + 50; // 50-99
        const answers: Record<string, string> = {};
        let correct = 0;
        const qs = p.questions || [];
        qs.forEach((q) => {
          const choice =
            q.options[Math.floor(Math.random() * q.options.length)];
          answers[q.id] = choice;
          if (choice === q.correct) correct++;
        });
        const res: Result = {
          id: `r_dummy_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
          studentEmail: email,
          paperId: p.id,
          score,
          correct,
          total: qs.length,
          date: new Date().toISOString().slice(0, 10),
          answers,
        };
        results.push(res);
      }
    }
    const raw = localStorage.getItem(RESULTS_KEY);
    const arr = raw ? (JSON.parse(raw) as Result[]) : [];
    localStorage.setItem(RESULTS_KEY, JSON.stringify([...results, ...arr]));
    return results;
  } catch (e) {
    return [];
  }
}

export function addDummyResultsForTeacher(
  teacherEmail: string,
  studentEmails: string[] | null = null,
  perPaper = 2,
) {
  try {
    const papers = getAllPapers().filter(
      (p) => p.teacherEmail === teacherEmail,
    );
    if (!papers.length) return [];
    const students =
      studentEmails && studentEmails.length
        ? studentEmails
        : loadAccounts()
            .filter((a) => a.role === "student")
            .map((s) => s.email);
    const results: Result[] = [];
    for (const p of papers) {
      const targetStudents =
        p.assignedTo && p.assignedTo.length
          ? p.assignedTo
          : students.slice(0, Math.min(5, students.length));
      for (const s of targetStudents) {
        for (let i = 0; i < perPaper; i++) {
          const qs = p.questions || [];
          const answers: Record<string, string> = {};
          let correct = 0;
          qs.forEach((q) => {
            const choice =
              q.options[Math.floor(Math.random() * q.options.length)];
            answers[q.id] = choice;
            if (choice === q.correct) correct++;
          });
          const score = qs.length
            ? Math.round((correct / qs.length) * 100)
            : Math.floor(Math.random() * 50) + 50;
          const res: Result = {
            id: `r_t_dummy_${Date.now()}_${Math.floor(Math.random() * 10000)}_${Math.floor(Math.random() * 10000)}`,
            studentEmail: s,
            paperId: p.id,
            score,
            correct,
            total: qs.length,
            date: new Date().toISOString().slice(0, 10),
            answers,
          };
          results.push(res);
        }
      }
    }
    const raw = localStorage.getItem(RESULTS_KEY);
    const arr = raw ? (JSON.parse(raw) as Result[]) : [];
    localStorage.setItem(RESULTS_KEY, JSON.stringify([...results, ...arr]));
    return results;
  } catch (e) {
    return [];
  }
}

// ensure seeded on module load
seedAccounts();
