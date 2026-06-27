export interface ReviewHistoryRecord {
  id: string;
  professorLabel: string;
  issueTags: string[];
  ruleId: string;
  importanceRate: number;
  repeatedFinding: string;
  occurrences: number;
  note: string;
}

export const reviewHistorySeed: ReviewHistoryRecord[] = [
  {
    id: "RH-001",
    professorLabel: "김○○ 교수",
    issueTags: ["정당방위", "오상방위"],
    ruleId: "CRIM-FACT-001",
    importanceRate: 87,
    repeatedFinding: "사실관계의 단계적 노출 부족",
    occurrences: 3,
    note: "유사 유형에서 정당방위와 오상방위의 변별을 위해 사실관계 보강을 반복적으로 지적함",
  },
  {
    id: "RH-002",
    professorLabel: "이○○ 교수",
    issueTags: ["정당방위", "과잉방위"],
    ruleId: "CRIM-ISSUE-001",
    importanceRate: 79,
    repeatedFinding: "위법성·책임 단계 전개의 불명확",
    occurrences: 2,
    note: "방위 관련 쟁점에서 판단 단계 구분을 명시하도록 요구한 사례가 반복됨",
  },
  {
    id: "RH-003",
    professorLabel: "박○○ 교수",
    issueTags: ["금지착오", "구성요건적 착오"],
    ruleId: "CRIM-ISSUE-002",
    importanceRate: 82,
    repeatedFinding: "착오 유형 구별을 위한 사실관계 단서 부족",
    occurrences: 4,
    note: "책임 단계 착오 문제에서 사실관계 단서 배치를 우선 보완하도록 지적함",
  },
  {
    id: "RH-004",
    professorLabel: "김○○ 교수",
    issueTags: ["공동정범", "교사범"],
    ruleId: "CRIM-ACCOM-001",
    importanceRate: 74,
    repeatedFinding: "공범 역할 분담의 사실관계 불명확",
    occurrences: 2,
    note: "공범 유형에서 각 참여자의 역할이 드러나도록 사실관계를 보강하도록 요청함",
  },
  {
    id: "RH-005",
    professorLabel: "이○○ 교수",
    issueTags: ["사기", "횡령"],
    ruleId: "CRIM-PROP-001",
    importanceRate: 76,
    repeatedFinding: "처분행위·영득의사 구별 단서 미흡",
    occurrences: 3,
    note: "재산범 유형에서 기망·처분·손해의 인과 흐름을 명확히 하도록 반복 지적함",
  },
  {
    id: "RH-006",
    professorLabel: "박○○ 교수",
    issueTags: ["불능미수", "중지미수"],
    ruleId: "CRIM-ATTEMPT-001",
    importanceRate: 71,
    repeatedFinding: "미수 유형 판별을 위한 실행 착수 시점 불명확",
    occurrences: 2,
    note: "미수 문제에서 실행에 착수한 시점과 중지 사유를 분리하여 서술하도록 요청함",
  },
  {
    id: "RH-007",
    professorLabel: "김○○ 교수",
    issueTags: ["긴급피난"],
    ruleId: "CRIM-FACT-002",
    importanceRate: 68,
    repeatedFinding: "피난 요건과 상당성 판단 자료 부족",
    occurrences: 2,
    note: "위법성 조각 문제에서 위난의 현재성과 상당성 판단 근거를 보강하도록 지적함",
  },
  {
    id: "RH-008",
    professorLabel: "이○○ 교수",
    issueTags: ["정당방위", "오상방위", "과잉방위"],
    ruleId: "CRIM-GRADE-001",
    importanceRate: 84,
    repeatedFinding: "채점기준과 쟁점 난이도의 불일치",
    occurrences: 3,
    note: "복합 방위 쟁점에서 배점과 기대 답안 수준이 맞지 않는다는 지적이 반복됨",
  },
  {
    id: "RH-009",
    professorLabel: "박○○ 교수",
    issueTags: ["위법수집증거"],
    ruleId: "CRIM-EVID-001",
    importanceRate: 73,
    repeatedFinding: "증거능력 쟁점 전제 사실관계 미비",
    occurrences: 2,
    note: "증거 문제에서 수집 경위와 증거능력 판단 전제를 분리하여 제시하도록 요청함",
  },
  {
    id: "RH-010",
    professorLabel: "김○○ 교수",
    issueTags: ["정당방위"],
    ruleId: "CRIM-INTENT-001",
    importanceRate: 70,
    repeatedFinding: "출제 의도와 평가 목표의 연결 미흡",
    occurrences: 2,
    note: "단일 쟁점 문제에서 출제 의도가 채점기준과 일치하지 않는다는 피드백이 있음",
  },
  {
    id: "RH-011",
    professorLabel: "이○○ 교수",
    issueTags: ["배임"],
    ruleId: "CRIM-FACT-003",
    importanceRate: 65,
    repeatedFinding: "임무 위배 행위의 구체적 경위 부족",
    occurrences: 2,
    note: "배임 유형에서 임무 내용과 위배 행위의 대응 관계를 명확히 하도록 지적함",
  },
  {
    id: "RH-012",
    professorLabel: "박○○ 교수",
    issueTags: ["방조범", "교사범"],
    ruleId: "CRIM-STRUCT-001",
    importanceRate: 72,
    repeatedFinding: "문항 구성상 쟁점 간 논리 연결 부족",
    occurrences: 2,
    note: "공범 문제에서 교사·방조의 구분을 위한 사실관계 배치를 보강하도록 반복 요청함",
  },
];

export const REVIEW_HISTORY_DISCLAIMER =
  "예시 검수 이력 데이터입니다. 실제 교수 검수 이력이 축적되면 이 영역이 자동으로 갱신됩니다.";
