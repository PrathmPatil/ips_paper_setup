import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// utils/labelize.js

export function labelize(id, config) {
  if (!id || !config) return id;

  const allOptions = [
    ...(config.grades || []),
    ...(config.sections || []),
    ...(config.subjects || []),
    ...(config.topics || []),
    ...(config.subtopics || []),
    ...(config.skills || []),
    ...(config.examTypes || []),
  ];

  const found = allOptions.find((item) => item.id === id);
  return found ? found.name : id; // fallback to ID if not found
}


// utils/transformTopics.ts
export interface Option {
  label: string;
  value: string | Option[];
}

/**
 * Convert API response to Option[] for MultiSelectChild
 */
export const transformTopicsToOptions = (topicsBySubject: Record<string, any[]>) => {
  return Object.entries(topicsBySubject).map(([subject, topics]) => ({
    label: subject,
    value: topics.map((t) => ({
      label: t.topic_name,
      value: `${subject}__${t.id}` // unique value for each topic
    }))
  }));
};

