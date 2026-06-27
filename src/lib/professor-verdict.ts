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
import {
  buildHistoryReferenceSentence,
  getTopReviewHistoryRecord,
} from "@/lib/review-history";

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

function formatPositiveEvaluation(
  selectedIssues: LegalIssue[],
  purpose: GenerationPurpose,
  difficulty: GenerationDifficulty
): string {
  const names = selectedIssues.map((issue) => issue.name);

  if (names.length === 0) {
    return `${purpose}(${difficulty}) 목적에 맞는 출제 골격을 갖추고 있어, 쟁점 설계는 전반적으로 적절합니다`;
  }

  if (names.length === 1) {
    return `${names[0]} 쟁점을 중심으로 한 출제 설계는 적절합니다`;
  }

  if (names.length === 2) {
    return `${names[0]}와 ${names[1]}를 함께 평가하려는 쟁점 설계는 적절합니다`;
  }

  return `${names.slice(0, 2).join("·")} 등 ${names.length}개 쟁점을 연계한 출제 설계는 적절합니다`;
}

function formatCoreWeakness(
  finding: ReviewFinding,
  rule: AppliedRule | null
): string {
  const diagnosis = trimSentence(
    rule?.draftDiagnosis || finding.finding || "핵심 보완 지점이 확인됩니다"
  );

  if (finding.category === "사실관계") {
    return `다만 현재 사실관계만으로는 ${diagnosis}습니다`;
  }

  if (finding.category === "쟁점") {
    return `다만 현재 초안은 ${diagnosis}습니다`;
  }

  return `다만 ${diagnosis}습니다`;
}

function formatRevisionDirection(
  finding: ReviewFinding,
  rule: AppliedRule | null
): string {
  const action = trimSentence(
    finding.suggestedAction ||
      rule?.revisionGuidance ||
      "해당 영역을 우선 보완"
  );

  if (/^(우선|먼저)/.test(action)) {
    return ensureEnding(action, "는 것이 필요합니다");
  }

  return `우선 보완할 부분은 ${ensureEnding(action, "하는 것")}입니다`;
}

function formatExpectedEffect(
  finding: ReviewFinding,
  rule: AppliedRule | null
): string {
  const effect = trimSentence(
    rule?.expectedImprovement ||
      finding.expectedEffect ||
      "출제·평가 구조를 더 명확히 할 수 있습니다"
  );

  if (/^(이 보완|보완)/.test(effect)) {
    return ensureEnding(effect, "습니다");
  }

  return `이 보완이 이루어지면 ${ensureEnding(effect, "습니다")}`;
}

function buildJudgmentParagraph(
  findings: ReviewFinding[],
  selectedIssues: LegalIssue[],
  purpose: GenerationPurpose,
  difficulty: GenerationDifficulty
): string {
  const finding = primaryFinding(findings)!;
  const rule = enrichedRule(finding);
  const { statusLabel } = getVerdictStatus(findings);

  const positive = formatPositiveEvaluation(selectedIssues, purpose, difficulty);
  const weakness =
    statusLabel === "대체로 적절"
      ? `다만 ${trimSentence(rule?.draftDiagnosis || finding.finding || "세부 표현")}는 한 번 더 점검할 만합니다`
      : formatCoreWeakness(finding, rule);

  const direction =
    statusLabel === "대체로 적절"
      ? `우선 ${trimSentence(finding.suggestedAction || rule?.revisionGuidance || "표현을 다듬")}을 검토할 수 있습니다`
      : formatRevisionDirection(finding, rule);

  const effect =
    statusLabel === "대체로 적절"
      ? formatExpectedEffect(finding, rule).replace(
          "이 보완이 이루어지면",
          "이를 반영하면"
        )
      : formatExpectedEffect(finding, rule);

  const historyRecord = getTopReviewHistoryRecord(findings, selectedIssues);
  const historySentence = historyRecord
    ? ` ${buildHistoryReferenceSentence(historyRecord)}`
    : "";

  return `${positive}. ${weakness}. ${direction}. ${effect}.${historySentence}`;
}

export function buildProfessorVerdict(
  findings: ReviewFinding[],
  selectedIssues: LegalIssue[],
  _selectedDocuments: KnowledgeDocument[],
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
      purpose,
      difficulty
    ),
    primaryRecommendation: getPrimaryRecommendation(findings),
    primaryRules: getPrimaryRules(findings),
    empty: false,
  };
}
