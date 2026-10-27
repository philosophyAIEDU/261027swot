import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { CHAPTERS } from '../data/scenes';
import { COLORS, FONT_BODY, FONT_TITLE } from '../theme';

interface SidePanelProps {
  chapter: number;
  /** 단계 안의 작은 소제목(예: '다시 요청 ① 개념 설명') */
  round?: string;
  points: string[];
  duration: number;
}

// 화면 오른쪽: 지금 단계 + 핵심 문구 카드(하나씩 차례로 등장)
export function SidePanel({ chapter, round, points, duration }: SidePanelProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const info = CHAPTERS[chapter - 1]!;
  const enter = spring({ frame: frame - 4, fps, config: { damping: 16 } });

  // 핵심 문구는 장면 앞부분에 고르게 나눠 등장시킨다.
  const firstAt = 14;
  const gap = Math.max(18, Math.round((duration * 0.55) / Math.max(points.length, 1)));

  return (
    <div
      style={{
        position: 'absolute',
        left: 1330,
        top: 150,
        width: 520,
        display: 'flex',
        flexDirection: 'column',
        gap: 22,
        opacity: enter,
        transform: `translateX(${interpolate(enter, [0, 1], [60, 0])}px)`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div
          style={{
            fontFamily: FONT_BODY,
            fontWeight: 900,
            fontSize: 24,
            letterSpacing: 2,
            color: '#FFFFFF',
            background: info.ink,
            padding: '8px 18px',
            borderRadius: 999,
          }}
        >
          STEP {info.n}
        </div>
        <div style={{ fontSize: 44 }}>{info.emoji}</div>
      </div>
      <div style={{ fontFamily: FONT_TITLE, fontSize: 54, lineHeight: 1.2, color: COLORS.ink }}>{info.title}</div>
      {round && (
        <div
          style={{
            alignSelf: 'flex-start',
            fontFamily: FONT_BODY,
            fontWeight: 800,
            fontSize: 26,
            color: info.ink,
            background: info.soft,
            border: `3px dashed ${info.ink}`,
            padding: '8px 18px',
            borderRadius: 16,
          }}
        >
          {round}
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginTop: 10 }}>
        {points.map((point, index) => {
          const appear = spring({ frame: frame - (firstAt + index * gap), fps, config: { damping: 14, stiffness: 120 } });
          return (
            <div
              key={point}
              style={{
                display: 'flex',
                gap: 16,
                alignItems: 'flex-start',
                background: 'rgba(255,255,255,0.88)',
                borderRadius: 24,
                padding: '20px 22px',
                boxShadow: `0 14px 34px ${COLORS.shadow}`,
                opacity: appear,
                transform: `translateY(${interpolate(appear, [0, 1], [30, 0])}px) scale(${interpolate(appear, [0, 1], [0.92, 1])})`,
              }}
            >
              <div
                style={{
                  flexShrink: 0,
                  width: 46,
                  height: 46,
                  borderRadius: '50%',
                  background: info.soft,
                  color: info.ink,
                  fontFamily: FONT_TITLE,
                  fontSize: 30,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {index + 1}
              </div>
              <div style={{ fontFamily: FONT_BODY, fontWeight: 700, fontSize: 33, lineHeight: 1.4, color: COLORS.ink }}>
                {point}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
