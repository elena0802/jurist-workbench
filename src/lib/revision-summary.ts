import type {
  ReviewChecklistId,
  ReviewFinding,
  RevisionSummary,
  GenerationOptions,
} from "@/types";
import { checklistInstructionMap } from "@/data/review-checklist";

export function buildLocalRevisionSummary(
  approvedFindings: ReviewFinding[],
  ignoredFindings: ReviewFinding[],
  checklistIds: ReviewChecklistId[],
  professorInstruction: string,
  options: GenerationOptions
): RevisionSummary {
  const applied: string[] = [];
  const evidenceApplied: string[] = [];
  const expectedEffects: string[] = [];
  const rulesApplied: string[] = [];
  const rulesImproved: string[] = [];
  const rulesPreserved: string[] = [];
  const ruleSatisfactionPlans: string[] = [];

  for (const finding of approvedFindings) {
    applied.push(`[${finding.category}] ${finding.suggestedAction}`);

    const docLabel =
      finding.evidenceDocuments.length > 0
        ? finding.evidenceDocuments.join(", ")
        : "자료 근거 미기재";
    evidenceApplied.push(
      `[${finding.category}] ${finding.finding} — 자료: ${docLabel}`
    );

    if (finding.expectedEffect.trim()) {
      expectedEffects.push(`[${finding.category}] ${finding.expectedEffect}`);
    }

    for (const rule of finding.appliedRules ?? []) {
      const ruleLine = `${rule.ruleId}: ${rule.title}`;
      if (!rulesApplied.includes(ruleLine)) {
        rulesApplied.push(ruleLine);
      }

      if (rule.status === "violated" || rule.status === "partial") {
        rulesImproved.push(
          `${rule.ruleId} (${rule.statusLabel}) → ${finding.suggestedAction}`
        );

        ruleSatisfactionPlans.push(
          `${rule.ruleId}: 변경 — ${finding.suggestedAction} · 충족 목표 — ${rule.satisfactionTarget} · 기대 — ${rule.expectedImprovement}`
        );
      }

      if (rule.status === "satisfied") {
        rulesPreserved.push(
          `${rule.ruleId} (${rule.statusLabel}): ${rule.title}`
        );
        ruleSatisfactionPlans.push(
          `${rule.ruleId}: 유지 — ${rule.title} · 충족 목표 달성 유지`
        );
      }
    }
  }

  for (const id of checklistIds) {
    applied.push(`[체크리스트] ${checklistInstructionMap[id]}`);
  }

  if (professorInstruction.trim()) {
    applied.push(`[교수 지시] ${professorInstruction.trim()}`);
  }

  const preserved: string[] = [];

  if (ignoredFindings.length > 0) {
    preserved.push(
      ...ignoredFindings.map(
        (f) => `[${f.category}] ${f.finding} — 교수 승인에서 제외`
      )
    );
  }

  preserved.push("1차 초안의 전체 구조와 학술적 문체");
  preserved.push("선택된 평가 쟁점의 기본 골격");

  if (rulesPreserved.length === 0) {
    rulesPreserved.push("충족 상태로 유지된 출제 원칙");
  }

  const hasDifficultyFinding = approvedFindings.some(
    (f) => f.category === "난이도"
  );
  const hasRaise = checklistIds.includes("raise-difficulty");
  const hasLower = checklistIds.includes("lower-difficulty");

  let difficultyChange = `현재 설정: ${options.difficulty}`;
  if (hasRaise || approvedFindings.some((f) => f.suggestedAction.includes("상향"))) {
    difficultyChange += " → 상향 조정 반영";
  } else if (
    hasLower ||
    approvedFindings.some((f) => f.suggestedAction.includes("하향"))
  ) {
    difficultyChange += " → 하향 조정 반영";
  } else if (hasDifficultyFinding) {
    difficultyChange += " → 난이도 관련 보완 반영";
  } else {
    difficultyChange += " → 유지";
  }

  const issueFindings = approvedFindings.filter((f) => f.category === "쟁점");

  let issueStructureChange = "선택 쟁점 골격 유지";
  if (issueFindings.length > 0) {
    issueStructureChange = `쟁점 연결·전개 보강 (${issueFindings.length}건 반영)`;
  }
  if (checklistIds.includes("remove-issues")) {
    issueStructureChange += " · 불필요 쟁점 정리 포함";
  }
  if (checklistIds.includes("strengthen-issue-links")) {
    issueStructureChange += " · 쟁점 간 연결 강화";
  }

  return {
    applied: applied.length > 0 ? applied : ["승인된 검토 항목 없음"],
    preserved,
    evidenceApplied:
      evidenceApplied.length > 0
        ? evidenceApplied
        : ["근거 기반 반영 항목 없음"],
    expectedEffects:
      expectedEffects.length > 0
        ? expectedEffects
        : ["기대 효과 정보 없음"],
    rulesApplied:
      rulesApplied.length > 0 ? rulesApplied : ["적용된 출제 원칙 없음"],
    rulesImproved:
      rulesImproved.length > 0
        ? rulesImproved
        : ["미충족·부분 충족 원칙 개선 항목 없음"],
    rulesPreserved,
    ruleSatisfactionPlans:
      ruleSatisfactionPlans.length > 0
        ? ruleSatisfactionPlans
        : ["원칙 충족 방안 정보 없음"],
    professorInstructionApplied: professorInstruction.trim().length > 0,
    professorInstructionNote: professorInstruction.trim()
      ? "교수님 추가 지시를 반영하였습니다."
      : "교수님 추가 지시 없음",
    difficultyChange,
    issueStructureChange,
  };
}

export function normalizeRevisionSummary(input: unknown): RevisionSummary | null {
  if (!input || typeof input !== "object") return null;
  const record = input as Record<string, unknown>;

  const toStringArray = (value: unknown): string[] => {
    if (!Array.isArray(value)) return [];
    return value.map((item) => String(item)).filter((s) => s.trim());
  };

  const applied = toStringArray(record.applied);
  const evidenceApplied = toStringArray(record.evidenceApplied);
  const expectedEffects = toStringArray(record.expectedEffects);
  const rulesApplied = toStringArray(record.rulesApplied);
  const rulesImproved = toStringArray(record.rulesImproved);
  const rulesPreserved = toStringArray(record.rulesPreserved);
  const ruleSatisfactionPlans = toStringArray(record.ruleSatisfactionPlans);

  return {
    applied,
    preserved: toStringArray(record.preserved),
    evidenceApplied,
    expectedEffects,
    rulesApplied,
    rulesImproved,
    rulesPreserved,
    ruleSatisfactionPlans,
    professorInstructionApplied: Boolean(record.professorInstructionApplied),
    professorInstructionNote: String(
      record.professorInstructionNote ?? ""
    ).trim(),
    difficultyChange: String(record.difficultyChange ?? "").trim() || "—",
    issueStructureChange: String(record.issueStructureChange ?? "").trim() || "—",
  };
}
