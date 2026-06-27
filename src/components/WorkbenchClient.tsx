"use client";

import { useCallback, useMemo, useState } from "react";
import type {
  GenerationOptions,
  GenerationResult,
  ReviewChecklistId,
  ReviewFinding,
  RevisionSummary,
  WorkflowPhase,
} from "@/types";
import { legalIssues } from "@/data/legal-issues";
import { mapDocumentsToLegacyAssetIds } from "@/data/knowledge-base";
import {
  hasDraftContent,
  normalizeGenerationResult,
} from "@/lib/normalize-draft-result";
import {
  buildDefaultReviewFindings,
  normalizeReviewFindings,
} from "@/lib/normalize-review-findings";
import { buildLocalRevisionSummary, normalizeRevisionSummary } from "@/lib/revision-summary";
import Header from "@/components/Header";
import WorkflowStepper from "@/components/WorkflowStepper";
import WorkflowStatusBanner from "@/components/WorkflowStatusBanner";
import KnowledgeBaseBrowser from "@/components/KnowledgeBaseBrowser";
import IssueDesign from "@/components/IssueDesign";
import DraftOptionsPanel from "@/components/DraftOptionsPanel";
import DraftComposeButton from "@/components/DraftComposeButton";
import DraftOutput from "@/components/DraftOutput";
import DraftReviewPanel from "@/components/DraftReviewPanel";
import ProfessorReviewPanel from "@/components/ProfessorReviewPanel";
import RevisionSummaryPanel from "@/components/RevisionSummaryPanel";
import CurrentDraft from "@/components/CurrentDraft";

const defaultOptions: GenerationOptions = {
  purpose: "모의시험",
  difficulty: "로스쿨",
  outputs: {
    caseProblem: true,
    examIntent: true,
    issueStructure: true,
    gradingCriteria: true,
    professorReviewMemo: true,
  },
};

