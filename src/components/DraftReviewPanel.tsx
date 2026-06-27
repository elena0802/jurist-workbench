"use client";

import type { ReviewFinding } from "@/types";
import { summarizeRuleInspection } from "@/lib/rule-matching";
import { summarizeFindingPriorities } from "@/lib/finding-priority";
import ReviewFindingsList from "@/components/ReviewFindingsList";

interface DraftReviewPanelProps {
  findings: ReviewFinding[];
  onFindingDecision: (id: string, decision: "accept" | "ignore") => void;
  onContinue: () => void;
  isLoading?: boolean;
  warning?: string | null;
  disabled?: boolean;
}

function ReviewSummaryBox({ findings }: { findings: ReviewFinding[] }) {
  const priorities = summarizeFindingPriorities(findings);
  const rules = summarizeRuleInspection(findings);

  if (findings.length === 0) return null;

  return (
    <div className="rounded-sm border border-ink/20 bg-ink/[0.03] px-4 py-3">
      <p className="text-[10px] font-semibold tracking-[0.08em] text-ink-faint uppercase">
        Review Summary
      </p>
      <h3 className="mt-0.5 font-serif text-sm font-semibold text-ink">
        검토 요약
      </h3>
      <p className="mt-1.5 text-[13px] leading-relaxed text-ink-muted">
        <span className="font-medium text-accent">필수 수정 {priorities.required}</span>
        <span className="mx-1.5 text-ink-faint">·</span>
        <span className="text-amber-900">권장 수정 {priorities.recommended}</span>
        <span className="mx-1.5 text-ink-faint">·</span>
        <span>선택 수정 {priorities.optional}</span>
        <span className="mx-1.5 text-ink-faint">·</span>
        <span>적용 원칙 {rules.total}</span>
      </p>
      {rules.total > 0 && (
        <p className="mt-1 text-[11px] text-ink-faint">
          충족 {rules.satisfied} · 부분 충족 {rules.partial} · 미충족{" "}
          {rules.violated}
        </p>
      )}
      <p className="mt-2 text-[11px] leading-relaxed text-ink-faint">
        이 검토는 선택된 자료와 적용 원칙을 기준으로 제안되었습니다.
      </p>
    </div>
  );
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
          출제 원칙에 따라 1차 초안을 점검했습니다. 요약과 우선순위를 확인한 뒤
          교수 승인 단계로 진행하세요.
        </p>
      </div>

      <div className="space-y-4 p-5">
        {isLoading ? (
          <div className="rounded-sm border border-border bg-highlight/30 px-4 py-8 text-center">
            <p className="text-sm text-ink-muted">초안 검토 중…</p>
            <p className="mt-1 text-xs text-ink-faint">
              출제 원칙·사실관계·쟁점·채점기준을 점검하고 있습니다.
            </p>
          </div>
        ) : (
          <>
            {warning && (
              <div className="rounded-sm border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                {warning}
              </div>
            )}

            <ReviewSummaryBox findings={findings} />

            <div>
              <h3 className="mb-2 text-xs font-medium text-ink">
                발견된 보완 지점
                <span className="ml-2 font-normal text-ink-faint">
                  {findings.length}건
                </span>
              </h3>
              <ReviewFindingsList
                findings={findings}
                onDecisionChange={onFindingDecision}
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
