"use client";

import type { GenerationOptions } from "@/types";
import {
  estimateContextTokens,
  getCollectionsForDocuments,
  getDocumentById,
} from "@/data/knowledge-base";
import { legalIssues } from "@/data/legal-issues";
import {
  outputLabels,
} from "@/data/generation-options";

interface CurrentDraftProps {
  selectedDocumentIds: string[];
  selectedIssueIds: string[];
  options: GenerationOptions;
  hasDraft: boolean;
}

function formatVolume(tokens: number) {
  const pages = Math.max(1, Math.round(tokens / 500));
  return `약 ${pages}쪽 분량`;
}

export default function CurrentDraft({
  selectedDocumentIds,
  selectedIssueIds,
  options,
  hasDraft,
}: CurrentDraftProps) {
  const selectedCollections = getCollectionsForDocuments(selectedDocumentIds);
  const volumeTokens = estimateContextTokens(selectedDocumentIds);

  const enabledOutputs = (
    Object.entries(options.outputs) as Array<
      [keyof typeof outputLabels, boolean]
    >
  )
    .filter(([, on]) => on)
    .map(([key]) => outputLabels[key]);

  const isEmpty =
    selectedDocumentIds.length === 0 &&
    selectedIssueIds.length === 0 &&
    !hasDraft;

  return (
    <aside className="academic-shadow sticky top-6 rounded-sm border border-border bg-paper">
      <div className="border-b border-border bg-highlight/50 px-4 py-3">
        <p className="text-[10px] font-semibold tracking-[0.14em] text-accent uppercase">
          Current Draft
        </p>
        <h2 className="font-serif text-base font-semibold text-ink">
          현재 초안
        </h2>
        <p className="mt-0.5 text-xs text-ink-faint">
          {hasDraft
            ? "검수 대기 중인 출제 초안"
            : isEmpty
              ? "자료와 쟁점을 선택하면 초안 구성이 표시됩니다"
              : "초안 작성 준비 완료"}
        </p>
      </div>

      <div className="divide-y divide-border">
        <DraftSection
          title="참고 자료"
          count={selectedDocumentIds.length}
          emptyText="선택된 참고 문서 없음"
        >
          {selectedCollections.length > 0 && (
            <p className="mb-2 text-xs text-ink-faint">
              {selectedCollections.map((c) => c.title).join(" · ")}
            </p>
          )}
          {selectedDocumentIds.map((id) => {
            const found = getDocumentById(id);
            return (
              <li key={id} className="text-sm text-ink-muted">
                {found?.document.title ?? id}
              </li>
            );
          })}
        </DraftSection>

        <DraftSection
          title="평가 쟁점"
          count={selectedIssueIds.length}
          emptyText="설계된 평가 쟁점 없음"
        >
          {selectedIssueIds.map((id) => {
            const issue = legalIssues.find((item) => item.id === id);
            return (
              <li key={id} className="text-sm text-ink-muted">
                {issue?.name ?? id}
              </li>
            );
          })}
        </DraftSection>

        <DraftSection
          title="초안 구성"
          count={enabledOutputs.length}
          emptyText="포함 항목 미지정"
        >
          <li className="text-sm text-ink-muted">
            용도: {options.purpose}
          </li>
          <li className="text-sm text-ink-muted">
            난이도: {options.difficulty}
          </li>
          {enabledOutputs.map((label) => (
            <li key={label} className="text-sm text-ink-muted">
              {label}
            </li>
          ))}
        </DraftSection>

        <div className="px-4 py-4">
          <h3 className="text-[11px] font-semibold tracking-[0.1em] text-ink-faint uppercase">
            참고 분량
          </h3>
          <p className="mt-2 font-serif text-lg text-ink">
            {selectedDocumentIds.length > 0 ? formatVolume(volumeTokens) : "—"}
          </p>
        </div>

        {hasDraft && (
          <div className="border-t border-border bg-paper-dark/40 px-4 py-3">
            <p className="text-xs font-medium text-accent">
              초안이 작성되었습니다. 본문에서 검수하세요.
            </p>
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
}: {
  title: string;
  count: number;
  emptyText: string;
  children: React.ReactNode;
}) {
  return (
    <div className="px-4 py-4">
      <div className="mb-2 flex items-baseline justify-between">
        <h3 className="text-[11px] font-semibold tracking-[0.08em] text-ink-faint">
          {title}
        </h3>
        <span className="text-xs text-ink-faint">{count}</span>
      </div>
      {count === 0 ? (
        <p className="text-sm italic text-ink-faint">{emptyText}</p>
      ) : (
        <ul className="space-y-1.5">{children}</ul>
      )}
    </div>
  );
}