export default function WorkbenchClient() {
  const [selectedDocumentIds, setSelectedDocumentIds] = useState<string[]>([]);
  const [selectedIssueIds, setSelectedIssueIds] = useState<string[]>([]);
  const [options, setOptions] = useState<GenerationOptions>(defaultOptions);
  const [draftV1, setDraftV1] = useState<GenerationResult | null>(null);
  const [revisedDraft, setRevisedDraft] = useState<GenerationResult | null>(
    null
  );
  const [revisionSummary, setRevisionSummary] =
    useState<RevisionSummary | null>(null);
  const [draftError, setDraftError] = useState<string | null>(null);
  const [revisionError, setRevisionError] = useState<string | null>(null);
  const [isComposing, setIsComposing] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [isRevising, setIsRevising] = useState(false);
  const [reviewFindings, setReviewFindings] = useState<ReviewFinding[]>([]);
  const [reviewWarning, setReviewWarning] = useState<string | null>(null);
  const [reviewConfirmed, setReviewConfirmed] = useState(false);
  const [checklistIds, setChecklistIds] = useState<ReviewChecklistId[]>([]);
  const [professorInstruction, setProfessorInstruction] = useState("");

  const canCompose =
    selectedDocumentIds.length > 0 && selectedIssueIds.length > 0;

  const basis = {
    documentIds: selectedDocumentIds,
    issueIds: selectedIssueIds,
    options,
  };

  const hasDraftV1 = hasDraftContent(draftV1);
  const hasRevisedDraft = hasDraftContent(revisedDraft);

  const workflowPhase: WorkflowPhase = useMemo(() => {
    if (isRevising) return "revising";
    if (hasRevisedDraft) return "revised-complete";
    if (reviewConfirmed && hasDraftV1) return "approval-pending";
    if (isReviewing) return "draft-review-loading";
    if (hasDraftV1 && reviewFindings.length > 0) return "draft-review-complete";
    if (hasDraftV1) return "draft-v1-complete";
    return "idle";
  }, [
    isRevising,
    hasRevisedDraft,
    reviewConfirmed,
    hasDraftV1,
    isReviewing,
    reviewFindings.length,
  ]);

  const activeStep = useMemo(() => {
    if (hasRevisedDraft) return "revised-draft";
    if (reviewConfirmed && hasDraftV1) return "professor-approval";
    if (hasDraftV1) return "draft-review";
    if (canCompose) return "draft";
    if (selectedIssueIds.length > 0) return "issue-design";
    if (selectedDocumentIds.length > 0) return "issue-design";
    return "knowledge-base";
  }, [
    hasRevisedDraft,
    reviewConfirmed,
    hasDraftV1,
    canCompose,
    selectedIssueIds.length,
    selectedDocumentIds.length,
  ]);

  const resetReviewState = () => {
    setReviewFindings([]);
    setReviewWarning(null);
    setReviewConfirmed(false);
    setChecklistIds([]);
    setProfessorInstruction("");
    setRevisionError(null);
    setRevisionSummary(null);
    setRevisedDraft(null);
  };

  const fetchReview = useCallback(
    async (draft: GenerationResult) => {
      setIsReviewing(true);
      setReviewWarning(null);
      setReviewFindings([]);
      setReviewConfirmed(false);

      try {
        const response = await fetch("/api/review", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            draft,
            assetIds: mapDocumentsToLegacyAssetIds(selectedDocumentIds),
            documentIds: selectedDocumentIds,
            issueIds: selectedIssueIds,
            options,
          }),
        });

        let data: {
          findings?: unknown;
          warning?: string;
          error?: string;
        };

        try {
          data = await response.json();
        } catch {
          throw new Error("검토 응답을 해석하지 못했습니다.");
        }

        if (data.warning) {
          setReviewWarning(data.warning);
        }

        let findings = normalizeReviewFindings(data.findings ?? data);

        if (findings.length === 0) {
          findings = buildDefaultReviewFindings(selectedIssueIds, options);
          if (!data.warning) {
            setReviewWarning(
              "검토 제안을 불러오지 못해 기본 검토 항목을 표시합니다."
            );
          }
        }

        setReviewFindings(findings);
      } catch {
        const fallback = buildDefaultReviewFindings(selectedIssueIds, options);
        setReviewFindings(fallback);
        setReviewWarning(
          "초안 검토를 자동 생성하지 못해 기본 검토 제안을 표시합니다."
        );
      } finally {
        setIsReviewing(false);
      }
    },
    [selectedDocumentIds, selectedIssueIds, options]
  );

  const handleCompose = async () => {
    setIsComposing(true);
    setDraftError(null);
    setDraftV1(null);
    resetReviewState();

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assetIds: mapDocumentsToLegacyAssetIds(selectedDocumentIds),
          documentIds: selectedDocumentIds,
          issueIds: selectedIssueIds,
          options,
        }),
      });

      let data: { result?: unknown; error?: string };
      try {
        data = await response.json();
      } catch {
        throw new Error("서버 응답을 해석하지 못했습니다.");
      }

      if (!response.ok) {
        throw new Error(data.error || "초안 작성 중 오류가 발생했습니다.");
      }

      const normalized = normalizeGenerationResult(data.result ?? data);

      if (!hasDraftContent(normalized)) {
        throw new Error(
          "초안 내용을 받지 못했습니다. 포함 항목을 확인하고 다시 시도해 주세요."
        );
      }

      setDraftV1(normalized);
      await fetchReview(normalized);
    } catch (err) {
      setDraftError(
        err instanceof Error ? err.message : "초안 작성 중 오류가 발생했습니다."
      );
    } finally {
      setIsComposing(false);
    }
  };

  const handleFindingDecision = (
    id: string,
    decision: "accept" | "ignore"
  ) => {
    setReviewFindings((prev) =>
      prev.map((f) => (f.id === id ? { ...f, decision } : f))
    );
  };

  const handleRevise = async () => {
    if (!draftV1) return;

    setIsRevising(true);
    setRevisionError(null);
    setRevisionSummary(null);
    setRevisedDraft(null);

    const approvedFindings = reviewFindings
      .filter((f) => f.decision === "accept")
      .map((f) => ({
        category: f.category,
        finding: f.finding,
        suggestedAction: f.suggestedAction,
      }));

    const ignoredFindings = reviewFindings
      .filter((f) => f.decision === "ignore")
      .map((f) => ({
        category: f.category,
        finding: f.finding,
        suggestedAction: f.suggestedAction,
      }));

    try {
      const response = await fetch("/api/revise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalDraft: draftV1,
          assetIds: mapDocumentsToLegacyAssetIds(selectedDocumentIds),
          documentIds: selectedDocumentIds,
          issueIds: selectedIssueIds,
          options,
          checklistItems: checklistIds,
          approvedFindings,
          ignoredFindings,
          professorInstruction,
        }),
      });

      let data: {
        result?: unknown;
        revisionSummary?: unknown;
        error?: string;
      };
      try {
        data = await response.json();
      } catch {
        throw new Error("서버 응답을 해석하지 못했습니다.");
      }

      if (!response.ok) {
        throw new Error(
          data.error || "수정 초안 작성 중 오류가 발생했습니다."
        );
      }

      const normalized = normalizeGenerationResult(data.result ?? data);

      if (!hasDraftContent(normalized)) {
        throw new Error(
          "수정 초안 내용을 받지 못했습니다. 검수 내용을 확인하고 다시 시도해 주세요."
        );
      }

      const summary =
        normalizeRevisionSummary(data.revisionSummary) ??
        buildLocalRevisionSummary(
          reviewFindings.filter((f) => f.decision === "accept"),
          reviewFindings.filter((f) => f.decision === "ignore"),
          checklistIds,
          professorInstruction,
          options
        );

      setRevisionSummary(summary);
      setRevisedDraft(normalized);
    } catch (err) {
      setRevisionError(
        err instanceof Error
          ? err.message
          : "수정 초안 작성 중 오류가 발생했습니다."
      );
    } finally {
      setIsRevising(false);
    }
  };

  const fallbackApplied = useMemo(
    () =>
      reviewFindings
        .filter((f) => f.decision === "accept")
        .map((f) => `[${f.category}] ${f.suggestedAction}`),
    [reviewFindings]
  );

  return (
    <div className="min-h-screen bg-paper">
      <Header variant="workbench" />
      <WorkflowStepper activeStep={activeStep} />

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6">
          <h1 className="font-serif text-2xl font-semibold text-ink md:text-3xl">
            형사법 출제 워크벤치
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted">
            지식 베이스 → 평가 쟁점 설계 → 출제 초안 → 초안 검토 → 교수 승인 →
            수정 초안. 교수님의 검수를 전제로 한 출제 워크플로입니다.
          </p>
          <div className="mt-4 max-w-md">
            <WorkflowStatusBanner phase={workflowPhase} />
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
          <div className="min-w-0 space-y-8">
            <KnowledgeBaseBrowser
              selectedDocumentIds={selectedDocumentIds}
              onDocumentChange={setSelectedDocumentIds}
            />

            <IssueDesign
              issues={legalIssues}
              selectedIds={selectedIssueIds}
              onChange={setSelectedIssueIds}
            />

            <DraftOptionsPanel
              options={options}
              onChange={setOptions}
              composeSlot={
                <DraftComposeButton
                  onClick={handleCompose}
                  isLoading={isComposing}
                  disabled={!canCompose}
                />
              }
            />

            <DraftOutput
              result={draftV1}
              error={draftError}
              basis={basis}
              onRecompose={handleCompose}
              isRecomposing={isComposing}
              versionLabel="출제 초안 v1"
              statusBadge={
                hasDraftV1 && !isComposing ? "출제 초안 작성 완료" : null
              }
            />

            {hasDraftV1 && !reviewConfirmed && (
              <DraftReviewPanel
                findings={reviewFindings}
                onFindingDecision={handleFindingDecision}
                onContinue={() => setReviewConfirmed(true)}
                isLoading={isReviewing}
                warning={reviewWarning}
              />
            )}

            {hasDraftV1 && reviewConfirmed && !hasRevisedDraft && (
              <ProfessorReviewPanel
                findings={reviewFindings}
                onFindingDecision={handleFindingDecision}
                checklistIds={checklistIds}
                onChecklistChange={setChecklistIds}
                professorInstruction={professorInstruction}
                onInstructionChange={setProfessorInstruction}
                onRevise={handleRevise}
                isRevising={isRevising}
                error={revisionError}
              />
            )}

            {hasRevisedDraft && (
              <>
                <RevisionSummaryPanel
                  summary={revisionSummary}
                  fallbackApplied={fallbackApplied}
                />
                <DraftOutput
                  result={revisedDraft}
                  error={null}
                  basis={basis}
                  versionLabel="수정 초안 v2"
                  statusBadge="수정 초안 작성 완료"
                  showReviewSection
                  footerNote="최종 검수 전 초안입니다."
                />
              </>
            )}
          </div>

          <div className="hidden lg:block">
            <CurrentDraft
              selectedDocumentIds={selectedDocumentIds}
              selectedIssueIds={selectedIssueIds}
              options={options}
              hasDraft={hasDraftV1 || hasRevisedDraft}
              workflowPhase={workflowPhase}
            />
          </div>
        </div>

        <div className="mt-8 lg:hidden">
          <CurrentDraft
            selectedDocumentIds={selectedDocumentIds}
            selectedIssueIds={selectedIssueIds}
            options={options}
            hasDraft={hasDraftV1 || hasRevisedDraft}
            workflowPhase={workflowPhase}
          />
        </div>
      </main>

      <footer className="mt-12 border-t border-border py-6 text-center text-xs text-ink-faint">
        Jurist Workbench · 형사법 출제 워크플로
      </footer>
    </div>
  );
}
