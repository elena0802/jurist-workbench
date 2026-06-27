"use client";

import type { FindingDecision, ReviewFinding } from "@/types";

interface ReviewFindingsListProps {
  findings: ReviewFinding[];
  onDecisionChange?: (id: string, decision: FindingDecision) => void;
  readOnly?: boolean;
  emptyMessage?: string;
}

export default function ReviewFindingsList({
  findings,
  onDecisionChange,
  readOnly = false,
  emptyMessage = "표시할 검토 제안이 없습니다.",
}: ReviewFindingsListProps) {
  if (!findings.length) {
    return (
      <p className="rounded-sm border border-border bg-paper-dark/20 px-3 py-4 text-sm text-ink-muted">
        {emptyMessage}
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {findings.map((finding) => {
        const isAccept = finding.decision === "accept";
        const isIgnore = finding.decision === "ignore";

        return (
          <li
            key={finding.id}
            className={`rounded-sm border px-3 py-3 ${
              isAccept
                ? "border-accent/35 bg-accent/[0.05]"
                : isIgnore
                  ? "border-border bg-paper-dark/20 opacity-70"
                  : "border-border bg-paper"
            }`}
          >
            <div className="mb-1.5 flex flex-wrap items-center gap-2">
              <span className="rounded-sm border border-ink/15 bg-ink/5 px-1.5 py-px text-[10px] font-medium text-ink-muted">
                {finding.category}
              </span>
            </div>
            <p className="text-[13px] leading-relaxed text-ink">{finding.finding}</p>
            {finding.suggestedAction && (
              <p className="mt-1.5 text-[12px] leading-relaxed text-ink-muted">
                <span className="text-ink-faint">제안 조치 · </span>
                {finding.suggestedAction}
              </p>
            )}
            {!readOnly && onDecisionChange && (
              <div className="mt-2.5 flex gap-2">
                <button
                  type="button"
                  onClick={() => onDecisionChange(finding.id, "accept")}
                  className={`rounded-sm border px-2 py-0.5 text-[11px] transition-colors ${
                    isAccept
                      ? "border-accent bg-accent text-paper"
                      : "border-border text-ink-muted hover:border-accent/40"
                  }`}
                >
                  반영
                </button>
                <button
                  type="button"
                  onClick={() => onDecisionChange(finding.id, "ignore")}
                  className={`rounded-sm border px-2 py-0.5 text-[11px] transition-colors ${
                    isIgnore
                      ? "border-ink/30 bg-ink/10 text-ink"
                      : "border-border text-ink-muted hover:border-border-dark"
                  }`}
                >
                  무시
                </button>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
