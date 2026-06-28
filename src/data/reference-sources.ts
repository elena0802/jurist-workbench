export type ReferenceCategory =
  | "official-exam"
  | "precedent"
  | "professor-knowledge"
  | "future";

export interface ReferenceSource {
  id: string;
  label: string;
  category: ReferenceCategory;
  enabled: boolean;
  checkedByDefault: boolean;
  disabled?: boolean;
  note?: string;
}

export const referenceCategoryLabels: Record<ReferenceCategory, string> = {
  "official-exam": "공식 시험 문항",
  precedent: "판례",
  "professor-knowledge": "교수 지식",
  future: "추후 구축 예정",
};

export const referenceSources: ReferenceSource[] = [
  {
    id: "ref-bar-exam",
    label: "제1회(2012년)~제15회(2026년) 변호사시험",
    category: "official-exam",
    enabled: true,
    checkedByDefault: true,
  },
  {
    id: "ref-judicial-crim",
    label: "제32회(1990년)~제59회(2017년) 사법시험 형법",
    category: "official-exam",
    enabled: true,
    checkedByDefault: true,
  },
  {
    id: "ref-admin-crim",
    label: "2009년~2021년 행정고등고시 형법",
    category: "official-exam",
    enabled: true,
    checkedByDefault: true,
  },
  {
    id: "ref-legislative-crim",
    label: "2012년~2021년 입법고시 형법",
    category: "official-exam",
    enabled: true,
    checkedByDefault: true,
  },
  {
    id: "ref-court-admin-crim",
    label: "2012년~2021년 법원행정고등고시 형법",
    category: "official-exam",
    enabled: true,
    checkedByDefault: true,
  },
  {
    id: "ref-judicial-crim-proc",
    label: "2001년~2017년 사법시험 형사소송법",
    category: "official-exam",
    enabled: true,
    checkedByDefault: true,
  },
  {
    id: "ref-admin-crim-proc",
    label: "2009년~2021년 행정고등고시 형사소송법",
    category: "official-exam",
    enabled: true,
    checkedByDefault: true,
  },
  {
    id: "ref-legislative-crim-proc",
    label: "2012년~2021년 입법고시 형사소송법",
    category: "official-exam",
    enabled: true,
    checkedByDefault: true,
  },
  {
    id: "ref-court-admin-crim-proc",
    label: "2012년~2021년 법원행정고등고시 형사소송법",
    category: "official-exam",
    enabled: true,
    checkedByDefault: true,
  },
  {
    id: "ref-precedent-major",
    label: "형법 주요 판례",
    category: "precedent",
    enabled: true,
    checkedByDefault: true,
  },
  {
    id: "ref-precedent-recent",
    label: "최신 대법원 판례",
    category: "precedent",
    enabled: true,
    checkedByDefault: true,
  },
  {
    id: "ref-prof-review-history",
    label: "교수 검토 이력",
    category: "professor-knowledge",
    enabled: true,
    checkedByDefault: true,
  },
  {
    id: "ref-exam-principles",
    label: "출제 원칙",
    category: "professor-knowledge",
    enabled: true,
    checkedByDefault: true,
  },
  {
    id: "ref-model-answers",
    label: "모범답안",
    category: "future",
    enabled: false,
    checkedByDefault: true,
    disabled: true,
    note: "준비 중",
  },
  {
    id: "ref-grading-standards",
    label: "채점기준",
    category: "future",
    enabled: false,
    checkedByDefault: true,
    disabled: true,
    note: "준비 중",
  },
  {
    id: "ref-papers",
    label: "논문",
    category: "future",
    enabled: false,
    checkedByDefault: true,
    disabled: true,
    note: "준비 중",
  },
  {
    id: "ref-professor-memos",
    label: "교수 메모",
    category: "future",
    enabled: false,
    checkedByDefault: true,
    disabled: true,
    note: "준비 중",
  },
];

export const referenceCategoryOrder: ReferenceCategory[] = [
  "official-exam",
  "precedent",
  "professor-knowledge",
  "future",
];
