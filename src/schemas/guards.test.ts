import { describe, expect, it } from 'vitest';
import introExample from '../data/introExample.json';
import { makeCompare, makeSwot } from '../test/fixtures';
import { isCompareResult, isPracticeFeedback, isRawIntent, isSwotResult } from './guards';

describe('isSwotResult', () => {
  it('올바른 JSON은 통과한다', () => {
    expect(isSwotResult(makeSwot('농심'))).toBe(true);
    expect(isSwotResult(introExample)).toBe(true);
  });

  it('칸이 빠지면 거부한다', () => {
    const { threats: _omit, ...rest } = makeSwot('농심');
    expect(isSwotResult(rest)).toBe(false);
  });

  it('빈 칸(빈 배열)은 거부한다', () => {
    expect(isSwotResult({ ...makeSwot('농심'), strengths: [] })).toBe(false);
  });

  it('타입이 틀리면 거부한다', () => {
    expect(isSwotResult({ ...makeSwot('농심'), summary: 3 })).toBe(false);
    expect(isSwotResult({ ...makeSwot('농심'), strengths: [{ point: '좋아요' }] })).toBe(false);
    expect(isSwotResult({ ...makeSwot('농심'), hardWords: 'none' })).toBe(false);
    expect(isSwotResult(null)).toBe(false);
    expect(isSwotResult([])).toBe(false);
    expect(isSwotResult('문자열')).toBe(false);
  });
});

describe('isCompareResult', () => {
  it('올바른 JSON은 통과한다', () => {
    expect(isCompareResult(makeCompare())).toBe(true);
  });

  it('한쪽 회사 분석이 깨지면 거부한다', () => {
    expect(isCompareResult({ ...makeCompare(), b: { company: '오뚜기' } })).toBe(false);
  });

  it('비교 칸이 빠지거나 틀리면 거부한다', () => {
    const { kidSummary: _omit, ...rest } = makeCompare();
    expect(isCompareResult(rest)).toBe(false);
    expect(isCompareResult({ ...makeCompare(), differentThings: [{ topic: '맛', a: '매워요' }] })).toBe(false);
    expect(isCompareResult({ ...makeCompare(), sameThings: [1, 2] })).toBe(false);
  });
});

describe('isRawIntent / isPracticeFeedback', () => {
  it('판별 결과 모양을 검사한다', () => {
    expect(isRawIntent({ mode: 'single', companies: ['카카오'], kind: 'none', reason: '' })).toBe(true);
    expect(isRawIntent({ mode: 'many', companies: [], kind: 'none', reason: '' })).toBe(false);
    expect(isRawIntent({ mode: 'single', companies: 'x', kind: 'none', reason: '' })).toBe(false);
  });

  it('피드백 모양을 검사한다', () => {
    expect(isPracticeFeedback({ praise: '잘했어요', hint: '밖의 일도 써 볼까요?' })).toBe(true);
    expect(isPracticeFeedback({ praise: '잘했어요' })).toBe(false);
  });
});
