import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { isSwotResult } from '../../schemas/guards';
import { QUADRANTS } from '../analysis/quadrantMeta';
import { FAMOUS_EXAMPLES, FamousExamples } from './FamousExamples';

describe('유명한 회사 예시 데이터', () => {
  it('10개이고, 이름과 id가 겹치지 않는다', () => {
    expect(FAMOUS_EXAMPLES).toHaveLength(10);
    expect(new Set(FAMOUS_EXAMPLES.map((example) => example.id)).size).toBe(10);
    expect(new Set(FAMOUS_EXAMPLES.map((example) => example.result.company)).size).toBe(10);
  });

  it.each(FAMOUS_EXAMPLES.map((example) => [example.result.company, example] as const))(
    '%s: 앱의 SWOT 형식 규칙을 지킨다',
    (_name, example) => {
      const { result } = example;
      expect(isSwotResult(result)).toBe(true);
      for (const meta of QUADRANTS) {
        expect(result[meta.key].length).toBeGreaterThanOrEqual(2);
        expect(result[meta.key].length).toBeLessThanOrEqual(3);
      }
      expect(result.hardWords.length).toBeLessThanOrEqual(3);

      // 초등학생용 글 규칙: 짧은 문장, 마크다운 기호 없음, 숫자(지어낸 수치) 없음
      const sentences = QUADRANTS.flatMap((meta) => result[meta.key].flatMap((item) => [item.point, item.example]));
      for (const sentence of sentences) {
        expect(sentence.length).toBeLessThanOrEqual(45);
        expect(sentence).not.toMatch(/[*#`]/);
        expect(sentence).not.toMatch(/\d/);
      }
    },
  );
});

describe('FamousExamples', () => {
  it('회사를 누르면 그 회사의 SWOT 결과를 연다', async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    render(<FamousExamples onOpen={onOpen} />);
    expect(screen.getAllByRole('button')).toHaveLength(10);
    await user.click(screen.getByRole('button', { name: /레고/ }));
    expect(onOpen).toHaveBeenCalledWith(expect.objectContaining({ company: '레고' }));
  });
});
