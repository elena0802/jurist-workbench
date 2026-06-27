import type { KnowledgeCollection } from "@/types";

export const knowledgeCollections: KnowledgeCollection[] = [
  {
    id: "col-bar-exam",
    title: "변호사시험 사례형",
    description:
      "변호사시험 형법·형사소송법 사례형 공개문제 및 모범답안 아카이브",
    source: "PUBLIC",
    group: "PUBLIC COLLECTIONS",
    documents: [
      { id: "doc-be-2023-1", title: "2023년 제1회 형법 사례형", tokenEstimate: 2400 },
      { id: "doc-be-2022-2", title: "2022년 제2회 형법 사례형", tokenEstimate: 2200 },
      { id: "doc-be-2021-1", title: "2021년 제1회 형법 사례형", tokenEstimate: 2100 },
      { id: "doc-be-sample", title: "사례형 문항 구성 가이드", tokenEstimate: 800 },
    ],
  },
  {
    id: "col-judicial-exam",
    title: "사법시험 사례형",
    description: "사법시험 형사법 사례형 출제자료 및 해설 아카이브",
    source: "PUBLIC",
    group: "PUBLIC COLLECTIONS",
    documents: [
      { id: "doc-je-1998", title: "1998년 사법시험 형법 사례형", tokenEstimate: 1800 },
      { id: "doc-je-1995", title: "1995년 사법시험 형법 사례형", tokenEstimate: 1600 },
      { id: "doc-je-1992", title: "1992년 사법시험 형법 사례형", tokenEstimate: 1500 },
      { id: "doc-je-notes", title: "사법시험 출제 경향 분석 노트", tokenEstimate: 1200 },
    ],
  },
  {
    id: "col-precedents",
    title: "주요 판례",
    description: "형사법 핵심 대법원 판례 요약 및 쟁점 정리",
    source: "PUBLIC",
    group: "PUBLIC COLLECTIONS",
    documents: [
      { id: "doc-prec-self-defense", title: "정당방위 관련 주요 판례", tokenEstimate: 3200 },
      { id: "doc-prec-mistake", title: "착오범 관련 주요 판례", tokenEstimate: 2800 },
      { id: "doc-prec-complicity", title: "공범론 관련 주요 판례", tokenEstimate: 2600 },
      { id: "doc-prec-evidence", title: "증거법칙 관련 주요 판례", tokenEstimate: 2400 },
    ],
  },
  {
    id: "col-papers",
    title: "대표 논문",
    description: "교수 연구실 보유 핵심 논문 및 학설 정리 자료",
    source: "PROFESSOR",
    group: "PROFESSOR COLLECTIONS",
    documents: [
      { id: "doc-paper-self-defense", title: "정당방위 연구", tokenEstimate: 4500 },
      { id: "doc-paper-putative", title: "오상방위 연구", tokenEstimate: 4200 },
      { id: "doc-paper-breach", title: "배임죄 연구", tokenEstimate: 3800 },
      { id: "doc-paper-necessity", title: "긴급피난 연구", tokenEstimate: 3600 },
    ],
  },
  {
    id: "col-lecture-notes",
    title: "강의노트",
    description: "형법 총론·각론 강의노트 및 판례 인용 정리",
    source: "PROFESSOR",
    group: "PROFESSOR COLLECTIONS",
    documents: [
      { id: "doc-lecture-general", title: "형법 총론 강의노트", tokenEstimate: 5200 },
      { id: "doc-lecture-elements", title: "구성요건론 강의노트", tokenEstimate: 4800 },
      { id: "doc-lecture-unlawful", title: "위법성론 강의노트", tokenEstimate: 4600 },
      { id: "doc-lecture-property", title: "재산범 각론 강의노트", tokenEstimate: 4400 },
    ],
  },
  {
    id: "col-mock-exams",
    title: "과거 모의시험",
    description: "연도별 모의시험 사례형 문항 및 채점기준",
    source: "PROFESSOR",
    group: "PROFESSOR COLLECTIONS",
    documents: [
      { id: "doc-mock-2024", title: "2024학년도 1학기 모의시험", tokenEstimate: 2000 },
      { id: "doc-mock-2023", title: "2023학년도 2학기 모의시험", tokenEstimate: 1900 },
      { id: "doc-mock-2023-mid", title: "2023학년도 중간고사", tokenEstimate: 1500 },
      { id: "doc-mock-grading", title: "모의시험 채점기준 샘플", tokenEstimate: 900 },
    ],
  },
  {
    id: "col-private",
    title: "비공개 출제자료",
    description: "미공개 출제 초안 및 내부 검토용 자료",
    source: "PRIVATE",
    group: "PROFESSOR COLLECTIONS",
    documents: [
      { id: "doc-private-draft-a", title: "2025 출제 초안 A", tokenEstimate: 1800 },
      { id: "doc-private-draft-b", title: "2025 출제 초안 B", tokenEstimate: 1700 },
      { id: "doc-private-review", title: "출제위원회 검토 메모", tokenEstimate: 1100 },
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

export function mapDocumentsToLegacyAssetIds(documentIds: string[]): string[] {
  const collectionToAsset: Record<string, string> = {
    "col-bar-exam": "asset-1",
    "col-judicial-exam": "asset-2",
    "col-precedents": "asset-2",
    "col-papers": "asset-3",
    "col-lecture-notes": "asset-4",
    "col-mock-exams": "asset-1",
    "col-private": "asset-2",
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
          `- 「${document.title}」: ${collection.title} 소속 참고자료. 출제 양식·쟁점 전개·논점 배치의 벤치마크로 활용.`
      ),
      ""
    );
  }

  return lines.join("\n").trim();
}
