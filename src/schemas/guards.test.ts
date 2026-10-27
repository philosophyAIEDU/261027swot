import { describe, expect, it } from 'vitest';
import introExample from '../data/introExample.json';
import { makeCompare, makeSwot } from '../test/fixtures';
import { isCompareResult, isPhotoResponse, isPracticeFeedback, isRawIntent, isSwotResult } from './guards';

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

describe('사진 분석 결과', () => {
  function photoResult() {
    const base = makeSwot('사진 속 분식집');
    const tag = (source: 'photo' | 'guess') => (item: { point: string; example: string }) => ({ ...item, source });
    return {
      ...base,
      isStore: true as const,
      reason: '',
      strengths: base.strengths.map(tag('photo')),
      weaknesses: base.weaknesses.map(tag('photo')),
      opportunities: base.opportunities.map(tag('guess')),
      threats: base.threats.map(tag('guess')),
      photoClues: ['메뉴판에 그림이 있어요.', '의자가 네 개 보여요.'],
    };
  }

  it('근거와 단서가 있는 SWOT 결과도 isSwotResult를 통과한다', () => {
    expect(isSwotResult(photoResult())).toBe(true);
  });

  it('근거(source) 값이 틀리면 거부한다', () => {
    const bad = photoResult();
    expect(isSwotResult({ ...bad, strengths: [{ ...bad.strengths[0], source: 'maybe' }] })).toBe(false);
  });

  it('isPhotoResponse: 올바른 결과는 통과한다', () => {
    expect(isPhotoResponse(photoResult())).toBe(true);
  });

  it('isPhotoResponse: 가게 사진이 아니면 이유만 있어도 통과한다', () => {
    expect(isPhotoResponse({ isStore: false, reason: '사람 사진이에요.' })).toBe(true);
  });

  it('isPhotoResponse: 근거 표시가 빠진 항목이나 단서가 없으면 거부한다', () => {
    const noSource = photoResult();
    expect(isPhotoResponse({ ...noSource, threats: makeSwot('x').threats })).toBe(false);
    expect(isPhotoResponse({ ...photoResult(), photoClues: [] })).toBe(false);
    expect(isPhotoResponse({ ...photoResult(), photoClues: undefined })).toBe(false);
  });
});
