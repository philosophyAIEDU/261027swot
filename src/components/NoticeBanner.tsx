import type { ReactNode } from 'react';

interface NoticeBannerProps {
  children?: ReactNode;
}

export function NoticeBanner({ children }: NoticeBannerProps) {
  return (
    <p className="rounded-2xl bg-notice-bg px-4 py-2 text-base text-notice-ink">
      <span aria-hidden="true">ℹ️ </span>
      {children ?? 'AI가 만든 내용이라 틀릴 수도 있어요. 중요한 건 어른과 함께 확인해요.'}
    </p>
  );
}
