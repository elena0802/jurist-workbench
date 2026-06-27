import type { AppliedRule, LegalIssue, ReviewFinding } from "@/types";
import {
  reviewHistorySeed,
  type ReviewHistoryRecord,
} from "@/data/review-history";

export interface ReviewHistorySignal {
  record: ReviewHistoryRecord;
  summaryLine: string;
  patternLine: string;
}

function issueNames(selectedIssues: LegalIssue[]): string[] {
  return selectedIssues.map((issue) => issue.name);
}

function overlapScore(
  record: ReviewHistoryRecord,
  names: string[],
  ruleIds: string[]
): number {
  let score = 0;
  const tagOverlap = record.issueTags.filter((tag) => names.includes(tag)).length;
  score += tagOverlap * 10;
  if (ruleIds.includes(record.ruleId)) score += 15;
  return score;
}

export function getRelevantReviewHistory(
  selectedIssues: LegalIssue[],
  appliedRules: AppliedRule[] | string[]
): ReviewHistoryRecord[] {
  if (!reviewHistorySeed.length) return [];

  const names = issueNames(selectedIssues);
  const ruleIds = Array.isArray(appliedRules)
    ? appliedRules.map((item) =>
        typeof item === "string" ? item : item.ruleId
      )
    : [];

  const scored = reviewHistorySeed
    .map((record) => ({
      record,
      score: overlapScore(record, names, ruleIds),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => {
      if (b.record.importanceRate !== a.record.importanceRate) {
        return b.record.importanceRate - a.record.importanceRate;
      }
      if (b.record.occurrences !== a.record.occurrences) {
        return b.record.occurrences - a.record.occurrences;
      }
      return b.score - a.score;
    });

  return scored.slice(0, 3).map((item) => item.record);
}

function formatIssueTags(tags: string[]): string {
  if (tags.length === 0) return "유사 쟁점";
  if (tags.length === 1) return tags[0]!;
  if (tags.length === 2) return `${tags[0]}·${tags[1]}`;
  return `${tags.slice(0, 2).join("·")} 등`;
}

export function buildHistoryReferenceSentence(
  record: ReviewHistoryRecord
): string {
  const issueLabel = formatIssueTags(record.issueTags);
  return `유사한 ${issueLabel} 유형에서도 ${record.repeatedFinding}이 반복적으로 지적된 바 있습니다.`;
}

function buildSignalLines(record: ReviewHistoryRecord): ReviewHistorySignal {
  const issueLabel = formatIssueTags(record.issueTags);

  return {
    record,
    summaryLine: `${record.professorLabel}는 유사한 ${issueLabel} 유형에서 ${record.ruleId}을 ${record.importanceRate}%의 사례에서 중요하게 보았습니다.`,
    patternLine: `이 유형은 이전 검토에서 ${record.occurrences}회 연속 '${record.repeatedFinding}'으로 수정되었습니다.`,
  };
}

export function buildReviewHistorySignals(
  findings: ReviewFinding[],
  selectedIssues: LegalIssue[]
): ReviewHistorySignal[] {
  if (!reviewHistorySeed.length) return [];

  const allRules = findings.flatMap((finding) => finding.appliedRules ?? []);
  const records = getRelevantReviewHistory(
    selectedIssues,
    allRules.length > 0 ? allRules : []
  );

  if (records.length === 0 && selectedIssues.length > 0) {
    return getRelevantReviewHistory(selectedIssues, [])
      .slice(0, 2)
      .map(buildSignalLines);
  }

  return records.slice(0, 3).map(buildSignalLines);
}

export function buildPostRevisionHistoryNote(
  signals: ReviewHistorySignal[]
): string | null {
  const top = signals[0];
  if (!top) return null;
  return `이번 수정은 유사 사례에서 반복적으로 지적된 '${top.record.repeatedFinding}' 보완 방향과 연결됩니다.`;
}

export function getTopReviewHistoryRecord(
  findings: ReviewFinding[],
  selectedIssues: LegalIssue[]
): ReviewHistoryRecord | null {
  const signals = buildReviewHistorySignals(findings, selectedIssues);
  return signals[0]?.record ?? null;
}
