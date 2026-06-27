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
      <div className="border-b border-border bg-paper-dark/50 px-5 py-4">
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.14em] text-accent uppercase">
              Issue Design
            </p>
            <h2 className="mt-1 font-serif text-xl font-semibold text-ink">
              평가 쟁점 설계
            </h2>
            <p className="mt-1 text-sm text-ink-muted">
              출제 의도에 맞는 평가 쟁점을 선별하세요. 쟁점 구성이 문항의
              학술적 수준을 결정합니다.
            </p>
          </div>
          <span className="shrink-0 text-sm text-ink-faint">
            {selectedIds.length}개 쟁점
          </span>
        </div>
      </div>

      <div className="p-5">
        <div className="space-y-6">
          {categories.map((category) => (
            <div key={category}>
              <h3 className="mb-3 border-b border-border pb-2 font-serif text-sm font-medium text-ink">
                {category}
              </h3>
              <div className="flex flex-wrap gap-2">
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
                        className={`rounded-sm border px-3 py-2 text-sm transition-all ${
                          isSelected
                            ? "border-ink bg-ink text-paper"
                            : "border-border bg-paper text-ink-muted hover:border-border-dark hover:bg-highlight"
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
