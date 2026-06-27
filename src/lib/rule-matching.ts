import type {
  GenerationOptions,
  ReviewFinding,
  ReviewFindingCategory,
  ReviewFindingPayload,
  AppliedRule,
  RuleStatus,
} from "@/types";
import { examRules, getExamRuleById, type ExamRule } from "@/data/exam-rules";
import { legalIssues } from "@/data/legal-issues";

const STATUS_LABELS: Record<RuleStatus, AppliedRule["statusLabel"]> = {
  satisfied: "충족",
  partial: "부분 충족",
  violated: "미충족",
};

export function ruleStatusLabel(status: RuleStatus): AppliedRule["statusLabel"] {
  return STATUS_LABELS[status] ?? "부분 충족";
}

function selectedIssueNames(issueIds: string[]): string[] {
  return issueIds
    .map((id) => legalIssues.find((i) => i.id === id)?.name)
    .filter((name): name is string => Boolean(name));
}

function ruleRelevanceScore(
  rule: ExamRule,
  issueNames: string[],
  category?: ReviewFindingCategory
): number {
  let score = 0;
  if (category && rule.category === category) score += 3;
  if (rule.issueTags.length === 0) score += 1;
  for (const tag of rule.issueTags) {
    if (issueNames.includes(tag)) score += 4;
  }
  return score;
}

export function getRelevantRules(
  selectedIssueIds: string[],
  options: GenerationOptions
): ExamRule[] {
  const issueNames = selectedIssueNames(selectedIssueIds);

  const scored = examRules
    .map((rule) => ({
      rule,
      score: ruleRelevanceScore(rule, issueNames),
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length >= 8) {
    return scored.slice(0, 12).map((e) => e.rule);
  }

  const picked = new Set(scored.map((e) => e.rule.id));

  if (options.outputs.gradingCriteria) {
    const grading = examRules.find((r) => r.id === "CRIM-GRADE-001");
    if (grading && !picked.has(grading.id)) {
      scored.push({ rule: grading, score: 2 });
      picked.add(grading.id);
    }
  }

  if (options.outputs.examIntent) {
    const intent = examRules.find((r) => r.id === "CRIM-INTENT-001");
    if (intent && !picked.has(intent.id)) {
      scored.push({ rule: intent, score: 2 });
      picked.add(intent.id);
    }
  }

  const general = examRules.filter(
    (r) =>
      !picked.has(r.id) &&
      (r.issueTags.length === 0 || r.category === "구성")
  );

  return [...scored.map((e) => e.rule), ...general].slice(0, 14);
}

function inferStatusFromFinding(finding: Partial<ReviewFindingPayload>): RuleStatus {
  if (finding.severity === "high") return "violated";
  if (finding.severity === "low") return "partial";
  return "partial";
}

function buildAppliedRule(
  rule: ExamRule,
  status: RuleStatus,
  explanation?: string
): AppliedRule {
  const statusLabel = ruleStatusLabel(status);
  const defaultExplanation =
    status === "satisfied"
      ? `「${rule.title}」에 부합하는 구조로 보입니다.`
      : status === "partial"
        ? `「${rule.checkQuestion}」 — 일부 요건은 충족하나 보완 여지가 있습니다. ${rule.weakPattern}`
        : `「${rule.checkQuestion}」 — ${rule.weakPattern}`;

  return {
    ruleId: rule.id,
    title: rule.title,
    category: rule.category,
    status,
    statusLabel,
    explanation: explanation?.trim() || defaultExplanation,
  };
}

export function matchRulesToFinding(
  finding: ReviewFindingPayload,
  relevantRules: ExamRule[]
): AppliedRule[] {
  const pool =
    relevantRules.length > 0
      ? relevantRules
      : examRules.filter((r) => r.category === finding.category);

  const scored = pool
    .map((rule) => ({
      rule,
      score: ruleRelevanceScore(rule, [], finding.category),
    }))
    .sort((a, b) => b.score - a.score);

  const status = inferStatusFromFinding(finding);
  const picked: ExamRule[] = [];

  for (const entry of scored) {
    if (picked.length >= 3) break;
    if (entry.score > 0 || entry.rule.category === finding.category) {
      picked.push(entry.rule);
    }
  }

  if (picked.length === 0) {
    const fallback = examRules.find((r) => r.category === finding.category);
    if (fallback) picked.push(fallback);
  }

  if (picked.length === 0) {
    picked.push(examRules[0]!);
  }

  return picked.slice(0, 3).map((rule) =>
    buildAppliedRule(
      rule,
      status,
      finding.reasoningBasis
        ? `${rule.checkQuestion} 검토 결과: ${finding.finding}`
        : undefined
    )
  );
}

export function buildDefaultAppliedRules(
  finding: ReviewFindingPayload,
  selectedIssueIds: string[]
): AppliedRule[] {
  const relevant = getRelevantRules(selectedIssueIds, {
    purpose: "모의시험",
    difficulty: "로스쿨",
    outputs: {
      caseProblem: true,
      examIntent: true,
      issueStructure: true,
      gradingCriteria: true,
      professorReviewMemo: true,
    },
  });

  const issueNames = selectedIssueNames(selectedIssueIds);
  const categoryRules = relevant
    .filter((r) => r.category === finding.category)
    .sort(
      (a, b) =>
        ruleRelevanceScore(b, issueNames, finding.category) -
        ruleRelevanceScore(a, issueNames, finding.category)
    );

  const pool =
    categoryRules.length > 0
      ? categoryRules
      : relevant.sort(
          (a, b) =>
            ruleRelevanceScore(b, issueNames) -
            ruleRelevanceScore(a, issueNames)
        );

  const status = inferStatusFromFinding(finding);
  const rule = pool[0] ?? examRules.find((r) => r.category === finding.category) ?? examRules[0]!;

  return [buildAppliedRule(rule, status)];
}

export function normalizeAppliedRules(
  input: unknown,
  finding: ReviewFindingPayload,
  selectedIssueIds: string[]
): AppliedRule[] {
  if (!Array.isArray(input) || input.length === 0) {
    return buildDefaultAppliedRules(finding, selectedIssueIds);
  }

  const normalized = input
    .map((item) => {
      if (typeof item !== "object" || item === null) return null;
      const record = item as Record<string, unknown>;
      const ruleId = String(record.ruleId ?? record.id ?? "").trim();
      if (!ruleId) return null;

      const known = getExamRuleById(ruleId);
      const statusRaw = String(record.status ?? "").toLowerCase().trim();
      const status: RuleStatus =
        statusRaw === "satisfied" || statusRaw === "partial" || statusRaw === "violated"
          ? statusRaw
          : inferStatusFromFinding(finding);

      return {
        ruleId,
        title: known?.title ?? String(record.title ?? "등록되지 않은 원칙"),
        category: String(known?.category ?? finding.category),
        status,
        statusLabel: ruleStatusLabel(status),
        explanation:
          String(record.explanation ?? "").trim() ||
          (known
            ? buildAppliedRule(known, status).explanation
            : "검토 근거를 확인할 수 없습니다."),
      } satisfies AppliedRule;
    })
    .filter((item): item is AppliedRule => item !== null);

  if (normalized.length === 0) {
    return buildDefaultAppliedRules(finding, selectedIssueIds);
  }

  return normalized.slice(0, 3);
}

export function countUniqueAppliedRules(findings: ReviewFinding[]): number {
  const ids = new Set<string>();
  for (const finding of findings) {
    for (const rule of finding.appliedRules ?? []) {
      ids.add(rule.ruleId);
    }
  }
  return ids.size;
}
