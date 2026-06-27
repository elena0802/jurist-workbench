import type { ReviewFindingCategory } from "@/types";

export interface ExamRule {
  id: string;
  title: string;
  category: ReviewFindingCategory;
  issueTags: string[];
  description: string;
  checkQuestion: string;
  goodPattern: string;
  weakPattern: string;
  sourceNote: string;
  revisionStrategy?: string;
}

export const examRules: ExamRule[] = [
  {
    id: "CRIM-FACT-001",
    title: "쟁점은 사실관계 속에서 단계적으로 드러나야 한다",
    category: "사실관계",
    issueTags: ["정당방위", "오상방위", "구성요건적 착오", "금지착오"],
    description:
      "사례형 문제는 쟁점명을 직접 드러내기보다 학생이 사실관계 분석을 통해 쟁점에 도달하도록 설계되어야 한다.",
    checkQuestion:
      "선택한 쟁점이 문제 본문에서 너무 직접적으로 드러나지는 않는가?",
    goodPattern:
      "피고인의 인식, 객관적 상황, 사후 정황이 순차적으로 제시되어 학생이 쟁점을 구성하게 한다.",
    weakPattern:
      "문제 본문에서 오인, 방위, 착오가 지나치게 명시되어 판단 과정이 단순해진다.",
    sourceNote: "원로 교수 검수 원칙으로 축적 예정",
    revisionStrategy:
      "초반에는 객관적 방위상황을 제시하고, 중반 이후 인식 착오 단서를 드러내 쟁점이 단계적으로 열리게 합니다.",
  },
  {
    id: "CRIM-ISSUE-001",
    title: "선택 쟁점들은 한 사례 안에서 자연스럽게 연결되어야 한다",
    category: "쟁점",
    issueTags: ["정당방위", "과잉방위", "오상방위", "공동정범", "교사범"],
    description:
      "복수 쟁점은 동일 사실관계 위에서 전제·경합·후속 관계로 연결되어야 한다.",
    checkQuestion:
      "선택 쟁점들이 사실관계상 분절되지 않고 하나의 사건 흐름으로 이어지는가?",
    goodPattern:
      "앞 쟁점의 전제가 뒤 쟁점의 검토를 자연스럽게 이끌며, 쟁점 구조에 연결 관계가 명시된다.",
    weakPattern:
      "쟁점이 병렬 나열되어 사건의 논리적 흐름과 무관하게 붙어 있다.",
    sourceNote: "변호사시험 사례형 출제 관행",
  },
  {
    id: "CRIM-ISSUE-002",
    title: "핵심 쟁점과 부수 쟁점의 비중이 구분되어야 한다",
    category: "쟁점",
    issueTags: ["정당방위", "사기", "공동정범", "불능미수"],
    description:
      "평가의 중심이 되는 쟁점과 보조 쟁점이 사실관계·채점에서 구분되어야 한다.",
    checkQuestion:
      "핵심 쟁점이 사실관계와 배점에서 충분히 강조되는가?",
    goodPattern:
      "핵심 쟁점에 사실 단서와 배점이 집중되고 부수 쟁점은 보조적으로 배치된다.",
    weakPattern:
      "모든 쟁점이 동일 비중으로 나열되어 평가 초점이 흐려진다.",
    sourceNote: "로스쿨 모의시험 출제 가이드",
  },
  {
    id: "CRIM-FACT-002",
    title: "학생이 답안 구조를 세울 수 있도록 사실관계가 충분해야 한다",
    category: "사실관계",
    issueTags: ["사기", "횡령", "배임", "위법수집증거", "공동정범"],
    description:
      "사실관계는 쟁점별 검토 순서를 학생이 스스로 설계할 수 있을 만큼 구체적이어야 한다.",
    checkQuestion:
      "사실관계만으로 답안의 목차(쟁점 순서)를 구성할 수 있는가?",
    goodPattern:
      "시간 순서·행위 단계·당사자 관계가 분명하여 논증 구조를 세울 수 있다.",
    weakPattern:
      "사실이 추상적이거나 누락되어 학생이 임의로 사실을 보충해야 한다.",
    sourceNote: "사례형 출제 실무 원칙",
  },
  {
    id: "CRIM-DIFF-001",
    title: "정답이 너무 빨리 드러나면 평가력이 떨어진다",
    category: "난이도",
    issueTags: ["정당방위", "오상방위", "구성요건적 착오", "금지착오"],
    description:
      "사실관계가 법적 결론을 암시하면 변별력이 낮아지므로, 판단 여지를 남겨야 한다.",
    checkQuestion:
      "본문만 읽고도 법적 결론이 거의 확정되는가?",
    goodPattern:
      "객관적 정황과 주관적 인식 사이에 해석 여지가 남아 있다.",
    weakPattern:
      "결론을 유도하는 표현이 과도하여 논증 과정 평가가 어렵다.",
    sourceNote: "출제 난이도 조절 원칙",
  },
  {
    id: "CRIM-GRADE-001",
    title: "채점기준은 쟁점별 판단요소와 감점요소를 포함해야 한다",
    category: "채점기준",
    issueTags: [],
    description:
      "채점기준은 각 쟁점의 핵심 판단 포인트와 흔한 오답·감점 사유를 함께 제시해야 한다.",
    checkQuestion:
      "채점기준에 배점·핵심 판단·감점 요소가 쟁점별로 구분되어 있는가?",
    goodPattern:
      "쟁점별 배점, 필수 언급 요소, 감점·부분점 기준이 항목화되어 있다.",
    weakPattern:
      "총점만 제시되거나 오답 유형이 구체화되지 않았다.",
    sourceNote: "채점 실무·피드백 가이드",
  },
  {
    id: "CRIM-INTENT-001",
    title: "출제의도는 지식 확인이 아니라 사고 과정 평가를 설명해야 한다",
    category: "출제의도",
    issueTags: [],
    description:
      "출제의도는 암기가 아닌 사실 적용·쟁점 분석·논증 과정을 평가한다는 점을 밝혀야 한다.",
    checkQuestion:
      "출제의도가 사고 과정·변별력 평가를 명시하는가?",
    goodPattern:
      "평가 목표, 기대 답안 구조, 변별 포인트가 서술되어 있다.",
    weakPattern:
      "지식 나열·조문 인용 수준의 평가 목표만 기술되어 있다.",
    sourceNote: "교수 검수 체크리스트",
  },
  {
    id: "CRIM-DIFF-002",
    title: "난이도는 사실관계 복잡도와 쟁점 결합 방식으로 조절되어야 한다",
    category: "난이도",
    issueTags: ["정당방위", "오상방위", "불능미수", "중지미수"],
    description:
      "난이도는 단순 사실 개수가 아니라 쟁점 결합·인식 차이·시점 문제로 조절한다.",
    checkQuestion:
      "설정 난이도와 사실관계 밀도·쟁점 결합 수준이 일치하는가?",
    goodPattern:
      "목표 난이도에 맞는 인식 차이·경합·미수·공범 구조가 설계되어 있다.",
    weakPattern:
      "난이도 대비 사실이 과도하거나 쟁점이 단순 나열되어 있다.",
    sourceNote: "용도·난이도 매칭 원칙",
  },
  {
    id: "CRIM-ISSUE-003",
    title: "선택한 쟁점 중 하나라도 문제 본문에 실질적으로 반영되어야 한다",
    category: "쟁점",
    issueTags: [
      "정당방위",
      "사기",
      "불능미수",
      "공동정범",
      "위법수집증거",
      "횡령",
    ],
    description:
      "선택 쟁점이 초안 본문·쟁점 구조·채점기준 중 어디에든 실질 반영되어야 한다.",
    checkQuestion:
      "선택 쟁점이 초안에서 누락되거나 이름만 언급되고 있지는 않은가?",
    goodPattern:
      "각 선택 쟁점에 대응하는 사실 단서·논점·배점이 존재한다.",
    weakPattern:
      "선택 쟁점 중 일부가 구조상 빠져 있거나 형식적으로만 언급된다.",
    sourceNote: "쟁점 설계 정합성 원칙",
  },
  {
    id: "CRIM-FACT-003",
    title: "오상방위·정당방위 유형은 피고인의 인식과 객관적 상황을 분리해 제시해야 한다",
    category: "사실관계",
    issueTags: ["정당방위", "오상방위", "과잉방위"],
    description:
      "방위 관련 쟁점은 주관적 인식 사실과 객관적 방위상황을 분리하여 서술해야 한다.",
    checkQuestion:
      "피고인의 인식과 객관적 정황이 구분되어 제시되는가?",
    goodPattern:
      "객관적 사정과 피고인의 인식·착오가 별도 단락·시점으로 드러난다.",
    weakPattern:
      "인식과 객관 정황이 혼재되어 오상방위·정당방위 구별이 어렵다.",
    sourceNote: "위법성 쟁점 출제 관행",
  },
  {
    id: "CRIM-ATTEMPT-001",
    title: "미수 유형은 실행착수와 결과발생 가능성이 드러나야 한다",
    category: "사실관계",
    issueTags: ["불능미수", "중지미수"],
    description:
      "미수 쟁점은 실행의 착수 시점과 결과 발생 가능성·중지 경위가 사실관계에 포함되어야 한다.",
    checkQuestion:
      "실행착수와 결과 발생 가능성(또는 중지 사유)이 사실관계에 드러나는가?",
    goodPattern:
      "범행 진행 단계, 장애 요인, 자의적 중지 여부가 시간 순으로 제시된다.",
    weakPattern:
      "미수 성립 여부를 판단할 사실 단서가 부족하다.",
    sourceNote: "미수범 출제 원칙",
  },
  {
    id: "CRIM-ACCOM-001",
    title: "공범 유형은 행위분담과 의사연락을 사실관계로 보여야 한다",
    category: "사실관계",
    issueTags: ["공동정범", "교사범", "방조범"],
    description:
      "공범 쟁점은 공동의 의사, 역할 분담, 기여 행위가 사실관계로 드러나야 한다.",
    checkQuestion:
      "행위자별 역할·의사연락·기여 행위가 사실관계에 제시되는가?",
    goodPattern:
      "각 참여자의 행위·의사 표현·시점이 구분되어 공범 유형 검토가 가능하다.",
    weakPattern:
      "공범 관계가 추상적으로만 언급되고 행위 분담이 불명확하다.",
    sourceNote: "공범론 출제 가이드",
  },
  {
    id: "CRIM-PROP-001",
    title: "재산범죄 유형은 처분행위, 손해, 신임관계 등 구성요소가 분리되어야 한다",
    category: "사실관계",
    issueTags: ["사기", "횡령", "배임"],
    description:
      "재산범 쟁점은 기망·처분·손해·영득의사·신임관계 등 요소가 사실관계에서 구분되어야 한다.",
    checkQuestion:
      "재산범 구성요소별 사실 단서가 분리되어 제시되는가?",
    goodPattern:
      "당사자 관계, 재물 경위, 처분 행위, 손해 발생이 단계별로 서술된다.",
    weakPattern:
      "구성요소가 혼재되어 사기·횡령·배임 구별이 어렵다.",
    sourceNote: "재산범 출제 실무",
  },
  {
    id: "CRIM-EVID-001",
    title: "증거법 쟁점은 수집 경위와 절차 위반 가능성이 사실관계에 포함되어야 한다",
    category: "사실관계",
    issueTags: ["위법수집증거"],
    description:
      "증거능력 쟁점은 증거 수집 경위·절차·위법성 논점이 사실관계에 반영되어야 한다.",
    checkQuestion:
      "증거 수집·보존 경위와 절차적 쟁점이 사실관계에 포함되는가?",
    goodPattern:
      "수사 단계, 수집 주체, 절차 준수 여부가 사실로 제시된다.",
    weakPattern:
      "증거능력 쟁점만 언급되고 수집 경위 사실이 없다.",
    sourceNote: "형사증거법 출제 원칙",
  },
  {
    id: "CRIM-STRUCT-001",
    title: "사례 본문·지시문·문항 구성이 명확히 구분되어야 한다",
    category: "구성",
    issueTags: [],
    description:
      "사례형 본문, 문제 지시, 문항 번호가 일관된 체계로 구분되어야 한다.",
    checkQuestion:
      "(가)(나) 구분·호 번호·지시문이 일관되게 정리되어 있는가?",
    goodPattern:
      "본문·지시·문항이 시각·구조적으로 분리되어 응시·채점이 용이하다.",
    weakPattern:
      "본문과 문항·지시가 혼재되어 답안 구조가 불명확하다.",
    sourceNote: "사례형 형식 원칙",
  },
  {
    id: "CRIM-INTENT-002",
    title: "출제의도는 선택 참고 자료·쟁점과의 연결을 밝혀야 한다",
    category: "출제의도",
    issueTags: [],
    description:
      "출제의도는 왜 해당 자료·쟁점을 선택했는지 평가 목표와 연결하여 설명해야 한다.",
    checkQuestion:
      "출제의도에 참고 자료·선택 쟁점 반영 근거가 드러나는가?",
    goodPattern:
      "자료·쟁점 선택 이유와 기대 평가 효과가 출제의도에 명시된다.",
    weakPattern:
      "출제의도가 일반론 수준에 머물러 설계 근거가 불분명하다.",
    sourceNote: "교수 검수·출제 메모 관행",
  },
];

export function getExamRuleById(id: string): ExamRule | undefined {
  return examRules.find((rule) => rule.id === id);
}
