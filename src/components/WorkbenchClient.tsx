"use client";

import { useState } from "react";
import type { GenerationOptions, GenerationResult } from "@/types";
import { legalIssues } from "@/data/legal-issues";
import { mapDocumentsToLegacyAssetIds } from "@/data/knowledge-base";
import {
  hasDraftContent,
  normalizeGenerationResult,
} from "@/lib/normalize-draft-result";
import Header from "@/components/Header";
import WorkflowStepper from "@/components/WorkflowStepper";
import KnowledgeBaseBrowser from "@/components/KnowledgeBaseBrowser";
import IssueDesign from "@/components/IssueDesign";
import DraftOptionsPanel from "@/components/DraftOptionsPanel";
import DraftComposeButton from "@/components/DraftComposeButton";
import DraftOutput from "@/components/DraftOutput";
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
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const canCompose =
    selectedDocumentIds.length > 0 && selectedIssueIds.length > 0;

  const handleCompose = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

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

      setResult(normalized);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "초안 작성 중 오류가 발생했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper">
      <Header variant="workbench" />
      <WorkflowStepper activeStep="knowledge-base" />

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8">
          <h1 className="font-serif text-2xl font-semibold text-ink md:text-3xl">
            형사법 출제 워크벤치
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted">
            지식 베이스 → 평가 쟁점 설계 → 출제 초안. 교수님이 선별한 자료와
            쟁점을 사례형 시험 문항으로 전환하는 출제 워크플로입니다.
          </p>
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
                  isLoading={isLoading}
                  disabled={!canCompose}
                />
              }
            />

            <DraftOutput
              result={result}
              error={error}
              basis={{
                documentIds: selectedDocumentIds,
                issueIds: selectedIssueIds,
                options,
              }}
              onRecompose={handleCompose}
              isRecomposing={isLoading}
            />
          </div>

          <div className="hidden lg:block">
            <CurrentDraft
              selectedDocumentIds={selectedDocumentIds}
              selectedIssueIds={selectedIssueIds}
              options={options}
              hasDraft={hasDraftContent(result)}
            />
          </div>
        </div>

        <div className="mt-8 lg:hidden">
          <CurrentDraft
            selectedDocumentIds={selectedDocumentIds}
            selectedIssueIds={selectedIssueIds}
            options={options}
            hasDraft={hasDraftContent(result)}
          />
        </div>
      </main>

      <footer className="mt-12 border-t border-border py-6 text-center text-xs text-ink-faint">
        Jurist Workbench · 형사법 출제 워크플로
      </footer>
    </div>
  );
}
