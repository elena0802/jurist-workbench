import type { ReviewChecklistId } from "@/types";

export const reviewChecklistItems: Array<{
  id: ReviewChecklistId;
  label: string;
}> = [
  { id: "strengthen-facts", label: "사실관계 보강" },
  { id: "strengthen-issue-links", label: "쟁점 연결 강화" },
  { id: "raise-difficulty", label: "난이도 상향" },
  { id: "lower-difficulty", label: "난이도 하향" },
  { id: "detail-grading", label: "채점기준 구체화" },
  { id: "supplement-intent", label: "출제의도 보완" },
  { id: "remove-issues", label: "불필요한 쟁점 제거" },
  { id: "adjust-length", label: "사례 길이 조정" },
];

export const checklistInstructionMap: Record<ReviewChecklistId, string> = {
  "strengthen-facts":
    "사실관계를 더 구체적·현실적으로 보강하고, 쟁점이 드러날 단서를 사실 속에 배치하세요.",
  "strengthen-issue-links":
    "선택된 평가 쟁점 간 연결·경합·전제 관계를 문제 전개에서 더 명확히 하세요.",
  "raise-difficulty":
    "사실관계의 복선·인식 차이·시점 문제를 추가하여 난이도를 상향하세요.",
  "lower-difficulty":
    "부수적 논점을 줄이고 핵심 쟁점에 집중하여 난이도를 하향하세요.",
  "detail-grading":
    "채점기준을 쟁점별로 세분화하고, 배점·핵심 판단 포인트·흔한 오류를 구체화하세요.",
  "supplement-intent":
    "출제의도에 평가 목표·변별력·참고 자료 반영 근거를 보완하세요.",
  "remove-issues":
    "불필요하거나 중복된 쟁점을 정리하고, 사실관계와의 대응을 맞추세요.",
  "adjust-length":
    "사례형 문제 본문의 길이를 교수 지시에 맞게 조정하세요.",
};
