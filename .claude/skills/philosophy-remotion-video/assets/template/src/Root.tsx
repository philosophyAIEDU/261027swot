import { getAudioDurationInSeconds } from '@remotion/media-utils';
import { Composition, staticFile } from 'remotion';
import { MEDIA } from './data/media';
import { FPS, SCENES, TRANSITION_FRAMES, sceneFrames } from './data/scenes';
import { VOICE_FILES } from './data/voice';
import { MainVideo, type VideoProps } from './Video';

// 장면 길이: 녹음이 있으면 녹음 길이, 없으면 대본 길이(영상 장면은 영상 길이 이상).
async function computeFrames(): Promise<number[]> {
  return Promise.all(
    SCENES.map(async (scene) => {
      const media = scene.kind === 'clip' ? MEDIA[`clips/${scene.video}`]?.duration : undefined;
      const file = VOICE_FILES[scene.id];
      const voice = file ? await getAudioDurationInSeconds(staticFile(file)) : undefined;
      return sceneFrames(scene, voice, media);
    }),
  );
}

export function Root() {
  return (
    <Composition
      id="Main"
      component={MainVideo}
      width={1920}
      height={1080}
      fps={FPS}
      durationInFrames={300}
      defaultProps={{ showSubtitles: false, sceneFrames: [] } satisfies VideoProps}
      calculateMetadata={async ({ props }) => {
        const frames = await computeFrames();
        const total = frames.reduce((sum, value) => sum + value, 0) - TRANSITION_FRAMES * (frames.length - 1);
        return { durationInFrames: total, props: { ...props, sceneFrames: frames } };
      }}
    />
  );
}
