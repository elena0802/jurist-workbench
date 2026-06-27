import type {
  GenerationOptions,
  ReviewFinding,
  ReviewFindingCategory,
  ReviewFindingPayload,
  ReviewFindingSeverity,
  FindingDecision,
} from "@/types";
import { legalIssues } from "@/data/legal-issues";
import { getDocumentById } from "@/data/knowledge-base";

const VALID_CATEGORIES: ReviewFindingCategory[] = [
  "사실관계",
  "쟁점",
  "난이도",
  "채점기준",
  "출제의도",
  "구성",
];

const FALLBACK_EVIDENCE = {
  evidenceText: "자료 근거를 확인할 수 없습니다.",
  reasoningBasis:
    "선택 쟁점·초안 내용·출제 원칙을 바탕으로 한 검토입니다.",
  recommendedReason: "초안의 평가 효과를 높이기 위한 보완이 필요합니다.",
  expectedEffect:
    "수정 시 해당 영역의 출제 품질이 개선될 것으로 예상됩니다.",
};

export function getDocumentTitles(documentIds: string[]): string[] {
  return documentIds
    .map((id) => getDocumentById(id)?.document.title)
    .filter((title): title is string => Boolean(title));
}

function coerceSeverity(value: unknown): ReviewFindingSeverity {
  const str = String(value ?? "").toLowerCase().trim();
  if (str === "low" || str === "medium" || str === "high") return str;
  return "medium";
}

function coerceStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item).trim()).filter(Boolean);
}

function coerceCategory(value: unknown): ReviewFindingCategory {
  const str = String(value ?? "").trim();
  if (VALID_CATEGORIES.includes(str as ReviewFindingCategory)) {
    return str as ReviewFindingCategory;
  }
  return "구성";
}

export function fillFindingEvidence(
  partial: Partial<ReviewFindingPayload>,
  context: {
    documentTitles: string[];
    issueNames: string[];
    category?: ReviewFindingCategory;
  }
): ReviewFindingPayload {
  const category = partial.category ?? context.category ?? "구성";
  const finding = partial.finding?.trim() ?? "";
  const suggestedAction =
    partial.suggestedAction?.trim() || "초안 해당 부분을 보완하세요.";

  const docPool =
    coerceStringArray(partial.evidenceDocuments).length > 0
      ? coerceStringArray(partial.evidenceDocuments)
      : context.documentTitles.slice(0, 2);

  const issueLabel =
    context.issueNames.length > 0
      ? context.issueNames.join(", ")
      : "선택 쟁점";

  return {
    category,
    finding,
    suggestedAction,
    evidenceDocuments: docPool,
    evidenceText:
      partial.evidenceText?.trim() ||
      (docPool.length > 0
        ? `선택 자료(${docPool.join(", ")})와 초안 구조를 대조한 검토입니다.`
        : FALLBACK_EVIDENCE.evidenceText),
    reasoningBasis:
      partial.reasoningBasis?.trim() ||
      `선택 쟁점(${issueLabel})과 ${category} 영역의 출제 원칙에 비추어 점검한 결과입니다.`,
    recommendedReason:
      partial.recommendedReason?.trim() || FALLBACK_EVIDENCE.recommendedReason,
    expectedEffect:
      partial.expectedEffect?.trim() || FALLBACK_EVIDENCE.expectedEffect,
    severity: coerceSeverity(partial.severity),
  };
}

