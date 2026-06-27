import type {
  AppliedRule,
  GenerationDifficulty,
  GenerationPurpose,
  KnowledgeDocument,
  LegalIssue,
  ReviewFinding,
} from "@/types";
import { getExamRuleById } from "@/data/exam-rules";
import { fillAppliedRuleReasoning, summarizeRuleInspection } from "@/lib/rule-matching";
import {
  getFindingPriority,
  sortFindingsByImportance,
  summarizeFindingPriorities,
} from "@/lib/finding-priority";

export type VerdictStatus = "needs_revision" | "mostly_appropriate" | "needs_re_review";

export type VerdictStatusLabel = "보완 필요" | "대체로 적절" | "재검토 필요";

export interface ProfessorVerdictResult {
  status: VerdictStatus;
  statusLabel: VerdictStatusLabel;
  judgment: string | null;
  primaryRecommendation: string | null;
  primaryRules: Array<{ ruleId: string; title: string }>;
  empty: boolean;
  emptyMessage?: string;
}

const EMPTY_MESSAGE =
  "초안 검토 의견을 작성할 수 없습니다. 초안을 다시 작성하거나 검토를 다시 실행해 주세요.";

function trimSentence(text: string): string {
  return text.trim().replace(/[.．]+$/, "");
}

function ensureEnding(text: string, suffix: string): string {
  const trimmed = trimSentence(text);
  if (!trimmed) return "";
  if (suffix === "습니다" && /습니다$/.test(trimmed)) return trimmed;
  if (suffix === "하십시오" && /(하십시오|하세요|주세요)$/.test(trimmed))
    return trimmed;
  return `${trimmed}${suffix}`;
}

function primaryFinding(findings: ReviewFinding[]): ReviewFinding | null {
  const sorted = sortFindingsByImportance(findings);
  if (!sorted.length) return null;

  const required = sorted.find(
    (f) => getFindingPriority(f).priority === "required"
  );
  if (required) return required;

  const recommended = sorted.find(
    (f) => getFindingPriority(f).priority === "recommended"
  );
  if (recommended) return recommended;

  return sorted[0]!;
}

function enrichedRule(finding: ReviewFinding): AppliedRule | null {
  const rule = finding.appliedRules?.[0];
  if (!rule) return null;
  return fillAppliedRuleReasoning(
    rule,
    getExamRuleById(rule.ruleId),
    finding,
    []
  );
}

function isHighSeverityViolated(finding: ReviewFinding): boolean {
  if ((finding.severity ?? "medium") !== "high") return false;
  const rules = finding.appliedRules ?? [];
  if (rules.length === 0) {
    return getFindingPriority(finding).priority === "required";
  }
  return rules.some((r) => r.status === "violated");
}

export function getVerdictStatus(findings: ReviewFinding[]): {
  status: VerdictStatus;
  statusLabel: VerdictStatusLabel;
} {
  if (findings.length === 0) {
    return { status: "needs_revision", statusLabel: "보완 필요" };
  }

  const highViolatedCount = findings.filter(isHighSeverityViolated).length;
  if (highViolatedCount >= 2) {
    return { status: "needs_re_review", statusLabel: "재검토 필요" };
  }

  const priorities = summarizeFindingPriorities(findings);
  if (priorities.required > 0) {
    return { status: "needs_revision", statusLabel: "보완 필요" };
  }

  const rules = summarizeRuleInspection(findings);
  const mostlySatisfied =
    rules.total === 0 ||
    rules.violated === 0 ||
    rules.satisfied + rules.partial >= rules.violated;

  if (priorities.required === 0 && mostlySatisfied) {
    return { status: "mostly_appropriate", statusLabel: "대체로 적절" };
  }

  return { status: "needs_revision", statusLabel: "보완 필요" };
}

export function getPrimaryRecommendation(findings: ReviewFinding[]): string | null {
  const finding = primaryFinding(findings);
  if (!finding) return null;

  const rule = enrichedRule(finding);
  const raw =
    finding.suggestedAction?.trim() ||
    rule?.revisionGuidance?.trim() ||
    finding.finding?.trim();

  if (!raw) return null;
  return ensureEnding(raw, "하십시오");
}

