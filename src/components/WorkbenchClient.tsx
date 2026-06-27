"use client";

import { useMemo, useState } from "react";
import type {
  GenerationOptions,
  GenerationResult,
  ReviewChecklistId,
  ReviewSuggestion,
  WorkflowPhase,
} from "@/types";
import { legalIssues } from "@/data/legal-issues";
import { mapDocumentsToLegacyAssetIds } from "@/data/knowledge-base";
import {
  hasDraftContent,
  normalizeGenerationResult,
} from "@/lib/normalize-draft-result";
import { buildReviewSuggestions } from "@/lib/parse-review-suggestions";
import Header from "@/components/Header";
import WorkflowStepper from "@/components/WorkflowStepper";
import WorkflowStatusBanner from "@/components/WorkflowStatusBanner";
import KnowledgeBaseBrowser from "@/components/KnowledgeBaseBrowser";
import IssueDesign from "@/components/IssueDesign";
import DraftOptionsPanel from "@/components/DraftOptionsPanel";
import DraftComposeButton from "@/components/DraftComposeButton";
import DraftOutput from "@/components/DraftOutput";
import ProfessorReviewPanel from "@/components/ProfessorReviewPanel";
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
  const [draftError, setDraftError] = useState<string | null>(null);
  const [revisionError, setRevisionError] = useState<string | null>(null);
  const [isComposing, setIsComposing] = useState(false);
  const [isRevising, setIsRevising] = useState(false);
  const [checklistIds, setChecklistIds] = useState<ReviewChecklistId[]>([]);
  const [suggestions, setSuggestions] = useState<ReviewSuggestion[]>([]);
  const [professorInstruction, setProfessorInstruction] = useState("");

  const canCompose =
    selectedDocumentIds.length > 0 && selectedIssueIds.length > 0;

  const basis = {
    documentIds: selectedDocumentIds,
    issueIds: selectedIssueIds,
    options,
  };

  const workflowPhase: WorkflowPhase = useMemo(() => {
    if (isRevising) return "revising";
    if (revisedDraft && hasDraftContent(revisedDraft)) return "revised-complete";
    if (draftV1 && hasDraftContent(draftV1)) return "review-pending";
    return "idle";
  }, [isRevising, revisedDraft, draftV1]);

  const activeStep = useMemo(() => {
    if (revisedDraft && hasDraftContent(revisedDraft)) return "revised-draft";
    if (draftV1 && hasDraftContent(draftV1)) return "professor-review";
    if (canCompose) return "draft";
    if (selectedIssueIds.length > 0) return "issue-design";
    if (selectedDocumentIds.length > 0) return "issue-design";
    return "knowledge-base";
  }, [
    revisedDraft,
    draftV1,
    canCompose,
    selectedIssueIds.length,
    selectedDocumentIds.length,
  ]);

  const initReviewFromDraft = (draft: GenerationResult) => {
    const memo = draft.professorReviewMemo ?? "";
    setSuggestions(
      buildReviewSuggestions(memo, selectedIssueIds, options)
    );
    setChecklistIds([]);
    setProfessorInstruction("");
    setRevisionError(null);
  };

  const handleCompose = async () => {
    setIsComposing(true);
    setDraftError(null);
    setDraftV1(null);
    setRevisedDraft(null);
    setRevisionError(null);

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
      initReviewFromDraft(normalized);
    } catch (err) {
      setDraftError(
        err instanceof Error ? err.message : "초안 작성 중 오류가 발생했습니다."
      );
    } finally {
      setIsComposing(false);
    }
  };

  const handleRevise = async () => {
    if (!draftV1) return;

    setIsRevising(true);
    setRevisionError(null);

    const acceptedSuggestions = suggestions
      .filter((s) => s.decision === "accept")
      .map((s) => s.text);

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
          acceptedSuggestions,
          professorInstruction,
        }),
      });

      let data: { result?: unknown; error?: string };
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

  const handleSuggestionDecision = (
    id: string,
    decision: "accept" | "ignore"
  ) => {
    setSuggestions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, decision } : s))
    );
  };

  const hasDraftV1 = hasDraftContent(draftV1);

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
            지식 베이스 → 평가 쟁점 설계 → 출제 초안 → 교수 검수 → 수정
            초안. 교수님의 검수를 전제로 한 출제 워크플로입니다.
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
                hasDraftV1 && !isComposing ? "Draft v1 작성 완료" : null
              }
            />

            {hasDraftV1 && (
              <ProfessorReviewPanel
                suggestions={suggestions}
                onSuggestionDecision={handleSuggestionDecision}
                checklistIds={checklistIds}
                onChecklistChange={setChecklistIds}
                professorInstruction={professorInstruction}
                onInstructionChange={setProfessorInstruction}
                onRevise={handleRevise}
                isRevising={isRevising}
                error={revisionError}
              />
            )}

            {revisedDraft && hasDraftContent(revisedDraft) && (
              <DraftOutput
                result={revisedDraft}
                error={null}
                basis={basis}
                versionLabel="수정 초안 v2"
                statusBadge="수정 초안 작성 완료"
                showReviewSection
              />
            )}
          </div>

          <div className="hidden lg:block">
            <CurrentDraft
              selectedDocumentIds={selectedDocumentIds}
              selectedIssueIds={selectedIssueIds}
              options={options}
              hasDraft={hasDraftV1 || hasDraftContent(revisedDraft)}
              workflowPhase={workflowPhase}
            />
          </div>
        </div>

        <div className="mt-8 lg:hidden">
          <CurrentDraft
            selectedDocumentIds={selectedDocumentIds}
            selectedIssueIds={selectedIssueIds}
            options={options}
            hasDraft={hasDraftV1 || hasDraftContent(revisedDraft)}
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
