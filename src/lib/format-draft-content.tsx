import type { GenerationResult } from "@/types";
import { resultSectionLabels } from "@/data/generation-options";
import { getVisibleDraftSections } from "@/lib/normalize-draft-result";

export function buildDraftPlainText(result: GenerationResult): string {
  const sections = getVisibleDraftSections(result);
  const header = "— Jurist Workbench 출제 초안 —\n\n";
  const body = sections
    .map(
      (section) =>
        `【${resultSectionLabels[section.key]}】\n${section.text.trim()}`
    )
    .join("\n\n");
  return header + body;
}

const NUMBERED_LINE =
  /^(\d+[\.\)]|[①②③④⑤⑥⑦⑧⑨⑩]|\([가나다]\)|[가나다][\.\)])\s*/;
const BULLET_LINE = /^[-·•*]\s+/;
const SUBHEAD_LINE = /^(#{1,3}\s+|\*\*.+\*\*)/;

export function DraftTextContent({
  text,
  density = "default",
}: {
  text: string;
  density?: "default" | "relaxed" | "compact";
}) {
  const lines = text.split("\n");
  const lineClass =
    density === "relaxed"
      ? "text-[15px] leading-[1.85]"
      : density === "compact"
        ? "text-[13px] leading-snug"
        : "text-sm leading-[1.75]";

  return (
    <div className="space-y-0.5">
      {lines.map((line, index) => {
        const trimmed = line.trim();

        if (!trimmed) {
          return <div key={index} className="h-2.5" aria-hidden />;
        }

        if (SUBHEAD_LINE.test(trimmed)) {
          const label = trimmed
            .replace(/^#{1,3}\s+/, "")
            .replace(/^\*\*/, "")
            .replace(/\*\*$/, "");
          return (
            <p
              key={index}
              className="mt-4 mb-1 font-serif text-[15px] font-medium text-ink first:mt-0"
            >
              {label}
            </p>
          );
        }

        if (NUMBERED_LINE.test(trimmed) || BULLET_LINE.test(trimmed)) {
          return (
            <div
              key={index}
              className="my-1 border-l-2 border-border-dark/70 py-0.5 pl-3"
            >
              <p className={`${lineClass} text-ink-muted`}>{trimmed}</p>
            </div>
          );
        }

        return (
          <p key={index} className={`${lineClass} text-ink-muted`}>
            {line}
          </p>
        );
      })}
    </div>
  );
}
