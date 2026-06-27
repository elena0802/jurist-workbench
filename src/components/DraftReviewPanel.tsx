"use client";

import type {
  GenerationDifficulty,
  GenerationPurpose,
  KnowledgeDocument,
  LegalIssue,
  ReviewFinding,
} from "@/types";
import ProfessorVerdict from "@/components/ProfessorVerdict";
import DraftReviewExecutiveSummary from "@/components/DraftReviewExecutiveSummary";
import ReviewFindingsList from "@/components/ReviewFindingsList";

interface DraftReviewPanelProps {
  findings: ReviewFinding[];
  selectedIssues: LegalIssue[];
  selectedDocuments: KnowledgeDocument[];
  purpose: GenerationPurpose;
  difficulty: GenerationDifficulty;
  onFindingDecision: (id: string, decision: "accept" | "ignore") => void;
  onContinue: () => void;
  isLoading?: boolean;
  warning?: string | null;
  disabled?: boolean;
}

export default function DraftReviewPanel({
  findings,
  selectedIssues,
  selectedDocuments,
  purpose,
  difficulty,
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
          교수 검토 의견과 요약을 먼저 확인한 뒤, 필요 시 세부 논리를 펼쳐
          보세요.
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

            <ProfessorVerdict
              findings={findings}
              selectedIssues={selectedIssues}
              selectedDocuments={selectedDocuments}
              purpose={purpose}
              difficulty={difficulty}
            />

            <DraftReviewExecutiveSummary findings={findings} />

            <div>
              <h3 className="mb-2 text-xs font-medium text-ink">
                핵심 보완 지점
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
