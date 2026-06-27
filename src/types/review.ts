import type {
  GenerationOptions,
  GenerationResult,
  ReviewChecklistId,
} from "@/types";

export type ReviewFindingCategory =
  | "사실관계"
  | "쟁점"
  | "난이도"
  | "채점기준"
  | "출제의도"
  | "구성";

export type FindingDecision = "accept" | "ignore";

export interface ReviewFinding {
  id: string;
  category: ReviewFindingCategory;
  finding: string;
  suggestedAction: string;
  decision: FindingDecision;
}

export interface ReviewRequest {
  draft: GenerationResult;
  assetIds: string[];
  documentIds?: string[];
  issueIds: string[];
  options: GenerationOptions;
}

export interface RevisionSummary {
  applied: string[];
  preserved: string[];
  professorInstructionApplied: boolean;
  professorInstructionNote: string;
  difficultyChange: string;
  issueStructureChange: string;
}

export interface RevisionRequest {
  originalDraft: GenerationResult;
  assetIds: string[];
  documentIds?: string[];
  issueIds: string[];
  options: GenerationOptions;
  checklistItems: ReviewChecklistId[];
  approvedFindings: Array<{
    category: ReviewFindingCategory;
    finding: string;
    suggestedAction: string;
  }>;
  ignoredFindings: Array<{
    category: ReviewFindingCategory;
    finding: string;
    suggestedAction: string;
  }>;
  professorInstruction: string;
}
