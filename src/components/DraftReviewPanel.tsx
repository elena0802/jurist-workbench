"use client";

import type { ReviewFinding } from "@/types";
import ReviewFindingsList from "@/components/ReviewFindingsList";

interface DraftReviewPanelProps {
  findings: ReviewFinding[];
  onFindingDecision: (id: string, decision: "accept" | "ignore") => void;
  onContinue: () => void;
  isLoading?: boolean;
  warning?: string | null;
  disabled?: boolean;
}

export default function DraftReviewPanel({
  findings,
  onFindingDecision,
  onContinue,
  isLoading = false,
  warning,
  disabled = false,
}: DraftReviewPanelProps) {
  return (
    <section
      id="draft-review"
      className="academic-shadow rounded-sm border border-border bg-paper"
    >
      <div className="border-b border-border bg-paper-dark/40 px-5 py-4">
        <p className="text-[10px] font-semibold tracking-[0.14em] text-accent uppercase">
          Draft Review
        </p>
        <h2 className="mt-0.5 font-serif text-lg font-semibold text-ink">
          초안 검토
        </h2>
        <p className="mt-1 text-xs leading-relaxed text-ink-muted">
          1차 출제 초안을 검토하여 보완 지점을 정리했습니다. 각 항목의 반영
          여부를 확인한 뒤 교수 승인 단계로 진행하세요.
        </p>
      </div>

      <div className="space-y-5 p-5">
        {isLoading ? (
          <div className="rounded-sm border border-border bg-highlight/30 px-4 py-8 text-center">
            <p className="text-sm text-ink-muted">초안 검토 중…</p>
            <p className="mt-1 text-xs text-ink-faint">
              사실관계·쟁점·채점기준 등을 점검하고 있습니다.
            </p>
          </div>
        ) : (
          <>
            {warning && (
              <div className="rounded-sm border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                {warning}
              </div>
            )}

            <div>
              <h3 className="mb-3 text-xs font-medium text-ink">
                발견된 보완 지점
                <span className="ml-2 font-normal text-ink-faint">
                  검토 제안 {findings.length}건
                </span>
              </h3>
              <ReviewFindingsList
                findings={findings}
                onDecisionChange={onFindingDecision}
                expandFirstEvidence
                expandFirstRules
                emptyMessage="검토 제안을 불러오지 못했습니다. 교수 승인 단계에서 체크리스트를 활용해 주세요."
              />
            </div>

            <div className="border-t border-border/80 pt-4">
              <button
                type="button"
                onClick={onContinue}
                disabled={disabled || isLoading}
                className="w-full rounded-sm border border-ink/25 bg-ink/5 px-6 py-3 font-serif text-sm font-medium text-ink transition-colors hover:bg-ink/10 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                검토 확인 · 교수 승인으로
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
