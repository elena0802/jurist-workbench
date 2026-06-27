"use client";

import type { LegalIssue } from "@/types";

interface LegalIssueSelectorProps {
  issues: LegalIssue[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export default function LegalIssueSelector({
  issues,
  selectedIds,
  onChange,
}: LegalIssueSelectorProps) {
  const categories = [...new Set(issues.map((issue) => issue.category))];

  const toggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((item) => item !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  return (
    <section className="academic-shadow rounded-sm border border-border bg-paper p-6">
      <div className="mb-5 flex items-baseline justify-between">
        <div>
          <h2 className="font-serif text-xl font-semibold text-ink">
            2. 법적 쟁점 선택
          </h2>
          <p className="mt-1 text-sm text-ink-faint">
            출제에 반영할 형사법 쟁점을 선택하세요. 쟁점 선별이 출제의 핵심입니다.
          </p>
        </div>
        <span className="text-sm text-ink-faint">{selectedIds.length}개 선택</span>
      </div>

      <div className="space-y-6">
        {categories.map((category) => (
          <div key={category}>
            <h3 className="mb-3 text-xs font-semibold tracking-widest text-ink-faint uppercase">
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
                      className={`rounded-sm border px-3 py-1.5 text-sm transition-all ${
                        isSelected
                          ? "border-accent bg-accent text-paper"
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
    </section>
  );
}
