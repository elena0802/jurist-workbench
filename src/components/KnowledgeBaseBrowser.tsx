"use client";

import { useMemo, useState } from "react";
import type { CollectionSource, KnowledgeCollection } from "@/types";
import { knowledgeCollections } from "@/data/knowledge-base";

interface KnowledgeBaseBrowserProps {
  selectedDocumentIds: string[];
  onDocumentChange: (ids: string[]) => void;
}

const sourceBadgeStyles: Record<CollectionSource, string> = {
  PUBLIC: "border-ink/20 bg-ink/5 text-ink-muted",
  PROFESSOR: "border-accent/30 bg-accent/10 text-accent",
  PRIVATE: "border-border-dark bg-paper-dark text-ink-faint",
};

function SourceBadge({ source }: { source: CollectionSource }) {
  return (
    <span
      className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase ${sourceBadgeStyles[source]}`}
    >
      {source}
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

  return (
    <div className="border-b border-border last:border-b-0">
      <button
        type="button"
        onClick={onToggleExpand}
        className="flex w-full items-start gap-3 px-4 py-4 text-left transition-colors hover:bg-highlight/60"
      >
        <span
          className="mt-0.5 w-4 shrink-0 font-mono text-xs text-ink-faint"
          aria-hidden
        >
          {isExpanded ? "▼" : "▶"}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-serif text-base font-medium text-ink">
              {collection.title}
            </h3>
            <SourceBadge source={collection.source} />
            <span className="text-xs text-ink-faint">
              {collection.documents.length}건
            </span>
            {selectedInCollection > 0 && (
              <span className="text-xs font-medium text-accent">
                {selectedInCollection}건 선택
              </span>
            )}
          </div>
          <p className="mt-1 text-sm leading-relaxed text-ink-muted">
            {collection.description}
          </p>
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-border bg-shelf/40 px-4 py-3 pl-11">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium tracking-wide text-ink-faint uppercase">
              문서 목록
            </span>
            <button
              type="button"
              onClick={() => onToggleAll(collection)}
              className="text-xs text-ink-muted underline-offset-2 hover:text-accent hover:underline"
            >
              {allSelected ? "전체 해제" : "전체 선택"}
            </button>
          </div>

          <ul className="space-y-1">
            {collection.documents.map((doc) => {
              const isSelected = selectedDocumentIds.includes(doc.id);
              return (
                <li key={doc.id}>
                  <label
                    className={`flex cursor-pointer items-center gap-3 rounded-sm px-2 py-2 transition-colors ${
                      isSelected ? "bg-accent/10" : "hover:bg-highlight"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleDocument(doc.id)}
                      className="h-3.5 w-3.5 shrink-0 accent-accent"
                    />
                    <span
                      className={`text-sm ${
                        isSelected
                          ? "font-medium text-ink"
                          : "text-ink-muted"
                      }`}
                    >
                      {doc.title}
                    </span>
                    <span className="ml-auto text-xs text-ink-faint">
                      ~{doc.tokenEstimate.toLocaleString()} tok
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
      const merged = new Set([...selectedDocumentIds, ...docIds]);
      onDocumentChange([...merged]);
    }
  };

  return (
    <section className="academic-shadow overflow-hidden rounded-sm border border-border bg-paper">
      <div className="border-b border-border bg-paper-dark/50 px-5 py-4">
        <h2 className="font-serif text-xl font-semibold text-ink">
          1. Knowledge Base
        </h2>
        <p className="mt-1 text-sm text-ink-muted">
          출제에 참고할 자료를 연구 라이브러리에서 선택하세요. 컬렉션을
          펼쳐 개별 문서를 지정할 수 있습니다.
        </p>
      </div>

      <div>
        {(["PUBLIC COLLECTIONS", "PROFESSOR COLLECTIONS"] as const).map(
          (group) => (
            <div key={group}>
              <div className="border-b border-border bg-highlight/70 px-4 py-2">
                <h3 className="text-[11px] font-semibold tracking-[0.12em] text-ink-faint">
                  {group}
                </h3>
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
