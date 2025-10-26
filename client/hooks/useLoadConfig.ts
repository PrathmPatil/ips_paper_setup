// hooks/useLoadConfig.ts
import { useEffect, useState } from "react";
import { ExamPattern, MarkingScheme } from "@shared/types";
import { defaultExamPattern } from "@/lib/staticConfig";

export function useLoadConfig() {
  const [config, setConfig] = useState<ExamPattern | null>(defaultExamPattern);
  const [marking, setMarking] = useState<MarkingScheme>(
    defaultExamPattern.defaultMarkingScheme,
  );

  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then((json: ExamPattern) => {
        setConfig(json);
        setMarking(json.defaultMarkingScheme);
      })
      .catch(() => {
        // fallback to static
      });
  }, []);

  return { config, marking, setConfig, setMarking };
}
