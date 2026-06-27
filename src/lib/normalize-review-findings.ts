import type {
  GenerationOptions,
  ReviewFinding,
  ReviewFindingCategory,
  FindingDecision,
} from "@/types";
import { legalIssues } from "@/data/legal-issues";

const VALID_CATEGORIES: ReviewFindingCategory[] = [
  "사실관계",
  "쟁점",
  "난이도",
  "채점기준",
  "출제의도",
  "구성",
];

export function buildDefaultReviewFindings(
  issueIds: string[],
  options: GenerationOptions
): ReviewFinding[] {
  const issues = issueIds
    .map((id) => legalIssues.find((issue) => issue.id === id))
    .filter((issue): issue is NonNullable<typeof issue> => issue !== undefined);

  const findings: ReviewFinding[] = [];

  if (issues[0]) {
    findings.push({
      id: "fallback-1",
      category: "사실관계",
      finding: `「${issues[0].name}」쟁점이 사실관계에서 충분히 드러나지 않을 수 있습니다.`,
      suggestedAction:
        "방어·인식·행위 경위에 쟁점 단서를 보강하는 사실을 추가하세요.",
      decision: "accept",
    });
  }

  if (issues.length > 1) {
    findings.push({
      id: "fallback-2",
      category: "쟁점",
      finding: `「${issues[0]?.name}」과 「${issues[1].name}」의 연결이 쟁점 구조에서 약합니다.`,
      suggestedAction:
        "쟁점 구조에서 두 논점의 전제 관계·경합을 명시하세요.",
      decision: "accept",
    });
  }

  findings.push({
    id: "fallback-3",
    category: "난이도",
    finding: `현재 난이도(${options.difficulty})에 비해 사실관계 복잡도를 점검할 필요가 있습니다.`,
    suggestedAction:
      options.difficulty === "학부"
        ? "부수 사실을 줄이고 핵심 쟁점에 집중하세요."
        : "인식 차이·시점 문제 등 변별 요소를 보강하세요.",
    decision: "accept",
  });

  if (options.outputs.gradingCriteria) {
    findings.push({
      id: "fallback-4",
      category: "채점기준",
      finding: "채점기준의 배점·흔한 오류·핵심 판단 포인트가 더 구체화될 수 있습니다.",
      suggestedAction: "쟁점별 배점과 학생 오답 유형을 항목화하세요.",
      decision: "accept",
    });
  }

  if (options.outputs.examIntent) {
    findings.push({
      id: "fallback-5",
      category: "출제의도",
      finding: `출제의도에 ${options.purpose} 맥락의 평가 목표가 더 분명히 드러날 수 있습니다.`,
      suggestedAction: "평가 목표·변별력·참고 자료 반영 근거를 한 단락 보완하세요.",
      decision: "accept",
    });
  }

  findings.push({
    id: "fallback-6",
    category: "구성",
    finding: "사례형 본문과 문제 지시문의 구분·호 번호 체계를 정리할 여지가 있습니다.",
    suggestedAction: "(가)(나) 구분과 문항 번호를 일관되게 정리하세요.",
    decision: "accept",
  });

  return findings.slice(0, 6);
}

function coerceCategory(value: unknown): ReviewFindingCategory {
  const str = String(value ?? "").trim();
  if (VALID_CATEGORIES.includes(str as ReviewFindingCategory)) {
    return str as ReviewFindingCategory;
  }
  return "구성";
}

export function normalizeReviewFindings(input: unknown): ReviewFinding[] {
  if (!input) return [];

  let raw: unknown[] = [];
  if (Array.isArray(input)) {
    raw = input;
  } else if (typeof input === "object" && input !== null) {
    const record = input as Record<string, unknown>;
    if (Array.isArray(record.findings)) raw = record.findings;
  }

  const normalized = raw
    .map((item, index) => {
      if (typeof item === "string" && item.trim()) {
        return {
          id: `finding-${index}`,
          category: "구성" as ReviewFindingCategory,
          finding: item.trim(),
          suggestedAction: "해당 지적을 반영하여 초안을 보완하세요.",
          decision: "accept" as FindingDecision,
        } satisfies ReviewFinding;
      }
      if (typeof item !== "object" || item === null) return null;
      const record = item as Record<string, unknown>;
      const finding = String(
        record.finding ?? record.text ?? record.issue ?? ""
      ).trim();
      if (!finding) return null;
      return {
        id: String(record.id ?? `finding-${index}`),
        category: coerceCategory(record.category),
        finding,
        suggestedAction:
          String(
            record.suggestedAction ?? record.action ?? record.suggestion ?? ""
          ).trim() || "초안 해당 부분을 보완하세요.",
        decision: "accept" as FindingDecision,
      } satisfies ReviewFinding;
    })
    .filter((item): item is ReviewFinding => item !== null);

  return normalized.slice(0, 6);
}
