import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { makeSwot } from '../../test/fixtures';
import { SwotBoard } from './SwotBoard';

describe('SwotBoard', () => {
  it('4칸을 쉬운 이름과 이모지로 렌더링한다', () => {
    render(<SwotBoard result={makeSwot('농심')} />);
    expect(screen.getByRole('heading', { level: 2, name: /농심/ })).toBeInTheDocument();
    const quadrants: [string, string][] = [
      ['S 잘하는 점', '💪'],
      ['W 아쉬운 점', '🩹'],
      ['O 기회', '🌱'],
      ['T 조심할 점', '⚠️'],
    ];
    for (const [name, emoji] of quadrants) {
      const region = screen.getByRole('region', { name });
      // 색만으로 뜻을 전하지 않도록 이모지와 글자가 함께 있어야 한다.
      expect(within(region).getByRole('heading', { level: 3 })).toHaveTextContent(`${emoji} ${name}`);
    }
    expect(screen.getByText('어려운 낱말 사전')).toBeInTheDocument();
    expect(screen.getByText('수출')).toBeInTheDocument();
  });

  it('"예를 들면?" 버튼으로 예시를 펼치고 접는다', async () => {
    const user = userEvent.setup();
    render(<SwotBoard result={makeSwot('농심')} />);
    const strengths = screen.getByRole('region', { name: 'S 잘하는 점' });
    const example = within(strengths).getByText(/여러 줄 놓여 있어요/);
    expect(example).not.toBeVisible();

    const [firstButton] = within(strengths).getAllByRole('button', { name: /예를 들면/ });
    expect(firstButton).toHaveAttribute('aria-expanded', 'false');
    await user.click(firstButton!);
    expect(example).toBeVisible();
    expect(within(strengths).getByRole('button', { name: /접기/ })).toHaveAttribute('aria-expanded', 'true');
  });
});
