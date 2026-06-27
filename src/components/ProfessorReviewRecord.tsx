"use client";

import type {
  GenerationResult,
  ReviewFinding,
  RevisionSummary,
} from "@/types";
import { getExamRuleById } from "@/data/exam-rules";
import { fillAppliedRuleReasoning } from "@/lib/rule-matching";
import {
  getFindingPriority,
  priorityStyles,
} from "@/lib/finding-priority";
import type { ProfessorVerdictResult } from "@/lib/professor-verdict";
import {
  buildRevisionEvaluation,
  buildRevisionRecordParagraph,
} from "@/lib/revision-evaluation";

interface ProfessorReviewRecordProps {
  verdict: ProfessorVerdictResult;
  findings: ReviewFinding[];
  revisionSummary: RevisionSummary | null;
  revisedDraft: GenerationResult;
}

const verdictStatusStyles = {
  "보완 필요": "text-accent",
  "대체로 적절": "text-emerald-800",
  "재검토 필요": "text-amber-900",
} as const;

const evaluationStatusStyles = {
  "반영 완료": "text-emerald-800",
  "부분 반영": "text-amber-900",
  "추가 검토 필요": "text-accent",
} as const;

const evaluationResultStyles = {
  반영: "border-emerald-200/70 bg-emerald-50/80 text-emerald-900",
  "부분 반영": "border-amber-200/90 bg-amber-50 text-amber-950",
  "추가 검토": "border-ink/15 bg-ink/5 text-ink-muted",
} as const;

function primaryRule(finding: ReviewFinding) {
  const rule = finding.appliedRules?.[0];
  if (!rule) return null;
  return fillAppliedRuleReasoning(
    rule,
    getExamRuleById(rule.ruleId),
    finding,
    []
  );
}

function ApprovedItemRow({ finding }: { finding: ReviewFinding }) {
  const { label: priorityLabel, priority } = getFindingPriority(finding);
  const rule = primaryRule(finding);

  return (
    <li className="rounded-sm border border-accent/25 bg-accent/[0.04] px-3 py-2">
      <div className="flex flex-wrap items-center gap-1.5">
        <span
          className={`rounded-sm border px-1.5 py-px text-[10px] font-medium ${priorityStyles[priority]}`}
        >
          {priorityLabel}
        </span>
        {rule && (
          <span className="font-mono text-[10px] text-ink-faint">
            {rule.ruleId}
          </span>
        )}
        <span className="rounded-sm border border-accent/30 bg-accent/10 px-1.5 py-px text-[10px] font-medium text-accent">
          승인
        </span>
      </div>
      <p className="mt-1 text-[12px] leading-snug text-ink">{finding.finding}</p>
    </li>
  );
}

