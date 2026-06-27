import type {
  GenerationResult,
  ReviewFinding,
  RevisionSummary,
} from "@/types";
import { getExamRuleById } from "@/data/exam-rules";
import { fillAppliedRuleReasoning } from "@/lib/rule-matching";
import { getFindingPriority } from "@/lib/finding-priority";

export type RevisionEvaluationStatus =
  | "반영 완료"
  | "부분 반영"
  | "추가 검토 필요";

export type EvaluationItemResult = "반영" | "부분 반영" | "추가 검토";

export interface RevisionEvaluation {
  status: RevisionEvaluationStatus;
  summary: string;
  appliedCount: number;
  partialCount: number;
  remainingCount: number;
  evaluatedItems: Array<{
    findingTitle: string;
    ruleId?: string;
    target: string;
    result: EvaluationItemResult;
    note: string;
  }>;
}

function summaryCorpus(summary: RevisionSummary | null): string {
  if (!summary) return "";
  return [
    ...summary.applied,
    ...summary.improvementsMade,
    ...summary.rulesImproved,
    ...summary.ruleSatisfactionPlans,
    ...summary.rulesApplied,
    ...summary.expectedEffects,
  ].join(" ");
}

function findingMentionedInSummary(
  finding: ReviewFinding,
  corpus: string
): boolean {
  if (!corpus.trim()) return false;

  const ruleId = finding.appliedRules?.[0]?.ruleId;
  if (ruleId && corpus.includes(ruleId)) return true;
  if (corpus.includes(finding.category)) return true;

  const actionSnippet = finding.suggestedAction.trim().slice(0, 24);
  if (actionSnippet && corpus.includes(actionSnippet)) return true;

  const findingSnippet = finding.finding.trim().slice(0, 24);
  if (findingSnippet && corpus.includes(findingSnippet)) return true;

  return false;
}

function primaryRuleForFinding(finding: ReviewFinding) {
  const rule = finding.appliedRules?.[0];
  if (!rule) return null;
  return fillAppliedRuleReasoning(
    rule,
    getExamRuleById(rule.ruleId),
    finding,
    []
  );
}

function buildItemNote(
  finding: ReviewFinding,
  result: EvaluationItemResult,
  revisedDraft: GenerationResult | null
): string {
  const rule = primaryRuleForFinding(finding);
  const improvement =
    rule?.expectedImprovement?.trim() ||
    finding.expectedEffect?.trim() ||
    finding.suggestedAction.trim();

  if (result === "부분 반영") {
    return `수정 초안에 반영이 시도되었으나, ${improvement || "해당 검토 의견"}에 대한 추가 확인이 필요합니다.`;
  }

  if (result === "추가 검토") {
    return "승인된 검토 항목이 없어 수정 초안의 반영 여부를 단정하기 어렵습니다.";
  }

  if (revisedDraft?.caseProblem?.trim()) {
    return `수정 초안은 ${improvement || finding.suggestedAction || "승인된 검토 의견"}을 반영하는 방향으로 작성되었습니다.`;
  }

  return `수정 초안은 ${improvement || "승인된 검토 의견"}을 반영하도록 작성되었습니다.`;
}

export function buildRevisionEvaluation(
  approvedFindings: ReviewFinding[],
  revisionSummary: RevisionSummary | null,
  revisedDraft: GenerationResult | null
): RevisionEvaluation {
  if (approvedFindings.length === 0) {
    return {
      status: "추가 검토 필요",
      summary:
        "승인된 검토 항목이 없습니다. 수정 초안의 반영 여부를 별도로 검토할 필요가 있습니다.",
      appliedCount: 0,
      partialCount: 0,
      remainingCount: 1,
      evaluatedItems: [],
    };
  }

  const corpus = summaryCorpus(revisionSummary);
  const hasRevisedDraft = Boolean(
    revisedDraft?.caseProblem?.trim() ||
      revisedDraft?.issueStructure?.trim() ||
      revisedDraft?.gradingCriteria?.trim()
  );

  const evaluatedItems = approvedFindings.map((finding) => {
    const rule = primaryRuleForFinding(finding);
    const { priority } = getFindingPriority(finding);
    const mentioned = findingMentionedInSummary(finding, corpus);

    let result: EvaluationItemResult = "반영";
    if (!hasRevisedDraft) {
      result = "추가 검토";
    } else if (priority === "required" && !mentioned) {
      result = "부분 반영";
    } else if (!mentioned && priority === "recommended") {
      result = "부분 반영";
    }

    return {
      findingTitle: finding.finding,
      ruleId: rule?.ruleId,
      target:
        rule?.satisfactionTarget?.trim() ||
        finding.suggestedAction.trim() ||
        "출제 원칙 충족",
      result,
      note: buildItemNote(finding, result, revisedDraft),
    };
  });

  const appliedCount = evaluatedItems.filter(
    (item) => item.result === "반영"
  ).length;
  const partialCount = evaluatedItems.filter(
    (item) => item.result === "부분 반영"
  ).length;
  const remainingCount = evaluatedItems.filter(
    (item) => item.result === "추가 검토"
  ).length;

  let status: RevisionEvaluationStatus = "반영 완료";
  if (remainingCount > 0 || !hasRevisedDraft) {
    status = "추가 검토 필요";
  } else if (partialCount > 0) {
    status = "부분 반영";
  }

  const summary =
    status === "반영 완료"
      ? "수정 초안은 승인된 검토 항목을 반영하도록 작성되었습니다."
      : status === "부분 반영"
        ? "수정 초안은 승인된 검토 항목을 대체로 반영하였으나, 일부 항목은 추가 확인이 필요합니다."
        : "수정 초안의 반영 여부를 확인하려면 승인된 검토 항목과 대조 검토가 필요합니다.";

  return {
    status,
    summary,
    appliedCount,
    partialCount,
    remainingCount,
    evaluatedItems,
  };
}
