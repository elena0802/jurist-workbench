import type { GenerationRequest } from "@/types";
import { legalIssues } from "@/data/legal-issues";
import { formatSelectedDocumentsForPrompt } from "@/data/knowledge-base";
import { formatReferenceSourcesForPrompt } from "@/lib/reference-sources";
import { outputLabels } from "@/data/generation-options";

function difficultyGuidance(difficulty: GenerationRequest["options"]["difficulty"]) {
  switch (difficulty) {
    case "학부":
      return "사실관계는 비교적 명료하게, 선택 쟁점 2~3개 중심. 논점 간 충돌은 드러나되 과도한 복선은 피함.";
    case "로스쿨":
      return "사실관계에 복선과 시간순 전개를 포함. 선택 쟁점 전부가 자연스럽게 연결되도록 구성.";
    case "변호사시험 수준":
      return "다층적 사실관계, 인과관계·시점·당사자 인식의 불일치를 포함. 쟁점 간 경합·흡수·착오 전이 등 고난도 구조 허용.";
  }
}

function purposeGuidance(purpose: GenerationRequest["options"]["purpose"]) {
  switch (purpose) {
    case "수업":
      return "수업 토론용: 사실관계 후 질문 형식을 병행 가능. 학습 목표가 분명히 드러나게.";
    case "모의시험":
      return "모의시험용: 실제 시험 문항 형식(사실관계 기술 → 문제 지시)을 따름.";
    case "세미나":
      return "세미나용: 학설 대립이 드러날 여지를 사실관계에 심되, 정답을 단정하지 않음.";
  }
}

export function buildGenerationPrompt(request: GenerationRequest): string {
  const selectedIssues = legalIssues.filter((issue) =>
    request.issueIds.includes(issue.id)
  );

  const issueNames = selectedIssues.map((issue) => issue.name);
  const issueOutline = selectedIssues
    .map(
      (issue, index) =>
        `${index + 1}. ${issue.name} (${issue.category}) — ${issue.description}`
    )
    .join("\n");

  const documentBlock =
    formatReferenceSourcesForPrompt(request.referenceSourceIds ?? []) ||
    formatSelectedDocumentsForPrompt(request.documentIds ?? []);

  const referenceBlock =
    documentBlock || "(참고 자료 목록 없음 — 선택된 쟁점 중심으로 작성)";

  const enabledOutputs = (
    Object.entries(request.options.outputs) as Array<
      [keyof typeof outputLabels, boolean]
    >
  )
    .filter(([, enabled]) => enabled)
    .map(([key]) => outputLabels[key]);

  return `당신은 한국 형사법 교수의 출제를 보조하는 전문가입니다. 최종 시험문제가 아니라, 교수 검수를 전제로 한 「출제 초안」을 작성합니다.

## 문서 성격 (필수 고지)
- 본 출력은 확정된 시험문제가 아닙니다.
- 교수님 검수·수정·폐기가 전제된 초안(draft)입니다.
- 문서 어디에서도 "최종 시험문제", "정답 확정" 등의 표현을 사용하지 마세요.
- 법적 결론은 단정하지 말고, 검토가 필요한 지점을 열어 두세요.

## 지식 베이스 — 교수가 편람한 참고 자료
아래 문서·컬렉션을 출제 스타일과 쟁점 배치의 벤치마크로 명시적으로 반영하세요. 문제 서두 또는 출제의도에서 어떤 자료를 참고했는지 언급하세요.

${referenceBlock}

## 평가 쟁점 설계 — 교수가 선택한 쟁점 (문항 구조의 뼈대)
선택된 쟁점: ${issueNames.join(", ")}

쟁점별 설계 메모:
${issueOutline}

※ 사례형 문제·쟁점 구조·채점기준은 반드시 위 쟁점 순서를 골격으로 하세요.
※ 각 쟁점이 사실관계에서 어떻게 충돌·경합하는지 구체적으로 드러내세요.

## 출제 조건
- 용도: ${request.options.purpose} — ${purposeGuidance(request.options.purpose)}
- 난이도: ${request.options.difficulty} — ${difficultyGuidance(request.options.difficulty)}
- 포함 항목: ${enabledOutputs.join(", ")}

## 작성 원칙
1. 한국어, 형사법 교수·출제위원이 읽는 학술적 문체.
2. 사실관계는 허구이되 현실적·구체적으로 (인물은 갑·을·A사 등 가명, 실존 사건명·판례 번호 인용 금지).
3. 허위 판례 인용·조문 번호 날조 금지. 일반적 법리 서술은 가능하나 "대법원 ○○년 ○○" 식 가짜 인용 금지.
4. 학생이 쟁점을 발견할 수 있도록 사실 속에 논점의 단서를 배치.
5. 최종 유·무죄·성립 여부를 단정하지 말 것 — 교수 검수 후 확정.
6. 선택 쟁점이 서로 논리적으로 연결되는지 스스로 점검하고, 교수 검수 메모에 기록.

## 섹션별 상세 지침

### caseProblem (사례형 문제 초안)
- 분량: 한국어 기준 1,200자 이상 (가능하면 1,500~2,000자).
- 구성: (가) 사실관계 기술 — 시간순·인물 관계·핵심 행위 명확히 (나) 문제 지시 — 선택 쟁점별로 논술·검토 요청.
- 사실관계에 각 쟁점의 충돌 요소가 드러나게 (예: 방위상황 인식 차이, 착오의 경합, 공범의 역할 분담 등).
- 참고 자료에서 차용한 출제 스타일이 느껴지게.

### examIntent (출제의도)
- 평가 목표, 의도적 함정·변별력 포인트.
- 어떤 참고 자료(컬렉션·문서)의 어떤 측면을 반영했는지 구체적으로.
- 각 선택 쟁점이 왜 이 사례에 배치되었는지.

### issueStructure (쟁점 구조)
- 선택 쟁점 각각에 대해: (1) 쟁점명 (2) 검토 순서 (3) 하위 질문 (4) 전제 사실 (5) 인접 쟁점과의 관계.
- 트리 또는 번호 목록 형식.

### gradingCriteria (채점기준)
- 선택 쟁점마다 반드시 다음 항목을 포함:
  · 쟁점 항목 (issue item)
  · 핵심 판단 포인트 (key reasoning point)
  · 흔한 학생 오류 (common student mistake)
  · 배점 제안 (suggested score range, 예: 10~15점 / 총 100점 기준)
- 표 형식 또는 일관된 목록 형식 권장.

### professorReviewMemo (교수 검수 메모 · 검수 포인트)
다음 소제목을 반드시 포함:
1. **사실관계 조정 검토** — 수정·보완이 필요할 수 있는 사실
2. **쟁점별 성숙도** — 미발달·과잉 쟁점 지적
3. **난이도 조절** — 상향·하향 조정 방안
4. **쟁점 간 정합성** — 선택 쟁점의 연결성·중복·누락 검토
5. **초안의 약점과 개선안** — 출제 초안으로서 보완할 점

## 출력 형식
반드시 아래 JSON 키만 사용. 선택되지 않은 항목은 빈 문자열("")로 두세요. 모든 값은 문자열(string)이어야 합니다.

{
  "caseProblem": "",
  "examIntent": "",
  "issueStructure": "",
  "gradingCriteria": "",
  "professorReviewMemo": ""
}`;
}
