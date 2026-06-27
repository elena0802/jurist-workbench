"use client";

import type { ReviewChecklistId, ReviewFinding } from "@/types";
import { reviewChecklistItems } from "@/data/review-checklist";
import ReviewFindingsList from "@/components/ReviewFindingsList";

interface ProfessorReviewPanelProps {
  findings: ReviewFinding[];
  onFindingDecision: (id: string, decision: "accept" | "ignore") => void;
  checklistIds: ReviewChecklistId[];
  onChecklistChange: (ids: ReviewChecklistId[]) => void;
  professorInstruction: string;
  onInstructionChange: (value: string) => void;
  onRevise: () => void;
  isRevising: boolean;
  disabled?: boolean;
  error?: string | null;
}

export default function ProfessorReviewPanel({
  findings,
  onFindingDecision,
  checklistIds,
  onChecklistChange,
  professorInstruction,
  onInstructionChange,
  onRevise,
  isRevising,
  disabled = false,
  error,
}: ProfessorReviewPanelProps) {
  const toggleChecklist = (id: ReviewChecklistId) => {
    if (checklistIds.includes(id)) {
      onChecklistChange(checklistIds.filter((item) => item !== id));
    } else {
      onChecklistChange([...checklistIds, id]);
    }
  };

  const acceptedCount = findings.filter((f) => f.decision === "accept").length;
  const canRevise =
    !disabled &&
    !isRevising &&
    (checklistIds.length > 0 ||
      acceptedCount > 0 ||
      professorInstruction.trim().length > 0);

  return (
    <section
      id="professor-approval"
      className="academic-shadow rounded-sm border border-border bg-paper"
    >
      <div className="border-b border-border bg-paper-dark/40 px-5 py-4">
        <p className="text-[10px] font-semibold tracking-[0.14em] text-accent uppercase">
          Professor Approval
        </p>
        <h2 className="mt-0.5 font-serif text-lg font-semibold text-ink">
          교수 승인
        </h2>
        <p className="mt-1 text-xs leading-relaxed text-ink-muted">
          검토 제안의 반영 여부를 확정하고, 체크리스트·추가 지시를 선택한 뒤
          수정 초안을 작성하세요.
        </p>
      </div>

      <div className="space-y-6 p-5">
        <div>
          <h3 className="mb-3 text-xs font-medium text-ink">
            검토 제안
            <span className="ml-2 font-normal text-ink-faint">
              반영 · 무시 선택
            </span>
          </h3>
          <ReviewFindingsList
            findings={findings}
            onDecisionChange={onFindingDecision}
            emptyMessage="검토 제안이 없습니다. 체크리스트와 추가 지시로 수정할 수 있습니다."
          />
        </div>

        <div>
          <h3 className="mb-3 text-xs font-medium text-ink">검수 체크리스트</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {reviewChecklistItems.map((item) => {
              const checked = checklistIds.includes(item.id);
              return (
                <label
                  key={item.id}
                  className={`flex cursor-pointer items-center gap-2.5 rounded-sm border px-3 py-2 transition-colors ${
                    checked
                      ? "border-ink/30 bg-ink/5"
                      : "border-border hover:bg-highlight/50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleChecklist(item.id)}
                    className="h-3.5 w-3.5 accent-accent"
                  />
                  <span className="text-[13px] text-ink-muted">{item.label}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div>
          <label
            htmlFor="professor-instruction"
            className="mb-2 block text-xs font-medium text-ink"
          >
            교수님 추가 지시
          </label>
          <textarea
            id="professor-instruction"
            value={professorInstruction}
            onChange={(e) => onInstructionChange(e.target.value)}
            placeholder="예: 학생들이 금지착오로 오해할 수 있도록 사실관계를 보강하고, 채점기준을 30점 기준으로 더 세분화해 주세요."
            rows={4}
            className="w-full resize-y rounded-sm border border-border bg-paper px-3 py-2 text-sm leading-relaxed text-ink-muted placeholder:text-ink-faint focus:border-border-dark focus:outline-none focus:ring-1 focus:ring-border-dark"
          />
        </div>

        {error && (
          <div className="rounded-sm border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="border-t border-border/80 pt-4">
          <button
            type="button"
            onClick={onRevise}
            disabled={!canRevise}
            className="w-full rounded-sm border border-accent bg-accent px-6 py-3 font-serif text-sm font-medium text-paper transition-colors hover:bg-accent-light disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {isRevising
              ? "수정 초안 작성 중…"
              : "승인한 검토 내용으로 수정 초안 작성"}
          </button>
          {!canRevise && !isRevising && (
            <p className="mt-2 text-xs text-ink-faint">
              반영할 검토 제안, 체크리스트, 또는 추가 지시 중 하나 이상을
              지정해 주세요.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
