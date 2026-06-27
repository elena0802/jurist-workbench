"use client";

import { useMemo, useState } from "react";
import type { GenerationOptions, GenerationResult } from "@/types";
import { resultSectionLabels } from "@/data/generation-options";
import { getDocumentById } from "@/data/knowledge-base";
import { legalIssues } from "@/data/legal-issues";
import {
  getVisibleDraftSections,
  hasDraftContent,
  normalizeGenerationResult,
} from "@/lib/normalize-draft-result";
import {
  buildDraftPlainText,
  DraftTextContent,
} from "@/lib/format-draft-content";

interface DraftBasis {
  documentIds: string[];
  issueIds: string[];
  options: GenerationOptions;
}

interface DraftOutputProps {
  result: GenerationResult | null;
  error: string | null;
  basis?: DraftBasis;
  onRecompose?: () => void;
  isRecomposing?: boolean;
  versionLabel?: string;
  statusBadge?: string | null;
  showReviewSection?: boolean;
}

function DraftBasisBox({ basis }: { basis: DraftBasis }) {
  const documents = useMemo(
    () =>
      basis.documentIds
        .map((id) => getDocumentById(id))
        .filter((entry): entry is NonNullable<typeof entry> => entry !== null),
    [basis.documentIds]
  );

  const issues = useMemo(
    () =>
      basis.issueIds
        .map((id) => legalIssues.find((issue) => issue.id === id))
        .filter((issue): issue is NonNullable<typeof issue> => issue !== undefined),
    [basis.issueIds]
  );

  return (
    <div className="border-b border-border bg-highlight/35 px-6 py-4">
      <p className="text-[10px] font-semibold tracking-[0.12em] text-ink-faint uppercase">
        Draft Basis
      </p>
      <p className="mt-0.5 text-xs text-ink-muted">초안 작성 근거</p>

      <dl className="mt-3 grid gap-4 sm:grid-cols-3">
        <div>
          <dt className="text-[10px] font-medium text-ink-faint">참고 자료</dt>
          <dd className="mt-1.5 space-y-1">
            {documents.length === 0 ? (
              <span className="text-xs italic text-ink-faint">—</span>
            ) : (
              documents.map(({ document, collection }) => (
                <div key={document.id} className="text-xs leading-snug">
                  <span className="text-ink-muted">{document.title}</span>
                  <span className="mt-0.5 block text-[10px] text-ink-faint">
                    {collection.title}
                    {document.year ? ` · ${document.year}` : ""}
                    {` · ${document.pageCount}쪽`}
                  </span>
                </div>
              ))
            )}
          </dd>
        </div>

        <div>
          <dt className="text-[10px] font-medium text-ink-faint">평가 쟁점</dt>
          <dd className="mt-1.5 flex flex-wrap gap-1">
            {issues.length === 0 ? (
              <span className="text-xs italic text-ink-faint">—</span>
            ) : (
              issues.map((issue) => (
                <span
                  key={issue.id}
                  className="rounded-sm border border-ink/15 bg-paper px-1.5 py-px text-[11px] text-ink-muted"
                >
                  {issue.name}
                </span>
              ))
            )}
          </dd>
        </div>

        <div>
          <dt className="text-[10px] font-medium text-ink-faint">
            용도 / 난이도
          </dt>
          <dd className="mt-1.5 space-y-1 text-xs text-ink-muted">
            <p>
              <span className="text-ink-faint">용도</span> · {basis.options.purpose}
            </p>
            <p>
              <span className="text-ink-faint">난이도</span> ·{" "}
              {basis.options.difficulty}
            </p>
          </dd>
        </div>
      </dl>
    </div>
  );
}

function DraftSection({
  sectionKey,
  title,
  text,
  index,
  isReview,
}: {
  sectionKey: keyof GenerationResult;
  title: string;
  text: string;
  index: number;
  isReview: boolean;
}) {
  if (isReview) {
    return (
      <article className="border-t-2 border-accent/30 bg-accent/[0.04] px-6 py-6">
        <div className="mb-4 flex items-start gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center border border-accent/40 bg-accent/10 font-serif text-xs font-semibold text-accent">
            {index}
          </span>
          <div>
            <p className="text-[10px] font-semibold tracking-[0.1em] text-accent uppercase">
              Professor Review
            </p>
            <h3 className="mt-0.5 font-serif text-lg font-semibold text-ink">
              {title}
            </h3>
            <p className="mt-1 text-xs text-ink-muted">
              초안의 약점·보완점을 검토하세요. 최종 출제 판단은 교수님께
              있습니다.
            </p>
          </div>
        </div>
        <div className="rounded-sm border border-accent/20 bg-paper/80 p-4 sm:ml-10">
          <DraftTextContent text={text} density="default" />
        </div>
      </article>
    );
  }

  const isCase = sectionKey === "caseProblem";
  const isGrading = sectionKey === "gradingCriteria";

  return (
    <article className="px-6 py-6">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center border border-border-dark bg-highlight text-xs font-semibold text-ink-muted">
          {index}
        </span>
        <h3 className="font-serif text-lg font-medium text-ink">{title}</h3>
      </div>

      <div
        className={`sm:pl-9 ${
          isCase
            ? "rounded-sm border border-border/80 bg-paper-dark/25 p-4 sm:p-5"
            : isGrading
              ? "rounded-sm border border-border/60 bg-shelf/30 p-4"
              : ""
        }`}
      >
        <DraftTextContent
          text={text}
          density={isCase ? "relaxed" : "default"}
        />
      </div>
    </article>
  );
}

