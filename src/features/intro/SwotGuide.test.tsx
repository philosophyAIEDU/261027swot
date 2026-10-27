import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SwotGuide } from './SwotGuide';

describe('SwotGuide', () => {
  it('개념·방법·장점·단점·퀴즈 단원을 모두 보여 준다', () => {
    render(<SwotGuide />);
    expect(screen.getByRole('heading', { level: 2, name: /SWOT 쉽게 알아보기/ })).toBeInTheDocument();
    for (const name of [
      /4칸은 두 가지 질문으로 나뉘어요/,
      /SWOT 분석은 이렇게 해요/,
      /SWOT 분석의 장점/,
      /SWOT 분석의 단점/,
      /퀴즈: 안일까, 밖일까\?/,
    ]) {
      expect(screen.getByRole('heading', { level: 3, name })).toBeInTheDocument();
    }
  });

  it('안/밖 × 좋은 일/걱정되는 일 표로 4칸을 설명한다', () => {
    render(<SwotGuide />);
    const table = screen.getByRole('table', { name: /SWOT 4칸/ });
    expect(within(table).getByRole('columnheader', { name: '좋은 일' })).toBeInTheDocument();
    expect(within(table).getByRole('columnheader', { name: '걱정되는 일' })).toBeInTheDocument();
    const insideRow = within(table).getByRole('rowheader', { name: '안' }).closest('tr');
    expect(insideRow).toHaveTextContent('S 잘하는 점');
    expect(insideRow).toHaveTextContent('W 아쉬운 점');
    const outsideRow = within(table).getByRole('rowheader', { name: '밖' }).closest('tr');
    expect(outsideRow).toHaveTextContent('O 기회');
    expect(outsideRow).toHaveTextContent('T 조심할 점');
  });
});
