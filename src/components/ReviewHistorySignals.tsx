"use client";

import type { LegalIssue, ReviewFinding } from "@/types";
import { REVIEW_HISTORY_DISCLAIMER } from "@/data/review-history";
import { buildReviewHistorySignals } from "@/lib/review-history";

interface ReviewHistorySignalsProps {
  findings: ReviewFinding[];
  selectedIssues: LegalIssue[];
}

export default function ReviewHistorySignals({
  findings,
  selectedIssues,
}: ReviewHistorySignalsProps) {
  const signals = buildReviewHistorySignals(findings, selectedIssues);

  if (signals.length === 0) return null;

  return (
    <div className="rounded-sm border border-border/80 bg-paper-dark/15 px-4 py-3">
      <h3 className="text-xs font-medium text-ink">검수 이력 참고</h3>
      <p className="mt-0.5 text-[11px] leading-relaxed text-ink-faint">
        유사한 쟁점과 출제 원칙에서 반복적으로 나타난 검수 패턴입니다.
      </p>

      <ul className="mt-3 space-y-3">
        {signals.map((signal) => (
          <li
            key={signal.record.id}
            className="border-t border-border/50 pt-3 first:border-t-0 first:pt-0"
          >
            <div className="mb-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-ink-faint">
              <span className="font-medium text-ink-muted">
                {signal.record.professorLabel}
              </span>
              <span className="font-mono">{signal.record.ruleId}</span>
              <span>중요도 {signal.record.importanceRate}%</span>
              <span>반복 {signal.record.occurrences}회</span>
            </div>
            <p className="text-[12px] leading-relaxed text-ink-muted">
              {signal.summaryLine}
            </p>
            <p className="mt-1 text-[12px] leading-relaxed text-ink-muted">
              {signal.patternLine}
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-ink-faint">
              {signal.record.note}
            </p>
          </li>
        ))}
      </ul>

      <p className="mt-3 text-[10px] leading-relaxed text-ink-faint">
        {REVIEW_HISTORY_DISCLAIMER}
      </p>
    </div>
  );
}
