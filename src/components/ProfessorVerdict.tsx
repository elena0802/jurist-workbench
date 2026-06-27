"use client";

import type {
  GenerationDifficulty,
  GenerationPurpose,
  KnowledgeDocument,
  LegalIssue,
  ReviewFinding,
} from "@/types";
import { buildProfessorVerdict, type ProfessorVerdictResult } from "@/lib/professor-verdict";

interface ProfessorVerdictProps {
  findings: ReviewFinding[];
  selectedIssues: LegalIssue[];
  selectedDocuments: KnowledgeDocument[];
  purpose: GenerationPurpose;
  difficulty: GenerationDifficulty;
  verdictSnapshot?: ProfessorVerdictResult | null;
}

const statusStyles = {
  "보완 필요": "text-accent",
  "대체로 적절": "text-emerald-800",
  "재검토 필요": "text-amber-900",
} as const;

export default function ProfessorVerdict({
  findings,
  selectedIssues,
  selectedDocuments,
  purpose,
  difficulty,
  verdictSnapshot,
}: ProfessorVerdictProps) {
  const verdict =
    verdictSnapshot ??
    buildProfessorVerdict(
      findings,
      selectedIssues,
      selectedDocuments,
      purpose,
      difficulty
    );

  if (verdict.empty) {
    return (
      <div className="rounded-sm border border-border bg-paper-dark/20 px-5 py-4">
        <h3 className="font-serif text-base font-semibold text-ink">
          교수 검토 의견
        </h3>
        <p className="mt-2 text-[13px] leading-relaxed text-ink-muted">
          {verdict.emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-sm border border-ink/15 border-l-[3px] border-l-accent bg-paper px-5 py-4">
      <h3 className="font-serif text-base font-semibold text-ink">
        교수 검토 의견
      </h3>
      <p className="mt-1 text-[12px] text-ink-muted">
        초안 전체에 대한 종합 판단입니다.
      </p>

      <p className="mt-3 text-[13px] font-medium text-ink">
        출제 적합성:{" "}
        <span className={statusStyles[verdict.statusLabel]}>
          {verdict.statusLabel}
        </span>
      </p>

      {verdict.judgment && (
        <p className="mt-3 text-[14px] leading-relaxed text-ink">
          {verdict.judgment}
        </p>
      )}

      {verdict.primaryRecommendation && (
        <div className="mt-4 border-t border-border/60 pt-3">
          <p className="text-[11px] font-medium text-ink-faint">우선 보완점</p>
          <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">
            {verdict.primaryRecommendation}
          </p>
        </div>
      )}

      {verdict.primaryRules.length > 0 && (
        <div className="mt-3 border-t border-border/60 pt-3">
          <p className="text-[11px] font-medium text-ink-faint">
            주요 적용 원칙
          </p>
          <ul className="mt-1 space-y-0.5">
            {verdict.primaryRules.map((rule) => (
              <li
                key={rule.ruleId}
                className="text-[12px] text-ink-muted"
              >
                <span className="font-mono text-[11px] text-ink-faint">
                  {rule.ruleId}
                </span>
                <span className="mx-1.5 text-ink-faint">·</span>
                {rule.title}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
