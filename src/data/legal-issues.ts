import type { LegalIssue } from "@/types";

export const legalIssues: LegalIssue[] = [
  { id: "issue-1", name: "정당방위", category: "위법성", description: "현재의 부당한 침해에 대한 방위행위의 성립 요건과 한계" },
  { id: "issue-2", name: "과잉방위", category: "위법성", description: "방위행위의 상당성 판단과 책임·위법성 조각의 경계" },
  { id: "issue-3", name: "오상방위", category: "위법성", description: "방위상황에 대한 착오와 위법성·책임의 처리" },
  { id: "issue-4", name: "긴급피난", category: "위법성", description: "현재의 위난을 피하기 위한 행위의 요건과 상당성" },
  { id: "issue-5", name: "구성요건적 착오", category: "책임", description: "구성요건 해당성에 대한 착오와 고의·과실의 판단" },
  { id: "issue-6", name: "금지착오", category: "책임", description: "행위의 위법성에 대한 착오와 법적 효과" },
  { id: "issue-7", name: "불능미수", category: "미수", description: "범죄의 실행에 착수했으나 결과 발생이 불가능한 경우" },
  { id: "issue-8", name: "중지미수", category: "미수", description: "자의로 또는 외부적 장애로 범행을 중지한 경우" },
  { id: "issue-9", name: "공동정범", category: "공범", description: "공동으로 범죄를 실현한 경우의 책임 구조" },
  { id: "issue-10", name: "교사범", category: "공범", description: "타인으로 하여금 범죄를 실행하게 한 경우" },
  { id: "issue-11", name: "방조범", category: "공범", description: "범죄의 실행을 방조한 경우의 성립 요건" },
  { id: "issue-12", name: "사기", category: "재산범", description: "기망행위·착오·처분행위·재산상 손해의 인과관계" },
  { id: "issue-13", name: "횡령", category: "재산범", description: "타인의 재물을 보관하는 자의 영득의사와 점유이전" },
  { id: "issue-14", name: "배임", category: "재산범", description: "임무에 위배한 행위로써 타인에게 재산상 손해를 가한 경우" },
  { id: "issue-15", name: "위법수집증거", category: "증거", description: "위법하게 수집된 증거의 증거능력과 한계" },
];
