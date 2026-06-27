import type { KnowledgeCollection } from "@/types";

export const knowledgeCollections: KnowledgeCollection[] = [
  {
    id: "col-bar-exam",
    title: "변호사시험 사례형 아카이브",
    description:
      "1990년대 이후 변호사시험 형법 사례형을 수집·해부한 자료. 출제 패턴과 쟁점 배치의 기준점.",
    source: "PUBLIC",
    group: "PUBLIC COLLECTIONS",
    lastModified: "2024.09",
    accumulatedSince: 1995,
    documents: [
      {
        id: "doc-be-2008",
        title: "2008년 변호사시험 사례형 분석",
        year: 2008,
        pageCount: 18,
        materialType: "아카이브",
        sourceType: "시험분석",
        tokenEstimate: 9000,
      },
      {
        id: "doc-be-2015",
        title: "2015년 제1회 형법 사례형 해설",
        year: 2015,
        pageCount: 14,
        materialType: "아카이브",
        sourceType: "시험분석",
        tokenEstimate: 7000,
      },
      {
        id: "doc-be-2019",
        title: "2019년 변호사시험 형법 쟁점 맵",
        year: 2019,
        pageCount: 11,
        materialType: "아카이브",
        sourceType: "시험분석",
        tokenEstimate: 5500,
      },
      {
        id: "doc-be-notes",
        title: "사례형 문항 구성 수업 필기",
        year: 2011,
        pageCount: 8,
        materialType: "필기",
        sourceType: "시험분석",
        tokenEstimate: 4000,
      },
    ],
  },
  {
    id: "col-judicial-exam",
    title: "사법시험 출제 아카이브",
    description:
      "사법시험 시대의 형사법 출제안·기출 정리. 고전 사례형의 사실 전개와 쟁점 설계를 참고.",
    source: "PUBLIC",
    group: "PUBLIC COLLECTIONS",
    lastModified: "2023.04",
    accumulatedSince: 1987,
    documents: [
      {
        id: "doc-je-1997",
        title: "사법시험 출제안 (1997)",
        year: 1997,
        pageCount: 12,
        materialType: "아카이브",
        sourceType: "시험출제",
        tokenEstimate: 6000,
      },
      {
        id: "doc-je-1998",
        title: "1998년 사법시험 형법 사례형",
        year: 1998,
        pageCount: 10,
        materialType: "아카이브",
        sourceType: "시험출제",
        tokenEstimate: 5000,
      },
      {
        id: "doc-je-1992",
        title: "1992년 사법시험 형법 사례형",
        year: 1992,
        pageCount: 9,
        materialType: "아카이브",
        sourceType: "시험출제",
        tokenEstimate: 4500,
      },
      {
        id: "doc-je-trend",
        title: "사법시험 출제 경향 필기 (1990s)",
        year: 1996,
        pageCount: 16,
        materialType: "필기",
        sourceType: "시험분석",
        tokenEstimate: 8000,
      },
    ],
  },
  {
    id: "col-precedents",
    title: "판례·변천 정리",
    description:
      "대법원 판례의 변천 과정을 시기별로 정리한 연구 보조 자료. 수업·출제 시 판례 인용의 기초.",
    source: "PUBLIC",
    group: "PUBLIC COLLECTIONS",
    lastModified: "2025.01",
    accumulatedSince: 2003,
    documents: [
      {
        id: "doc-prec-evolution",
        title: "판례변천 정리",
        year: 2020,
        pageCount: 34,
        materialType: "연구",
        sourceType: "판례정리",
        tokenEstimate: 17000,
      },
      {
        id: "doc-prec-self-defense",
        title: "정당방위 판례 연표",
        year: 2018,
        pageCount: 22,
        materialType: "아카이브",
        sourceType: "판례정리",
        tokenEstimate: 11000,
      },
      {
        id: "doc-prec-mistake",
        title: "착오범 판례 비교표",
        year: 2016,
        pageCount: 19,
        materialType: "연구",
        sourceType: "판례정리",
        tokenEstimate: 9500,
      },
      {
        id: "doc-prec-evidence",
        title: "증거법칙 판례 요약",
        year: 2014,
        pageCount: 15,
        materialType: "아카이브",
        sourceType: "판례정리",
        tokenEstimate: 7500,
      },
    ],
  },
  {
    id: "col-research",
    title: "연구 메모·논문 정리",
    description:
      "형법 총론·위법성론 관련 연구 메모와 학설 정리. 세미나·출제 쟁점 설계의 이론적 배경.",
    source: "PROFESSOR",
    group: "PROFESSOR COLLECTIONS",
    lastModified: "2025.02",
    accumulatedSince: 2001,
    documents: [
      {
        id: "doc-research-putative",
        title: "오상방위 연구 메모",
        year: 2019,
        pageCount: 28,
        materialType: "연구",
        sourceType: "연구메모",
        tokenEstimate: 14000,
      },
      {
        id: "doc-research-self-defense",
        title: "정당방위 학설 정리",
        year: 2014,
        pageCount: 24,
        materialType: "연구",
        sourceType: "연구메모",
        tokenEstimate: 12000,
      },
      {
        id: "doc-research-excess",
        title: "과잉방위 판례 메모",
        year: 2012,
        pageCount: 14,
        materialType: "필기",
        sourceType: "연구메모",
        tokenEstimate: 7000,
      },
      {
        id: "doc-research-complicity",
        title: "공범론 연구 노트",
        year: 2008,
        pageCount: 20,
        materialType: "연구",
        sourceType: "연구메모",
        tokenEstimate: 10000,
      },
    ],
  },
  {
    id: "col-lecture-notes",
    title: "강의노트 보관함",
    description:
      "로스쿨·학부 강의에서 사용한 필기와 정리본. 매 학기 보완되어 온 장기 보관 자료.",
    source: "PROFESSOR",
    group: "PROFESSOR COLLECTIONS",
    lastModified: "2024.12",
    accumulatedSince: 1999,
    documents: [
      {
        id: "doc-lecture-self-defense",
        title: "형법총론 강의노트 (정당방위)",
        year: 2023,
        pageCount: 42,
        materialType: "강의",
        sourceType: "강의노트",
        tokenEstimate: 21000,
      },
      {
        id: "doc-lecture-unlawful",
        title: "위법성론 강의 정리",
        year: 2021,
        pageCount: 36,
        materialType: "강의",
        sourceType: "강의노트",
        tokenEstimate: 18000,
      },
      {
        id: "doc-lecture-elements",
        title: "구성요건론 수업 필기",
        year: 2017,
        pageCount: 31,
        materialType: "필기",
        sourceType: "강의노트",
        tokenEstimate: 15500,
      },
      {
        id: "doc-lecture-property",
        title: "재산범 각론 강의노트",
        year: 2015,
        pageCount: 27,
        materialType: "강의",
        sourceType: "강의노트",
        tokenEstimate: 13500,
      },
    ],
  },
  {
    id: "col-course-exams",
    title: "강좌 시험·채점 자료",
    description:
      "학기별 기말·모의시험 문항과 채점기준 초안. 실제 강의 평가에서 사용·수정된 자료.",
    source: "PROFESSOR",
    group: "PROFESSOR COLLECTIONS",
    lastModified: "2024.06",
    accumulatedSince: 2005,
    documents: [
      {
        id: "doc-course-2012",
        title: "2012년 형법 기말시험",
        year: 2012,
        pageCount: 6,
        materialType: "아카이브",
        sourceType: "시험출제",
        tokenEstimate: 3000,
      },
      {
        id: "doc-course-2018",
        title: "2018학년도 2학기 모의시험",
        year: 2018,
        pageCount: 8,
        materialType: "아카이브",
        sourceType: "시험출제",
        tokenEstimate: 4000,
      },
      {
        id: "doc-course-grading",
        title: "채점기준 초안",
        year: 2022,
        pageCount: 5,
        materialType: "초안",
        sourceType: "채점기준",
        tokenEstimate: 2500,
      },
      {
        id: "doc-course-2024",
        title: "2024학년도 중간고사 사례형",
        year: 2024,
        pageCount: 7,
        materialType: "초안",
        sourceType: "시험출제",
        tokenEstimate: 3500,
      },
    ],
  },
  {
    id: "col-private-drafts",
    title: "개인 출제 서랍",
    description:
      "연구실 비공개 보관. 미발표 출제 메모·사례은행·검토 중인 초안. 외부 반출 전제 아님.",
    source: "PRIVATE",
    group: "PROFESSOR COLLECTIONS",
    lastModified: "2025.03",
    accumulatedSince: 1994,
    documents: [
      {
        id: "doc-private-memo",
        title: "교수 개인 출제 메모",
        year: 2025,
        pageCount: 4,
        materialType: "필기",
        sourceType: "출제메모",
        tokenEstimate: 2000,
      },
      {
        id: "doc-private-bank-a",
        title: "사례은행 A",
        year: 2023,
        pageCount: 22,
        materialType: "초안",
        sourceType: "사례은행",
        tokenEstimate: 11000,
      },
      {
        id: "doc-private-bank-b",
        title: "사례은행 B",
        year: 2021,
        pageCount: 19,
        materialType: "초안",
        sourceType: "사례은행",
        tokenEstimate: 9500,
      },
      {
        id: "doc-private-review",
        title: "출제위원회 검토 메모 (미공개)",
        year: 2024,
        pageCount: 3,
        materialType: "필기",
        sourceType: "출제메모",
        tokenEstimate: 1500,
      },
      {
        id: "doc-private-draft",
        title: "2025 출제 초안 (작업 중)",
        year: 2025,
        pageCount: 9,
        materialType: "초안",
        sourceType: "출제메모",
        tokenEstimate: 4500,
      },
    ],
  },
];