export default function ProfessorReviewRecord({
  verdict,
  findings,
  revisionSummary,
  revisedDraft,
}: ProfessorReviewRecordProps) {
  const approvedFindings = findings.filter((f) => f.decision === "accept");
  const ignoredFindings = findings.filter((f) => f.decision === "ignore");
  const evaluation = buildRevisionEvaluation(
    approvedFindings,
    revisionSummary,
    revisedDraft
  );
  const recordParagraph = buildRevisionRecordParagraph(
    verdict.primaryRecommendation,
    approvedFindings,
    evaluation
  );

  const remainingItems = [
    ...ignoredFindings.map(
      (f) => `[무시] ${f.finding} — ${f.suggestedAction}`
    ),
    ...(revisionSummary?.remainingRecommendations ?? []),
    ...evaluation.evaluatedItems
      .filter((item) => item.result !== "반영")
      .map((item) => `[${item.result}] ${item.findingTitle}`),
  ];

  return (
    <section
      id="professor-review-record"
      className="academic-shadow rounded-sm border-2 border-ink/15 border-l-[3px] border-l-accent bg-paper"
    >
      <div className="border-b border-border bg-paper-dark/40 px-5 py-4">
        <p className="text-[10px] font-semibold tracking-[0.14em] text-accent uppercase">
          Review Record
        </p>
        <h2 className="mt-0.5 font-serif text-lg font-semibold text-ink">
          교수 검토 기록
        </h2>
        <p className="mt-2 text-[13px] font-medium text-ink">
          수정 반영 평가:{" "}
          <span className={evaluationStatusStyles[evaluation.status]}>
            {evaluation.status}
          </span>
        </p>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-muted">
          {recordParagraph}
        </p>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-ink-faint">
          <span>반영 완료 {evaluation.appliedCount}</span>
          <span>부분 반영 {evaluation.partialCount}</span>
          <span>추가 검토 {evaluation.remainingCount}</span>
        </div>
      </div>

      <div className="space-y-5 p-5">
        <div className="rounded-sm border border-border/80 bg-paper-dark/10 px-4 py-3">
          <h3 className="text-xs font-medium text-ink">
            1. 원래 무엇을 지적했는가
          </h3>
          <p className="mt-0.5 text-[10px] text-ink-faint">초안 검토 의견</p>
          <p className="mt-2 text-[12px] font-medium text-ink">
            출제 적합성:{" "}
            <span className={verdictStatusStyles[verdict.statusLabel]}>
              {verdict.statusLabel}
            </span>
          </p>
          {verdict.judgment && (
            <p className="mt-2 text-[13px] leading-relaxed text-ink-muted">
              {verdict.judgment}
            </p>
          )}
          {verdict.primaryRecommendation && (
            <p className="mt-2 text-[12px] text-ink-muted">
              <span className="text-ink-faint">우선 보완점 · </span>
              {verdict.primaryRecommendation}
            </p>
          )}
          {verdict.primaryRules.length > 0 && (
            <ul className="mt-2 space-y-0.5">
              {verdict.primaryRules.map((rule) => (
                <li key={rule.ruleId} className="text-[11px] text-ink-muted">
                  <span className="font-mono text-ink-faint">{rule.ruleId}</span>
                  <span className="mx-1.5 text-ink-faint">·</span>
                  {rule.title}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h3 className="mb-2 text-xs font-medium text-ink">
            2. 어떤 검토 항목을 승인했는가
          </h3>
          <p className="mb-2 text-[10px] text-ink-faint">승인된 검토 항목</p>
          {approvedFindings.length > 0 ? (
            <ul className="space-y-2">
              {approvedFindings.map((finding) => (
                <ApprovedItemRow key={finding.id} finding={finding} />
              ))}
            </ul>
          ) : (
            <p className="text-[13px] italic text-ink-faint">
              승인된 검토 항목이 없습니다.
            </p>
          )}
        </div>

        <div>
          <h3 className="mb-2 text-xs font-medium text-ink">
            3. 수정 초안이 무엇을 반영했는가
          </h3>
          <p className="mb-2 text-[10px] text-ink-faint">수정 반영 결과</p>
          {approvedFindings.length > 0 ? (
            <ul className="space-y-2">
              {approvedFindings.map((finding) => {
                const rule = primaryRule(finding);
                const evaluated = evaluation.evaluatedItems.find(
                  (item) => item.findingTitle === finding.finding
                );

                return (
                  <li
                    key={finding.id}
                    className="rounded-sm border border-border/80 bg-paper px-3 py-2.5"
                  >
                    <div className="flex flex-wrap items-center gap-1.5">
                      {rule && (
                        <span className="font-mono text-[10px] text-ink-faint">
                          {rule.ruleId}
                        </span>
                      )}
                      {evaluated && (
                        <span
                          className={`rounded-sm border px-1.5 py-px text-[10px] font-medium ${evaluationResultStyles[evaluated.result]}`}
                        >
                          {evaluated.result}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-[12px] font-medium text-ink">
                      {finding.finding}
                    </p>
                    <p className="mt-1 text-[11px] text-ink-muted">
                      {evaluated?.note ||
                        `반영 검토 의견: ${finding.suggestedAction}`}
                    </p>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-[13px] italic text-ink-faint">
              승인된 검토 항목이 없어 반영 결과를 표시할 수 없습니다.
            </p>
          )}
        </div>

        <div>
          <h3 className="mb-2 text-xs font-medium text-ink">
            4. 아직 남은 검토사항은 무엇인가
          </h3>
          {remainingItems.length > 0 ? (
            <ul className="space-y-1.5">
              {remainingItems.map((item, index) => (
                <li
                  key={`remaining-${index}`}
                  className="text-[12px] leading-relaxed text-ink-muted"
                >
                  · {item}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[13px] italic text-ink-faint">
              남은 권고 사항이 없습니다.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
