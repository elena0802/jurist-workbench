interface WorkflowStepperProps {
  activeStep?: "knowledge-base" | "issue-design" | "draft";
}

const steps = [
  { id: "knowledge-base" as const, label: "Knowledge Base", sublabel: "지식 베이스" },
  { id: "issue-design" as const, label: "Issue Design", sublabel: "평가 쟁점 설계" },
  { id: "draft" as const, label: "Draft", sublabel: "출제 초안" },
];

export default function WorkflowStepper({
  activeStep = "knowledge-base",
}: WorkflowStepperProps) {
  const activeIndex = steps.findIndex((s) => s.id === activeStep);

  return (
    <nav
      aria-label="출제 워크플로"
      className="border-b border-border bg-paper-dark/30"
    >
      <ol className="mx-auto flex max-w-7xl items-stretch px-6">
        {steps.map((step, index) => {
          const isActive = index === activeIndex;
          const isComplete = index < activeIndex;

          return (
            <li key={step.id} className="flex flex-1 items-stretch">
              <div
                className={`flex flex-1 flex-col border-b-2 px-4 py-4 transition-colors ${
                  isActive
                    ? "border-accent"
                    : isComplete
                      ? "border-ink/30"
                      : "border-transparent"
                }`}
              >
                <span
                  className={`text-[10px] font-semibold tracking-[0.14em] uppercase ${
                    isActive ? "text-accent" : "text-ink-faint"
                  }`}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span
                  className={`mt-0.5 font-serif text-sm font-medium ${
                    isActive ? "text-ink" : "text-ink-muted"
                  }`}
                >
                  {step.label}
                </span>
                <span className="text-xs text-ink-faint">{step.sublabel}</span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className="hidden w-8 shrink-0 items-center justify-center text-ink-faint sm:flex"
                  aria-hidden
                >
                  →
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
