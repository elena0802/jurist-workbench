import type { RevisionRequest } from "@/types";
import { checklistInstructionMap } from "@/data/review-checklist";
import { legalIssues } from "@/data/legal-issues";
import { formatSelectedDocumentsForPrompt } from "@/data/knowledge-base";
import { outputLabels } from "@/data/generation-options";
import { buildDraftPlainText } from "@/lib/format-draft-content";

export function buildRevisionPrompt(request: RevisionRequest): string {
  const selectedIssues = legalIssues.filter((issue) =>
    request.issueIds.includes(issue.id)
  );

  const issueList = selectedIssues
    .map((issue) => `- ${issue.name} [${issue.category}]: ${issue.description}`)
    .join("\n");

  const referenceBlock = formatSelectedDocumentsForPrompt(
    request.documentIds ?? []
  );

  const checklistInstructions = request.checklistItems
    .map((id) => `- ${checklistInstructionMap[id]}`)
    .join("\n");

  const acceptedSuggestions = request.acceptedSuggestions
    .map((text) => `- ${text}`)
    .join("\n");

  const enabledOutputs = (
    Object.entries(request.options.outputs) as Array<
      [keyof typeof outputLabels, boolean]
    >
  )
    .filter(([, enabled]) => enabled)
    .map(([key]) => outputLabels[key]);

  const originalDraftText = buildDraftPlainText(request.originalDraft);

  return `당신은 한국 형사법 교수의 출제 초안을 「교수 검수 후 수정」하는 전문 보조자입니다.
이번 작업은 1차 출제 초안에 대한 수정 패스(revision pass)입니다.

## 문서 성격
- 확정 시험문제가 아닌, 교수 검수를 거친 「수정 초안 v2」입니다.
- 1차 초안의 유용한 부분은 보존하되, 교수 검수 지시를 반영하세요.
- 허위 판례 인용·조문 날조·법적 결론의 단정을 금지합니다.
- 최종 판단은 교수에게 열어 두세요.

## 1차 출제 초안 (수정 대상)
${originalDraftText}

## 참고 자료 (지식 베이스)
${referenceBlock || "(동일 참고 자료 유지)"}

## 평가 쟁점
${issueList}

## 출제 조건
- 용도: ${request.options.purpose}
- 난이도: ${request.options.difficulty}
- 포함 항목: ${enabledOutputs.join(", ")}

## 교수 검수 — 체크리스트 반영
${checklistInstructions || "(체크리스트 항목 없음)"}

## 교수 검수 — 반영할 제안
${acceptedSuggestions || "(반영할 제안 없음)"}

## 교수님 추가 지시
${request.professorInstruction.trim() || "(추가 지시 없음)"}

## 수정 지침
1. 1차 초안의 구조와 학술적 톤을 유지하되, 검수 지시를 우선 반영하세요.
2. 사실관계·쟁점·채점기준·출제의도를 일관되게 수정하세요.
3. 교수 검수 메모에는 이번 수정에서 반영한 점과 추가 검토가 필요한 점을 기록하세요.
4. 모든 내용은 한국어로 작성하세요.

## 출력 형식
반드시 아래 JSON 키만 사용. 모든 값은 문자열(string)입니다.

{
  "caseProblem": "",
  "examIntent": "",
  "issueStructure": "",
  "gradingCriteria": "",
  "professorReviewMemo": ""
}`;
}
