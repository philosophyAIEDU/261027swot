import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ApiKeySetup } from './ApiKeySetup';

describe('ApiKeySetup', () => {
  it('빈 키는 제출할 수 없다', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(null);
    render(<ApiKeySetup onSubmit={onSubmit} />);

    const button = screen.getByRole('button', { name: /키 확인/ });
    expect(button).toBeDisabled();

    await user.type(screen.getByLabelText('Gemini API 키'), '   ');
    expect(button).toBeDisabled();
    await user.type(screen.getByLabelText('Gemini API 키'), '{Enter}');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('키를 넣으면 기억하기 설정과 함께 제출한다', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(null);
    render(<ApiKeySetup onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText('Gemini API 키'), 'my-key');
    await user.click(screen.getByRole('button', { name: /키 확인/ }));
    expect(onSubmit).toHaveBeenCalledWith('my-key', false);
  });

  it('입력란은 password이고 보기/숨기기로 바꿀 수 있다', async () => {
    const user = userEvent.setup();
    render(<ApiKeySetup onSubmit={vi.fn().mockResolvedValue(null)} />);
    const input = screen.getByLabelText('Gemini API 키');
    expect(input).toHaveAttribute('type', 'password');
    await user.click(screen.getByRole('button', { name: /보기/ }));
    expect(input).toHaveAttribute('type', 'text');
    await user.click(screen.getByRole('button', { name: /숨기기/ }));
    expect(input).toHaveAttribute('type', 'password');
  });

  it('키 확인에 실패하면 친절한 오류를 보여 준다', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue({ kind: 'badKey', message: '열쇠(API 키)가 맞지 않아요.' });
    render(<ApiKeySetup onSubmit={onSubmit} />);
    await user.type(screen.getByLabelText('Gemini API 키'), 'wrong');
    await user.click(screen.getByRole('button', { name: /키 확인/ }));
    expect(await screen.findByRole('alert')).toHaveTextContent('열쇠(API 키)가 맞지 않아요.');
  });
});
