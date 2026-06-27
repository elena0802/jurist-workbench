import type { GenerationRequest } from "@/types";
import { educationalAssets } from "@/data/educational-assets";
import { legalIssues } from "@/data/legal-issues";
import { outputLabels } from "@/data/generation-options";

export function buildGenerationPrompt(request: GenerationRequest): string {
  const selectedAssets = educationalAssets.filter((asset) =>
    request.assetIds.includes(asset.id)
  );
  const selectedIssues = legalIssues.filter((issue) =>
    request.issueIds.includes(issue.id)
  );

  const enabledOutputs = (
    Object.entries(request.options.outputs) as Array<
      [keyof typeof outputLabels, boolean]
    >
  )
    .filter(([, enabled]) => enabled)
    .map(([key]) => outputLabels[key]);

  const assetList = selectedAssets
    .map(
      (asset) =>
        `- ${asset.title} (${asset.category}${asset.year ? `, ${asset.year}` : ""}): ${asset.description}`
    )
    .join("\n");

  const issueList = selectedIssues
    .map((issue) => `- ${issue.name} [${issue.category}]: ${issue.description}`)
    .join("\n");

  return `당신은 한국 형사법 교수를 위한 출제 보조 AI입니다. 범용 채팅이 아니라, 교수가 선별한 교육 자료와 법적 쟁점을 바탕으로 사례형 시험 초안을 작성합니다.

## 교육 자료
${assetList}

## 선택된 법적 쟁점
${issueList}

## 생성 옵션
- 용도: ${request.options.purpose}
- 난이도: ${request.options.difficulty}
- 출력 항목: ${enabledOutputs.join(", ")}

## 작성 지침
1. 한국 형사법 교육 맥락에 맞는 학술적·전문적 문체를 사용하세요.
2. 사실관계는 현실적이되 허구의 사례로 구성하세요. 실제 인물·사건명을 사용하지 마세요.
3. 선택된 쟁점이 문제 전개의 중심이 되도록 구성하세요.
4. 교수 검수를 전제로 하므로, 논점을 명확히 제시하고 채점 가능한 구조를 유지하세요.
5. 난이도에 맞게 사실관계의 복잡성과 쟁점 수를 조절하세요.
6. 모든 내용은 한국어로 작성하세요.

## 출력 형식
반드시 아래 JSON 형식으로만 응답하세요. 선택되지 않은 항목은 빈 문자열("")로 두세요.

{
  "caseProblem": "사례형 문제 초안 (선택된 경우)",
  "examIntent": "출제의도 (선택된 경우)",
  "issueStructure": "쟁점 구조 (선택된 경우)",
  "gradingCriteria": "채점기준 (선택된 경우)",
  "professorReviewMemo": "교수 검수 메모 (선택된 경우)"
}`;
}
