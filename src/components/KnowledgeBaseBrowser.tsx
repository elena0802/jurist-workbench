"use client";

import { groupReferenceSourcesByCategory } from "@/lib/reference-sources";

interface KnowledgeBaseBrowserProps {
  selectedReferenceSourceIds: string[];
  onReferenceChange: (ids: string[]) => void;
}

const checkboxClassName =
  "mt-0.5 h-3 w-3 shrink-0 rounded-sm border border-ink/20 bg-paper accent-accent/50 focus:outline-none focus:ring-0 cursor-default disabled:cursor-not-allowed disabled:border-ink/10 disabled:bg-paper-dark/30";

export default function KnowledgeBaseBrowser({
  selectedReferenceSourceIds,
  onReferenceChange,
}: KnowledgeBaseBrowserProps) {
  const grouped = groupReferenceSourcesByCategory();

  const toggleSource = (id: string, disabled?: boolean) => {
    if (disabled) return;

    if (selectedReferenceSourceIds.includes(id)) {
      onReferenceChange(selectedReferenceSourceIds.filter((item) => item !== id));
    } else {
      onReferenceChange([...selectedReferenceSourceIds, id]);
    }
  };

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
          출제안 작성 및 검토 시 아래 자료를 기본 참고합니다.
        </p>
      </div>

      <div>
        {grouped.map(({ category, label, sources }, index) => {
          const isFuture = category === "future";

          return (
            <div
              key={category}
              className={`px-4 py-3.5 ${
                index > 0 ? "border-t border-border/70" : ""
              }`}
            >
              <h3
                className={`mb-2.5 font-serif text-[12px] font-semibold tracking-wide ${
                  isFuture ? "text-ink-faint" : "text-ink"
                }`}
              >
                {label}
              </h3>
              {isFuture && (
                <p className="mb-2 text-[10px] text-ink-faint">준비 중</p>
              )}
              <ul className="space-y-2">
                {sources.map((source) => {
                  const isInactive = Boolean(source.disabled) || !source.enabled;
                  const isChecked =
                    !isInactive && selectedReferenceSourceIds.includes(source.id);

                  return (
                    <li key={source.id}>
                      <label className="flex items-start gap-2.5 px-0.5 py-0.5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          disabled={isInactive}
                          onChange={() => toggleSource(source.id, isInactive)}
                          className={checkboxClassName}
                        />
                        <span
                          className={`min-w-0 flex-1 text-[13px] leading-snug ${
                            isInactive ? "text-ink-faint/80" : "text-ink-muted"
                          }`}
                        >
                          {source.label}
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
