"use client";

import type {
  AppliedRule,
  FindingDecision,
  ReviewFinding,
  RuleStatus,
} from "@/types";
import { getExamRuleById } from "@/data/exam-rules";
import { fillAppliedRuleReasoning } from "@/lib/rule-matching";
import {
  getFindingPriority,
  priorityStyles,
  sortFindingsByImportance,
} from "@/lib/finding-priority";
import { getOneLineSummary } from "@/lib/review-executive-summary";

interface ReviewFindingsListProps {
  findings: ReviewFinding[];
  onDecisionChange?: (id: string, decision: FindingDecision) => void;
  readOnly?: boolean;
  emptyMessage?: string;
  mode?: "draft-review" | "professor-approval";
}

const ruleStatusStyles: Record<RuleStatus, string> = {
  satisfied: "border-emerald-200/70 bg-emerald-50/80 text-emerald-900",
  partial: "border-amber-200/90 bg-amber-50 text-amber-950",
  violated: "border-accent/45 bg-accent/15 text-accent",
};

function safeRules(finding: ReviewFinding): AppliedRule[] {
  const rules = finding.appliedRules ?? [];
  if (rules.length > 0) {
    return rules.map((rule) =>
      fillAppliedRuleReasoning(rule, getExamRuleById(rule.ruleId), finding, [])
    );
  }
  return [
    fillAppliedRuleReasoning(
      {
        ruleId: "—",
        title: "등록되지 않은 원칙",
        category: "구성",
        status: "partial",
        statusLabel: "부분 충족",
        explanation: "적용 원칙 정보를 불러오지 못했습니다.",
        diagnosticQuestion: "",
        draftDiagnosis: "",
        violationReason: "",
        revisionGuidance: finding.suggestedAction,
        satisfactionTarget: "",
        expectedImprovement: finding.expectedEffect,
      },
      undefined,
      finding,
      []
    ),
  ];
}

function primaryRule(finding: ReviewFinding): AppliedRule {
  return safeRules(finding)[0]!;
}

function DecisionButtons({
  finding,
  onDecisionChange,
}: {
  finding: ReviewFinding;
  onDecisionChange: (id: string, decision: FindingDecision) => void;
}) {
  const isAccept = finding.decision === "accept";
  const isIgnore = finding.decision === "ignore";

  return (
    <div className="flex shrink-0 gap-2">
      <button
        type="button"
        onClick={() => onDecisionChange(finding.id, "accept")}
        className={`rounded-sm border px-2 py-0.5 text-[11px] transition-colors ${
          isAccept
            ? "border-accent bg-accent text-paper"
            : "border-border text-ink-muted hover:border-accent/40"
        }`}
      >
        반영
      </button>
      <button
        type="button"
        onClick={() => onDecisionChange(finding.id, "ignore")}
        className={`rounded-sm border px-2 py-0.5 text-[11px] transition-colors ${
          isIgnore
            ? "border-ink/30 bg-ink/10 text-ink"
            : "border-border text-ink-muted hover:border-border-dark"
        }`}
      >
        무시
      </button>
    </div>
  );
}

function ReasoningBlock({ rule }: { rule: AppliedRule }) {
  const sections = [
    { label: "① 현재 초안 진단", text: rule.draftDiagnosis },
    { label: "② 원칙 위반 이유", text: rule.violationReason },
    { label: "③ 수정 방향", text: rule.revisionGuidance },
    { label: "④ 원칙 충족 목표", text: rule.satisfactionTarget },
    { label: "⑤ 기대 효과", text: rule.expectedImprovement },
  ].filter((section) => section.text.trim());

  if (sections.length === 0) return null;

  return (
    <div className="space-y-1.5 text-[10px] leading-relaxed text-ink-muted">
      {sections.map((section) => (
        <div key={section.label}>
          <span className="font-medium text-ink-faint">{section.label}</span>
          <p className="mt-0.5">{section.text}</p>
        </div>
      ))}
    </div>
  );
}

function ReasoningDetails({ rules }: { rules: AppliedRule[] }) {
  return (
    <details className="mt-2 rounded-sm border border-border/70 bg-paper-dark/15">
      <summary className="cursor-pointer px-2.5 py-1.5 text-[11px] font-medium text-ink-muted hover:bg-highlight/40">
        검토 논리 보기
      </summary>
      <div className="space-y-2 border-t border-border/60 px-2.5 py-2">
        {rules.map((rule, index) => (
          <div key={`${rule.ruleId}-${index}`}>
            {rules.length > 1 && (
              <p className="mb-1 font-mono text-[9px] text-ink-faint">
                {rule.ruleId} · {rule.title}
              </p>
            )}
            <ReasoningBlock rule={rule} />
          </div>
        ))}
      </div>
    </details>
  );
}

