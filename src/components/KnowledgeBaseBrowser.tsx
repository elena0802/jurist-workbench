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
  PUBLIC: "border-ink/20 bg-ink/5 text-ink-muted",
  PROFESSOR: "border-accent/30 bg-accent/10 text-accent",
  PRIVATE: "border-border-dark bg-paper-dark text-ink-faint",
};

const groupLabels: Record<KnowledgeCollection["group"], string> = {
  "PUBLIC COLLECTIONS": "공개 컬렉션",
  "PROFESSOR COLLECTIONS": "교수 컬렉션",
};

function SourceBadge({ source }: { source: CollectionSource }) {
  return (
    <span
      className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold tracking-wide ${sourceBadgeStyles[source]}`}
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

  return (
    <div className="border-b border-border last:border-b-0">
      <button
        type="button"
        onClick={onToggleExpand}
        aria-expanded={isExpanded}
        className="flex w-full items-start gap-3 px-5 py-4 text-left transition-colors hover:bg-highlight/50"
      >
        <span
          className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center border border-border-dark bg-paper text-[10px] text-ink-faint"
          aria-hidden
        >
          {isExpanded ? "−" : "+"}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-serif text-base font-medium text-ink">
              {collection.title}
            </h3>
            <SourceBadge source={collection.source} />
          </div>
          <p className="mt-1 text-sm leading-relaxed text-ink-muted">
            {collection.description}
          </p>
          <p className="mt-2 text-xs text-ink-faint">
            {collection.documents.length}권
            {selectedInCollection > 0 && (
              <span className="ml-2 font-medium text-accent">
                · {selectedInCollection}권 편람 중
              </span>
            )}
          </p>
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-border bg-shelf/50">
          <div className="flex items-center justify-between border-b border-border/60 px-5 py-2 pl-[3.25rem]">
            <span className="text-xs font-medium text-ink-faint">
              편람 목록
            </span>
            <button
              type="button"
              onClick={() => onToggleAll(collection)}
              className="text-xs text-ink-muted underline-offset-2 hover:text-accent hover:underline"
            >
              {allSelected ? "전체 해제" : "전체 편람"}
            </button>
          </div>

          <ul className="divide-y divide-border/60">
            {collection.documents.map((doc) => {
              const isSelected = selectedDocumentIds.includes(doc.id);
              const pages = Math.max(1, Math.round(doc.tokenEstimate / 500));
              return (
                <li key={doc.id}>
                  <label
                    className={`flex cursor-pointer items-center gap-3 px-5 py-3 pl-[3.25rem] transition-colors ${
                      isSelected ? "bg-accent/5" : "hover:bg-highlight/60"
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
                        isSelected ? "font-medium text-ink" : "text-ink-muted"
                      }`}
                    >
                      {doc.title}
                    </span>
                    <span className="ml-auto text-xs text-ink-faint">
                      약 {pages}쪽
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

  return (
    <section
      id="knowledge-base"
      className="academic-shadow overflow-hidden rounded-sm border border-border bg-paper"
    >
      <div className="border-b border-border bg-paper-dark/50 px-5 py-4">
        <p className="text-[10px] font-semibold tracking-[0.14em] text-accent uppercase">
          Knowledge Base
        </p>
        <h2 className="mt-1 font-serif text-xl font-semibold text-ink">
          지식 베이스
        </h2>
        <p className="mt-1 text-sm text-ink-muted">
          출제 참고 자료를 컬렉션별로 편람하세요. 공개·교수·비공개 자료를
          구분하여 관리합니다.
        </p>
      </div>

      <div>
        {(["PUBLIC COLLECTIONS", "PROFESSOR COLLECTIONS"] as const).map(
          (group) => (
            <div key={group}>
              <div className="flex items-center gap-3 border-b border-border bg-highlight/60 px-5 py-2.5">
                <span className="h-px flex-1 bg-border-dark" aria-hidden />
                <h3 className="shrink-0 font-serif text-xs font-medium tracking-wide text-ink-muted">
                  {groupLabels[group]}
                </h3>
                <span className="h-px flex-1 bg-border-dark" aria-hidden />
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
