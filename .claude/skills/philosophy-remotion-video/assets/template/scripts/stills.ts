// 장면마다 점검용 정지 화면을 한 장씩 만든다: node scripts/stills.ts [장면id ...]
// 각 장면의 60% 지점(확대·핵심 문구가 다 나온 뒤)을 out/stills/<id>.png 로 저장한다.
// 녹음이 연결돼 있으면 녹음 길이를 반영해 장면 위치를 계산한다.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { MEDIA } from '../src/data/media.ts';
import { SCENES, TRANSITION_FRAMES, sceneFrames } from '../src/data/scenes.ts';
import { VOICE_FILES } from '../src/data/voice.ts';

const wanted = new Set(process.argv.slice(2));
const publicDir = new URL('../public/', import.meta.url);

function voiceSeconds(id: string): number | undefined {
  const file = VOICE_FILES[id];
  if (!file) return undefined;
  const path = new URL(file, publicDir).pathname;
  if (!existsSync(path)) return undefined;
  return Number(String(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path])).trim());
}

mkdirSync(new URL('../out/stills/', import.meta.url), { recursive: true });
let start = 0;
for (const scene of SCENES) {
  const media = scene.kind === 'clip' ? MEDIA[`clips/${scene.video}`]?.duration : undefined;
  const frames = sceneFrames(scene, voiceSeconds(scene.id), media);
  if (wanted.size === 0 || wanted.has(scene.id)) {
    const frame = start + Math.round(frames * 0.6);
    execFileSync('npx', ['remotion', 'still', 'Main', `out/stills/${scene.id}.png`, `--frame=${frame}`, '--log=error'], {
      stdio: 'inherit',
      cwd: new URL('..', import.meta.url).pathname,
    });
    console.log(`out/stills/${scene.id}.png  (프레임 ${frame})`);
  }
  start += frames - TRANSITION_FRAMES;
}
