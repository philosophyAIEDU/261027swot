import { useEffect, useId, useRef, useState } from 'react';
import type { UsePreferences } from '../hooks/usePreferences';
import { Button } from './Button';

interface HeaderProps {
  hasKey: boolean;
  preferences: UsePreferences;
  onHome: () => void;
  onChangeKey: () => void;
  onClearKey: () => void;
}

export function Header({ hasKey, preferences, onHome, onChangeKey, onClearKey }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        toggleRef.current?.focus();
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [menuOpen]);

  const choose = (action: () => void) => {
    setMenuOpen(false);
    action();
  };

  return (
    <header className="border-b-2 border-line bg-surface print:hidden">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-2">
        <button
          type="button"
          onClick={onHome}
          className="min-h-12 rounded-2xl px-2 text-left text-xl font-extrabold sm:text-2xl"
        >
          <span aria-hidden="true">🧭 </span>SWOT 탐험대
        </button>

        <div className="flex flex-wrap items-center gap-1">
          <Button
            variant="ghost"
            onClick={preferences.shrinkFont}
            disabled={!preferences.canShrink}
            aria-label="글자 작게"
            title="글자 작게"
          >
            가<span className="text-sm">−</span>
          </Button>
          <Button
            variant="ghost"
            onClick={preferences.growFont}
            disabled={!preferences.canGrow}
            aria-label="글자 크게"
            title="글자 크게"
          >
            가<span className="text-lg">+</span>
          </Button>
          <Button
            variant="ghost"
            onClick={preferences.toggleTheme}
            aria-pressed={preferences.theme === 'dark'}
            aria-label="어두운 화면"
            title="어두운 화면 켜기/끄기"
          >
            <span aria-hidden="true">{preferences.theme === 'dark' ? '🌙' : '☀️'}</span>
          </Button>

          {hasKey && (
            <div ref={wrapperRef} className="relative">
              <Button
                ref={toggleRef}
                variant="secondary"
                onClick={() => setMenuOpen((open) => !open)}
                aria-expanded={menuOpen}
                aria-controls={menuId}
              >
                <span aria-hidden="true">🔑</span> 키 바꾸기 / 지우기
              </Button>
              {menuOpen && (
                <div
                  id={menuId}
                  className="absolute right-0 z-20 mt-2 flex w-56 flex-col gap-1 rounded-2xl border-2 border-line bg-surface p-2 shadow-lg"
                >
                  <Button variant="ghost" className="justify-start" onClick={() => choose(onChangeKey)}>
                    ✏️ 키 바꾸기
                  </Button>
                  <Button variant="ghost" className="justify-start" onClick={() => choose(onClearKey)}>
                    🗑️ 키 지우기
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
