"use client";

import type { GenerationResult } from "@/types";
import { resultSectionLabels } from "@/data/generation-options";

interface DraftOutputProps {
  result: GenerationResult | null;
  error: string | null;
}

const sectionOrder: Array<keyof GenerationResult> = [
  "caseProblem",
  "examIntent",
  "issueStructure",
  "gradingCriteria",
  "professorReviewMemo",
];

export default function DraftOutput({ result, error }: DraftOutputProps) {
  if (error) {
    return (
      <section className="rounded-sm border border-red-200 bg-red-50 p-6">
        <h2 className="font-serif text-lg font-semibold text-red-800">
          초안 작성 오류
        </h2>
        <p className="mt-2 text-sm text-red-700">{error}</p>
      </section>
    );
  }

  if (!result) {
    return null;
  }

  const visibleSections = sectionOrder.filter((key) => result[key]?.trim());

  return (
    <section className="academic-shadow rounded-sm border border-border bg-paper">
      <div className="border-b border-border px-6 py-4">
        <p className="text-[10px] font-semibold tracking-[0.14em] text-accent uppercase">
          Draft Output
        </p>
        <h2 className="mt-1 font-serif text-xl font-semibold text-ink">
          출제 초안
        </h2>
        <p className="mt-1 text-sm text-ink-faint">
          교수 검수를 위한 초안입니다. 최종 출제 여부는 교수님이 결정합니다.
        </p>
      </div>

      <div className="divide-y divide-border">
        {visibleSections.map((key, index) => (
          <article key={key} className="px-6 py-6">
            <div className="mb-3 flex items-center gap-3">
              <span className="flex h-6 w-6 items-center justify-center border border-border-dark bg-highlight text-xs font-semibold text-ink-muted">
                {index + 1}
              </span>
              <h3 className="font-serif text-lg font-medium text-ink">
                {resultSectionLabels[key]}
              </h3>
            </div>
            <div className="whitespace-pre-wrap pl-9 text-sm leading-relaxed text-ink-muted">
              {result[key]}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
