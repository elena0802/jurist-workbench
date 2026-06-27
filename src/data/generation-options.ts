import type { GenerationPurpose, GenerationDifficulty } from "@/types";

export const generationPurposes: GenerationPurpose[] = ["수업", "모의시험", "세미나"];
export const generationDifficulties: GenerationDifficulty[] = ["학부", "로스쿨", "변호사시험 수준"];

export const outputLabels = {
  caseProblem: "사례형 문제",
  examIntent: "출제의도",
  issueStructure: "쟁점 구조",
  gradingCriteria: "채점기준",
  professorReviewMemo: "교수 검수 메모",
} as const;

export const resultSectionLabels: Record<keyof typeof outputLabels, string> = {
  caseProblem: "사례형 문제 초안",
  examIntent: "출제의도",
  issueStructure: "쟁점 구조",
  gradingCriteria: "채점기준",
  professorReviewMemo: "교수 검수 메모",
};
