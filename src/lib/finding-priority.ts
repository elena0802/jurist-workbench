import type { ReviewFinding, RuleStatus, ReviewFindingSeverity } from "@/types";

export type FindingPriority = "required" | "recommended" | "optional";

export type FindingPriorityLabel = "필수 수정" | "권장 수정" | "선택 수정";

const PRIORITY_LABELS: Record<FindingPriority, FindingPriorityLabel> = {
  required: "필수 수정",
  recommended: "권장 수정",
  optional: "선택 수정",
};

function worstRuleStatus(finding: ReviewFinding): RuleStatus {
  const rules = finding.appliedRules ?? [];
  if (rules.some((r) => r.status === "violated")) return "violated";
  if (rules.some((r) => r.status === "partial")) return "partial";
  return "satisfied";
}

export function getFindingPriority(finding: ReviewFinding): {
  priority: FindingPriority;
  label: FindingPriorityLabel;
} {
  const severity = finding.severity ?? "medium";
  const status = worstRuleStatus(finding);

  if (status === "violated" && severity === "high") {
    return { priority: "required", label: PRIORITY_LABELS.required };
  }
  if (status === "partial" || status === "violated") {
    return { priority: "recommended", label: PRIORITY_LABELS.recommended };
  }
  if (status === "satisfied" || severity === "low") {
    return { priority: "optional", label: PRIORITY_LABELS.optional };
  }

  return { priority: "recommended", label: PRIORITY_LABELS.recommended };
}

export function summarizeFindingPriorities(findings: ReviewFinding[]) {
  let required = 0;
  let recommended = 0;
  let optional = 0;

  for (const finding of findings) {
    const { priority } = getFindingPriority(finding);
    if (priority === "required") required += 1;
    else if (priority === "recommended") recommended += 1;
    else optional += 1;
  }

  return { required, recommended, optional, total: findings.length };
}

const PRIORITY_ORDER: Record<FindingPriority, number> = {
  required: 0,
  recommended: 1,
  optional: 2,
};

const SEVERITY_ORDER: Record<ReviewFindingSeverity, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

export function sortFindingsByImportance(
  findings: ReviewFinding[]
): ReviewFinding[] {
  return [...findings].sort((a, b) => {
    const pa = getFindingPriority(a).priority;
    const pb = getFindingPriority(b).priority;
    if (PRIORITY_ORDER[pa] !== PRIORITY_ORDER[pb]) {
      return PRIORITY_ORDER[pa] - PRIORITY_ORDER[pb];
    }
    const sa = a.severity ?? "medium";
    const sb = b.severity ?? "medium";
    return SEVERITY_ORDER[sa] - SEVERITY_ORDER[sb];
  });
}

export const priorityStyles: Record<FindingPriority, string> = {
  required: "border-accent/40 bg-accent/10 text-accent",
  recommended: "border-amber-200/90 bg-amber-50 text-amber-950",
  optional: "border-ink/15 bg-ink/5 text-ink-muted",
};
