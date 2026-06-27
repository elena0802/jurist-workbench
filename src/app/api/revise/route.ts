import { NextResponse } from "next/server";
import OpenAI from "openai";
import type { GenerationResult, RevisionRequest, ReviewFinding } from "@/types";
import { buildRevisionPrompt } from "@/lib/revision-prompt";
import { buildLocalRevisionSummary } from "@/lib/revision-summary";
import { fillFindingEvidence } from "@/lib/normalize-review-findings";
import {
  applyOutputFilters,
  hasDraftContent,
  normalizeGenerationResult,
  parseDraftResponseContent,
} from "@/lib/normalize-draft-result";

function getOpenAIClient() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

function toSummaryFinding(
  payload: RevisionRequest["approvedFindings"][number],
  id: string,
  decision: "accept" | "ignore"
): ReviewFinding {
  const base = fillFindingEvidence(payload, {
    documentTitles: payload.evidenceDocuments ?? [],
    issueNames: [],
    category: payload.category,
  });
  return {
    id,
    decision,
    ...base,
    appliedRules: payload.appliedRules ?? [],
  };
}

export async function POST(request: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          error:
            "OPENAI_API_KEY가 설정되지 않았습니다. .env.local 파일을 확인해 주세요.",
        },
        { status: 500 }
      );
    }

    const body = (await request.json()) as RevisionRequest;

    if (!body.originalDraft || !hasDraftContent(body.originalDraft)) {
      return NextResponse.json(
        { error: "수정할 1차 출제 초안이 없습니다." },
        { status: 400 }
      );
    }

    if (
      (!body.assetIds?.length && !body.documentIds?.length) ||
      !body.issueIds?.length
    ) {
      return NextResponse.json(
        { error: "참고 자료와 평가 쟁점 정보가 필요합니다." },
        { status: 400 }
      );
    }

    const approvedFindings = body.approvedFindings ?? [];
    const ignoredFindings = body.ignoredFindings ?? [];

    const hasRevisionInput =
      body.checklistItems.length > 0 ||
      approvedFindings.length > 0 ||
      body.professorInstruction.trim().length > 0;

    if (!hasRevisionInput) {
      return NextResponse.json(
        {
          error:
            "반영할 검토 제안, 체크리스트, 또는 교수님 추가 지시 중 하나 이상을 지정해 주세요.",
        },
        { status: 400 }
      );
    }

    const hasOutput = Object.values(body.options.outputs).some(Boolean);
    if (!hasOutput) {
      return NextResponse.json(
        { error: "출력 항목을 하나 이상 선택해 주세요." },
        { status: 400 }
      );
    }

    const prompt = buildRevisionPrompt(body);

    const completion = await getOpenAIClient().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `당신은 한국 형사법 교수의 출제 초안을 교수 승인 후 수정하는 전문 보조자입니다.
1차 초안의 유용한 부분을 보존하면서 승인된 검토 내용만 반영한 수정 초안을 작성합니다.
반드시 유효한 JSON 객체 하나만 반환하세요. 모든 필드 값은 문자열이어야 합니다.
허위 판례 인용·조문 날조·법적 결론의 단정을 금지합니다.`,
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.6,
      max_tokens: 6000,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json(
        { error: "응답을 받지 못했습니다. 잠시 후 다시 시도해 주세요." },
        { status: 500 }
      );
    }

    const rawResult = parseDraftResponseContent(content);
    const normalized = normalizeGenerationResult(rawResult);

    const result: GenerationResult = applyOutputFilters(
      normalized,
      body.options.outputs
    );

    if (!hasDraftContent(result)) {
      return NextResponse.json(
        {
          error:
            "수정 초안을 작성하지 못했습니다. 검수 내용을 확인하고 다시 시도해 주세요.",
        },
        { status: 500 }
      );
    }

    const approvedForSummary = approvedFindings.map((f, index) =>
      toSummaryFinding(f, `approved-${index}`, "accept")
    );

    const ignoredForSummary = ignoredFindings.map((f, index) =>
      toSummaryFinding(f, `ignored-${index}`, "ignore")
    );

    const revisionSummary = buildLocalRevisionSummary(
      approvedForSummary,
      ignoredForSummary,
      body.checklistItems,
      body.professorInstruction,
      body.options
    );

    return NextResponse.json({ result, revisionSummary });
  } catch (error) {
    console.error("Revision error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "수정 초안 작성 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