function DraftReviewCard({
  finding,
  onDecisionChange,
}: {
  finding: ReviewFinding;
  onDecisionChange?: (id: string, decision: FindingDecision) => void;
}) {
  const isAccept = finding.decision === "accept";
  const isIgnore = finding.decision === "ignore";
  const { label: priorityLabel, priority } = getFindingPriority(finding);
  const rule = primaryRule(finding);
  const allRules = safeRules(finding);
  const oneLine = getOneLineSummary(finding);

  return (
    <li
      className={`rounded-sm border px-3 py-2.5 ${
        isAccept
          ? "border-accent/35 bg-accent/[0.05]"
          : isIgnore
            ? "border-border bg-paper-dark/20 opacity-70"
            : "border-border bg-paper"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <span
          className={`rounded-sm border px-1.5 py-px text-[10px] font-medium ${priorityStyles[priority]}`}
        >
          {priorityLabel}
        </span>
        {onDecisionChange && (
          <DecisionButtons finding={finding} onDecisionChange={onDecisionChange} />
        )}
      </div>

      <p className="mt-1.5 text-[13px] font-medium leading-snug text-ink">
        {finding.finding}
      </p>

      <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px]">
        <span className="font-mono text-ink-faint">{rule.ruleId}</span>
        <span className="text-ink-muted">{rule.title}</span>
        <span
          className={`rounded-sm border px-1.5 py-px text-[10px] font-semibold ${ruleStatusStyles[rule.status]}`}
        >
          {rule.statusLabel}
        </span>
      </div>

      <p className="mt-1.5 text-[11px] leading-relaxed text-ink-muted">
        {oneLine}
      </p>

      {finding.suggestedAction && (
        <p className="mt-1 text-[11px] leading-relaxed text-ink-muted">
          <span className="text-ink-faint">제안 조치 · </span>
          {finding.suggestedAction}
        </p>
      )}

      <ReasoningDetails rules={allRules} />
    </li>
  );
}

function ApprovalCompactCard({
  finding,
  onDecisionChange,
  readOnly = false,
}: {
  finding: ReviewFinding;
  onDecisionChange?: (id: string, decision: FindingDecision) => void;
  readOnly?: boolean;
}) {
  const isAccept = finding.decision === "accept";
  const isIgnore = finding.decision === "ignore";
  const { label: priorityLabel, priority } = getFindingPriority(finding);
  const rule = primaryRule(finding);

  return (
    <li
      className={`rounded-sm border px-3 py-2 ${
        isAccept
          ? "border-accent/35 bg-accent/[0.05]"
          : isIgnore
            ? "border-border bg-paper-dark/20 opacity-70"
            : "border-border bg-paper"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-1.5">
            <span
              className={`rounded-sm border px-1.5 py-px text-[10px] font-medium ${priorityStyles[priority]}`}
            >
              {priorityLabel}
            </span>
            <span className="font-mono text-[10px] text-ink-faint">
              {rule.ruleId}
            </span>
            <span className="text-[10px] text-ink-muted">{rule.title}</span>
            <span
              className={`rounded-sm border px-1.5 py-px text-[10px] font-semibold ${ruleStatusStyles[rule.status]}`}
            >
              {rule.statusLabel}
            </span>
          </div>
          <p className="text-[12px] leading-snug text-ink line-clamp-2">
            {finding.finding}
          </p>
        </div>
        {readOnly ? (
          <span
            className={`shrink-0 rounded-sm border px-1.5 py-px text-[10px] font-medium ${
              isAccept
                ? "border-accent/30 bg-accent/10 text-accent"
                : isIgnore
                  ? "border-border text-ink-faint"
                  : "border-border text-ink-muted"
            }`}
          >
            {isAccept ? "반영" : isIgnore ? "무시" : "미결정"}
          </span>
        ) : (
          onDecisionChange && (
            <DecisionButtons
              finding={finding}
              onDecisionChange={onDecisionChange}
            />
          )
        )}
      </div>
    </li>
  );
}

export default function ReviewFindingsList({
  findings,
  onDecisionChange,
  readOnly = false,
  emptyMessage = "표시할 검토 제안이 없습니다.",
  mode = "draft-review",
}: ReviewFindingsListProps) {
  if (!findings.length) {
    return (
      <p className="rounded-sm border border-border bg-paper-dark/20 px-3 py-4 text-sm text-ink-muted">
        {emptyMessage}
      </p>
    );
  }

  const sorted = sortFindingsByImportance(findings);

  return (
    <ul className="space-y-2">
      {sorted.map((finding) =>
        mode === "professor-approval" ? (
          <ApprovalCompactCard
            key={finding.id}
            finding={finding}
            onDecisionChange={readOnly ? undefined : onDecisionChange}
            readOnly={readOnly}
          />
        ) : (
          <DraftReviewCard
            key={finding.id}
            finding={finding}
            onDecisionChange={readOnly ? undefined : onDecisionChange}
          />
        )
      )}
    </ul>
  );
}
