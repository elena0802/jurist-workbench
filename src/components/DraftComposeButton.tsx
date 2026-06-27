"use client";

interface DraftComposeButtonProps {
  onClick: () => void;
  isLoading: boolean;
  disabled: boolean;
}

export default function DraftComposeButton({
  onClick,
  isLoading,
  disabled,
}: DraftComposeButtonProps) {
  return (
    <div className="flex flex-col items-center gap-2 border-t border-border/80 px-4 pb-4 pt-3">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled || isLoading}
        className="w-full max-w-md rounded-sm border border-accent bg-accent px-6 py-3 font-serif text-base font-medium text-paper transition-colors hover:bg-accent-light disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-paper/30 border-t-paper" />
            출제 초안 작성 중…
          </span>
        ) : (
          "출제 초안 작성"
        )}
      </button>
      {disabled && !isLoading && (
        <p className="text-center text-xs leading-relaxed text-ink-faint">
          지식 베이스에서 참고 자료를, 평가 쟁점 설계에서 쟁점을 각각 지정해
          주세요.
        </p>
      )}
    </div>
  );
}
