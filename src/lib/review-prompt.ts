import type { ReviewRequest } from "@/types";
import { legalIssues } from "@/data/legal-issues";
import { formatSelectedDocumentsForPrompt } from "@/data/knowledge-base";
import { outputLabels } from "@/data/generation-options";
import { buildDraftPlainText } from "@/lib/format-draft-content";

export function buildReviewPrompt(request: ReviewRequest): string {
  const selectedIssues = legalIssues.filter((issue) =>
    request.issueIds.includes(issue.id)
  );

  const issueList = selectedIssues
    .map((issue) => `- ${issue.name} [${issue.category}]: ${issue.description}`)
    .join("\n");

  const referenceBlock = formatSelectedDocumentsForPrompt(
    request.documentIds ?? []
  );

  const enabledOutputs = (
    Object.entries(request.options.outputs) as Array<
      [keyof typeof outputLabels, boolean]
    >
  )
    .filter(([, enabled]) => enabled)
    .map(([key]) => outputLabels[key]);

  const draftText = buildDraftPlainText(request.draft);

  return `당신은 한국 형사법 출제 초안을 검토하는 전문 검토자입니다.
교수 검수 전 1차 출제 초안을 분석하여 보완 지점을 구조화하세요.

## 검토 대상 — 1차 출제 초안
${draftText}

## 참고 자료
${referenceBlock || "(참고 자료 정보 없음)"}

## 평가 쟁점
${issueList}

## 출제 조건
- 용도: ${request.options.purpose}
- 난이도: ${request.options.difficulty}
- 포함 항목: ${enabledOutputs.join(", ")}

## 검토 지침
1. 확정 시험이 아닌 교수 검수용 초안임을 전제로 약점·보완점을 지적하세요.
2. 허위 판례 인용을 제안하지 마세요.
3. 각 finding은 구체적이고 실행 가능해야 합니다.
4. 카테고리는 반드시 다음 중 하나: 사실관계, 쟁점, 난이도, 채점기준, 출제의도, 구성
5. 4~6개의 findings를 제시하세요.

## 출력 형식
반드시 아래 JSON만 반환:

{
  "findings": [
    {
      "id": "finding-1",
      "category": "사실관계",
      "finding": "발견된 문제 설명",
      "suggestedAction": "권장 보완 조치"
    }
  ]
}`;
}
