"use client";

import type { GenerationOptions, GenerationPurpose, GenerationDifficulty } from "@/types";
import {
  generationPurposes,
  generationDifficulties,
  outputLabels,
} from "@/data/generation-options";

interface GenerationOptionsPanelProps {
  options: GenerationOptions;
  onChange: (options: GenerationOptions) => void;
}

export default function GenerationOptionsPanel({
  options,
  onChange,
}: GenerationOptionsPanelProps) {
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
    <section className="academic-shadow rounded-sm border border-border bg-paper p-6">
      <div className="mb-5">
        <h2 className="font-serif text-xl font-semibold text-ink">3. 생성 옵션</h2>
        <p className="mt-1 text-sm text-ink-faint">
          용도, 난이도, 출력 항목을 설정하세요.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <h3 className="mb-3 text-sm font-medium text-ink">용도</h3>
          <div className="flex flex-wrap gap-2">
            {generationPurposes.map((purpose) => (
              <button
                key={purpose}
                type="button"
                onClick={() => setPurpose(purpose)}
                className={`rounded-sm border px-4 py-2 text-sm transition-all ${
                  options.purpose === purpose
                    ? "border-ink bg-ink text-paper"
                    : "border-border text-ink-muted hover:bg-highlight"
                }`}
              >
                {purpose}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-medium text-ink">난이도</h3>
          <div className="flex flex-wrap gap-2">
            {generationDifficulties.map((difficulty) => (
              <button
                key={difficulty}
                type="button"
                onClick={() => setDifficulty(difficulty)}
                className={`rounded-sm border px-4 py-2 text-sm transition-all ${
                  options.difficulty === difficulty
                    ? "border-ink bg-ink text-paper"
                    : "border-border text-ink-muted hover:bg-highlight"
                }`}
              >
                {difficulty}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="mb-3 text-sm font-medium text-ink">출력 항목</h3>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {(Object.keys(outputLabels) as Array<keyof typeof outputLabels>).map(
            (key) => (
              <label
                key={key}
                className={`flex cursor-pointer items-center gap-3 rounded-sm border px-4 py-3 transition-all ${
                  options.outputs[key]
                    ? "border-accent/40 bg-accent/5"
                    : "border-border hover:bg-highlight"
                }`}
              >
                <input
                  type="checkbox"
                  checked={options.outputs[key]}
                  onChange={() => toggleOutput(key)}
                  className="h-4 w-4 accent-accent"
                />
                <span className="text-sm text-ink-muted">{outputLabels[key]}</span>
              </label>
            )
          )}
        </div>
      </div>
    </section>
  );
}
