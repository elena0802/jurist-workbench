import type { ReviewFinding } from "@/types";
import { getExamRuleById } from "@/data/exam-rules";
import { fillAppliedRuleReasoning } from "@/lib/rule-matching";
import {
  getFindingPriority,
  sortFindingsByImportance,
  summarizeFindingPriorities,
} from "@/lib/finding-priority";

function trimSentence(text: string): string {
  return text.trim().replace(/[.．]+$/, "");
}

function primaryRuleText(finding: ReviewFinding) {
  const rule = finding.appliedRules?.[0];
  if (!rule) return null;
  return fillAppliedRuleReasoning(rule, getExamRuleById(rule.ruleId), finding, []);
}

export function buildExecutiveSummary(findings: ReviewFinding[]): string {
  const sorted = sortFindingsByImportance(findings);
  if (sorted.length === 0) {
    return "검토할 보완 지점이 없습니다.";
  }

  const top = sorted[0]!;
  const rule = primaryRuleText(top);
  const counts = summarizeFindingPriorities(findings);
  const { priority } = getFindingPriority(top);

  const weakness = trimSentence(
    rule?.draftDiagnosis || top.finding || "초안의 핵심 보완 지점"
  );
  const rationale = trimSentence(
    rule?.violationReason || top.recommendedReason || "출제·평가 구조상 보완이 필요합니다"
  );
  const ruleLabel = rule?.title ? `「${rule.title}」` : "적용 출제 원칙";
  const action = trimSentence(
    top.suggestedAction || rule?.revisionGuidance || "해당 영역을 우선 보완"
  );

  const lead =
    counts.required > 0
      ? `필수 수정 ${counts.required}건을 포함해 `
      : counts.recommended > 0
        ? `권장 수정 ${counts.recommended}건이 있으며 `
        : "";

  if (priority === "required" || priority === "recommended") {
    const second =
      sorted.length > 1 && counts.required + counts.recommended > 1
        ? ` 그 외 ${counts.required + counts.recommended - 1}건의 우선 보완 항목도 함께 검토가 필요합니다.`
        : "";

    return `${lead}${weakness}습니다. ${rationale}하므로 ${ruleLabel} 기준에서 ${action}이 우선 필요합니다.${second}`;
  }

  return `전반적 골격은 유지되나 ${weakness}습니다. ${ruleLabel} 관점에서 ${action}을 검토할 수 있습니다.`;
}

export function getFindingTitle(finding: ReviewFinding): string {
  const text = finding.finding.trim();
  if (text.length <= 48) return text;
  return `${text.slice(0, 47)}…`;
}

export function getOneLineSummary(finding: ReviewFinding): string {
  const rule = primaryRuleText(finding);
  const summary = rule?.explanation?.trim() || finding.finding;
  if (summary.length <= 72) return summary;
  return `${summary.slice(0, 71)}…`;
}