export function getCollectionById(id: string) {
  return knowledgeCollections.find((c) => c.id === id);
}

export function getDocumentById(id: string) {
  for (const collection of knowledgeCollections) {
    const doc = collection.documents.find((d) => d.id === id);
    if (doc) return { document: doc, collection };
  }
  return null;
}

export function getCollectionsForDocuments(documentIds: string[]) {
  const collectionIds = new Set<string>();
  for (const docId of documentIds) {
    const found = getDocumentById(docId);
    if (found) collectionIds.add(found.collection.id);
  }
  return knowledgeCollections.filter((c) => collectionIds.has(c.id));
}

export function estimateCollectionPageCount(collection: KnowledgeCollection) {
  return collection.documents.reduce((sum, doc) => sum + doc.pageCount, 0);
}

export function formatCollectionVolume(collection: KnowledgeCollection) {
  const pages = estimateCollectionPageCount(collection);
  return `약 ${pages}쪽`;
}

export function mapDocumentsToLegacyAssetIds(documentIds: string[]): string[] {
  const collectionToAsset: Record<string, string> = {
    "col-bar-exam": "asset-1",
    "col-judicial-exam": "asset-2",
    "col-precedents": "asset-2",
    "col-research": "asset-3",
    "col-lecture-notes": "asset-4",
    "col-course-exams": "asset-1",
    "col-private-drafts": "asset-2",
  };

  const assetIds = new Set<string>();
  for (const docId of documentIds) {
    const found = getDocumentById(docId);
    if (found) {
      assetIds.add(collectionToAsset[found.collection.id] ?? "asset-1");
    }
  }
  return [...assetIds];
}

