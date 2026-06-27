"use client";

import type { RevisionSummary } from "@/types";

interface RevisionSummaryPanelProps {
  summary: RevisionSummary | null;
  fallbackApplied?: string[];
}

function SummaryList({
  title,
  items,
  emptyText,
  mono = false,
}: {
  title: string;
  items: string[];
  emptyText: string;
  mono?: boolean;
}) {
  return (
    <div>
      <h3 className="mb-2 text-xs font-medium text-ink">{title}</h3>
      {items.length > 0 ? (
        <ul className="space-y-1.5">
          {items.map((item, index) => (
            <li
              key={`${title}-${index}`}
              className={`text-[13px] leading-relaxed text-ink-muted ${
                mono ? "font-mono text-[12px]" : ""
              }`}
            >
              · {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[13px] italic text-ink-faint">{emptyText}</p>
      )}
    </div>
  );
}

const emptySummary: RevisionSummary = {
  applied: [],
  preserved: ["1차 초안의 전체 구조와 학술적 문체"],
  evidenceApplied: [],
  expectedEffects: [],
  rulesApplied: [],
  rulesImproved: [],
  rulesPreserved: [],
  ruleSatisfactionPlans: [],
  improvementsMade: [],
  remainingRecommendations: [],
  professorInstructionApplied: false,
  professorInstructionNote: "교수님 추가 지시 없음",
  difficultyChange: "—",
  issueStructureChange: "—",
};

export default function RevisionSummaryPanel({
  summary,
  fallbackApplied = [],
}: RevisionSummaryPanelProps) {
  const safe: RevisionSummary = summary ?? {
    ...emptySummary,
    applied:
      fallbackApplied.length > 0
        ? fallbackApplied
        : ["반영 내역을 확인할 수 없습니다."],
  };

  const hasRules =
    (safe.rulesApplied?.length ?? 0) > 0 ||
    (safe.rulesImproved?.length ?? 0) > 0 ||
    (safe.rulesPreserved?.length ?? 0) > 0;

  const improvements =
    safe.improvementsMade?.length > 0
      ? safe.improvementsMade
      : (safe.rulesImproved ?? []).map((item) => `개선 · ${item}`);

  const remaining = safe.remainingRecommendations ?? [];

  return (
    <section className="academic-shadow rounded-sm border border-border bg-paper">
      <div className="border-b border-border bg-paper-dark/40 px-5 py-4">
        <p className="text-[10px] font-semibold tracking-[0.14em] text-accent uppercase">
          Revision Summary
        </p>
        <h2 className="mt-0.5 font-serif text-lg font-semibold text-ink">
          수정 요약
        </h2>
        <p className="mt-1 text-xs leading-relaxed text-ink-muted">
          출제 원칙 반영 결과와 이번 수정으로 달라진 점을 요약합니다.
        </p>
      </div>

      <div className="space-y-6 p-5">
        <div className="rounded-sm border-2 border-accent/25 bg-accent/[0.04] px-4 py-4">
          <h3 className="font-serif text-base font-semibold text-ink">
            출제 원칙 반영
          </h3>
          <p className="mt-1 text-[11px] text-ink-faint">
            승인된 검토에 연결된 원칙 ID와 개선·유지 여부입니다.
          </p>

          {hasRules ? (
            <div className="mt-4 space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <SummaryList
                  title="적용 원칙 (Rule ID)"
                  items={safe.rulesApplied ?? []}
                  emptyText="적용 원칙 없음"
                  mono
                />
                <SummaryList
                  title="개선"
                  items={(safe.rulesImproved ?? []).map(
                    (item) => `개선 · ${item}`
                  )}
                  emptyText="개선 항목 없음"
                  mono
                />
                <SummaryList
                  title="유지"
                  items={(safe.rulesPreserved ?? []).map(
                    (item) => `유지 · ${item}`
                  )}
                  emptyText="유지 항목 없음"
                  mono
                />
              </div>
            </div>
          ) : (
            <p className="mt-3 text-[13px] italic text-ink-faint">
              출제 원칙 반영 정보 없음
            </p>
          )}
        </div>

        <SummaryList
          title="이번 수정으로 개선된 사항"
          items={improvements}
          emptyText="개선 사항 정보 없음"
        />

        {remaining.length > 0 && (
          <SummaryList
            title="남은 권고 사항"
            items={remaining}
            emptyText="남은 권고 사항 없음"
          />
        )}

        <details className="rounded-sm border border-border/70 bg-paper-dark/10">
          <summary className="cursor-pointer px-4 py-2.5 text-xs font-medium text-ink-muted hover:bg-highlight/40">
            상세 반영 내역 보기
          </summary>
          <div className="space-y-6 border-t border-border/60 p-4">
            <div className="grid gap-6 sm:grid-cols-2">
              <SummaryList
                title="반영된 검토 내용"
                items={safe.applied}
                emptyText="반영 항목 없음"
              />
              <SummaryList
                title="근거 기반 반영 항목"
                items={safe.evidenceApplied ?? []}
                emptyText="근거 기반 반영 항목 없음"
              />
              <SummaryList
                title="유지한 내용"
                items={safe.preserved}
                emptyText="유지 항목 정보 없음"
              />
              <SummaryList
                title="기대 효과"
                items={safe.expectedEffects ?? []}
                emptyText="기대 효과 정보 없음"
              />
              <SummaryList
                title="원칙 충족 방안"
                items={safe.ruleSatisfactionPlans ?? []}
                emptyText="원칙 충족 방안 정보 없음"
                mono
              />

              <div>
                <h3 className="mb-2 text-xs font-medium text-ink">
                  교수 추가 지시 반영 여부
                </h3>
                <p className="text-[13px] text-ink-muted">
                  {safe.professorInstructionNote ||
                    (safe.professorInstructionApplied
                      ? "교수님 추가 지시를 반영하였습니다."
                      : "교수님 추가 지시 없음")}
                </p>
              </div>

              <div>
                <h3 className="mb-2 text-xs font-medium text-ink">난이도 변화</h3>
                <p className="text-[13px] text-ink-muted">
                  {safe.difficultyChange || "—"}
                </p>
              </div>

              <div className="sm:col-span-2">
                <h3 className="mb-2 text-xs font-medium text-ink">
                  쟁점 구성 변화
                </h3>
                <p className="text-[13px] text-ink-muted">
                  {safe.issueStructureChange || "—"}
                </p>
              </div>
            </div>
          </div>
        </details>
      </div>
    </section>
  );
}
