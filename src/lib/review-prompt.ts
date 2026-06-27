import type { ReviewRequest } from "@/types";
import { legalIssues } from "@/data/legal-issues";
import {
  formatSelectedDocumentsForPrompt,
  getDocumentById,
} from "@/data/knowledge-base";
import { outputLabels } from "@/data/generation-options";
import { buildDraftPlainText } from "@/lib/format-draft-content";

export function buildReviewPrompt(request: ReviewRequest): string {
  const selectedIssues = legalIssues.filter((issue) =>
    request.issueIds.includes(issue.id)
  );

  const issueList = selectedIssues
    .map((issue) => `- ${issue.name} [${issue.category}]: ${issue.description}`)
    .join("\n");

  const documentTitles = (request.documentIds ?? [])
    .map((id) => getDocumentById(id)?.document.title)
    .filter((title): title is string => Boolean(title));

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
교수 검수 전 1차 출제 초안을 분석하여, 각 보완 지점에 대해 근거 있는 판단을 구조화하세요.

## 검토 대상 — 1차 출제 초안
${draftText}

## 참고 자료 (지식 베이스)
${referenceBlock || "(참고 자료 정보 없음)"}

선택된 문서 제목:
${documentTitles.length > 0 ? documentTitles.map((t) => `- ${t}`).join("\n") : "(없음)"}

## 평가 쟁점
${issueList}

## 출제 조건
- 용도: ${request.options.purpose}
- 난이도: ${request.options.difficulty}
- 포함 항목: ${enabledOutputs.join(", ")}

## 출제 원칙 (검토 기준)
- 사실관계는 쟁점이 단계적으로 드러나도록 설계할 것
- 복수 쟁점은 전제 관계·검토 순서가 분명할 것
- 난이도·용도와 사실관계 밀도가 일치할 것
- 채점기준은 쟁점 구조·평가 목표와 대응할 것
- 출제의도는 선택 자료·쟁점과 정합적일 것
- 사례 본문·지시문·문항 구성이 명확할 것

## 검토 지침
1. 확정 시험이 아닌 교수 검수용 초안임을 전제로 약점·보완점을 지적하세요.
2. 각 finding마다 왜 그렇게 판단했는지 간결한 전문적 근거를 제시하세요.
3. 내부 추론 과정·chain-of-thought는 노출하지 말고, 결과적 판단 근거만 기술하세요.
4. 선택 문서·쟁점·초안 내용·출제 원칙에 연결하세요. 연결이 약하면 evidenceText에 "직접 근거보다는 유사 출제 구조 참고"라고 명시하세요.
5. 허위 판례 인용·원문 인용 허위 생성을 금지합니다. 제공되지 않은 정확한 인용을 주장하지 마세요.
6. 카테고리는 반드시 다음 중 하나: 사실관계, 쟁점, 난이도, 채점기준, 출제의도, 구성
7. severity는 low | medium | high 중 하나
8. 4~6개의 findings를 제시하세요.

## 출력 형식
반드시 아래 JSON만 반환:

{
  "findings": [
    {
      "id": "finding-1",
      "category": "사실관계",
      "finding": "발견된 문제 설명",
      "suggestedAction": "권장 보완 조치",
      "evidenceDocuments": ["선택 자료 제목"],
      "evidenceText": "자료·초안과의 연결 설명",
      "reasoningBasis": "선택 쟁점·출제 원칙에 기반한 판단 근거",
      "recommendedReason": "이 조치를 권하는 이유",
      "expectedEffect": "반영 시 기대되는 출제·평가 효과",
      "severity": "medium"
    }
  ]
}`;
}
