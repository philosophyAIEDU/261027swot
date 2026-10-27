import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { Background } from '../components/Background';
import { SidePanel } from '../components/SidePanel';
import { TopBar } from '../components/TopBar';
import { CHAPTERS, type Scene } from '../data/scenes';
import { COLORS, FONT_TITLE } from '../theme';

type PhotosSceneProps = { scene: Extract<Scene, { kind: 'photos' }>; duration: number };

// 테스트용 사진 두 장을 폴라로이드처럼 나란히
export function PhotosScene({ scene, duration }: PhotosSceneProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const info = CHAPTERS[scene.chapter - 1]!;
  return (
    <AbsoluteFill>
      <Background accent={info.soft} />
      <TopBar chapter={scene.chapter} />
      {scene.images.map((image, index) => {
        const appear = spring({ frame: frame - index * 10, fps, config: { damping: 13 } });
        const rotate = index === 0 ? -4 : 3;
        return (
          <div
            key={image}
            style={{
              position: 'absolute',
              left: 90 + index * 600,
              top: 290 + index * 70,
              width: 580,
              padding: '22px 22px 18px',
              background: '#FFFFFF',
              borderRadius: 20,
              boxShadow: `0 30px 70px ${COLORS.shadow}`,
              opacity: appear,
              transform: `translateY(${interpolate(appear, [0, 1], [80, 0])}px) rotate(${rotate * appear}deg) scale(${1 + Math.sin(frame / 40 + index) * 0.006})`,
            }}
          >
            <Img src={staticFile(`shots/${image}`)} style={{ width: '100%', borderRadius: 12, display: 'block' }} />
            <div style={{ fontFamily: FONT_TITLE, fontSize: 36, color: COLORS.ink, textAlign: 'center', marginTop: 14 }}>
              {scene.captions[index]}
            </div>
          </div>
        );
      })}
      <SidePanel chapter={scene.chapter} round={scene.round} points={scene.points} duration={duration} />
    </AbsoluteFill>
  );
}
