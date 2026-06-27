"use client";

import { useMemo, useState } from "react";
import type { CollectionSource, KnowledgeCollection } from "@/types";
import { knowledgeCollections } from "@/data/knowledge-base";

interface KnowledgeBaseBrowserProps {
  selectedDocumentIds: string[];
  onDocumentChange: (ids: string[]) => void;
}

const sourceBadgeLabels: Record<CollectionSource, string> = {
  PUBLIC: "공개",
  PROFESSOR: "교수",
  PRIVATE: "비공개",
};

const sourceBadgeStyles: Record<CollectionSource, string> = {
  PUBLIC: "border-ink/15 bg-ink/5 text-ink-muted",
  PROFESSOR: "border-accent/25 bg-accent/8 text-accent",
  PRIVATE: "border-border-dark bg-paper-dark text-ink-faint",
};

const groupLabels: Record<KnowledgeCollection["group"], string> = {
  "PUBLIC COLLECTIONS": "공개 컬렉션",
  "PROFESSOR COLLECTIONS": "교수 컬렉션",
};

function SourceBadge({ source }: { source: CollectionSource }) {
  return (
    <span
      className={`shrink-0 rounded px-1.5 py-px text-[10px] font-medium tracking-wide ${sourceBadgeStyles[source]}`}
    >
      {sourceBadgeLabels[source]}
    </span>
  );
}

