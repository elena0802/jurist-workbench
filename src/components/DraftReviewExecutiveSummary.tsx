"use client";

import type { ReviewFinding } from "@/types";
import { summarizeRuleInspection } from "@/lib/rule-matching";
import { summarizeFindingPriorities } from "@/lib/finding-priority";
import { buildExecutiveSummary } from "@/lib/review-executive-summary";

interface DraftReviewExecutiveSummaryProps {
  findings: ReviewFinding[];
}

export default function DraftReviewExecutiveSummary({
  findings,
}: DraftReviewExecutiveSummaryProps) {
  if (findings.length === 0) return null;

  const priorities = summarizeFindingPriorities(findings);
  const rules = summarizeRuleInspection(findings);
  const keyImprovement = buildExecutiveSummary(findings);

  return (
    <div className="rounded-sm border-2 border-ink/20 bg-ink/[0.04] px-5 py-4">
      <h3 className="font-serif text-base font-semibold text-ink">
        초안 검토 결과
      </h3>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-ink-muted">
        <span>
          <span className="font-medium text-accent">필수 수정</span>{" "}
          {priorities.required}
        </span>
        <span>
          <span className="font-medium text-amber-900">권장 수정</span>{" "}
          {priorities.recommended}
        </span>
        <span>
          <span className="font-medium text-ink">선택 수정</span>{" "}
          {priorities.optional}
        </span>
      </div>

      {rules.total > 0 && (
        <div className="mt-3 border-t border-border/60 pt-3">
          <p className="text-[11px] font-medium text-ink-faint">
            적용 출제 원칙
          </p>
          <p className="mt-1 text-[13px] text-ink-muted">
            충족 {rules.satisfied}
            <span className="mx-1.5 text-ink-faint">·</span>
            부분 충족 {rules.partial}
            <span className="mx-1.5 text-ink-faint">·</span>
            미충족 {rules.violated}
          </p>
        </div>
      )}

      <div className="mt-4 border-t border-border/60 pt-3">
        <p className="text-[11px] font-medium text-ink-faint">
          가장 중요한 보완점
        </p>
        <p className="mt-1.5 text-[14px] leading-relaxed text-ink">
          {keyImprovement}
        </p>
      </div>
    </div>
  );
}
