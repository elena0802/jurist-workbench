import {
  referenceCategoryLabels,
  referenceCategoryOrder,
  referenceSources,
  type ReferenceCategory,
  type ReferenceSource,
} from "@/data/reference-sources";

export function isActiveReferenceSource(source: ReferenceSource): boolean {
  return source.enabled && !source.disabled;
}

export function getReferenceSourceById(id: string): ReferenceSource | undefined {
  return referenceSources.find((source) => source.id === id);
}

export function getDefaultSelectedReferenceSourceIds(): string[] {
  return referenceSources
    .filter((source) => isActiveReferenceSource(source) && source.checkedByDefault)
    .map((source) => source.id);
}

export function getActiveReferenceSources(
  selectedIds: string[]
): ReferenceSource[] {
  return selectedIds
    .map((id) => getReferenceSourceById(id))
    .filter((source): source is ReferenceSource => {
      if (!source) return false;
      return isActiveReferenceSource(source);
    });
}

export function getReferenceLabels(selectedIds: string[]): string[] {
  return getActiveReferenceSources(selectedIds).map((source) => source.label);
}

export function summarizeReferenceSourcesByCategory(selectedIds: string[]) {
  const counts: Record<ReferenceCategory, number> = {
    "official-exam": 0,
    precedent: 0,
    "professor-knowledge": 0,
    future: 0,
  };

  for (const source of getActiveReferenceSources(selectedIds)) {
    counts[source.category] += 1;
  }

  return counts;
}

export function formatReferenceSourcesForPrompt(selectedIds: string[]): string {
  const active = getActiveReferenceSources(selectedIds);
  if (active.length === 0) return "";

  const lines: string[] = [
    "아래 참고 자료는 출제안 검토 시 기본적으로 함께 참고하는 공식·판례·교수 지식 자료입니다.",
    "",
  ];

  for (const category of referenceCategoryOrder) {
    if (category === "future") continue;

    const items = active.filter((source) => source.category === category);
    if (items.length === 0) continue;

    lines.push(`### ${referenceCategoryLabels[category]}`);
    for (const item of items) {
      lines.push(`- ${item.label}`);
    }
    lines.push("");
  }

  return lines.join("\n").trim();
}

export function formatReferenceBasisForPrompt(
  selectedIds: string[],
  documentIds: string[] = []
): string {
  const referenceBlock = formatReferenceSourcesForPrompt(selectedIds);
  if (referenceBlock) return referenceBlock;

  if (documentIds.length > 0) {
    return "(개별 문서 참조 — 레거시 모드)";
  }

  return "";
}

export function groupReferenceSourcesByCategory() {
  return referenceCategoryOrder.map((category) => ({
    category,
    label: referenceCategoryLabels[category],
    sources: referenceSources.filter((source) => source.category === category),
  }));
}

export function hasActiveReferenceSelection(selectedIds: string[]): boolean {
  return getActiveReferenceSources(selectedIds).length > 0;
}
