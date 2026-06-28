"use client";

import {
  groupReferenceSourcesByCategory,
} from "@/lib/reference-sources";

interface KnowledgeBaseBrowserProps {
  selectedReferenceSourceIds: string[];
  onReferenceChange: (ids: string[]) => void;
}

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
          출제안 검토 시 기본적으로 아래 자료를 함께 참고합니다. 필요한 경우
          특정 자료만 제외할 수 있습니다.
        </p>
      </div>

      <div className="divide-y divide-border/80">
        {grouped.map(({ category, label, sources }) => (
          <div key={category} className="px-4 py-3">
            <h3
              className={`mb-2 text-[11px] font-medium tracking-wide ${
                category === "future" ? "text-ink-faint" : "text-ink-faint"
              }`}
            >
              {label}
            </h3>
            <ul className="space-y-1">
              {sources.map((source) => {
                const isDisabled = Boolean(source.disabled) || !source.enabled;
                const isChecked = isDisabled
                  ? source.checkedByDefault
                  : selectedReferenceSourceIds.includes(source.id);

                return (
                  <li key={source.id}>
                    <label
                      className={`flex items-start gap-2.5 rounded-sm px-1 py-1.5 transition-colors ${
                        isDisabled
                          ? "cursor-not-allowed opacity-60"
                          : "cursor-pointer hover:bg-highlight/40"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        disabled={isDisabled}
                        onChange={() => toggleSource(source.id, isDisabled)}
                        className="mt-0.5 h-3.5 w-3.5 accent-accent disabled:opacity-70"
                      />
                      <span className="min-w-0 flex-1">
                        <span
                          className={`text-[13px] leading-snug ${
                            isDisabled ? "text-ink-faint" : "text-ink-muted"
                          }`}
                        >
                          {source.label}
                        </span>
                        {source.note && (
                          <span className="ml-1.5 text-[10px] text-ink-faint">
                            {source.note}
                          </span>
                        )}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
