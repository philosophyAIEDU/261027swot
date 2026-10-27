import type { CSSProperties } from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

interface StickerProps {
  emoji: string;
  size: number;
  x: number;
  y: number;
  delay?: number;
  rotate?: number;
  style?: CSSProperties;
}

// 톡 튀어나와서 둥실둥실 떠 있는 이모지 스티커
export function Sticker({ emoji, size, x, y, delay = 0, rotate = 0, style }: StickerProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: frame - delay, fps, config: { damping: 11, stiffness: 140 } });
  const float = Math.sin((frame + delay * 3) / 22) * 10;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y + float,
        fontSize: size,
        lineHeight: 1,
        transform: `scale(${pop}) rotate(${rotate + interpolate(pop, [0, 1], [-25, 0])}deg)`,
        filter: 'drop-shadow(0 12px 18px rgba(43,38,69,0.18))',
        ...style,
      }}
    >
      {emoji}
    </div>
  );
}
