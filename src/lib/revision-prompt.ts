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

  const approvedBlock = request.approvedFindings
    .map(
      (f) =>
        `- [${f.category}] 발견: ${f.finding} → 조치: ${f.suggestedAction}`
    )
    .join("\n");

  const ignoredBlock = request.ignoredFindings
    .map((f) => `- [${f.category}] ${f.finding} (교수 승인에서 제외)`)
    .join("\n");

  const enabledOutputs = (
    Object.entries(request.options.outputs) as Array<
      [keyof typeof outputLabels, boolean]
    >
  )
    .filter(([, enabled]) => enabled)
    .map(([key]) => outputLabels[key]);

  const originalDraftText = buildDraftPlainText(request.originalDraft);

  return `당신은 한국 형사법 교수의 출제 초안을 「교수 승인 후 수정」하는 전문 보조자입니다.
이번 작업은 초안 검토·교수 승인을 거친 수정 패스입니다.

## 문서 성격
- 확정 시험문제가 아닌 「수정 초안 v2」입니다.
- 1차 초안의 강점은 보존하고, 승인된 검토 내용만 반영하세요.
- 무시(제외)된 검토 항목은 반영하지 마세요.
- 허위 판례 인용·조문 날조·법적 결론의 단정을 금지합니다.

## 1차 출제 초안
${originalDraftText}

## 참고 자료
${referenceBlock || "(동일 참고 자료 유지)"}

## 평가 쟁점
${issueList}

## 출제 조건
- 용도: ${request.options.purpose}
- 난이도: ${request.options.difficulty}
- 포함 항목: ${enabledOutputs.join(", ")}

## 승인된 검토 제안 (반영 필수)
${approvedBlock || "(승인된 검토 제안 없음)"}

## 제외된 검토 제안 (반영 금지)
${ignoredBlock || "(제외 항목 없음)"}

## 교수 승인 체크리스트
${checklistInstructions || "(체크리스트 없음)"}

## 교수님 추가 지시
${request.professorInstruction.trim() || "(추가 지시 없음)"}

## 수정 지침
1. 승인된 검토·체크리스트·교수 지시만 반영하세요.
2. 변경 사항이 교수 검수 메모에 무엇이 바뀌었는지 드러나게 기록하세요.
3. 사실관계·쟁점·채점기준·출제의도의 일관성을 유지하세요.
4. 모든 내용은 한국어로 작성하세요.

## 출력 형식
반드시 아래 JSON 키만 사용. 모든 값은 문자열입니다.

{
  "caseProblem": "",
  "examIntent": "",
  "issueStructure": "",
  "gradingCriteria": "",
  "professorReviewMemo": ""
}`;
}
