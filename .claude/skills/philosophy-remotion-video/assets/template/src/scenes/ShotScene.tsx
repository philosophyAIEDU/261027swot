import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { Background } from '../components/Background';
import { FocusMedia, type MediaSource } from '../components/FocusMedia';
import { SidePanel } from '../components/SidePanel';
import { TopBar } from '../components/TopBar';
import { WINDOW_HEADER, WindowFrame } from '../components/WindowFrame';
import { CHAPTERS, type Scene } from '../data/scenes';

type ShotLike = Extract<Scene, { kind: 'shot' | 'clip' }>;

const WIN = { left: 70, top: 130, width: 1220, height: 880 };

/** 캡처(shot)와 화면 녹화(clip)는 같은 틀: 왼쪽 앱 창 + 오른쪽 핵심 문구 */
export function ShotScene({ scene, duration }: { scene: ShotLike; duration: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const info = CHAPTERS[scene.chapter - 1]!;
  const enter = spring({ frame, fps, config: { damping: 15, stiffness: 110 } });
  const source: MediaSource =
    scene.kind === 'shot'
      ? { type: 'image', file: scene.image }
      : { type: 'video', file: scene.video, from: scene.from, to: scene.to, rate: scene.rate, withSound: scene.withSound };
  return (
    <AbsoluteFill>
      <Background accent={info.soft} />
      <TopBar chapter={scene.chapter} />
      <div
        style={{
          position: 'absolute',
          left: WIN.left,
          top: WIN.top,
          opacity: enter,
          transform: `translateY(${interpolate(enter, [0, 1], [50, 0])}px) scale(${interpolate(enter, [0, 1], [0.95, 1])})`,
        }}
      >
        <WindowFrame app={scene.app} width={WIN.width} height={WIN.height} accent={info.soft}>
          <FocusMedia
            source={source}
            width={WIN.width}
            height={WIN.height - WINDOW_HEADER}
            focus={scene.focus}
            blur={scene.blur}
            duration={duration}
            accentInk={info.ink}
          />
        </WindowFrame>
      </div>
      <SidePanel chapter={scene.chapter} round={scene.round} points={scene.points} duration={duration} />
    </AbsoluteFill>
  );
}
