import type { ReviewRequest } from "@/types";
import { legalIssues } from "@/data/legal-issues";
import { examRules } from "@/data/exam-rules";
import {
  formatSelectedDocumentsForPrompt,
  getDocumentById,
} from "@/data/knowledge-base";
import { outputLabels } from "@/data/generation-options";
import { buildDraftPlainText } from "@/lib/format-draft-content";
import { getRelevantRules } from "@/lib/rule-matching";

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

  const relevantRules = getRelevantRules(
    request.issueIds,
    request.options
  );

  const rulesBlock = relevantRules
    .map(
      (rule) =>
        `- [${rule.id}] ${rule.title} (${rule.category})
  점검 질문: ${rule.checkQuestion}
  충족 패턴: ${rule.goodPattern}
  미충족 패턴: ${rule.weakPattern}`
    )
    .join("\n\n");

  const allRuleIds = examRules.map((r) => r.id).join(", ");

  const draftText = buildDraftPlainText(request.draft);

  return `당신은 한국 형사법 출제 초안을 검토하는 전문 검토자입니다.
교수 검수 전 1차 출제 초안을 분석하여, 명시된 출제 원칙에 따라 보완 지점을 구조화하세요.

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

## 적용 출제 원칙 (이 목록의 ruleId만 사용)
${rulesBlock}

등록된 전체 원칙 ID: ${allRuleIds}

## 검토 지침
1. 위 출제 원칙을 기준으로 초안을 점검하세요. 원칙 ID를 임의로 만들지 마세요.
2. 각 finding에 appliedRules 1~3개를 첨부하세요. ruleId는 반드시 위 목록에서만 선택하세요.
3. appliedRules.status는 satisfied(충족), partial(부분 충족), violated(미충족) 중 하나입니다.
4. appliedRules마다 explanation과 함께 아래 검토 논리 필드를 작성하세요 (간결한 교수 검토 문체, 내부 추론·chain-of-thought 금지):
   - diagnosticQuestion: 점검 질문
   - draftDiagnosis: 현재 초안 진단
   - violationReason: 원칙 미충족·부분 충족 사유
   - revisionGuidance: 수정 방향
   - satisfactionTarget: 원칙 충족 방안
   - expectedImprovement: 기대 효과
5. 선택 문서·쟁점·초안 내용과 원칙을 연결하세요.
6. 허위 판례 인용·원문 인용 허위 생성을 금지합니다.
7. 카테고리: 사실관계, 쟁점, 난이도, 채점기준, 출제의도, 구성
8. severity: low | medium | high
9. 4~6개의 findings를 제시하세요.

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
      "reasoningBasis": "출제 원칙·쟁점에 기반한 판단 근거",
      "recommendedReason": "이 조치를 권하는 이유",
      "expectedEffect": "반영 시 기대되는 출제·평가 효과",
      "severity": "medium",
      "appliedRules": [
        {
          "ruleId": "CRIM-FACT-001",
          "status": "violated",
          "explanation": "원칙 점검 결과에 대한 간결한 검토 근거",
          "diagnosticQuestion": "점검 질문",
          "draftDiagnosis": "현재 초안 진단",
          "violationReason": "미충족·부분 충족 사유",
          "revisionGuidance": "수정 방향",
          "satisfactionTarget": "원칙 충족 방안",
          "expectedImprovement": "기대 효과"
        }
      ]
    }
  ]
}`;
}
