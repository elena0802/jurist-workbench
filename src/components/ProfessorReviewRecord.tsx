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
import { buildRevisionEvaluation } from "@/lib/revision-evaluation";

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
        {rule && (
          <span className="rounded-sm border border-border px-1.5 py-px text-[10px] text-ink-muted">
            {rule.statusLabel}
          </span>
        )}
        <span className="rounded-sm border border-accent/30 bg-accent/10 px-1.5 py-px text-[10px] font-medium text-accent">
          반영
        </span>
      </div>
      <p className="mt-1 text-[12px] leading-snug text-ink">{finding.finding}</p>
    </li>
  );
}

function IgnoredItemRow({ finding }: { finding: ReviewFinding }) {
  const { label: priorityLabel, priority } = getFindingPriority(finding);
  const rule = primaryRule(finding);

  return (
    <li className="rounded-sm border border-border/70 bg-paper-dark/15 px-3 py-2 opacity-80">
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
        <span className="text-[10px] text-ink-faint">무시</span>
      </div>
      <p className="mt-1 text-[12px] leading-snug text-ink-muted">
        {finding.finding}
      </p>
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

  return (
    <section
      id="professor-review-record"
      className="academic-shadow rounded-sm border border-border bg-paper"
    >
      <div className="border-b border-border bg-paper-dark/40 px-5 py-4">
        <p className="text-[10px] font-semibold tracking-[0.14em] text-accent uppercase">
          Review Record
        </p>
        <h2 className="mt-0.5 font-serif text-lg font-semibold text-ink">
          교수 검토 기록
        </h2>
        <p className="mt-1 text-xs leading-relaxed text-ink-muted">
          초안 검토 의견과 수정 반영 결과를 함께 확인합니다.
        </p>
      </div>

      <div className="space-y-6 p-5">
        <div className="rounded-sm border border-ink/15 border-l-[3px] border-l-accent bg-paper px-4 py-3">
          <h3 className="text-xs font-medium text-ink">초안 검토 의견</h3>
          <p className="mt-2 text-[13px] font-medium text-ink">
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
          <h3 className="mb-2 text-xs font-medium text-ink">승인된 검토 항목</h3>
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

          {ignoredFindings.length > 0 && (
            <details className="mt-3 rounded-sm border border-border/70 bg-paper-dark/10">
              <summary className="cursor-pointer px-3 py-2 text-[11px] font-medium text-ink-faint hover:bg-highlight/40">
                무시한 검토 항목 ({ignoredFindings.length}건)
              </summary>
              <ul className="space-y-2 border-t border-border/60 p-3">
                {ignoredFindings.map((finding) => (
                  <IgnoredItemRow key={finding.id} finding={finding} />
                ))}
              </ul>
            </details>
          )}
        </div>

        <div>
          <h3 className="mb-2 text-xs font-medium text-ink">수정 반영 결과</h3>
          {approvedFindings.length > 0 ? (
            <ul className="space-y-3">
              {approvedFindings.map((finding) => {
                const rule = primaryRule(finding);
                const evaluated = evaluation.evaluatedItems.find(
                  (item) => item.findingTitle === finding.finding
                );

                return (
                  <li
                    key={finding.id}
                    className="rounded-sm border border-border/80 bg-paper-dark/10 px-3 py-2.5"
                  >
                    <p className="text-[12px] font-medium text-ink">
                      {finding.finding}
                    </p>
                    <p className="mt-1 text-[11px] text-ink-muted">
                      <span className="text-ink-faint">반영 검토 의견 · </span>
                      {finding.suggestedAction}
                    </p>
                    {rule?.satisfactionTarget && (
                      <p className="mt-1 text-[11px] text-ink-muted">
                        <span className="text-ink-faint">충족 목표 · </span>
                        {rule.satisfactionTarget}
                      </p>
                    )}
                    {(rule?.expectedImprovement || finding.expectedEffect) && (
                      <p className="mt-1 text-[11px] text-ink-muted">
                        <span className="text-ink-faint">기대 효과 · </span>
                        {rule?.expectedImprovement || finding.expectedEffect}
                      </p>
                    )}
                    {evaluated && (
                      <p className="mt-1.5 text-[11px] leading-relaxed text-ink-faint">
                        {evaluated.note}
                      </p>
                    )}
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

        <div className="rounded-sm border border-ink/15 bg-ink/[0.03] px-4 py-3">
          <h3 className="text-xs font-medium text-ink">수정 반영 평가</h3>
          <p className="mt-1 text-[13px] font-medium text-ink">
            {evaluation.status}
          </p>
          <p className="mt-1 text-[12px] leading-relaxed text-ink-muted">
            {evaluation.summary}
          </p>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-ink-muted">
            <span>반영 완료 {evaluation.appliedCount}</span>
            <span>부분 반영 {evaluation.partialCount}</span>
            <span>추가 검토 {evaluation.remainingCount}</span>
          </div>

          {evaluation.evaluatedItems.length > 0 && (
            <ul className="mt-3 space-y-2 border-t border-border/60 pt-3">
              {evaluation.evaluatedItems.map((item, index) => (
                <li
                  key={`${item.ruleId ?? "item"}-${index}`}
                  className="text-[12px] leading-relaxed"
                >
                  <div className="flex flex-wrap items-center gap-1.5">
                    {item.ruleId && (
                      <span className="font-mono text-[11px] text-ink-faint">
                        {item.ruleId}
                      </span>
                    )}
                    <span
                      className={`rounded-sm border px-1.5 py-px text-[10px] font-medium ${evaluationResultStyles[item.result]}`}
                    >
                      {item.result}
                    </span>
                  </div>
                  <p className="mt-0.5 text-ink">{item.findingTitle}</p>
                  <p className="mt-0.5 text-ink-muted">{item.note}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
