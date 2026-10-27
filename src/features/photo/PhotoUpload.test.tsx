import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { PhotoUpload } from './PhotoUpload';
import { ImagePrepareError, type PreparedImage } from './prepareImage';

const prepared: PreparedImage = { base64: 'QUJD', mimeType: 'image/jpeg', dataUrl: 'data:image/jpeg;base64,QUJD' };

describe('PhotoUpload', () => {
  it('사진을 고르기 전에는 분석 버튼이 비활성이다', () => {
    render(<PhotoUpload disabled={false} onSubmit={vi.fn()} prepare={vi.fn()} />);
    expect(screen.getByRole('button', { name: /사진으로 SWOT 알아보기/ })).toBeDisabled();
  });

  it('사진을 고르면 미리보기를 보여 주고, 이름·메모와 함께 보낸다', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const prepare = vi.fn().mockResolvedValue(prepared);
    render(<PhotoUpload disabled={false} onSubmit={onSubmit} prepare={prepare} />);

    await user.upload(screen.getByLabelText(/사진 고르기/), new File(['img'], 'shop.jpg', { type: 'image/jpeg' }));
    expect(await screen.findByRole('img', { name: '고른 가게 사진 미리보기' })).toHaveAttribute('src', prepared.dataUrl);

    await user.type(screen.getByLabelText(/가게 이름/), '행복 떡볶이');
    await user.type(screen.getByLabelText(/가게 주변 메모/), '학교 앞이에요');
    await user.click(screen.getByRole('button', { name: /사진으로 SWOT 알아보기/ }));

    expect(onSubmit).toHaveBeenCalledWith({
      imageBase64: 'QUJD',
      mimeType: 'image/jpeg',
      storeName: '행복 떡볶이',
      note: '학교 앞이에요',
    });
  });

  it('준비할 수 없는 사진이면 안내하고 보내지 않는다', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const prepare = vi.fn().mockRejectedValue(new ImagePrepareError('사진 파일만 넣을 수 있어요 🖼️'));
    render(<PhotoUpload disabled={false} onSubmit={onSubmit} prepare={prepare} />);

    await user.upload(screen.getByLabelText(/사진 고르기/), new File(['img'], 'shop.jpg', { type: 'image/jpeg' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('사진 파일만 넣을 수 있어요');
    expect(screen.getByRole('button', { name: /사진으로 SWOT 알아보기/ })).toBeDisabled();
  });
});
