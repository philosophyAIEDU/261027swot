import type {
  CompareResult,
  DifferentThing,
  HardWord,
  PracticeFeedback,
  SwotItem,
  SwotResult,
} from '../types';

// AI 응답은 JSON.parse 직후 "unknown"으로 취급하고, 여기서 하나하나 확인한 뒤에만
// 화면에 넘긴다. 칸 하나만 빠져도 화면이 깨지거나 빈 카드가 보일 수 있기 때문이다.

export interface RawIntent {
  mode: 'single' | 'compare' | 'unclear';
  companies: string[];
  kind: 'none' | 'tooMany' | 'person' | 'notCompany' | 'unknown';
  reason: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isArrayOf<T>(value: unknown, guard: (item: unknown) => item is T): value is T[] {
  return Array.isArray(value) && value.every(guard);
}

export function isSwotItem(value: unknown): value is SwotItem {
  return isRecord(value) && isNonEmptyString(value.point) && isNonEmptyString(value.example);
}

function isHardWord(value: unknown): value is HardWord {
  return isRecord(value) && isNonEmptyString(value.word) && isNonEmptyString(value.meaning);
}

function isSwotItemList(value: unknown): value is SwotItem[] {
  // 스키마로 2~3개를 요청하지만, 1개만 와도 보여 줄 수는 있으므로 "비어 있지 않음"만 요구한다.
  return isArrayOf(value, isSwotItem) && value.length > 0;
}

export function isSwotResult(value: unknown): value is SwotResult {
  return (
    isRecord(value) &&
    isNonEmptyString(value.company) &&
    isNonEmptyString(value.oneLineIntro) &&
    isSwotItemList(value.strengths) &&
    isSwotItemList(value.weaknesses) &&
    isSwotItemList(value.opportunities) &&
    isSwotItemList(value.threats) &&
    isNonEmptyString(value.summary) &&
    isArrayOf(value.hardWords, isHardWord)
  );
}

function isDifferentThing(value: unknown): value is DifferentThing {
  return (
    isRecord(value) &&
    isNonEmptyString(value.topic) &&
    isNonEmptyString(value.a) &&
    isNonEmptyString(value.b)
  );
}

export function isCompareResult(value: unknown): value is CompareResult {
  return (
    isRecord(value) &&
    isSwotResult(value.a) &&
    isSwotResult(value.b) &&
    isArrayOf(value.sameThings, isNonEmptyString) &&
    value.sameThings.length > 0 &&
    isArrayOf(value.differentThings, isDifferentThing) &&
    value.differentThings.length > 0 &&
    isNonEmptyString(value.kidSummary)
  );
}

const INTENT_MODES: readonly string[] = ['single', 'compare', 'unclear'];
const INTENT_KINDS: readonly string[] = ['none', 'tooMany', 'person', 'notCompany', 'unknown'];

export function isRawIntent(value: unknown): value is RawIntent {
  return (
    isRecord(value) &&
    typeof value.mode === 'string' &&
    INTENT_MODES.includes(value.mode) &&
    isArrayOf(value.companies, (item: unknown): item is string => typeof item === 'string') &&
    typeof value.kind === 'string' &&
    INTENT_KINDS.includes(value.kind) &&
    typeof value.reason === 'string'
  );
}

export function isPracticeFeedback(value: unknown): value is PracticeFeedback {
  return isRecord(value) && isNonEmptyString(value.praise) && isNonEmptyString(value.hint);
}
