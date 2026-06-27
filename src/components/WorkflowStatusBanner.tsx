import type { WorkflowPhase } from "@/types";

const phaseLabels: Record<WorkflowPhase, string> = {
  idle: "워크플로 준비",
  "draft-v1-complete": "Draft v1 작성 완료",
  "review-pending": "교수 검수 대기",
  revising: "수정 초안 작성 중",
  "revised-complete": "수정 초안 작성 완료",
};

const phaseStyles: Record<WorkflowPhase, string> = {
  idle: "border-border bg-highlight/30 text-ink-muted",
  "draft-v1-complete": "border-ink/20 bg-ink/5 text-ink",
  "review-pending": "border-accent/30 bg-accent/5 text-accent",
  revising: "border-border-dark bg-paper-dark text-ink-muted",
  "revised-complete": "border-ink/25 bg-highlight text-ink",
};

export default function WorkflowStatusBanner({
  phase,
}: {
  phase: WorkflowPhase;
}) {
  return (
    <div
      className={`rounded-sm border px-4 py-2.5 text-sm ${phaseStyles[phase]}`}
    >
      <span className="text-[10px] font-semibold tracking-[0.1em] uppercase opacity-70">
        Workflow Status
      </span>
      <p className="mt-0.5 font-medium">{phaseLabels[phase]}</p>
    </div>
  );
}
