"use client";

import {
  estimateContextTokens,
  getCollectionsForDocuments,
  getDocumentById,
} from "@/data/knowledge-base";
import { legalIssues } from "@/data/legal-issues";

interface SelectionSummaryProps {
  selectedDocumentIds: string[];
  selectedIssueIds: string[];
}

function formatTokens(tokens: number) {
  if (tokens >= 1000) {
    return `~${(tokens / 1000).toFixed(1)}k tokens`;
  }
  return `~${tokens} tokens`;
}

export default function SelectionSummary({
  selectedDocumentIds,
  selectedIssueIds,
}: SelectionSummaryProps) {
  const selectedCollections = getCollectionsForDocuments(selectedDocumentIds);
  const contextTokens = estimateContextTokens(selectedDocumentIds);

  return (
    <aside className="academic-shadow sticky top-6 rounded-sm border border-border bg-paper">
      <div className="border-b border-border px-4 py-3">
        <h2 className="font-serif text-base font-semibold text-ink">
          Selection Summary
        </h2>
        <p className="mt-0.5 text-xs text-ink-faint">현재 선택 상태</p>
      </div>

      <div className="divide-y divide-border">
        <SummarySection
          title="Selected collections"
          count={selectedCollections.length}
          emptyText="선택된 컬렉션이 없습니다"
        >
          {selectedCollections.map((col) => (
            <li key={col.id} className="text-sm text-ink-muted">
              {col.title}
            </li>
          ))}
        </SummarySection>

        <SummarySection
          title="Selected documents"
          count={selectedDocumentIds.length}
          emptyText="선택된 문서가 없습니다"
        >
          {selectedDocumentIds.map((id) => {
            const found = getDocumentById(id);
            return (
              <li key={id} className="text-sm text-ink-muted">
                {found?.document.title ?? id}
              </li>
            );
          })}
        </SummarySection>

        <SummarySection
          title="Selected issues"
          count={selectedIssueIds.length}
          emptyText="아직 선택된 쟁점이 없습니다"
        >
          {selectedIssueIds.map((id) => {
            const issue = legalIssues.find((item) => item.id === id);
            return (
              <li key={id} className="text-sm text-ink-muted">
                {issue?.name ?? id}
              </li>
            );
          })}
        </SummarySection>

        <div className="px-4 py-4">
          <h3 className="text-[11px] font-semibold tracking-[0.1em] text-ink-faint uppercase">
            Estimated context size
          </h3>
          <p className="mt-2 font-serif text-lg text-ink">
            {selectedDocumentIds.length > 0
              ? formatTokens(contextTokens)
              : "—"}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-ink-faint">
            선택된 문서의 추정 토큰 합계입니다. 생성 시 참고 컨텍스트
            규모를 나타냅니다.
          </p>
        </div>
      </div>
    </aside>
  );
}

function SummarySection({
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
        <h3 className="text-[11px] font-semibold tracking-[0.1em] text-ink-faint uppercase">
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
