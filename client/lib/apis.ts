import { apiCall } from "./axios";
interface Login {
  email: string;
  password: string;
}
interface User {
  name: string;
  email: string;
  password: string;
}
// http://localhost:8081/api/standard/save_questions
export const saveQuestions = async (data: any) => {
  const response = await apiCall({
    url: "standard/save_questions",
    method: "POST",
    data: data,
  });
  return response;
};

// GET http://localhost:8081/api/standard/7
export const getSubjects = async (classParam: string | number) => {
  const response = await apiCall({
    url: `standard/${classParam}`,
    method: "GET",
  });
  return response;
}

// GET http://localhost:8081/api/standard/topics/6th_class/chemistry

export const getTopics = async (className: string, subject: string) => {
  const response = await apiCall({
    url: `standard/topics/${className}`,
    method: "POST",
    data: { subjects: subject },
  });
  return response;
}

// POST http://localhost:8081/api/standard/questions
// {
//   "class": "7",
//   "subjects": ["English", "Math", "Science"],
//   "type": ["basic", "advance"],
//   "mode": ["mcq"]
// }
export const getQuestions = async (data: any) => {
  const response = await apiCall({
    url: "standard/questions",
    method: "POST",
    data: data,
  });
  return response;
}

// http://localhost:8081/api/papers/
export const getAllPapers = async () => {
  const response = await apiCall({
    url: "papers",
    method: "GET",
  });
  return response;
}

// http://localhost:8081/api/papers/filter
export const getPapersByFilter = async (data: any) => {
  const response = await apiCall({
    url: "papers/filter",
    method: "POST",
    data: data,
  });
  return response;
}

// http://localhost:8081/api/papers/
export const savePaper = async (data: any) => {
  const response = await apiCall({
    url: "papers",
    method: "POST",
    data: data,
  });
  return response;
}

// :id
// http://localhost:8081/api/papers/1
export const getPaperById = async (id: number) => {
  const response = await apiCall({
    url: `papers/${id}`,
    method: "GET",
  });
  return response;
}

// :id
// http://localhost:8081/api/papers/1
export const updatePaper = async (id: number, data: any) => {
  const response = await apiCall({
    url: `papers/${id}`,
    method: "PUT",
    data: data,
  });
  return response;
}

// :id
// http://localhost:8081/api/papers/1
export const deletePaper = async (id: number) => {
  const response = await apiCall({
    url: `papers/${id}`,
    method: "DELETE",
  });
  return response;
}


export const loginUser = async (user: Login) => {
  const response = await apiCall({
    url: "/user/login",
    method: "POST",
    data: user,
  });

  return response;
};

export const RegisterUser = async (user: User) => {
  const response = await apiCall({
    url: "/user/register",
    method: "POST",
    data: user,
  });
  return response;
};
