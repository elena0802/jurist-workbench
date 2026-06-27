import { NextResponse } from "next/server";
import OpenAI from "openai";
import type { ReviewRequest } from "@/types";
import { buildReviewPrompt } from "@/lib/review-prompt";
import {
  buildDefaultReviewFindings,
  normalizeReviewFindings,
} from "@/lib/normalize-review-findings";
import { hasDraftContent } from "@/lib/normalize-draft-result";

function getOpenAIClient() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export async function POST(request: Request) {
  let body: ReviewRequest | null = null;

  try {
    body = (await request.json()) as ReviewRequest;

    if (!body.draft || !hasDraftContent(body.draft)) {
      return NextResponse.json(
        { error: "검토할 출제 초안이 없습니다." },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      const fallback = buildDefaultReviewFindings(
        body.issueIds ?? [],
        body.options
      );
      return NextResponse.json({
        findings: fallback,
        source: "fallback",
        warning: "API 키가 없어 기본 검토 제안을 표시합니다.",
      });
    }

    const prompt = buildReviewPrompt(body);

    const completion = await getOpenAIClient().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `당신은 한국 형사법 출제 초안을 검토하는 전문 검토자입니다.
교수 검수 전 보완 지점을 구조화합니다. 유효한 JSON만 반환하세요.`,
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.55,
      max_tokens: 2000,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("검토 응답을 받지 못했습니다.");
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      throw new Error("검토 응답을 해석하지 못했습니다.");
    }

    let findings = normalizeReviewFindings(parsed);

    if (findings.length < 3) {
      const fallback = buildDefaultReviewFindings(
        body.issueIds ?? [],
        body.options
      );
      const existingTexts = new Set(findings.map((f) => f.finding));
      for (const item of fallback) {
        if (findings.length >= 6) break;
        if (!existingTexts.has(item.finding)) findings.push(item);
      }
    }

    if (findings.length === 0) {
      findings = buildDefaultReviewFindings(body.issueIds ?? [], body.options);
    }

    return NextResponse.json({ findings, source: "review" });
  } catch (error) {
    console.error("Review error:", error);

    const fallback = buildDefaultReviewFindings(
      body?.issueIds ?? [],
      body?.options ?? {
        purpose: "모의시험",
        difficulty: "로스쿨",
        outputs: {
          caseProblem: true,
          examIntent: true,
          issueStructure: true,
          gradingCriteria: true,
          professorReviewMemo: true,
        },
      }
    );

    return NextResponse.json({
      findings: fallback,
      source: "fallback",
      warning:
        error instanceof Error
          ? `초안 검토를 자동 생성하지 못했습니다. ${error.message}`
          : "초안 검토를 자동 생성하지 못해 기본 검토 제안을 표시합니다.",
    });
  }
}
