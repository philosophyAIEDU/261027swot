import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { makeCompare } from '../../test/fixtures';
import { CompareView, MOBILE_QUERY } from './CompareView';

const originalMatchMedia = window.matchMedia;

function mockScreen(isMobile: boolean) {
  window.matchMedia = vi.fn((query: string) => ({
    matches: query === MOBILE_QUERY ? isMobile : false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}

afterEach(() => {
  window.matchMedia = originalMatchMedia;
});

describe('CompareView', () => {
  it('데스크톱에서는 두 회사와 비교표를 한꺼번에 보여 준다', () => {
    mockScreen(false);
    render(<CompareView result={makeCompare()} />);
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /농심/ })).toBeVisible();
    expect(screen.getByRole('heading', { level: 2, name: /오뚜기/ })).toBeVisible();
    expect(screen.getByText('비슷한 점')).toBeVisible();
  });

  it('모바일에서는 탭으로 회사 A / 회사 B / 비교를 바꿔 본다', async () => {
    mockScreen(true);
    const user = userEvent.setup();
    render(<CompareView result={makeCompare()} />);

    const tabA = screen.getByRole('tab', { name: /A 농심/ });
    const tabB = screen.getByRole('tab', { name: /B 오뚜기/ });
    const tabCompare = screen.getByRole('tab', { name: /비교/ });
    expect(tabA).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('heading', { level: 2, name: /농심/ })).toBeVisible();
    expect(screen.getByRole('heading', { level: 2, name: /오뚜기/, hidden: true })).not.toBeVisible();

    await user.click(tabB);
    expect(tabB).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('heading', { level: 2, name: /오뚜기/ })).toBeVisible();

    await user.click(tabCompare);
    expect(screen.getByText('비슷한 점')).toBeVisible();
    expect(screen.getByText('농심은 라면을 잘 만들고, 오뚜기는 카레를 잘 만들어요.')).toBeVisible();

    // 키보드 화살표로도 탭을 옮길 수 있다.
    await user.keyboard('{ArrowRight}');
    expect(tabA).toHaveAttribute('aria-selected', 'true');
    expect(tabA).toHaveFocus();
  });
});
