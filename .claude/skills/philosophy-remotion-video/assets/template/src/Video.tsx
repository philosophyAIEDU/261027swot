import { linearTiming, TransitionSeries } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import { slide } from '@remotion/transitions/slide';
import { Fragment } from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile } from 'remotion';
import { Subtitle } from './components/Subtitle';
import { CAPTIONS } from './data/captions';
import { SCENES, TRANSITION_FRAMES, type Scene } from './data/scenes';
import { VOICE_FILES } from './data/voice';
import { PhotosScene } from './scenes/PhotosScene';
import { ShotScene } from './scenes/ShotScene';
import { BriefScene, CardsScene, ChapterScene, FlowScene, OutroScene, TitleScene } from './scenes/StoryScenes';
import { loadFonts } from './theme';

loadFonts();

export type VideoProps = {
  /** 자막을 보여 줄지(자막 파일이 있으면 그 시각대로, 없으면 대본으로) */
  showSubtitles: boolean;
  /** 장면마다의 길이(프레임). calculateMetadata가 채운다. */
  sceneFrames: number[];
};

/** 목소리는 장면 전환이 반쯤 지난 뒤부터 나오게 한다. */
export const VOICE_DELAY = Math.round(TRANSITION_FRAMES / 2);

function SceneBody({ scene, duration }: { scene: Scene; duration: number }) {
  switch (scene.kind) {
    case 'title':
      return <TitleScene scene={scene} />;
    case 'brief':
      return <BriefScene scene={scene} />;
    case 'flow':
      return <FlowScene scene={scene} duration={duration} />;
    case 'chapter':
      return <ChapterScene chapterNumber={scene.chapter} />;
    case 'shot':
    case 'clip':
      return <ShotScene scene={scene} duration={duration} />;
    case 'photos':
      return <PhotosScene scene={scene} duration={duration} />;
    case 'cards':
      return <CardsScene scene={scene} duration={duration} />;
    case 'outro':
      return <OutroScene scene={scene} />;
  }
}

export function MainVideo({ showSubtitles, sceneFrames }: VideoProps) {
  return (
    // keep-all: 한국어 낱말이 줄 끝에서 쪼개지지 않게 한다("다듬/기" 방지).
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
                  <Subtitle
                    script={scene.script}
                    // 원본 소리를 쓰는 영상은 장면 첫 프레임부터 소리가 나오고, 녹음은 VOICE_DELAY 뒤에 나온다.
                    start={scene.kind === 'clip' && scene.withSound ? 0 : VOICE_DELAY}
                    end={duration - TRANSITION_FRAMES}
                    cues={CAPTIONS[scene.id]}
                  />
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
