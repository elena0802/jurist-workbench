import { NextResponse } from "next/server";
import OpenAI from "openai";
import type { GenerationRequest, GenerationResult } from "@/types";
import { buildGenerationPrompt } from "@/lib/prompt";

function getOpenAIClient() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

function parseGenerationResult(content: string): GenerationResult {
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("AI 응답을 파싱할 수 없습니다.");
  }

  const parsed = JSON.parse(jsonMatch[0]) as Partial<GenerationResult>;

  return {
    caseProblem: parsed.caseProblem ?? "",
    examIntent: parsed.examIntent ?? "",
    issueStructure: parsed.issueStructure ?? "",
    gradingCriteria: parsed.gradingCriteria ?? "",
    professorReviewMemo: parsed.professorReviewMemo ?? "",
  };
}

export async function POST(request: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY가 설정되지 않았습니다. .env.local 파일을 확인해 주세요." },
        { status: 500 }
      );
    }

    const body = (await request.json()) as GenerationRequest;

    if (!body.assetIds?.length || !body.issueIds?.length) {
      return NextResponse.json(
        { error: "교육 자료와 법적 쟁점을 각각 하나 이상 선택해 주세요." },
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
          content:
            "당신은 한국 형사법 교수를 위한 출제 보조 AI입니다. 항상 유효한 JSON만 반환하세요.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json(
        { error: "AI로부터 응답을 받지 못했습니다." },
        { status: 500 }
      );
    }

    const rawResult = parseGenerationResult(content);

    const result: GenerationResult = {
      caseProblem: body.options.outputs.caseProblem ? rawResult.caseProblem : "",
      examIntent: body.options.outputs.examIntent ? rawResult.examIntent : "",
      issueStructure: body.options.outputs.issueStructure
        ? rawResult.issueStructure
        : "",
      gradingCriteria: body.options.outputs.gradingCriteria
        ? rawResult.gradingCriteria
        : "",
      professorReviewMemo: body.options.outputs.professorReviewMemo
        ? rawResult.professorReviewMemo
        : "",
    };

    return NextResponse.json({ result });
  } catch (error) {
    console.error("Generation error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "생성 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