function CollectionRow({
  collection,
  isExpanded,
  selectedDocumentIds,
  onToggleExpand,
  onToggleDocument,
  onToggleAll,
}: {
  collection: KnowledgeCollection;
  isExpanded: boolean;
  selectedDocumentIds: string[];
  onToggleExpand: () => void;
  onToggleDocument: (docId: string) => void;
  onToggleAll: (collection: KnowledgeCollection) => void;
}) {
  const selectedInCollection = collection.documents.filter((d) =>
    selectedDocumentIds.includes(d.id)
  ).length;
  const allSelected =
    collection.documents.length > 0 &&
    selectedInCollection === collection.documents.length;
  const hasSelection = selectedInCollection > 0;

  return (
    <div
      className={`border-b border-border last:border-b-0 ${
        hasSelection && !isExpanded ? "border-l-2 border-l-accent/50" : "border-l-2 border-l-transparent"
      }`}
    >
      <button
        type="button"
        onClick={onToggleExpand}
        aria-expanded={isExpanded}
        className={`flex w-full items-start gap-2.5 px-4 py-3 text-left transition-colors ${
          hasSelection ? "bg-accent/[0.03]" : "hover:bg-highlight/40"
        }`}
      >
        <span
          className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center text-[11px] text-ink-faint"
          aria-hidden
        >
          {isExpanded ? "−" : "+"}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h3 className="font-serif text-[15px] font-medium leading-snug text-ink">
              {collection.title}
            </h3>
            <SourceBadge source={collection.source} />
            <span className="text-[11px] text-ink-faint">
              {collection.documents.length}권
            </span>
            {hasSelection && (
              <span className="text-[11px] font-medium text-accent">
                {selectedInCollection}권 편람
              </span>
            )}
          </div>
          {!isExpanded && (
            <p className="mt-0.5 line-clamp-1 text-xs leading-relaxed text-ink-faint">
              {collection.description}
            </p>
          )}
          {isExpanded && (
            <p className="mt-1 text-xs leading-relaxed text-ink-muted">
              {collection.description}
            </p>
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-border/80 bg-shelf/30">
          <div className="flex items-center justify-between px-4 py-1.5 pl-9">
            <span className="text-[11px] text-ink-faint">편람 목록</span>
            <button
              type="button"
              onClick={() => onToggleAll(collection)}
              className="text-[11px] text-ink-muted underline-offset-2 hover:text-accent hover:underline"
            >
              {allSelected ? "전체 해제" : "전체 편람"}
            </button>
          </div>

          <ul className="pb-2">
            {collection.documents.map((doc) => {
              const isSelected = selectedDocumentIds.includes(doc.id);
              const pages = Math.max(1, Math.round(doc.tokenEstimate / 500));
              return (
                <li key={doc.id}>
                  <label
                    className={`mx-2 flex cursor-pointer items-center gap-2.5 rounded-sm border-l-2 py-1.5 pr-3 pl-7 transition-colors ${
                      isSelected
                        ? "border-l-accent bg-accent/[0.06] text-ink"
                        : "border-l-transparent text-ink-muted hover:bg-highlight/50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleDocument(doc.id)}
                      className="h-3 w-3 shrink-0 accent-accent"
                    />
                    <span
                      className={`min-w-0 flex-1 text-[13px] leading-snug ${
                        isSelected ? "font-medium" : ""
                      }`}
                    >
                      {doc.title}
                    </span>
                    <span className="shrink-0 text-[11px] text-ink-faint">
                      {pages}쪽
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function KnowledgeBaseBrowser({
  selectedDocumentIds,
  onDocumentChange,
}: KnowledgeBaseBrowserProps) {
  const [expandedIds, setExpandedIds] = useState<string[]>([]);

  const grouped = useMemo(() => {
    const groups: Record<string, KnowledgeCollection[]> = {};
    for (const col of knowledgeCollections) {
      if (!groups[col.group]) groups[col.group] = [];
      groups[col.group].push(col);
    }
    return groups;
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleDocument = (docId: string) => {
    if (selectedDocumentIds.includes(docId)) {
      onDocumentChange(selectedDocumentIds.filter((id) => id !== docId));
    } else {
      onDocumentChange([...selectedDocumentIds, docId]);
    }
  };

  const toggleAllInCollection = (collection: KnowledgeCollection) => {
    const docIds = collection.documents.map((d) => d.id);
    const allSelected = docIds.every((id) => selectedDocumentIds.includes(id));

    if (allSelected) {
      onDocumentChange(
        selectedDocumentIds.filter((id) => !docIds.includes(id))
      );
    } else {
      onDocumentChange([...new Set([...selectedDocumentIds, ...docIds])]);
    }
  };

  const hasSelection = selectedDocumentIds.length > 0;

  return (
    <section
      id="knowledge-base"
      className="academic-shadow overflow-hidden rounded-sm border border-border bg-paper"
    >
      <div className="border-b border-border bg-paper-dark/40 px-4 py-3.5">
        <p className="text-[10px] font-semibold tracking-[0.14em] text-accent uppercase">
          Knowledge Base
        </p>
        <h2 className="mt-0.5 font-serif text-lg font-semibold text-ink">
          지식 베이스
        </h2>
        <p className="mt-1 text-xs leading-relaxed text-ink-muted">
          컬렉션을 펼쳐 출제에 참고할 문서를 편람하세요.
        </p>
      </div>

      {!hasSelection && (
        <div className="border-b border-border/80 bg-highlight/30 px-4 py-2.5">
          <p className="text-xs leading-relaxed text-ink-muted">
            <span className="font-medium text-ink">시작:</span> 컬렉션을
            선택하여 참고 자료를 지정합니다. 우측 현재 초안에 반영됩니다.
          </p>
        </div>
      )}

      <div>
        {(["PUBLIC COLLECTIONS", "PROFESSOR COLLECTIONS"] as const).map(
          (group) => (
            <div key={group}>
              <div className="flex items-center gap-2 border-b border-border/80 bg-highlight/40 px-4 py-2">
                <span className="h-px flex-1 bg-border-dark/80" aria-hidden />
                <h3 className="shrink-0 font-serif text-[11px] font-medium tracking-wide text-ink-faint">
                  {groupLabels[group]}
                </h3>
                <span className="h-px flex-1 bg-border-dark/80" aria-hidden />
              </div>

              {grouped[group]?.map((collection) => (
                <CollectionRow
                  key={collection.id}
                  collection={collection}
                  isExpanded={expandedIds.includes(collection.id)}
                  selectedDocumentIds={selectedDocumentIds}
                  onToggleExpand={() => toggleExpand(collection.id)}
                  onToggleDocument={toggleDocument}
                  onToggleAll={toggleAllInCollection}
                />
              ))}
            </div>
          )
        )}
      </div>
    </section>
  );
}
