import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { CHAPTERS } from '../data/scenes';
import { COLORS, FONT_BODY, FONT_TITLE } from '../theme';

interface TopBarProps {
  chapter: number;
}

// 위쪽 줄: 시리즈 이름 + 지금 몇 단계인지 보여 주는 진행 표시
export function TopBar({ chapter }: TopBarProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 18 } });
  return (
    <div
      style={{
        position: 'absolute',
        left: 70,
        right: 70,
        top: 38,
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        opacity: enter,
        transform: `translateY(${interpolate(enter, [0, 1], [-20, 0])}px)`,
      }}
    >
      <div
        style={{
          fontFamily: FONT_TITLE,
          fontSize: 30,
          color: COLORS.ink,
          background: 'rgba(255,255,255,0.75)',
          padding: '10px 26px',
          borderRadius: 999,
          boxShadow: `0 8px 24px ${COLORS.shadow}`,
        }}
      >
        AI 시대의 과제 · 실전편
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        {CHAPTERS.map((item) => {
          const active = item.n === chapter;
          const done = item.n < chapter;
          return (
            <div
              key={item.n}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: active ? '10px 22px' : '10px 16px',
                borderRadius: 999,
                fontFamily: FONT_BODY,
                fontWeight: 700,
                fontSize: 24,
                color: active ? item.ink : COLORS.inkSoft,
                background: active ? item.soft : 'rgba(255,255,255,0.6)',
                border: active ? `3px solid ${item.ink}` : '3px solid transparent',
                boxShadow: active ? `0 8px 22px ${COLORS.shadow}` : 'none',
              }}
            >
              <span>{done ? '✅' : item.emoji}</span>
              {active ? <span>{item.n}. {item.title}</span> : <span>{item.n}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
