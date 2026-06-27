"use client";

import { useState } from "react";
import type { GenerationOptions, GenerationResult } from "@/types";
import { legalIssues } from "@/data/legal-issues";
import { mapDocumentsToLegacyAssetIds } from "@/data/knowledge-base";
import Header from "@/components/Header";
import KnowledgeBaseBrowser from "@/components/KnowledgeBaseBrowser";
import SelectionSummary from "@/components/SelectionSummary";
import LegalIssueSelector from "@/components/LegalIssueSelector";
import GenerationOptionsPanel from "@/components/GenerationOptionsPanel";
import GenerateButton from "@/components/GenerateButton";
import ResultDisplay from "@/components/ResultDisplay";

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

  const canGenerate =
    selectedDocumentIds.length > 0 && selectedIssueIds.length > 0;

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assetIds: mapDocumentsToLegacyAssetIds(selectedDocumentIds),
          issueIds: selectedIssueIds,
          options,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "생성 중 오류가 발생했습니다.");
      }

      setResult(data.result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "생성 중 오류가 발생했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper">
      <Header variant="workbench" />

      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-10">
          <p className="text-sm font-medium tracking-widest text-accent uppercase">
            Workbench
          </p>
          <h1 className="mt-2 font-serif text-3xl font-semibold text-ink">
            형사법 출제 워크벤치
          </h1>
          <p className="mt-3 max-w-2xl text-ink-muted">
            Knowledge Base에서 교육 자료를 선택하고, 법적 쟁점을 지정하면 AI가
            사례형 시험 초안을 생성합니다.{" "}
            <span className="font-medium text-ink">
              쟁점을 선택하는 것이 교수님의 실력입니다.
            </span>{" "}
            AI는 그 쟁점을 문제와 수업자료로 빠르게 전환합니다.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
          <div className="min-w-0 space-y-6">
            <KnowledgeBaseBrowser
              selectedDocumentIds={selectedDocumentIds}
              onDocumentChange={setSelectedDocumentIds}
            />

            <LegalIssueSelector
              issues={legalIssues}
              selectedIds={selectedIssueIds}
              onChange={setSelectedIssueIds}
            />

            <GenerationOptionsPanel options={options} onChange={setOptions} />

            <GenerateButton
              onClick={handleGenerate}
              isLoading={isLoading}
              disabled={!canGenerate}
            />

            <ResultDisplay result={result} error={error} />
          </div>

          <div className="hidden lg:block">
            <SelectionSummary
              selectedDocumentIds={selectedDocumentIds}
              selectedIssueIds={selectedIssueIds}
            />
          </div>
        </div>

        <div className="mt-6 lg:hidden">
          <SelectionSummary
            selectedDocumentIds={selectedDocumentIds}
            selectedIssueIds={selectedIssueIds}
          />
        </div>
      </main>

      <footer className="mt-16 border-t border-border py-8 text-center text-sm text-ink-faint">
        Jurist Workbench · 형사법 출제 워크플로 MVP
      </footer>
    </div>
  );
}
