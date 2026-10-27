import type { ReactNode } from 'react';
import { APPS } from '../data/scenes';
import { COLORS, FONT_BODY } from '../theme';

interface WindowFrameProps {
  app: string;
  width: number;
  height: number;
  accent: string;
  children: ReactNode;
}

export const WINDOW_HEADER = 58;

// 캡처를 담는 앱 창 모양 액자. 어떤 프로그램 화면인지 이름과 주소로 알려 준다.
export function WindowFrame({ app, width, height, accent, children }: WindowFrameProps) {
  const label = APPS[app] ?? { name: app, url: '', icon: '🪟' };
  return (
    <div
      style={{
        width,
        height,
        borderRadius: 30,
        background: '#FFFFFF',
        boxShadow: `0 30px 80px ${COLORS.shadow}, 0 0 0 6px rgba(255,255,255,0.7)`,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          height: WINDOW_HEADER,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          padding: '0 22px',
          background: accent,
          fontFamily: FONT_BODY,
        }}
      >
        <div style={{ display: 'flex', gap: 9 }}>
          {['#FF9AA2', '#FFD38A', '#9EE6B8'].map((color) => (
            <div key={color} style={{ width: 16, height: 16, borderRadius: '50%', background: color }} />
          ))}
        </div>
        <div style={{ fontWeight: 800, fontSize: 22, color: COLORS.ink, display: 'flex', gap: 8, alignItems: 'center' }}>
          <span>{label.icon}</span>
          {label.name}
        </div>
        <div
          style={{
            flex: 1,
            height: 34,
            borderRadius: 999,
            background: 'rgba(255,255,255,0.75)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 18px',
            fontSize: 19,
            color: COLORS.inkSoft,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
          }}
        >
          {label.url}
        </div>
      </div>
      <div style={{ position: 'relative', flex: 1, background: '#FFFFFF', overflow: 'hidden' }}>{children}</div>
    </div>
  );
}
