import { Easing, Img, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { IMAGE_SIZES } from '../data/imageSizes';
import type { Rect } from '../data/scenes';

interface FocusImageProps {
  image: string;
  /** 이미지가 들어갈 칸의 크기(px) */
  width: number;
  height: number;
  focus?: Rect;
  blur?: Rect[];
  /** 이 장면의 전체 길이(프레임). 확대 시점을 길이에 맞춰 잡는다. */
  duration: number;
  accentInk: string;
}

const MAX_ZOOM = 2.4;

function clampCenter(center: number, imageSize: number, viewSize: number, scale: number): number {
  const half = viewSize / 2 / scale;
  if (imageSize * scale <= viewSize) return imageSize / 2;
  return Math.min(Math.max(center, half), imageSize - half);
}

// 캡처 전체를 먼저 보여 준 뒤, 중요한 부분으로 천천히 확대하고 주변을 살짝 어둡게 해 강조한다.
export function FocusImage({ image, width, height, focus, blur = [], duration, accentInk }: FocusImageProps) {
  const frame = useCurrentFrame();
  const size = IMAGE_SIZES[image];
  if (!size) throw new Error(`이미지 크기를 모르는 파일: ${image}`);
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

  // 확대가 없는 장면은 아주 느리게 다가가는 효과(켄 번즈)만 준다.
  const drift = focus ? 1 : interpolate(frame, [0, duration], [1, 1.05]);
  const scale = (baseScale + (targetScale - baseScale) * progress) * drift;
  const centerX = clampCenter(iw / 2 + (targetX - iw / 2) * progress, iw, viewW, scale);
  const centerY = clampCenter(ih / 2 + (targetY - ih / 2) * progress, ih, viewH, scale);

  const toViewX = (x: number) => pad + viewW / 2 + (x - centerX) * scale;
  const toViewY = (y: number) => pad + viewH / 2 + (y - centerY) * scale;

  const highlight = focus
    ? interpolate(frame, [zoomEnd - 6, zoomEnd + 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : 0;
  const pulse = 0.5 + 0.5 * Math.sin(frame / 9);

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#F7F6FB', overflow: 'hidden' }}>
      <Img
        src={staticFile(`shots/${image}`)}
        style={{
          position: 'absolute',
          left: toViewX(0),
          top: toViewY(0),
          width: iw * scale,
          height: ih * scale,
          borderRadius: 10,
          boxShadow: '0 6px 24px rgba(43,38,69,0.10)',
        }}
      />
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