export function buildDefaultReviewFindings(
  issueIds: string[],
  options: GenerationOptions,
  documentIds: string[] = []
): ReviewFinding[] {
  const issues = issueIds
    .map((id) => legalIssues.find((issue) => issue.id === id))
    .filter((issue): issue is NonNullable<typeof issue> => issue !== undefined);

  const documentTitles = getDocumentTitles(documentIds);
  const issueNames = issues.map((i) => i.name);
  const docRef = (index: number) =>
    documentTitles[index] ?? documentTitles[0] ?? "선택 참고 자료";
  const docPair = documentTitles.slice(0, 2);

  const context = { documentTitles, issueNames };
  const withDecision = (
    id: string,
    payload: Partial<ReviewFindingPayload>
  ): ReviewFinding => ({
    id,
    decision: "accept" as FindingDecision,
    ...fillFindingEvidence(payload, context),
  });

  const findings: ReviewFinding[] = [];

  if (issues[0]) {
    findings.push(
      withDecision("fallback-1", {
        category: "사실관계",
        finding: `「${issues[0].name}」쟁점이 사실관계에서 충분히 드러나지 않을 수 있습니다.`,
        suggestedAction:
          "방어·인식·행위 경위에 쟁점 단서를 보강하는 사실을 추가하세요.",
        evidenceDocuments: docPair.length ? docPair : [docRef(0)],
        evidenceText: docPair.length
          ? `선택 자료는 「${issues[0].name}」 관련 사실관계의 단계적 전개·인식 차이 설계를 다룹니다.`
          : "직접 근거보다는 유사 출제 구조 참고.",
        reasoningBasis: `선택 쟁점 중 「${issues[0].name}」이 포함되어 있으므로, 학생이 사실관계에서 쟁점을 스스로 도출하도록 설계되어야 합니다.`,
        recommendedReason:
          "쟁점이 너무 빨리 드러나면 변별력이 낮아지고 판단 과정을 보기 어렵습니다.",
        expectedEffect: `학생이 사실관계를 검토하며 「${issues[0].name}」을 순차적으로 검토하게 됩니다.`,
        severity: "medium",
      })
    );
  }

  if (issues.length > 1) {
    findings.push(
      withDecision("fallback-2", {
        category: "쟁점",
        finding: `「${issues[0]?.name}」과 「${issues[1].name}」의 연결이 쟁점 구조에서 약합니다.`,
        suggestedAction:
          "쟁점 구조에서 두 논점의 전제 관계·경합을 명시하세요.",
        evidenceDocuments: docPair.length ? docPair : [docRef(1)],
        evidenceText: docPair.length
          ? `선택 자료는 복수 쟁점의 전제 관계·검토 순서를 정리한 출제 구조를 보여 줍니다.`
          : "직접 근거보다는 유사 출제 구조 참고.",
        reasoningBasis: `「${issues[0]?.name}」과 「${issues[1].name}」이 함께 선택되었으므로, 양자의 연결·경합이 쟁점 구조에 반영되어야 합니다.`,
        recommendedReason:
          "쟁점 간 연결이 약하면 학생이 논점을 분절하여 답안을 작성할 수 있습니다.",
        expectedEffect:
          "학생이 두 쟁점의 전제 관계를 인식하고 순서대로 검토하게 됩니다.",
        severity: "medium",
      })
    );
  }

  findings.push(
    withDecision("fallback-3", {
      category: "난이도",
      finding: `현재 난이도(${options.difficulty})에 비해 사실관계 복잡도를 점검할 필요가 있습니다.`,
      suggestedAction:
        options.difficulty === "학부"
          ? "부수 사실을 줄이고 핵심 쟁점에 집중하세요."
          : "인식 차이·시점 문제 등 변별 요소를 보강하세요.",
      evidenceDocuments: docPair.length ? [docPair[0]!] : [docRef(0)],
      evidenceText: `설정 난이도(${options.difficulty})와 선택 자료의 사례 복잡도를 대조한 검토입니다.`,
      reasoningBasis: `출제 원칙상 난이도·용도(${options.purpose})와 사실관계 밀도는 일치해야 합니다.`,
      recommendedReason:
        options.difficulty === "학부"
          ? "과도한 사실관계는 핵심 쟁점 평가를 흐릴 수 있습니다."
          : "변별 요소가 부족하면 목표 난이도에 미치지 못할 수 있습니다.",
      expectedEffect:
        options.difficulty === "학부"
          ? "핵심 쟁점에 집중한 응시 경험을 제공합니다."
          : "인식·시점 차이를 통한 변별력이 강화됩니다.",
      severity: options.difficulty === "변호사시험 수준" ? "high" : "medium",
    })
  );

  if (options.outputs.gradingCriteria) {
    findings.push(
      withDecision("fallback-4", {
        category: "채점기준",
        finding:
          "채점기준의 배점·흔한 오류·핵심 판단 포인트가 더 구체화될 수 있습니다.",
        suggestedAction: "쟁점별 배점과 학생 오답 유형을 항목화하세요.",
        evidenceDocuments: docPair.filter((d) =>
          d.includes("채점") || d.includes("해설")
        ).length
          ? docPair.filter((d) => d.includes("채점") || d.includes("해설"))
          : docPair.length
            ? [docPair[0]!]
            : [docRef(0)],
        evidenceText:
          "선택 자료의 채점·해설 구조를 참고하여 배점·오답 유형의 구체화가 필요합니다.",
        reasoningBasis:
          "출제 원칙상 채점기준은 쟁점 구조와 대응하며, 평가 목표가 명확해야 합니다.",
        recommendedReason:
          "배점·오답 유형이 불명확하면 채점 일관성과 피드백 효과가 떨어집니다.",
        expectedEffect:
          "채점 시 핵심 판단 포인트가 분명해지고 학습 피드백이 용이해집니다.",
        severity: "medium",
      })
    );
  }

  if (options.outputs.examIntent) {
    findings.push(
      withDecision("fallback-5", {
        category: "출제의도",
        finding: `출제의도에 ${options.purpose} 맥락의 평가 목표가 더 분명히 드러날 수 있습니다.`,
        suggestedAction:
          "평가 목표·변별력·참고 자료 반영 근거를 한 단락 보완하세요.",
        evidenceDocuments: docPair.length ? docPair : [docRef(0)],
        evidenceText: `선택 자료와 용도(${options.purpose})를 연결한 출제 의도 서술이 보강될 수 있습니다.`,
        reasoningBasis:
          "출제 원칙상 출제의도는 용도·난이도·선택 쟁점과 정합적이어야 합니다.",
        recommendedReason:
          "평가 목표가 불명확하면 출제·채점·피드백 전 과정의 기준이 흐려집니다.",
        expectedEffect: `${options.purpose} 맥락에서 기대하는 학습·평가 효과가 분명해집니다.`,
        severity: "low",
      })
    );
  }

  findings.push(
    withDecision("fallback-6", {
      category: "구성",
      finding:
        "사례형 본문과 문제 지시문의 구분·호 번호 체계를 정리할 여지가 있습니다.",
      suggestedAction: "(가)(나) 구분과 문항 번호를 일관되게 정리하세요.",
      evidenceDocuments: docPair.length ? [docPair[0]!] : [docRef(0)],
      evidenceText:
        docPair.length > 0
          ? "선택 자료의 사례형 구성·문항 번호 체계와 대조한 검토입니다."
          : "직접 근거보다는 유사 출제 구조 참고.",
      reasoningBasis:
        "출제 원칙상 사례 본문·지시문·문항 구분이 명확해야 응시·채점이 안정적입니다.",
      recommendedReason:
        "구성이 혼재되면 학생의 답안 구조와 채점 기준이 어긋날 수 있습니다.",
      expectedEffect:
        "응시자가 문항 구조를 명확히 인지하고 체계적으로 답안을 작성합니다.",
      severity: "low",
    })
  );

  return findings.slice(0, 6);
}

