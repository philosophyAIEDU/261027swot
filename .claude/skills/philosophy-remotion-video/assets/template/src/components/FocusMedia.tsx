import type { CSSProperties } from 'react';
import { Easing, Freeze, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { MEDIA } from '../data/media';
import type { Rect } from '../data/scenes';

export type MediaSource =
  | { type: 'image'; file: string }
  | { type: 'video'; file: string; from?: number; to?: number; rate?: number; withSound?: boolean };

interface FocusMediaProps {
  source: MediaSource;
  /** 그림이 들어갈 칸의 크기(px) */
  width: number;
  height: number;
  focus?: Rect;
  blur?: Rect[];
  /** 이 장면의 길이(프레임). 확대 시점을 길이에 맞춰 잡는다. */
  duration: number;
  accentInk: string;
}

const MAX_ZOOM = 2.4;

function clampCenter(center: number, size: number, view: number, scale: number): number {
  const half = view / 2 / scale;
  if (size * scale <= view) return size / 2;
  return Math.min(Math.max(center, half), size - half);
}

/** 영상: 원본 구간만 재생하고, 장면이 더 길면 마지막 화면에서 멈춰 있는다. */
function ClipVideo({ source, style }: { source: Extract<MediaSource, { type: 'video' }>; style: CSSProperties }) {
  const { fps } = useVideoConfig();
  const info = MEDIA[`clips/${source.file}`];
  const rate = source.rate ?? 1;
  const from = source.from ?? 0;
  const to = source.to ?? info?.duration ?? from + 5;
  const playFrames = Math.max(1, Math.floor(((to - from) / rate) * fps));
  const video = (
    <OffthreadVideo
      src={staticFile(`clips/${source.file}`)}
      trimBefore={Math.round(from * fps)}
      playbackRate={rate}
      muted={!source.withSound}
      style={style}
    />
  );
  return (
    <>
      <Sequence durationInFrames={playFrames} layout="none">
        {video}
      </Sequence>
      <Sequence from={playFrames} layout="none">
        <Freeze frame={playFrames - 1}>{video}</Freeze>
      </Sequence>
    </>
  );
}

// 캡처·영상 전체를 먼저 보여 준 뒤, 중요한 부분으로 천천히 확대하고 주변을 살짝 어둡게 해 강조한다.
export function FocusMedia({ source, width, height, focus, blur = [], duration, accentInk }: FocusMediaProps) {
  const frame = useCurrentFrame();
  const key = `${source.type === 'image' ? 'shots' : 'clips'}/${source.file}`;
  const size = MEDIA[key];
  if (!size) throw new Error(`크기를 모르는 파일: ${key} — python3 scripts/media-sizes.py 를 실행하세요`);
  const { w: iw, h: ih } = size;

  const pad = 28;
  const viewW = width - pad * 2;
  const viewH = height - pad * 2;
  const baseScale = Math.min(viewW / iw, viewH / ih);

  // 확대는 장면의 22%~42% 사이에 일어나고, 그 뒤로는 그대로 머문다.
  const zoomStart = Math.round(duration * 0.22);
  const zoomEnd = Math.max(zoomStart + 18, Math.round(duration * 0.42));
  const progress = focus
    ? interpolate(frame, [zoomStart, zoomEnd], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: Easing.inOut(Easing.cubic),
      })
    : 0;

  let targetScale = baseScale;
  let targetX = iw / 2;
  let targetY = ih / 2;
  if (focus) {
    const fit = Math.min(viewW / (focus.w * iw), viewH / (focus.h * ih)) * 0.9;
    targetScale = Math.min(Math.max(fit, baseScale), baseScale * MAX_ZOOM);
    targetX = (focus.x + focus.w / 2) * iw;
    targetY = (focus.y + focus.h / 2) * ih;
  }

  // 확대가 없는 그림은 아주 느리게 다가가는 효과(켄 번즈)만 준다. 영상은 움직이므로 그대로 둔다.
  const drift = focus || source.type === 'video' ? 1 : interpolate(frame, [0, duration], [1, 1.05]);
  const scale = (baseScale + (targetScale - baseScale) * progress) * drift;
  const centerX = clampCenter(iw / 2 + (targetX - iw / 2) * progress, iw, viewW, scale);
  const centerY = clampCenter(ih / 2 + (targetY - ih / 2) * progress, ih, viewH, scale);
  const toViewX = (x: number) => pad + viewW / 2 + (x - centerX) * scale;
  const toViewY = (y: number) => pad + viewH / 2 + (y - centerY) * scale;

  const highlight = focus
    ? interpolate(frame, [zoomEnd - 6, zoomEnd + 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : 0;
  const pulse = 0.5 + 0.5 * Math.sin(frame / 9);

  const mediaStyle: CSSProperties = {
    position: 'absolute',
    left: toViewX(0),
    top: toViewY(0),
    width: iw * scale,
    height: ih * scale,
    borderRadius: 10,
    boxShadow: '0 6px 24px rgba(43,38,69,0.10)',
  };

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#F7F6FB', overflow: 'hidden' }}>
      {source.type === 'image' ? (
        <Img src={staticFile(`shots/${source.file}`)} style={mediaStyle} />
      ) : (
        <ClipVideo source={source} style={mediaStyle} />
      )}
      {blur.map((rect, index) => (
        <div
          key={index}
          style={{
            position: 'absolute',
            left: toViewX(rect.x * iw),
            top: toViewY(rect.y * ih),
            width: rect.w * iw * scale,
            height: rect.h * ih * scale,
            backdropFilter: 'blur(9px)',
            background: 'rgba(255,255,255,0.35)',
            borderRadius: 8,
          }}
        />
      ))}
      {focus && highlight > 0 && (
        <div
          style={{
            position: 'absolute',
            left: toViewX(focus.x * iw) - 8,
            top: toViewY(focus.y * ih) - 8,
            width: focus.w * iw * scale + 16,
            height: focus.h * ih * scale + 16,
            borderRadius: 18,
            border: `5px solid ${accentInk}`,
            opacity: highlight,
            boxShadow: `0 0 0 9999px rgba(43,38,69,${0.22 * highlight}), 0 0 ${18 + pulse * 18}px ${accentInk}`,
            pointerEvents: 'none',
          }}
        />
      )}
    </div>
  );
}
