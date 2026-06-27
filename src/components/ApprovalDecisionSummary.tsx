"use client";

import type { ReviewFinding } from "@/types";

interface ApprovalDecisionSummaryProps {
  findings: ReviewFinding[];
}

export default function ApprovalDecisionSummary({
  findings,
}: ApprovalDecisionSummaryProps) {
  const approved = findings.filter((f) => f.decision === "accept").length;
  const ignored = findings.filter((f) => f.decision === "ignore").length;
  const pending = findings.length - approved - ignored;

  return (
    <div className="rounded-sm border border-ink/20 bg-ink/[0.03] px-4 py-3">
      <h3 className="text-xs font-medium text-ink">
        이번 수정에 반영할 검토 의견
      </h3>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[13px]">
        <span>
          <span className="font-medium text-accent">반영</span> {approved}
        </span>
        <span>
          <span className="font-medium text-ink-muted">무시</span> {ignored}
        </span>
        {pending > 0 && (
          <span className="text-ink-faint">미결정 {pending}</span>
        )}
      </div>
    </div>
  );
}
