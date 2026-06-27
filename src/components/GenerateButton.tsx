"use client";

interface GenerateButtonProps {
  onClick: () => void;
  isLoading: boolean;
  disabled: boolean;
}

export default function GenerateButton({
  onClick,
  isLoading,
  disabled,
}: GenerateButtonProps) {
  return (
    <div className="flex flex-col items-center gap-3 py-4">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled || isLoading}
        className="w-full max-w-md rounded-sm bg-accent px-8 py-4 font-serif text-base font-medium text-paper transition-all hover:bg-accent-light disabled:cursor-not-allowed disabled:opacity-50 md:text-lg"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-paper/30 border-t-paper" />
            사례형 시험 초안 생성 중…
          </span>
        ) : (
          "사례형 시험 초안 생성"
        )}
      </button>
      {disabled && !isLoading && (
        <p className="text-sm text-ink-faint">
          Knowledge Base 문서와 법적 쟁점을 각각 하나 이상 선택해 주세요.
        </p>
      )}
    </div>
  );
}
