import type { GenerationResult } from "@/types";

const SECTION_KEYS: Array<keyof GenerationResult> = [
  "caseProblem",
  "examIntent",
  "issueStructure",
  "gradingCriteria",
  "professorReviewMemo",
];

const FIELD_ALIASES: Record<keyof GenerationResult, string[]> = {
  caseProblem: ["caseProblem", "case_problem", "사례형문제", "사례형_문제"],
  examIntent: ["examIntent", "exam_intent", "출제의도"],
  issueStructure: ["issueStructure", "issue_structure", "쟁점구조", "쟁점_구조"],
  gradingCriteria: [
    "gradingCriteria",
    "grading_criteria",
    "채점기준",
    "채점_기준",
  ],
  professorReviewMemo: [
    "professorReviewMemo",
    "professor_review_memo",
    "교수검수메모",
    "교수_검수_메모",
  ],
};

const RAW_TEXT_KEYS = [
  "rawDraft",
  "raw_draft",
  "draft",
  "content",
  "text",
  "output",
  "result",
];

export function coerceToDraftText(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (Array.isArray(value)) {
    return value
      .map((item) => coerceToDraftText(item))
      .filter((item) => item.trim().length > 0)
      .join("\n\n");
  }
  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    return Object.entries(record)
      .map(([key, entry]) => {
        const body = coerceToDraftText(entry).trim();
        return body ? `${key}\n${body}` : "";
      })
      .filter(Boolean)
      .join("\n\n");
  }
  return String(value);
}

export function normalizeSectionText(value: unknown): string {
  return coerceToDraftText(value).trim();
}

function readAliasedField(
  record: Record<string, unknown>,
  key: keyof GenerationResult
): string {
  for (const alias of FIELD_ALIASES[key]) {
    if (alias in record) {
      return normalizeSectionText(record[alias]);
    }
  }
  return "";
}

function readRawDraftText(record: Record<string, unknown>): string {
  for (const key of RAW_TEXT_KEYS) {
    if (key in record) {
      return normalizeSectionText(record[key]);
    }
  }
  return "";
}

function hasStructuredContent(record: Record<string, unknown>): boolean {
  return SECTION_KEYS.some((key) => {
    if (key === "professorReviewMemo") {
      return mergeProfessorReviewMemo(record).length > 0;
    }
    return readAliasedField(record, key).length > 0;
  });
}

function mergeProfessorReviewMemo(record: Record<string, unknown>): string {
  const memo = readAliasedField(record, "professorReviewMemo");
  const points = [
    "professorReviewPoints",
    "professor_review_points",
    "교수검수포인트",
    "교수_검수_포인트",
  ]
    .map((key) => normalizeSectionText(record[key]))
    .filter((text) => text.length > 0);

  if (memo && points.length > 0) {
    return [memo, ...points].join("\n\n");
  }
  if (memo) return memo;
  return points.join("\n\n");
}

export function emptyGenerationResult(): GenerationResult {
  return {
    caseProblem: "",
    examIntent: "",
    issueStructure: "",
    gradingCriteria: "",
    professorReviewMemo: "",
  };
}

export function normalizeGenerationResult(input: unknown): GenerationResult {
  const empty = emptyGenerationResult();

  if (input == null) return empty;

  if (typeof input === "string") {
    const text = input.trim();
    return text ? { ...empty, caseProblem: text } : empty;
  }

  if (typeof input !== "object") {
    const text = normalizeSectionText(input);
    return text ? { ...empty, caseProblem: text } : empty;
  }

  const record = input as Record<string, unknown>;

  const structured: GenerationResult = {
    caseProblem: readAliasedField(record, "caseProblem"),
    examIntent: readAliasedField(record, "examIntent"),
    issueStructure: readAliasedField(record, "issueStructure"),
    gradingCriteria: readAliasedField(record, "gradingCriteria"),
    professorReviewMemo: mergeProfessorReviewMemo(record),
  };

  if (hasDraftContent(structured)) {
    return structured;
  }

  const rawText = readRawDraftText(record);
  if (rawText) {
    return { ...empty, caseProblem: rawText };
  }

  if (!hasStructuredContent(record)) {
    const serialized = normalizeSectionText(record);
    if (serialized) {
      return { ...empty, caseProblem: serialized };
    }
  }

  return structured;
}

export function parseDraftResponseContent(content: string): GenerationResult {
  const trimmed = content.trim();
  if (!trimmed) return emptyGenerationResult();

  try {
    const parsed: unknown = JSON.parse(trimmed);
    return normalizeGenerationResult(parsed);
  } catch {
    const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed: unknown = JSON.parse(jsonMatch[0]);
        const normalized = normalizeGenerationResult(parsed);
        if (hasDraftContent(normalized)) {
          return normalized;
        }
      } catch {
        // fall through to plain text
      }
    }
    return { ...emptyGenerationResult(), caseProblem: trimmed };
  }
}

export function hasDraftContent(result: GenerationResult | null | undefined): boolean {
  if (!result) return false;
  return SECTION_KEYS.some((key) => normalizeSectionText(result[key]).length > 0);
}

export function getVisibleDraftSections(
  result: GenerationResult
): Array<{ key: keyof GenerationResult; text: string }> {
  return SECTION_KEYS.map((key) => ({
    key,
    text: normalizeSectionText(result[key]),
  })).filter((section) => section.text.length > 0);
}

export function applyOutputFilters(
  result: GenerationResult,
  outputs: {
    caseProblem: boolean;
    examIntent: boolean;
    issueStructure: boolean;
    gradingCriteria: boolean;
    professorReviewMemo: boolean;
  }
): GenerationResult {
  return {
    caseProblem: outputs.caseProblem ? normalizeSectionText(result.caseProblem) : "",
    examIntent: outputs.examIntent ? normalizeSectionText(result.examIntent) : "",
    issueStructure: outputs.issueStructure
      ? normalizeSectionText(result.issueStructure)
      : "",
    gradingCriteria: outputs.gradingCriteria
      ? normalizeSectionText(result.gradingCriteria)
      : "",
    professorReviewMemo: outputs.professorReviewMemo
      ? normalizeSectionText(result.professorReviewMemo)
      : "",
  };
}
