// 대본(녹음용) 내보내기: node scripts/export-script.ts
// src/data/scenes.ts 한 곳에서 영상과 대본을 같이 만들기 때문에, 장면을 고치면 이 명령으로 대본도 다시 뽑는다.
import { writeFileSync } from 'node:fs';
import { APP_LABELS, CHAPTERS, FPS, ROUNDS, SCENES, TRANSITION_FRAMES, sceneFrames, type Scene } from '../src/data/scenes.ts';

const LINE = '━━━━━━━━━━━━━━━━━━━━━━━━';

function timecode(frames: number): string {
  const total = Math.round(frames / FPS);
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

function screenNote(scene: Scene): string[] {
  switch (scene.kind) {
    case 'title':
      return ['[화면: 오프닝 타이틀 — "AI 시대의 과제, 실제로 해 보기"]'];
    case 'task':
      return ['[화면: 오늘의 과제 카드 + SWOT 4칸]'];
    case 'flow':
      return ['[화면: 다섯 단계 흐름도]'];
    case 'chapter': {
      const chapter = CHAPTERS[scene.chapter - 1]!;
      return [`[화면: STEP ${chapter.n} 표지 — ${chapter.title}]`];
    }
    case 'shot': {
      const notes = [`[화면: ${APP_LABELS[scene.app].name} 캡처 (${scene.image.replace('.png', '')})]`];
      if (scene.round) notes.push(`[자막: ${ROUNDS[scene.round]}]`);
      notes.push(`[자막: ${scene.points.join(' / ')}]`);
      return notes;
    }
    case 'photos':
      return ['[화면: 테스트 사진 두 장 — 레스토랑 / 동네 식당]', `[자막: ${scene.points.join(' / ')}]`];
    case 'lessons':
      return ['[화면: 정리 카드 4장 — 요청하기 · 확인하기 · 다시 요청하기 · 기록 남기기]'];
    case 'teacher':
      return ['[화면: 선생님들께 — 프롬프트 · AI와의 대화 · 커밋 기록]'];
    case 'outro':
      return ['[화면: 마무리 — 좋아요 · 구독]'];
  }
}

const SECTION_TITLES: Partial<Record<string, string>> = {
  intro: '인사 & 오프닝',
  task: '오늘의 과제',
  flow: '전체 흐름',
  ch1: `STEP 1. ${CHAPTERS[0]!.title}`,
  ch2: `STEP 2. ${CHAPTERS[1]!.title}`,
  ch3: `STEP 3. ${CHAPTERS[2]!.title}`,
  ch4: `STEP 4. ${CHAPTERS[3]!.title}`,
  ch5: `STEP 5. ${CHAPTERS[4]!.title}`,
  lessons: '정리 & 교육적 의미',
  outro: '마무리 & CTA',
};

let cursor = 0;
const starts: number[] = [];
for (const scene of SCENES) {
  starts.push(cursor);
  cursor += sceneFrames(scene) - TRANSITION_FRAMES;
}
const totalFrames = cursor + TRANSITION_FRAMES;
const chars = SCENES.reduce((sum, scene) => sum + scene.script.replace(/\s+/g, '').length, 0);

const out: string[] = [];
out.push(LINE, '📹 AI 시대의 과제, 실제로 해 보기 (후속편)', LINE, '');
out.push(`⏱️ 예상 길이: 약 ${Math.round(totalFrames / FPS / 60)}분 (녹음하면 녹음 길이에 맞춰 바뀝니다)`);
out.push('🎯 타겟: 교육자, 학생, AI 초보자');
out.push('📝 톤: 전문적이지만 따뜻한 존댓말');
out.push(`🔤 대본 분량: 공백 빼고 ${chars.toLocaleString()}자`, '');
out.push('🎙️ 녹음 방법');
out.push('- 아래 장면마다 [녹음 파일: ○○] 이름이 있어요. 장면별로 따로 녹음해서 그 이름으로 주시면 화면과 정확히 맞춰집니다. (예: intro.mp3, s01.mp3)');
out.push('- 한 파일로 쭉 녹음하셔도 괜찮아요. 장면 사이에 1~2초 쉬어 주시면 제가 잘라서 맞추겠습니다.');
out.push('- 줄바꿈은 숨 쉬는 곳이에요. 편하게 말투를 바꿔 읽으셔도 돼요. 장면 길이는 녹음에 맞춰 자동으로 늘거나 줄어요.', '');

let sceneNumber = 0;
SCENES.forEach((scene, index) => {
  sceneNumber += 1;
  const section = SECTION_TITLES[scene.id];
  if (section) {
    out.push(LINE, `[${timecode(starts[index]!)}] ${section}`, LINE, '');
  }
  out.push(`▶ 장면 ${sceneNumber}  [녹음 파일: ${scene.id}]  (${timecode(starts[index]!)})`);
  out.push(...screenNote(scene), '');
  out.push(scene.script, '');
});

out.push(LINE, '📊 후반 작업 가이드', LINE, '');
out.push('🔍 제목 후보');
out.push('1. AI 시대의 과제, 실제로 해 봤습니다 | 초등학생용 SWOT 앱을 AI와 처음부터 끝까지');
out.push('2. 코딩 몰라도 됩니다! 말로 요청해서 웹앱 과제 완성하기 (Claude Code + Gemini)');
out.push('3. AI에게 맡기고 끝? 아니에요 — 요청·확인·다시 요청으로 하는 AI 시대의 과제', '');
out.push('📝 설명문');
out.push('지난 영상에서 이야기한 "AI 시대의 과제"를 직접 해 봤습니다.');
out.push('초등학생도 이해할 수 있는 SWOT 분석 앱을 만들기 위해');
out.push('프롬프트 다듬기 → 코딩 AI에게 맡기기 → GitHub·Netlify로 배포 → 직접 써 보며 확인 → 다시 요청하기');
out.push('다섯 단계를 처음부터 끝까지 그대로 보여드려요.');
out.push('AI 시대의 과제는 결과물보다 과정이 중요하다는 것, 함께 확인해 보세요 :)', '');
out.push('🏷️ 태그');
out.push('AI 시대의 과제, AI 교육, 클로드 코드, Claude Code, Gemini, SWOT 분석, 바이브 코딩, 프롬프트, Netlify, GitHub, 교사 AI 활용, 필로소피 AI 교육', '');
out.push('⏰ 타임스탬프 (녹음 전 예상 — 녹음 후 다시 뽑아 드릴게요)');
SCENES.forEach((scene, index) => {
  const section = SECTION_TITLES[scene.id];
  if (section) out.push(`${timecode(starts[index]!)} ${section}`);
});
out.push('');

writeFileSync(new URL('../대본.md', import.meta.url), out.join('\n'));
console.log(`대본.md 작성 완료 — 장면 ${SCENES.length}개, ${chars}자, 약 ${(totalFrames / FPS / 60).toFixed(1)}분`);
