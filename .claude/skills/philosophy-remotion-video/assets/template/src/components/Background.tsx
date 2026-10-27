import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { COLORS } from '../theme';

interface BackgroundProps {
  /** 이 장면의 대표 파스텔 색(가장 큰 방울에 쓰인다) */
  accent?: string;
}

// 천천히 떠다니는 파스텔 방울 + 은은한 점 무늬. 영상 전체에 깔리는 바탕.
const BLOBS = [
  { color: COLORS.lavender, size: 900, x: -120, y: -200, dx: 60, dy: 40, speed: 0.004 },
  { color: COLORS.mint, size: 760, x: 1300, y: 520, dx: -70, dy: 50, speed: 0.005 },
  { color: COLORS.peach, size: 620, x: 980, y: -260, dx: 50, dy: 70, speed: 0.0035 },
  { color: COLORS.sky, size: 700, x: -200, y: 620, dx: 80, dy: -40, speed: 0.0045 },
  { color: COLORS.butter, size: 420, x: 640, y: 760, dx: -40, dy: -50, speed: 0.006 },
];

export function Background({ accent }: BackgroundProps) {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: COLORS.paper, overflow: 'hidden' }}>
      {BLOBS.map((blob, index) => {
        const t = frame * blob.speed + index;
        const color = index === 0 && accent ? accent : blob.color;
        return (
          <div
            key={index}
            style={{
              position: 'absolute',
              width: blob.size,
              height: blob.size,
              left: blob.x + Math.sin(t) * blob.dx,
              top: blob.y + Math.cos(t * 1.3) * blob.dy,
              borderRadius: '50%',
              background: color,
              filter: 'blur(90px)',
              opacity: 0.85,
            }}
          />
        );
      })}
      <AbsoluteFill
        style={{
          backgroundImage: 'radial-gradient(rgba(43,38,69,0.07) 1.6px, transparent 1.6px)',
          backgroundSize: '34px 34px',
          backgroundPosition: `${interpolate(frame, [0, 3000], [0, 34])}px 0px`,
        }}
      />
    </AbsoluteFill>
  );
}
