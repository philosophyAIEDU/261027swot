import type { QuadrantKey } from '../../types';

export type Scope = 'inside' | 'outside';

export interface QuadrantMeta {
  key: QuadrantKey;
  letter: 'S' | 'W' | 'O' | 'T';
  emoji: string;
  name: string;
  english: string;
  description: string;
  scope: Scope;
  /** 카드 배경·테두리·글자 색 (색만으로 뜻을 전하지 않도록 이모지·글자와 함께 쓴다) */
  classes: string;
}

// SWOT 4칸의 쉬운 이름과 이모지는 앱 전체에서 이 정의만 쓴다.
export const QUADRANTS: readonly QuadrantMeta[] = [
  {
    key: 'strengths',
    letter: 'S',
    emoji: '💪',
    name: '잘하는 점',
    english: 'Strengths',
    description: '우리가 잘하는 것',
    scope: 'inside',
    classes: 'bg-s-bg border-s-line text-s-ink',
  },
  {
    key: 'weaknesses',
    letter: 'W',
    emoji: '🩹',
    name: '아쉬운 점',
    english: 'Weaknesses',
    description: '우리가 아직 부족한 것',
    scope: 'inside',
    classes: 'bg-w-bg border-w-line text-w-ink',
  },
  {
    key: 'opportunities',
    letter: 'O',
    emoji: '🌱',
    name: '기회',
    english: 'Opportunities',
    description: '밖에서 찾아온 좋은 일',
    scope: 'outside',
    classes: 'bg-o-bg border-o-line text-o-ink',
  },
  {
    key: 'threats',
    letter: 'T',
    emoji: '⚠️',
    name: '조심할 점',
    english: 'Threats',
    description: '밖에서 찾아올 수 있는 걱정거리',
    scope: 'outside',
    classes: 'bg-t-bg border-t-line text-t-ink',
  },
];

export const SCOPE_LABELS: Record<Scope, { emoji: string; label: string; detail: string; classes: string }> = {
  inside: { emoji: '🏠', label: '안', detail: '우리 회사 안의 일', classes: 'text-inside border-inside' },
  outside: { emoji: '🌍', label: '밖', detail: '바깥 세상의 일', classes: 'text-outside border-outside' },
};