export default function DraftOutput({
  result,
  error,
  basis,
  onRecompose,
  isRecomposing = false,
  versionLabel = "출제 초안",
  statusBadge = null,
  showReviewSection = true,
}: DraftOutputProps) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">(
    "idle"
  );

  if (error) {
    return (
      <section className="rounded-sm border border-red-200 bg-red-50 p-6">
        <h2 className="font-serif text-lg font-semibold text-red-800">
          초안 작성 오류
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-red-700">{error}</p>
        <p className="mt-3 text-xs text-red-600/80">
          참고 자료와 평가 쟁점을 확인한 뒤 다시 시도해 주세요.
        </p>
        {onRecompose && (
          <button
            type="button"
            onClick={onRecompose}
            disabled={isRecomposing}
            className="mt-4 rounded-sm border border-red-300 bg-paper px-3 py-1.5 text-xs text-red-800 hover:bg-red-50 disabled:opacity-50"
          >
            초안 다시 작성
          </button>
        )}
      </section>
    );
  }

  if (!result) {
    return null;
  }

  let safeResult: GenerationResult;
  try {
    safeResult = normalizeGenerationResult(result);
  } catch {
    return (
      <section className="rounded-sm border border-red-200 bg-red-50 p-6">
        <h2 className="font-serif text-lg font-semibold text-red-800">
          초안 표시 오류
        </h2>
        <p className="mt-2 text-sm text-red-700">
          초안 데이터를 해석하지 못했습니다. 다시 작성해 주세요.
        </p>
      </section>
    );
  }

  if (!hasDraftContent(safeResult)) {
    return (
      <section className="rounded-sm border border-border bg-paper-dark/40 p-6">
        <h2 className="font-serif text-lg font-semibold text-ink">
          출제 초안
        </h2>
        <p className="mt-2 text-sm text-ink-muted">
          작성된 초안 내용이 없습니다. 포함 항목을 확인하고 다시 시도해
          주세요.
        </p>
      </section>
    );
  }

  const visibleSections = getVisibleDraftSections(safeResult).filter(
    (section) =>
      showReviewSection || section.key !== "professorReviewMemo"
  );

  const handleCopyAll = async () => {
    try {
      await navigator.clipboard.writeText(buildDraftPlainText(safeResult));
      setCopyState("copied");
      window.setTimeout(() => setCopyState("idle"), 2000);
    } catch {
      setCopyState("failed");
      window.setTimeout(() => setCopyState("idle"), 2000);
    }
  };

  return (
    <section className="academic-shadow rounded-sm border border-border bg-paper">
      <div className="flex flex-col gap-3 border-b border-border px-6 py-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.14em] text-accent uppercase">
            Draft Output
          </p>
          <h2 className="mt-1 font-serif text-xl font-semibold text-ink">
            {versionLabel}
          </h2>
          {statusBadge && (
            <p className="mt-1.5 inline-block rounded-sm border border-border-dark bg-highlight px-2 py-0.5 text-[11px] font-medium text-ink-muted">
              {statusBadge}
            </p>
          )}
          <p className="mt-1 text-sm text-ink-faint">
            교수 검수를 위한 초안입니다. 최종 출제 여부는 교수님이 결정합니다.
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            type="button"
            onClick={handleCopyAll}
            className="rounded-sm border border-border bg-paper px-3 py-1.5 text-xs text-ink-muted transition-colors hover:border-border-dark hover:bg-highlight"
          >
            {copyState === "copied"
              ? "복사됨"
              : copyState === "failed"
                ? "복사 실패"
                : "전체 복사"}
          </button>
          {onRecompose && (
            <button
              type="button"
              onClick={onRecompose}
              disabled={isRecomposing}
              className="rounded-sm border border-border-dark bg-highlight px-3 py-1.5 text-xs text-ink transition-colors hover:bg-paper-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isRecomposing ? "작성 중…" : "초안 다시 작성"}
            </button>
          )}
        </div>
      </div>

      {basis && <DraftBasisBox basis={basis} />}

      <div className="divide-y divide-border/80">
        {visibleSections.map((section, index) => (
          <DraftSection
            key={section.key}
            sectionKey={section.key}
            title={resultSectionLabels[section.key]}
            text={section.text}
            index={index + 1}
            isReview={section.key === "professorReviewMemo"}
          />
        ))}
      </div>
    </section>
  );
}
