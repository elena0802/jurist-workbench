"use client";

import type { GenerationResult } from "@/types";
import { resultSectionLabels } from "@/data/generation-options";

interface ResultDisplayProps {
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

export default function ResultDisplay({ result, error }: ResultDisplayProps) {
  if (error) {
    return (
      <section className="rounded-sm border border-red-200 bg-red-50 p-6">
        <h2 className="font-serif text-lg font-semibold text-red-800">생성 오류</h2>
        <p className="mt-2 text-sm text-red-700">{error}</p>
      </section>
    );
  }

  if (!result) {
    return (
      <section className="rounded-sm border border-dashed border-border bg-paper-dark/50 p-10 text-center">
        <p className="font-serif text-lg text-ink-faint">
          생성된 결과가 여기에 표시됩니다.
        </p>
        <p className="mt-2 text-sm text-ink-faint">
          Knowledge Base 문서와 쟁점을 선택한 뒤 생성 버튼을 눌러 주세요.
        </p>
      </section>
    );
  }

  const visibleSections = sectionOrder.filter((key) => result[key]?.trim());

  return (
    <section className="academic-shadow rounded-sm border border-border bg-paper">
      <div className="border-b border-border px-6 py-4">
        <h2 className="font-serif text-xl font-semibold text-ink">생성 결과</h2>
        <p className="mt-1 text-sm text-ink-faint">
          교수님의 검수를 위해 초안 형태로 제공됩니다.
        </p>
      </div>

      <div className="divide-y divide-border">
        {visibleSections.map((key, index) => (
          <article key={key} className="px-6 py-6">
            <div className="mb-3 flex items-center gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-sm bg-accent/10 text-xs font-semibold text-accent">
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
