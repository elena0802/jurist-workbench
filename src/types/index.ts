export type CollectionSource = "PUBLIC" | "PROFESSOR" | "PRIVATE";

export type CollectionGroup = "PUBLIC COLLECTIONS" | "PROFESSOR COLLECTIONS";

export type DocumentMaterialType =
  | "필기"
  | "강의"
  | "초안"
  | "아카이브"
  | "연구";

export type DocumentSourceType =
  | "시험분석"
  | "시험출제"
  | "강의노트"
  | "연구메모"
  | "판례정리"
  | "출제메모"
  | "채점기준"
  | "사례은행";

export interface KnowledgeDocument {
  id: string;
  title: string;
  year?: number;
  pageCount: number;
  materialType: DocumentMaterialType;
  sourceType: DocumentSourceType;
  /** Legacy estimate for context sizing; typically pageCount × ~500 */
  tokenEstimate: number;
}

export interface KnowledgeCollection {
  id: string;
  title: string;
  description: string;
  source: CollectionSource;
  group: CollectionGroup;
  lastModified: string;
  accumulatedSince?: number;
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

export type ReviewChecklistId =
  | "strengthen-facts"
  | "strengthen-issue-links"
  | "raise-difficulty"
  | "lower-difficulty"
  | "detail-grading"
  | "supplement-intent"
  | "remove-issues"
  | "adjust-length";

export type SuggestionDecision = "accept" | "ignore" | "pending";

export interface ReviewSuggestion {
  id: string;
  text: string;
  decision: SuggestionDecision;
}

export type WorkflowPhase =
  | "idle"
  | "draft-v1-complete"
  | "review-pending"
  | "revising"
  | "revised-complete";

export interface RevisionRequest {
  originalDraft: GenerationResult;
  assetIds: string[];
  documentIds?: string[];
  issueIds: string[];
  options: GenerationOptions;
  checklistItems: ReviewChecklistId[];
  acceptedSuggestions: string[];
  professorInstruction: string;
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
