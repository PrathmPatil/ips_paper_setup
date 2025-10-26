import axios from "axios";

const API_BASE = "http://localhost:8081/api/upload"; // change if needed

export interface QuestionMetadata {
  class: string;
  subject: string;
  topic_id: number;
  questions: any[];
}

export async function uploadImages(images: File[]) {
  const formData = new FormData();
  images.forEach((img) => formData.append("images", img));

  const { data } = await axios.post(`${API_BASE}/images`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data;
}

export async function uploadImagesAndQuestions(images: File[], metadata: QuestionMetadata) {
  const formData = new FormData();
  images.forEach((img) => formData.append("images", img));
  formData.append("metadata", JSON.stringify(metadata));

  const { data } = await axios.post(`${API_BASE}/images-and-questions`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data;
}
