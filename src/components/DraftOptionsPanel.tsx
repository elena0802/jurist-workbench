"use client";

import type { GenerationOptions, GenerationPurpose, GenerationDifficulty } from "@/types";
import {
  generationPurposes,
  generationDifficulties,
  outputLabels,
} from "@/data/generation-options";

interface DraftOptionsPanelProps {
  options: GenerationOptions;
  onChange: (options: GenerationOptions) => void;
  composeSlot?: React.ReactNode;
}

export default function DraftOptionsPanel({
  options,
  onChange,
  composeSlot,
}: DraftOptionsPanelProps) {
  const setPurpose = (purpose: GenerationPurpose) => {
    onChange({ ...options, purpose });
  };

  const setDifficulty = (difficulty: GenerationDifficulty) => {
    onChange({ ...options, difficulty });
  };

  const toggleOutput = (key: keyof GenerationOptions["outputs"]) => {
    onChange({
      ...options,
      outputs: { ...options.outputs, [key]: !options.outputs[key] },
    });
  };

  return (
    <section
      id="draft"
      className="academic-shadow rounded-sm border border-border bg-paper"
    >
      <div className="border-b border-border bg-paper-dark/40 px-4 py-3.5">
        <p className="text-[10px] font-semibold tracking-[0.14em] text-accent uppercase">
          Draft
        </p>
        <h2 className="mt-0.5 font-serif text-lg font-semibold text-ink">
          출제 초안 작성
        </h2>
        <p className="mt-1 text-xs leading-relaxed text-ink-muted">
          용도·난이도·포함 항목을 지정합니다.
        </p>
      </div>

      <div className="p-4">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="mb-2 text-xs font-medium text-ink">용도</h3>
            <div className="flex flex-wrap gap-1.5">
              {generationPurposes.map((purpose) => (
                <button
                  key={purpose}
                  type="button"
                  onClick={() => setPurpose(purpose)}
                  className={`rounded-sm border px-3 py-1.5 text-[13px] transition-colors ${
                    options.purpose === purpose
                      ? "border-ink bg-ink text-paper"
                      : "border-border text-ink-muted hover:bg-highlight/60"
                  }`}
                >
                  {purpose}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-xs font-medium text-ink">난이도</h3>
            <div className="flex flex-wrap gap-1.5">
              {generationDifficulties.map((difficulty) => (
                <button
                  key={difficulty}
                  type="button"
                  onClick={() => setDifficulty(difficulty)}
                  className={`rounded-sm border px-3 py-1.5 text-[13px] transition-colors ${
                    options.difficulty === difficulty
                      ? "border-ink bg-ink text-paper"
                      : "border-border text-ink-muted hover:bg-highlight/60"
                  }`}
                >
                  {difficulty}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5">
          <h3 className="mb-2 text-xs font-medium text-ink">포함 항목</h3>
          <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
            {(Object.keys(outputLabels) as Array<keyof typeof outputLabels>).map(
              (key) => (
                <label
                  key={key}
                  className={`flex cursor-pointer items-center gap-2.5 rounded-sm border px-3 py-2 transition-colors ${
                    options.outputs[key]
                      ? "border-accent/35 bg-accent/[0.05]"
                      : "border-border hover:bg-highlight/50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={options.outputs[key]}
                    onChange={() => toggleOutput(key)}
                    className="h-3.5 w-3.5 accent-accent"
                  />
                  <span className="text-[13px] text-ink-muted">
                    {outputLabels[key]}
                  </span>
                </label>
              )
            )}
          </div>
        </div>

        <p className="mt-5 border-t border-border/80 pt-4 text-xs leading-relaxed text-ink-faint">
          초안은 교수 검수를 전제로 작성됩니다.
        </p>
      </div>

      {composeSlot}
    </section>
  );
}
