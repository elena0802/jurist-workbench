"use client";

import type {
  AppliedRule,
  FindingDecision,
  ReviewFinding,
  ReviewFindingSeverity,
  RuleStatus,
} from "@/types";
import { getExamRuleById } from "@/data/exam-rules";
import { fillAppliedRuleReasoning } from "@/lib/rule-matching";
import {
  getFindingPriority,
  priorityStyles,
} from "@/lib/finding-priority";

interface ReviewFindingsListProps {
  findings: ReviewFinding[];
  onDecisionChange?: (id: string, decision: FindingDecision) => void;
  readOnly?: boolean;
  emptyMessage?: string;
  mode?: "draft-review" | "professor-approval";
}

const severityLabels: Record<ReviewFindingSeverity, string> = {
  low: "낮음",
  medium: "보통",
  high: "높음",
};

const severityStyles: Record<ReviewFindingSeverity, string> = {
  low: "border-border bg-paper-dark/30 text-ink-faint",
  medium: "border-ink/15 bg-ink/5 text-ink-muted",
  high: "border-accent/30 bg-accent/10 text-accent",
};

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
    <div className="mt-2 flex gap-2">
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

function ReasoningDetails({
  rules,
  defaultOpen,
}: {
  rules: AppliedRule[];
  defaultOpen: boolean;
}) {
  return (
    <details
      className="mt-2 rounded-sm border border-border/70 bg-paper-dark/15"
      open={defaultOpen}
    >
      <summary className="cursor-pointer px-2.5 py-1.5 text-[11px] font-medium text-ink-muted hover:bg-highlight/40">
        검토 논리 보기
      </summary>
      <div className="space-y-2 border-t border-border/60 px-2.5 py-2">
        {rules.map((rule, index) => (
          <div
            key={`${rule.ruleId}-${index}`}
            className="text-[10px] leading-relaxed text-ink-muted"
          >
            {rules.length > 1 && (
              <p className="mb-1 font-mono text-[9px] text-ink-faint">
                {rule.ruleId}
              </p>
            )}
            <div className="space-y-1">
              <div>
                <span className="font-medium text-ink-faint">현재 초안 진단 · </span>
                {rule.draftDiagnosis}
              </div>
              <div>
                <span className="font-medium text-ink-faint">수정 방향 · </span>
                {rule.revisionGuidance}
              </div>
              <div>
                <span className="font-medium text-ink-faint">기대 효과 · </span>
                {rule.expectedImprovement}
              </div>
              <div>
                <span className="font-medium text-ink-faint">원칙 충족 방안 · </span>
                {rule.satisfactionTarget}
              </div>
            </div>
          </div>
        ))}
      </div>
    </details>
  );
}

function DraftReviewCard({
  finding,
  defaultOpenReasoning,
  onDecisionChange,
}: {
  finding: ReviewFinding;
  defaultOpenReasoning: boolean;
  onDecisionChange?: (id: string, decision: FindingDecision) => void;
}) {
  const isAccept = finding.decision === "accept";
  const isIgnore = finding.decision === "ignore";
  const severity = finding.severity ?? "medium";
  const { label: priorityLabel, priority } = getFindingPriority(finding);
  const rule = primaryRule(finding);
  const allRules = safeRules(finding);

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
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="rounded-sm border border-ink/15 bg-ink/5 px-1.5 py-px text-[10px] font-medium text-ink-muted">
          {finding.category}
        </span>
        <span
          className={`rounded-sm border px-1.5 py-px text-[10px] font-medium ${severityStyles[severity]}`}
        >
          {severityLabels[severity]}
        </span>
        <span
          className={`rounded-sm border px-1.5 py-px text-[10px] font-medium ${priorityStyles[priority]}`}
        >
          {priorityLabel}
        </span>
      </div>

      <p className="mt-1.5 text-[13px] leading-snug text-ink">{finding.finding}</p>

      <div className="mt-1.5 flex flex-wrap items-start gap-1.5 text-[11px]">
        <span className="font-mono text-ink-faint">{rule.ruleId}</span>
        <span className="text-ink-muted">{rule.title}</span>
        <span
          className={`rounded-sm border px-1.5 py-px text-[10px] font-semibold ${ruleStatusStyles[rule.status]}`}
        >
          {rule.statusLabel}
        </span>
      </div>

      {finding.suggestedAction && (
        <p className="mt-1.5 text-[11px] leading-relaxed text-ink-muted">
          <span className="text-ink-faint">제안 조치 · </span>
          {finding.suggestedAction}
        </p>
      )}

      <ReasoningDetails rules={allRules} defaultOpen={defaultOpenReasoning} />

      {onDecisionChange && (
        <DecisionButtons finding={finding} onDecisionChange={onDecisionChange} />
      )}
    </li>
  );
}

function ApprovalCompactCard({
  finding,
  onDecisionChange,
}: {
  finding: ReviewFinding;
  onDecisionChange: (id: string, decision: FindingDecision) => void;
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
          </div>
          <p className="text-[12px] leading-snug text-ink line-clamp-2">
            {finding.finding}
          </p>
        </div>
        <DecisionButtons finding={finding} onDecisionChange={onDecisionChange} />
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

  return (
    <ul className="space-y-2">
      {findings.map((finding, index) =>
        mode === "professor-approval" ? (
          <ApprovalCompactCard
            key={finding.id}
            finding={finding}
            onDecisionChange={onDecisionChange!}
          />
        ) : (
          <DraftReviewCard
            key={finding.id}
            finding={finding}
            defaultOpenReasoning={index === 0}
            onDecisionChange={readOnly ? undefined : onDecisionChange}
          />
        )
      )}
    </ul>
  );
}