export function estimateContextTokens(documentIds: string[]) {
  return documentIds.reduce((sum, id) => {
    const found = getDocumentById(id);
    return sum + (found?.document.tokenEstimate ?? 0);
  }, 0);
}

export function estimateContextPages(documentIds: string[]) {
  return documentIds.reduce((sum, id) => {
    const found = getDocumentById(id);
    return sum + (found?.document.pageCount ?? 0);
  }, 0);
}

const sourceLabels: Record<KnowledgeCollection["source"], string> = {
  PUBLIC: "공개",
  PROFESSOR: "교수",
  PRIVATE: "비공개",
};

export function formatSelectedDocumentsForPrompt(documentIds: string[]) {
  if (documentIds.length === 0) return "";

  const lines: string[] = [];
  const collections = getCollectionsForDocuments(documentIds);

  for (const collection of collections) {
    const docs = documentIds
      .map((id) => getDocumentById(id))
      .filter(
        (entry): entry is NonNullable<typeof entry> =>
          entry !== null && entry.collection.id === collection.id
      );

    if (docs.length === 0) continue;

    lines.push(
      `### ${collection.title} [${sourceLabels[collection.source]}]`,
      collection.description,
      "",
      "편람 문서:",
      ...docs.map(
        ({ document }) =>
          `- 「${document.title}」(${document.year ?? "연도 미상"}, ${document.sourceType}, ${document.pageCount}쪽): ${collection.title} 소속 참고자료.`
      ),
      ""
    );
  }

  return lines.join("\n").trim();
}
