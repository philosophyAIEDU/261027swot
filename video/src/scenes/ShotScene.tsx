import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { Background } from '../components/Background';
import { FocusImage } from '../components/FocusImage';
import { SidePanel } from '../components/SidePanel';
import { TopBar } from '../components/TopBar';
import { WINDOW_HEADER, WindowFrame } from '../components/WindowFrame';
import { CHAPTERS, type Scene } from '../data/scenes';

type ShotSceneProps = { scene: Extract<Scene, { kind: 'shot' }>; duration: number };

const WIN = { left: 70, top: 130, width: 1220, height: 880 };

export function ShotScene({ scene, duration }: ShotSceneProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const info = CHAPTERS[scene.chapter - 1]!;
  const enter = spring({ frame, fps, config: { damping: 15, stiffness: 110 } });
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
          <FocusImage
            image={scene.image}
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
