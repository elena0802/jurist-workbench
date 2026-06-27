import type { GenerationOptions } from "@/types";
import { legalIssues } from "@/data/legal-issues";
import type { ReviewSuggestion } from "@/types";

function extractBulletPoints(text: string): string[] {
  const results: string[] = [];
  const lines = text.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length < 12) continue;

    const cleaned = trimmed
      .replace(/^(\d+[\.\)]|[①②③④⑤⑥⑦⑧⑨⑩]|\([가나다]\)|[가나다][\.\)])\s*/, "")
      .replace(/^[-·•*]\s+/, "")
      .replace(/^\*\*([^*]+)\*\*:?\s*/, "$1: ")
      .trim();

    if (
      cleaned.length >= 12 &&
      (/^(\d+[\.\)]|[-·•*]|[①②③])/.test(trimmed) ||
        /^(\*\*|#{1,3}\s)/.test(trimmed) ||
        /(필요|검토|보완|조정|미발달|약점|개선|권고|제안)/.test(cleaned))
    ) {
      results.push(cleaned);
    }
  }

  return [...new Set(results)];
}

function buildDefaultSuggestions(
  issueIds: string[],
  options: GenerationOptions
): string[] {
  const issues = issueIds
    .map((id) => legalIssues.find((issue) => issue.id === id))
    .filter((issue): issue is NonNullable<typeof issue> => issue !== undefined);

  const suggestions: string[] = [];

  if (issues.length > 0) {
    suggestions.push(
      `「${issues[0].name}」쟁점이 사실관계 전개에서 더 분명히 드러나도록 보강이 필요합니다.`
    );
  }
  if (issues.length > 1) {
    suggestions.push(
      `「${issues[0].name}」과 「${issues[1].name}」의 논리적 연결을 쟁점 구조에서 더 명시하세요.`
    );
  }

  if (options.outputs.gradingCriteria) {
    suggestions.push(
      "채점기준에 쟁점별 배점과 흔한 학생 오류를 추가하여 변별력을 높이세요."
    );
  }

  if (options.outputs.examIntent) {
    suggestions.push(
      `출제의도에 ${options.purpose} 맥락에서의 평가 목표를 한 단락 보완하세요.`
    );
  }

  suggestions.push(
    "사실관계의 시간순 전개를 점검하고, 불필요한 복선은 줄이는 것을 검토하세요."
  );

  return suggestions;
}

export function buildReviewSuggestions(
  professorReviewMemo: string,
  issueIds: string[],
  options: GenerationOptions
): ReviewSuggestion[] {
  const parsed = extractBulletPoints(professorReviewMemo);
  const defaults = buildDefaultSuggestions(issueIds, options);

  const combined = [...parsed];
  for (const item of defaults) {
    if (combined.length >= 5) break;
    if (!combined.some((existing) => similar(existing, item))) {
      combined.push(item);
    }
  }

  return combined.slice(0, 5).map((text, index) => ({
    id: `suggestion-${index}`,
    text,
    decision: "pending" as const,
  }));
}

function similar(a: string, b: string): boolean {
  const norm = (s: string) => s.replace(/\s/g, "").slice(0, 20);
  return norm(a) === norm(b);
}
