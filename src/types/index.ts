export type CollectionSource = "PUBLIC" | "PROFESSOR" | "PRIVATE";

export type CollectionGroup = "PUBLIC COLLECTIONS" | "PROFESSOR COLLECTIONS";

export interface KnowledgeDocument {
  id: string;
  title: string;
  tokenEstimate: number;
}

export interface KnowledgeCollection {
  id: string;
  title: string;
  description: string;
  source: CollectionSource;
  group: CollectionGroup;
  documents: KnowledgeDocument[];
}

export type GenerationPurpose = "수업" | "모의시험" | "세미나";
export type GenerationDifficulty = "학부" | "로스쿨" | "변호사시험 수준";

export interface GenerationOptions {
  purpose: GenerationPurpose;
  difficulty: GenerationDifficulty;
  outputs: {
    caseProblem: boolean;
    examIntent: boolean;
    issueStructure: boolean;
    gradingCriteria: boolean;
    professorReviewMemo: boolean;
  };
}

export interface GenerationRequest {
  assetIds: string[];
  documentIds?: string[];
  issueIds: string[];
  options: GenerationOptions;
}

export interface GenerationResult {
  caseProblem: string;
  examIntent: string;
  issueStructure: string;
  gradingCriteria: string;
  professorReviewMemo: string;
}

export interface EducationalAsset {
  id: string;
  title: string;
  description: string;
  category: "시험자료" | "강의자료" | "논문요약";
  year?: string;
}

export interface LegalIssue {
  id: string;
  name: string;
  category: "위법성" | "책임" | "미수" | "공범" | "재산범" | "증거";
  description: string;
}
