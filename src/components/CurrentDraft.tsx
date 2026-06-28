"use client";

import { useMemo } from "react";
import type { GenerationOptions, WorkflowPhase } from "@/types";
import { referenceCategoryLabels } from "@/data/reference-sources";
import { legalIssues } from "@/data/legal-issues";
import { outputLabels } from "@/data/generation-options";
import { summarizeReferenceSourcesByCategory } from "@/lib/reference-sources";

interface CurrentDraftProps {
  selectedReferenceSourceIds: string[];
  selectedIssueIds: string[];
  options: GenerationOptions;
  hasDraft: boolean;
  workflowPhase?: WorkflowPhase;
  appliedRuleCount?: number;
  partialRuleCount?: number;
  violatedRuleCount?: number;
  ruleReviewComplete?: boolean;
}

export default function CurrentDraft({
  selectedReferenceSourceIds,
  selectedIssueIds,
  options,
  hasDraft,
  workflowPhase = "idle",
  appliedRuleCount = 0,
  partialRuleCount = 0,
  violatedRuleCount = 0,
  ruleReviewComplete = false,
}: CurrentDraftProps) {
  const referenceCounts = useMemo(
    () => summarizeReferenceSourcesByCategory(selectedReferenceSourceIds),
    [selectedReferenceSourceIds]
  );

  const totalReferences =
    referenceCounts["official-exam"] +
    referenceCounts.precedent +
    referenceCounts["professor-knowledge"];

  const selectedIssues = useMemo(
    () =>
      selectedIssueIds
        .map((id) => legalIssues.find((issue) => issue.id === id))
        .filter((issue): issue is NonNullable<typeof issue> => issue !== undefined),
    [selectedIssueIds]
  );

  const enabledOutputs = (
    Object.entries(options.outputs) as Array<
      [keyof typeof outputLabels, boolean]
    >
  )
    .filter(([, on]) => on)
    .map(([key]) => outputLabels[key]);

  const isEmpty =
    totalReferences === 0 && selectedIssueIds.length === 0 && !hasDraft;

  return (
    <aside className="academic-shadow sticky top-6 rounded-sm border border-border bg-paper text-[13px]">
      <div className="border-b border-border bg-highlight/40 px-3.5 py-3">
        <p className="text-[10px] font-semibold tracking-[0.14em] text-accent uppercase">
          Current Draft
        </p>
        <h2 className="font-serif text-[15px] font-semibold text-ink">
          현재 초안
        </h2>
        <p className="mt-0.5 text-[11px] leading-relaxed text-ink-faint">
          {workflowPhase === "revised-complete"
            ? "수정 초안 v2 완료"
            : workflowPhase === "revising"
              ? "수정 초안 작성 중"
              : workflowPhase === "approval-pending"
                ? "교수 승인 대기"
                : workflowPhase === "draft-review-loading"
                  ? "초안 검토 중"
                  : workflowPhase === "draft-review-complete"
                    ? "초안 검토 완료"
                    : workflowPhase === "draft-v1-complete"
                      ? "출제 초안 작성 완료"
                      : hasDraft
                        ? "검수 대기 중"
                        : isEmpty
                          ? "평가 쟁점을 설계하세요"
                          : "초안 작성 준비됨"}
        </p>
      </div>

      {isEmpty && (
        <div className="border-b border-border/80 bg-paper-dark/30 px-3.5 py-2.5">
          <ol className="space-y-1 text-[11px] leading-relaxed text-ink-muted">
            <li>1. 참고 자료 확인</li>
            <li>2. 평가 쟁점 설계</li>
            <li>3. 출제 초안 작성</li>
            <li>4. 초안 검토</li>
            <li>5. 교수 승인</li>
            <li>6. 수정 초안</li>
          </ol>
        </div>
      )}

      <div className="divide-y divide-border/80">
        <DraftSection
          title="기본 참고자료"
          count={totalReferences}
          emptyText="참고 자료 없음"
          hideCount
        >
          {referenceCounts["official-exam"] > 0 && (
            <li>
              <p className="text-[12px] font-medium text-ink-muted">
                {referenceCategoryLabels["official-exam"]}
              </p>
              <p className="mt-0.5 text-[10px] text-ink-faint">
                {referenceCounts["official-exam"]}개 포함
              </p>
            </li>
          )}
          {referenceCounts.precedent > 0 && (
            <li>
              <p className="text-[12px] font-medium text-ink-muted">
                {referenceCategoryLabels.precedent}
              </p>
              <p className="mt-0.5 text-[10px] text-ink-faint">
                {referenceCounts.precedent}개 포함
              </p>
            </li>
          )}
          {referenceCounts["professor-knowledge"] > 0 && (
            <li>
              <p className="text-[12px] font-medium text-ink-muted">
                {referenceCategoryLabels["professor-knowledge"]}
              </p>
              <p className="mt-0.5 text-[10px] text-ink-faint">
                {referenceCounts["professor-knowledge"]}개 포함
              </p>
            </li>
          )}
        </DraftSection>

        <DraftSection
          title="평가 쟁점"
          count={selectedIssueIds.length}
          emptyText="설계된 쟁점 없음"
        >
          <li className="flex flex-wrap gap-1">
            {selectedIssues.map((issue) => (
              <span
                key={issue.id}
                className="rounded-sm border border-ink/15 bg-ink/5 px-1.5 py-px text-[11px] text-ink-muted"
              >
                {issue.name}
              </span>
            ))}
          </li>
        </DraftSection>

        <DraftSection
          title="초안 구성"
          count={enabledOutputs.length + 2}
          emptyText="—"
          hideWhenEmpty
        >
          <li className="flex justify-between gap-2 text-[12px]">
            <span className="text-ink-faint">용도</span>
            <span className="text-ink-muted">{options.purpose}</span>
          </li>
          <li className="flex justify-between gap-2 text-[12px]">
            <span className="text-ink-faint">난이도</span>
            <span className="text-ink-muted">{options.difficulty}</span>
          </li>
          {enabledOutputs.length > 0 && (
            <li className="pt-0.5">
              <p className="mb-1 text-[10px] text-ink-faint">포함 항목</p>
              <ul className="space-y-0.5">
                {enabledOutputs.map((label) => (
                  <li
                    key={label}
                    className="text-[12px] leading-snug text-ink-muted"
                  >
                    · {label}
                  </li>
                ))}
              </ul>
            </li>
          )}
        </DraftSection>

        {hasDraft && (
          <div className="border-t border-border/80 bg-paper-dark/30 px-3.5 py-2 space-y-0.5">
            <p className="text-[11px] text-accent">
              초안 작성 완료 · 본문에서 검수
            </p>
            {appliedRuleCount > 0 && (
              <>
                <p className="text-[10px] text-ink-muted">
                  적용 원칙: {appliedRuleCount}개
                </p>
                {(partialRuleCount > 0 || violatedRuleCount > 0) && (
                  <p className="text-[10px] leading-snug text-ink-faint">
                    {partialRuleCount > 0 && (
                      <span className="text-amber-900/80">
                        부분 충족 {partialRuleCount}개
                      </span>
                    )}
                    {partialRuleCount > 0 && violatedRuleCount > 0 && (
                      <span className="mx-1">·</span>
                    )}
                    {violatedRuleCount > 0 && (
                      <span className="text-accent/90">
                        미충족 {violatedRuleCount}개
                      </span>
                    )}
                  </p>
                )}
                {ruleReviewComplete && (
                  <p className="text-[10px] text-ink-muted">원칙 검토 완료</p>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}

function DraftSection({
  title,
  count,
  emptyText,
  children,
  hideWhenEmpty,
  hideCount = false,
}: {
  title: string;
  count: number;
  emptyText: string;
  children: React.ReactNode;
  hideWhenEmpty?: boolean;
  hideCount?: boolean;
}) {
  if (hideWhenEmpty && count === 0) return null;

  const isEmpty = count === 0;

  return (
    <div className="px-3.5 py-2.5">
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <h3 className="text-[10px] font-semibold tracking-[0.06em] text-ink-faint">
          {title}
        </h3>
        {!isEmpty && !hideCount && (
          <span className="text-[10px] tabular-nums text-ink-faint">
            {count}
          </span>
        )}
      </div>
      {isEmpty ? (
        <p className="text-[11px] italic text-ink-faint/90">{emptyText}</p>
      ) : (
        <ul className="space-y-2">{children}</ul>
      )}
    </div>
  );
}
