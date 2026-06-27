import { NextResponse } from "next/server";
import OpenAI from "openai";
import type { GenerationRequest, GenerationResult } from "@/types";
import { buildGenerationPrompt } from "@/lib/prompt";
import {
  applyOutputFilters,
  hasDraftContent,
  normalizeGenerationResult,
  parseDraftResponseContent,
} from "@/lib/normalize-draft-result";

function getOpenAIClient() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
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

    const body = (await request.json()) as GenerationRequest;

    if (
      (!body.assetIds?.length && !body.documentIds?.length) ||
      !body.issueIds?.length
    ) {
      return NextResponse.json(
        {
          error:
            "참고 자료와 평가 쟁점을 각각 하나 이상 선택해 주세요.",
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

    const prompt = buildGenerationPrompt(body);

    const completion = await getOpenAIClient().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `당신은 한국 형사법 교수의 출제 초안을 작성하는 전문 보조자입니다.
교수 검수를 전제로 하며, 확정 시험문제가 아닌 초안만 작성합니다.
반드시 유효한 JSON 객체 하나만 반환하세요. 모든 필드 값은 문자열이어야 합니다.
허위 판례 인용·조문 날조·법적 결론의 단정을 금지합니다.`,
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.65,
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
            "초안 내용을 작성하지 못했습니다. 포함 항목을 확인하고 다시 시도해 주세요.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ result });
  } catch (error) {
    console.error("Generation error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "초안 작성 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