export function normalizeReviewFindings(
  input: unknown,
  documentIds: string[] = [],
  issueIds: string[] = []
): ReviewFinding[] {
  if (!input) return [];

  const documentTitles = getDocumentTitles(documentIds);
  const issueNames = issueIds
    .map((id) => legalIssues.find((i) => i.id === id)?.name)
    .filter((name): name is string => Boolean(name));
  const context = { documentTitles, issueNames };

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
        const filled = fillFindingEvidence(
          {
            category: "구성",
            finding: item.trim(),
            suggestedAction: "해당 지적을 반영하여 초안을 보완하세요.",
          },
          context
        );
        return {
          id: `finding-${index}`,
          decision: "accept" as FindingDecision,
          ...filled,
        } satisfies ReviewFinding;
      }
      if (typeof item !== "object" || item === null) return null;
      const record = item as Record<string, unknown>;
      const finding = String(
        record.finding ?? record.text ?? record.issue ?? ""
      ).trim();
      if (!finding) return null;

      const filled = fillFindingEvidence(
        {
          category: coerceCategory(record.category),
          finding,
          suggestedAction: String(
            record.suggestedAction ?? record.action ?? record.suggestion ?? ""
          ),
          evidenceDocuments: coerceStringArray(record.evidenceDocuments),
          evidenceText: String(record.evidenceText ?? ""),
          reasoningBasis: String(
            record.reasoningBasis ?? record.reasoning ?? ""
          ),
          recommendedReason: String(
            record.recommendedReason ?? record.reason ?? ""
          ),
          expectedEffect: String(record.expectedEffect ?? ""),
          severity: coerceSeverity(record.severity),
        },
        { ...context, category: coerceCategory(record.category) }
      );

      return {
        id: String(record.id ?? `finding-${index}`),
        decision: "accept" as FindingDecision,
        ...filled,
      } satisfies ReviewFinding;
    })
    .filter((item): item is ReviewFinding => item !== null);

  return normalized.slice(0, 6);
}

export function toRevisionFindingPayload(
  finding: ReviewFinding
): ReviewFindingPayload {
  return {
    category: finding.category,
    finding: finding.finding,
    suggestedAction: finding.suggestedAction,
    evidenceDocuments: finding.evidenceDocuments,
    evidenceText: finding.evidenceText,
    reasoningBasis: finding.reasoningBasis,
    recommendedReason: finding.recommendedReason,
    expectedEffect: finding.expectedEffect,
    severity: finding.severity,
  };
}
