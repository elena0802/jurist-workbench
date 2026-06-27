"use client";

import type { FindingDecision, ReviewFinding, ReviewFindingSeverity } from "@/types";

interface ReviewFindingsListProps {
  findings: ReviewFinding[];
  onDecisionChange?: (id: string, decision: FindingDecision) => void;
  readOnly?: boolean;
  emptyMessage?: string;
  showEvidence?: boolean;
  expandFirstEvidence?: boolean;
}

const severityLabels: Record<ReviewFindingSeverity, string> = {
  low: "낮음",
  medium: "보통",
  high: "높음",
};

const severityStyles: Record<ReviewFindingSeverity, string> = {
  low: "border-border bg-paper-dark/30 text-ink-faint",
  medium: "border-ink/15 bg-ink/5 text-ink-muted",
  high: "border-accent/30 bg-accent/10 text-accent",
};

function FindingEvidence({
  finding,
  defaultOpen,
}: {
  finding: ReviewFinding;
  defaultOpen: boolean;
}) {
  const evidenceText = finding.evidenceText?.trim() || "자료 근거를 확인할 수 없습니다.";
  const recommendedReason =
    finding.recommendedReason?.trim() || "반영 이유를 확인할 수 없습니다.";
  const expectedEffect =
    finding.expectedEffect?.trim() || "예상 효과를 확인할 수 없습니다.";
  const reasoningBasis =
    finding.reasoningBasis?.trim() || "출제 원칙 검토 근거를 확인할 수 없습니다.";

  return (
    <details
      className="mt-2.5 rounded-sm border border-border/80 bg-paper/60"
      open={defaultOpen}
    >
      <summary className="cursor-pointer px-2.5 py-1.5 text-[11px] font-medium text-ink-muted hover:bg-highlight/40">
        판단 근거
      </summary>
      <div className="space-y-2 border-t border-border/60 px-2.5 py-2 text-[11px] leading-relaxed">
        {finding.evidenceDocuments.length > 0 && (
          <div>
            <p className="font-medium text-ink-faint">관련 자료</p>
            <p className="mt-0.5 text-ink-muted">
              {finding.evidenceDocuments.join(" · ")}
            </p>
          </div>
        )}
        <div>
          <p className="font-medium text-ink-faint">자료 근거</p>
          <p className="mt-0.5 text-ink-muted">{evidenceText}</p>
        </div>
        <div>
          <p className="font-medium text-ink-faint">출제 원칙</p>
          <p className="mt-0.5 text-ink-muted">{reasoningBasis}</p>
        </div>
        <div>
          <p className="font-medium text-ink-faint">반영 이유</p>
          <p className="mt-0.5 text-ink-muted">{recommendedReason}</p>
        </div>
        <div>
          <p className="font-medium text-ink-faint">예상 효과</p>
          <p className="mt-0.5 text-ink-muted">{expectedEffect}</p>
        </div>
      </div>
    </details>
  );
}

export default function ReviewFindingsList({
  findings,
  onDecisionChange,
  readOnly = false,
  emptyMessage = "표시할 검토 제안이 없습니다.",
  showEvidence = true,
  expandFirstEvidence = false,
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
      {findings.map((finding, index) => {
        const isAccept = finding.decision === "accept";
        const isIgnore = finding.decision === "ignore";
        const severity = finding.severity ?? "medium";

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
              <span
                className={`rounded-sm border px-1.5 py-px text-[10px] font-medium ${severityStyles[severity]}`}
              >
                중요도 {severityLabels[severity]}
              </span>
            </div>
            <p className="text-[13px] leading-relaxed text-ink">{finding.finding}</p>
            {finding.suggestedAction && (
              <p className="mt-1.5 text-[12px] leading-relaxed text-ink-muted">
                <span className="text-ink-faint">제안 조치 · </span>
                {finding.suggestedAction}
              </p>
            )}
            {showEvidence && (
              <FindingEvidence
                finding={finding}
                defaultOpen={expandFirstEvidence && index === 0}
              />
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
