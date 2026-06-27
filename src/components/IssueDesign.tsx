"use client";

import type { LegalIssue } from "@/types";

interface IssueDesignProps {
  issues: LegalIssue[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export default function IssueDesign({
  issues,
  selectedIds,
  onChange,
}: IssueDesignProps) {
  const categories = [...new Set(issues.map((issue) => issue.category))];
  const hasSelection = selectedIds.length > 0;

  const toggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((item) => item !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  return (
    <section
      id="issue-design"
      className="academic-shadow rounded-sm border border-border bg-paper"
    >
      <div className="border-b border-border bg-paper-dark/40 px-4 py-3.5">
        <div className="flex items-baseline justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.14em] text-accent uppercase">
              Issue Design
            </p>
            <h2 className="mt-0.5 font-serif text-lg font-semibold text-ink">
              평가 쟁점 설계
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-ink-muted">
              출제 의도에 맞는 평가 쟁점을 선별하세요.
            </p>
          </div>
          <span className="shrink-0 text-xs text-ink-faint">
            {selectedIds.length}개
          </span>
        </div>
      </div>

      {!hasSelection && (
        <div className="border-b border-border/80 bg-highlight/30 px-4 py-2.5">
          <p className="text-xs leading-relaxed text-ink-muted">
            <span className="font-medium text-ink">다음:</span> 문항에 반영할
            형사법 쟁점을 선택하세요. 쟁점 구성이 평가의 핵심입니다.
          </p>
        </div>
      )}

      <div className="p-4">
        <div className="space-y-5">
          {categories.map((category) => (
            <div key={category}>
              <h3 className="mb-2 border-b border-border/80 pb-1.5 font-serif text-xs font-medium text-ink">
                {category}
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {issues
                  .filter((issue) => issue.category === category)
                  .map((issue) => {
                    const isSelected = selectedIds.includes(issue.id);
                    return (
                      <button
                        key={issue.id}
                        type="button"
                        onClick={() => toggle(issue.id)}
                        title={issue.description}
                        className={`rounded-sm border px-2.5 py-1.5 text-[13px] transition-colors ${
                          isSelected
                            ? "border-accent/50 bg-accent/[0.08] font-medium text-ink ring-1 ring-accent/15"
                            : "border-border bg-paper text-ink-muted hover:border-border-dark hover:bg-highlight/60"
                        }`}
                      >
                        {issue.name}
                      </button>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
