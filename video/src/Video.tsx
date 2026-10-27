import { linearTiming, TransitionSeries } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import { slide } from '@remotion/transitions/slide';
import { Fragment } from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile } from 'remotion';
import { Subtitle } from './components/Subtitle';
import { SCENES, TRANSITION_FRAMES, type Scene } from './data/scenes';
import { VOICE_FILES } from './data/voice';
import { PhotosScene } from './scenes/PhotosScene';
import { ShotScene } from './scenes/ShotScene';
import {
  ChapterScene,
  FlowScene,
  LessonsScene,
  OutroScene,
  TaskScene,
  TeacherScene,
  TitleScene,
} from './scenes/StoryScenes';
import { loadFonts } from './theme';

loadFonts();

export type VideoProps = {
  /** 대본을 자막으로 보여 줄지 */
  showSubtitles: boolean;
  /** 장면마다의 길이(프레임). calculateMetadata가 채운다. */
  sceneFrames: number[];
};

/** 목소리는 장면이 바뀌는 전환이 반쯤 지난 뒤부터 나오게 한다. */
const VOICE_DELAY = Math.round(TRANSITION_FRAMES / 2);

function SceneBody({ scene, duration }: { scene: Scene; duration: number }) {
  switch (scene.kind) {
    case 'title':
      return <TitleScene />;
    case 'task':
      return <TaskScene />;
    case 'flow':
      return <FlowScene duration={duration} />;
    case 'chapter':
      return <ChapterScene chapterNumber={scene.chapter} />;
    case 'shot':
      return <ShotScene scene={scene} duration={duration} />;
    case 'photos':
      return <PhotosScene scene={scene} duration={duration} />;
    case 'lessons':
      return <LessonsScene duration={duration} />;
    case 'teacher':
      return <TeacherScene duration={duration} />;
    case 'outro':
      return <OutroScene />;
  }
}

export function AiAssignmentVideo({ showSubtitles, sceneFrames }: VideoProps) {
  return (
    <AbsoluteFill style={{ background: '#FFFDFB', wordBreak: 'keep-all', overflowWrap: 'break-word' }}>
      <TransitionSeries>
        {SCENES.map((scene, index) => {
          const duration = sceneFrames[index] ?? 150;
          const voice = VOICE_FILES[scene.id];
          const next = SCENES[index + 1];
          return (
            <Fragment key={scene.id}>
              <TransitionSeries.Sequence durationInFrames={duration}>
                <SceneBody scene={scene} duration={duration} />
                {voice && (
                  <Sequence from={VOICE_DELAY}>
                    <Audio src={staticFile(voice)} />
                  </Sequence>
                )}
                {showSubtitles && (
                  <Subtitle script={scene.script} start={VOICE_DELAY} end={duration - TRANSITION_FRAMES} />
                )}
              </TransitionSeries.Sequence>
              {next && (
                <TransitionSeries.Transition
                  presentation={next.kind === 'chapter' ? slide({ direction: 'from-right' }) : fade()}
                  timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })}
                />
              )}
            </Fragment>
          );
        })}
      </TransitionSeries>
    </AbsoluteFill>
  );
}
