// 녹음용 대본 내보내기: node scripts/export-script.ts  →  대본.md
// 영상과 대본이 같은 src/data/scenes.ts 에서 나오므로, 장면을 고치면 이 명령으로 대본도 다시 만든다.
// 녹음이 연결돼 있으면(voice.ts) 실제 녹음 길이로 타임스탬프를 계산한다.
import { execFileSync } from 'node:child_process';
import { existsSync, writeFileSync } from 'node:fs';
import { MEDIA } from '../src/data/media.ts';
import { APPS, CHAPTERS, FPS, META, SCENES, TRANSITION_FRAMES, sceneFrames, type Scene } from '../src/data/scenes.ts';
import { VOICE_FILES } from '../src/data/voice.ts';

const LINE = '━━━━━━━━━━━━━━━━━━━━━━━━';
const publicDir = new URL('../public/', import.meta.url);

function timecode(frames: number): string {
  const total = Math.round(frames / FPS);
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

function voiceSeconds(id: string): number | undefined {
  const file = VOICE_FILES[id];
  if (!file) return undefined;
  const path = new URL(file, publicDir).pathname;
  if (!existsSync(path)) return undefined;
  const out = execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path]);
  return Number(String(out).trim());
}

function screenNote(scene: Scene): string[] {
  switch (scene.kind) {
    case 'title':
      return [`[화면: 오프닝 타이틀 — "${scene.lines.join(' ')}"]`];
    case 'brief':
      return [`[화면: ${scene.label} — ${scene.title.join(' ')}]`];
    case 'flow':
      return [`[화면: 단계 흐름도 — ${CHAPTERS.map((c) => c.title).join(' → ')}]`];
    case 'chapter': {
      const chapter = CHAPTERS[scene.chapter - 1]!;
      return [`[화면: STEP ${chapter.n} 표지 — ${chapter.title}]`];
    }
    case 'shot':
    case 'clip': {
      const what = scene.kind === 'shot' ? `캡처 ${scene.image}` : `화면 녹화 ${scene.video}`;
      const notes = [`[화면: ${APPS[scene.app]?.name ?? scene.app} ${what}]`];
      if (scene.round) notes.push(`[자막: ${scene.round}]`);
      notes.push(`[자막: ${scene.points.join(' / ')}]`);
      return notes;
    }
    case 'photos':
      return [`[화면: 사진 두 장 — ${scene.captions.join(' / ')}]`, `[자막: ${scene.points.join(' / ')}]`];
    case 'cards':
      return [`[화면: ${scene.title} — ${scene.cards.map((c) => c.title).join(' · ')}]`];
    case 'outro':
      return ['[화면: 마무리 — 좋아요 · 구독]'];
  }
}

function sectionTitle(scene: Scene, index: number): string | null {
  if (scene.kind === 'title') return '인사 & 오프닝';
  if (scene.kind === 'brief') return '주제 소개';
  if (scene.kind === 'flow') return '전체 흐름';
  if (scene.kind === 'chapter') return `STEP ${scene.chapter}. ${CHAPTERS[scene.chapter - 1]!.title}`;
  if (scene.kind === 'outro') return '마무리 & CTA';
  if (scene.kind === 'cards' && SCENES[index - 1]?.kind !== 'cards') return '정리';
  return null;
}

let cursor = 0;
const starts: number[] = [];
let recorded = 0;
for (const scene of SCENES) {
  starts.push(cursor);
  const voice = voiceSeconds(scene.id);
  if (voice !== undefined) recorded += 1;
  const media = scene.kind === 'clip' ? MEDIA[`clips/${scene.video}`]?.duration : undefined;
  cursor += sceneFrames(scene, voice, media) - TRANSITION_FRAMES;
}
const totalFrames = cursor + TRANSITION_FRAMES;
const chars = SCENES.reduce((sum, scene) => sum + scene.script.replace(/\s+/g, '').length, 0);
const basis = recorded === SCENES.length ? '녹음 길이 기준' : recorded > 0 ? `녹음 ${recorded}개 + 나머지는 예상` : '녹음 전 예상';

const out: string[] = [];
out.push(LINE, `📹 ${META.title}`, LINE, '');
out.push(`⏱️ 길이: 약 ${(totalFrames / FPS / 60).toFixed(1)}분 (${basis})`);
out.push(`🎯 타겟: ${META.target}`);
out.push(`📝 톤: ${META.tone}`);
out.push(`🔤 대본 분량: 공백 빼고 ${chars.toLocaleString()}자 · 장면 ${SCENES.length}개`, '');
out.push('🎙️ 녹음 방법');
out.push('- 장면별로 녹음하면 [녹음 파일: ○○] 이름으로 주세요(예: intro.mp3). 화면과 정확히 맞춰집니다.');
out.push('- 한 번에 녹음해도 돼요. ▶ 장면이 바뀔 때마다 2초쯤 확실히 쉬어 주세요. 장면 안에서는 1초 넘게 멈추지 않으면 좋아요.');
out.push('- 녹음 프로그램에서 만든 자막 파일(SRT)이 있으면 같이 주세요. 장면을 더 정확히 나누고 자막도 그 시각대로 넣을 수 있어요.');
out.push('- 줄바꿈은 숨 쉬는 곳이에요. 말투는 편하게 바꿔 읽으셔도 돼요.', '');

SCENES.forEach((scene, index) => {
  const section = sectionTitle(scene, index);
  if (section) out.push(LINE, `[${timecode(starts[index]!)}] ${section}`, LINE, '');
  out.push(`▶ 장면 ${index + 1}  [녹음 파일: ${scene.id}]  (${timecode(starts[index]!)})`);
  out.push(...screenNote(scene), '');
  out.push(scene.script, '');
});

out.push(LINE, '📊 후반 작업 가이드', LINE, '');
out.push('🔍 제목 후보');
META.titleIdeas.forEach((idea, index) => out.push(`${index + 1}. ${idea}`));
out.push('', '📝 설명문', META.description, '');
out.push('🏷️ 태그', META.tags.join(', '), '');
out.push(`⏰ 타임스탬프 (${basis})`);
SCENES.forEach((scene, index) => {
  const section = sectionTitle(scene, index);
  if (section) out.push(`${timecode(starts[index]!)} ${section}`);
});
out.push('');

writeFileSync(new URL('../대본.md', import.meta.url), out.join('\n'));
console.log(`대본.md 작성 완료 — 장면 ${SCENES.length}개, ${chars}자, 약 ${(totalFrames / FPS / 60).toFixed(1)}분 (${basis})`);
