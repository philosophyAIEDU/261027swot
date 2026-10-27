import { useCallback, useEffect, useState } from 'react';

// 글자 크기·다크 모드는 이 기기에서만 쓰는 편의 설정이라 localStorage에 둔다.
// 저장이 막힌 환경에서도 앱은 기본값으로 정상 동작한다.

export type FontSize = 'normal' | 'large' | 'xlarge';
export type Theme = 'light' | 'dark';

const FONT_SIZES: FontSize[] = ['normal', 'large', 'xlarge'];
const PREF_KEY = 'swot-kids:preferences';

interface Preferences {
  fontSize: FontSize;
  theme: Theme;
}

function systemTheme(): Theme {
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

function loadPreferences(): Preferences {
  const fallback: Preferences = { fontSize: 'normal', theme: systemTheme() };
  try {
    const raw = window.localStorage.getItem(PREF_KEY);
    if (!raw) return fallback;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return fallback;
    const record = parsed as Record<string, unknown>;
    const fontSize = FONT_SIZES.find((size) => size === record.fontSize) ?? fallback.fontSize;
    const theme: Theme = record.theme === 'dark' || record.theme === 'light' ? record.theme : fallback.theme;
    return { fontSize, theme };
  } catch {
    return fallback;
  }
}

export interface UsePreferences {
  fontSize: FontSize;
  theme: Theme;
  canGrow: boolean;
  canShrink: boolean;
  growFont: () => void;
  shrinkFont: () => void;
  toggleTheme: () => void;
}

export function usePreferences(): UsePreferences {
  const [prefs, setPrefs] = useState<Preferences>(loadPreferences);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.fontSize = prefs.fontSize;
    root.classList.toggle('dark', prefs.theme === 'dark');
    try {
      window.localStorage.setItem(PREF_KEY, JSON.stringify(prefs));
    } catch {
      // 저장하지 못해도 이번 방문 동안은 그대로 동작한다.
    }
  }, [prefs]);

  const index = FONT_SIZES.indexOf(prefs.fontSize);

  const growFont = useCallback(() => {
    setPrefs((prev) => {
      const next = FONT_SIZES[FONT_SIZES.indexOf(prev.fontSize) + 1];
      return next ? { ...prev, fontSize: next } : prev;
    });
  }, []);

  const shrinkFont = useCallback(() => {
    setPrefs((prev) => {
      const next = FONT_SIZES[FONT_SIZES.indexOf(prev.fontSize) - 1];
      return next ? { ...prev, fontSize: next } : prev;
    });
  }, []);

  const toggleTheme = useCallback(() => {
    setPrefs((prev) => ({ ...prev, theme: prev.theme === 'dark' ? 'light' : 'dark' }));
  }, []);

  return {
    fontSize: prefs.fontSize,
    theme: prefs.theme,
    canGrow: index < FONT_SIZES.length - 1,
    canShrink: index > 0,
    growFont,
    shrinkFont,
    toggleTheme,
  };
}
