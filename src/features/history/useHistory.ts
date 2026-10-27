import { useCallback, useState } from 'react';
import { MAX_HISTORY_ITEMS } from '../../config';
import { isCompareResult, isSwotResult } from '../../schemas/guards';
import type { Analysis, Source } from '../../types';

// 최근 분석 결과를 이 기기의 localStorage에 남긴다.
// 저장하는 것은 "분석 결과 JSON"뿐이고 API 키는 절대 넣지 않는다.
// 불러올 때도 타입 가드로 검사해, 예전 버전 데이터나 손상된 데이터가 화면을 깨뜨리지 않게 한다.

const HISTORY_KEY = 'swot-kids:history';

export interface HistoryEntry {
  id: string;
  savedAt: string;
  analysis: Analysis;
}

export function analysisTitle(analysis: Analysis): string {
  return analysis.kind === 'single'
    ? analysis.result.company
    : `${analysis.result.a.company} ↔️ ${analysis.result.b.company}`;
}

function isSourceList(value: unknown): value is Source[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item: unknown) =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as Record<string, unknown>).title === 'string' &&
        typeof (item as Record<string, unknown>).uri === 'string' &&
        /^https?:\/\//i.test((item as Record<string, unknown>).uri as string),
    )
  );
}

function isAnalysis(value: unknown): value is Analysis {
  if (typeof value !== 'object' || value === null) return false;
  const record = value as Record<string, unknown>;
  if (!isSourceList(record.sources)) return false;
  if (record.kind === 'single') return isSwotResult(record.result);
  if (record.kind === 'compare') return isCompareResult(record.result);
  return false;
}

function isHistoryEntry(value: unknown): value is HistoryEntry {
  if (typeof value !== 'object' || value === null) return false;
  const record = value as Record<string, unknown>;
  return typeof record.id === 'string' && typeof record.savedAt === 'string' && isAnalysis(record.analysis);
}

export function loadHistory(): HistoryEntry[] {
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isHistoryEntry).slice(0, MAX_HISTORY_ITEMS) : [];
  } catch {
    return [];
  }
}

function persist(entries: HistoryEntry[]): void {
  try {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(entries));
  } catch {
    // 저장 공간이 없거나 막혀 있어도 앱 사용에는 지장이 없다.
  }
}

export interface UseHistory {
  entries: HistoryEntry[];
  add: (analysis: Analysis) => void;
  remove: (id: string) => void;
  clearAll: () => void;
}

export function useHistory(): UseHistory {
  const [entries, setEntries] = useState<HistoryEntry[]>(loadHistory);

  const update = useCallback((makeNext: (prev: HistoryEntry[]) => HistoryEntry[]) => {
    setEntries((prev) => {
      const next = makeNext(prev);
      persist(next);
      return next;
    });
  }, []);

  const add = useCallback(
    (analysis: Analysis) => {
      const title = analysisTitle(analysis);
      const entry: HistoryEntry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        savedAt: new Date().toISOString(),
        analysis,
      };
      // 같은 회사를 다시 분석하면 예전 기록을 지우고 맨 앞에 새로 둔다.
      update((prev) =>
        [entry, ...prev.filter((item) => analysisTitle(item.analysis) !== title)].slice(0, MAX_HISTORY_ITEMS),
      );
    },
    [update],
  );

  const remove = useCallback((id: string) => update((prev) => prev.filter((item) => item.id !== id)), [update]);
  const clearAll = useCallback(() => update(() => []), [update]);

  return { entries, add, remove, clearAll };
}
