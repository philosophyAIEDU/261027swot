import type { ReactNode } from 'react';

interface LayoutProps {
  header: ReactNode;
  children: ReactNode;
}

export function Layout({ header, children }: LayoutProps) {
  return (
    <div className="min-h-screen">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-surface focus:p-3"
      >
        본문으로 건너뛰기
      </a>
      {header}
      <main id="main" tabIndex={-1} className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 print:max-w-none print:p-0">
        {children}
      </main>
      <footer className="mx-auto max-w-6xl px-4 pb-8 text-center text-base text-ink-soft print:hidden">
        광고도, 회원가입도, 기록 수집도 없는 어린이용 학습 도구예요.
      </footer>
    </div>
  );
}
