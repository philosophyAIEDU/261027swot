import { getAudioDurationInSeconds } from '@remotion/media-utils';
import { Composition, staticFile } from 'remotion';
import { FPS, SCENES, TRANSITION_FRAMES, sceneFrames } from './data/scenes';
import { VOICE_FILES } from './data/voice';
import { AiAssignmentVideo, type VideoProps } from './Video';

// 녹음 파일이 있는 장면은 녹음 길이로, 없는 장면은 대본 길이로 장면 길이를 정한다.
async function computeFrames(): Promise<number[]> {
  return Promise.all(
    SCENES.map(async (scene) => {
      const file = VOICE_FILES[scene.id];
      if (!file) return sceneFrames(scene);
      const seconds = await getAudioDurationInSeconds(staticFile(file));
      return sceneFrames(scene, seconds);
    }),
  );
}

export function Root() {
  return (
    <Composition
      id="AiAssignment"
      component={AiAssignmentVideo}
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