export function getPrimaryRules(
  findings: ReviewFinding[]
): Array<{ ruleId: string; title: string }> {
  const sorted = sortFindingsByImportance(findings);
  const seen = new Set<string>();
  const rules: Array<{ ruleId: string; title: string }> = [];

  for (const finding of sorted) {
    for (const rule of finding.appliedRules ?? []) {
      if (!rule.ruleId || rule.ruleId === "—" || seen.has(rule.ruleId)) continue;
      seen.add(rule.ruleId);
      rules.push({ ruleId: rule.ruleId, title: rule.title });
      if (rules.length >= 2) return rules;
    }
  }

  return rules;
}

function issueSelectionPhrase(
  findings: ReviewFinding[],
  selectedIssues: LegalIssue[],
  purpose: GenerationPurpose,
  difficulty: GenerationDifficulty
): string {
  const issueFinding = findings.find((f) => f.category === "쟁점");
  const names = selectedIssues.map((i) => i.name);

  if (issueFinding) {
    const severity = issueFinding.severity ?? "medium";
    if (severity === "high" || getFindingPriority(issueFinding).priority === "required") {
      return "쟁점 선정은 방향은 맞으나 구성상 보완이 필요하나";
    }
    return "쟁점 선정은 대체로 적절하나";
  }

  if (names.length > 0) {
    const label =
      names.length <= 3
        ? names.join("·")
        : `${names.slice(0, 2).join("·")} 등 ${names.length}개 쟁점`;
    return `${purpose}(${difficulty}) 목적에 맞게 ${label}을 선정하였으나`;
  }

  return "초안의 전반적 골격은 유지할 만하나";
}

function buildJudgmentParagraph(
  findings: ReviewFinding[],
  selectedIssues: LegalIssue[],
  selectedDocuments: KnowledgeDocument[],
  purpose: GenerationPurpose,
  difficulty: GenerationDifficulty
): string {
  const finding = primaryFinding(findings)!;
  const rule = enrichedRule(finding);
  const { statusLabel } = getVerdictStatus(findings);

  const opener = issueSelectionPhrase(
    findings,
    selectedIssues,
    purpose,
    difficulty
  );

  const weakness = trimSentence(
    rule?.draftDiagnosis || finding.finding || "핵심 보완 지점이 확인됩니다"
  );

  const rationale = trimSentence(
    rule?.violationReason ||
      finding.recommendedReason ||
      "수험생이 법적 판단 구조를 단계적으로 전개하기 어렵습니다"
  );

  const action = trimSentence(
    finding.suggestedAction ||
      rule?.revisionGuidance ||
      "우선 해당 영역을 보완"
  );

  const effect = trimSentence(
    rule?.expectedImprovement ||
      finding.expectedEffect ||
      "출제·평가 구조를 더 명확히 할 수 있습니다"
  );

  const docHint =
    finding.category === "사실관계" && selectedDocuments.length > 0
      ? ` 참고 자료(${selectedDocuments
          .slice(0, 2)
          .map((d) => d.title)
          .join(", ")})를 반영하면 보완 방향을 구체화할 수 있습니다.`
      : "";

  if (statusLabel === "대체로 적절") {
    return `${opener.replace(/하나$/, "하나,")} ${weakness}는 점검할 만합니다. ${action}을 검토하면 ${effect}습니다.${docHint}`;
  }

  return `${opener} 현재 초안은 ${weakness}습니다. ${rationale}하므로, 우선 ${action}하는 것이 필요합니다. 이 보완이 이루어지면 ${effect}습니다.${docHint}`;
}

export function buildProfessorVerdict(
  findings: ReviewFinding[],
  selectedIssues: LegalIssue[],
  selectedDocuments: KnowledgeDocument[],
  purpose: GenerationPurpose,
  difficulty: GenerationDifficulty
): ProfessorVerdictResult {
  if (findings.length === 0) {
    return {
      status: "needs_revision",
      statusLabel: "보완 필요",
      judgment: null,
      primaryRecommendation: null,
      primaryRules: [],
      empty: true,
      emptyMessage: EMPTY_MESSAGE,
    };
  }

  const { status, statusLabel } = getVerdictStatus(findings);

  return {
    status,
    statusLabel,
    judgment: buildJudgmentParagraph(
      findings,
      selectedIssues,
      selectedDocuments,
      purpose,
      difficulty
    ),
    primaryRecommendation: getPrimaryRecommendation(findings),
    primaryRules: getPrimaryRules(findings),
    empty: false,
  };
}
