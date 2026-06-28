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

export type ReviewFindingSeverity = "low" | "medium" | "high";

export type RuleStatus = "satisfied" | "partial" | "violated";

export interface AppliedRule {
  ruleId: string;
  title: string;
  category: string;
  status: RuleStatus;
  statusLabel: "충족" | "부분 충족" | "미충족";
  explanation: string;
  diagnosticQuestion: string;
  draftDiagnosis: string;
  violationReason: string;
  revisionGuidance: string;
  satisfactionTarget: string;
  expectedImprovement: string;
}

export interface ReviewFindingPayload {
  category: ReviewFindingCategory;
  finding: string;
  suggestedAction: string;
  evidenceDocuments: string[];
  evidenceText: string;
  reasoningBasis: string;
  recommendedReason: string;
  expectedEffect: string;
  severity: ReviewFindingSeverity;
  appliedRules: AppliedRule[];
}

export interface ReviewFinding extends ReviewFindingPayload {
  id: string;
  decision: FindingDecision;
}

export interface ReviewRequest {
  draft: GenerationResult;
  assetIds: string[];
  documentIds?: string[];
  referenceSourceIds?: string[];
  issueIds: string[];
  options: GenerationOptions;
}

export interface RevisionSummary {
  applied: string[];
  preserved: string[];
  evidenceApplied: string[];
  expectedEffects: string[];
  rulesApplied: string[];
  rulesImproved: string[];
  rulesPreserved: string[];
  ruleSatisfactionPlans: string[];
  improvementsMade: string[];
  remainingRecommendations: string[];
  professorInstructionApplied: boolean;
  professorInstructionNote: string;
  difficultyChange: string;
  issueStructureChange: string;
}

export interface RevisionRequest {
  originalDraft: GenerationResult;
  assetIds: string[];
  documentIds?: string[];
  referenceSourceIds?: string[];
  issueIds: string[];
  options: GenerationOptions;
  checklistItems: ReviewChecklistId[];
  approvedFindings: ReviewFindingPayload[];
  ignoredFindings: ReviewFindingPayload[];
  professorInstruction: string;
}
