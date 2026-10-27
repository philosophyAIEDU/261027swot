// 영상의 모든 장면이 이 파일 하나에 있다. 영상과 녹음용 대본(대본.md)이 둘 다 여기서 만들어진다.
// - script: 내레이션 대본(녹음할 문장). 줄바꿈 = 숨 쉬는 곳.
// - points: 캡처/영상 장면 오른쪽에 뜨는 짧은 핵심 문구(1~3개, 한 줄 20자 안팎).
// - focus: 캡처·영상에서 확대해 강조할 영역(0~1 비율). blur: 흐리게 가릴 영역(같은 방식).
// 이 파일은 node에서도 바로 읽히도록 다른 파일을 import하지 않는다(대본 내보내기·녹음 맞추기 스크립트용).
// 아래 내용은 예시다. 새 영상을 만들 때는 SERIES, CHAPTERS, APPS, SCENES를 그 영상에 맞게 바꾼다.

export type Rect = { x: number; y: number; w: number; h: number };
export type Chip = { emoji: string; text: string };
export type CardItem = { emoji: string; title: string; text: string };
export type Tile = { emoji: string; big?: string; label: string; bg: string; ink: string };

export type Scene =
  /** 오프닝 타이틀. lines의 각 줄은 형광펜 효과로 칠해진다. */
  | { kind: 'title'; id: string; script: string; kicker?: string; lines: string[]; subtitle?: string; stickers?: string[] }
  /** "오늘의 과제"처럼 주제를 소개하는 카드(+오른쪽에 큰 타일) */
  | { kind: 'brief'; id: string; script: string; label: string; title: string[]; highlight?: string; chips: Chip[]; tiles?: Tile[] }
  /** CHAPTERS 전체를 흐름도로 보여 준다. loop: 마지막 단계에서 앞 단계로 돌아가는 화살표 */
  | { kind: 'flow'; id: string; script: string; title: string; highlight?: string; loop?: boolean }
  /** 단계 표지 */
  | { kind: 'chapter'; id: string; chapter: number; script: string }
  /** 캡처 이미지(public/shots/) */
  | {
      kind: 'shot';
      id: string;
      chapter: number;
      round?: string;
      image: string;
      app: string;
      points: string[];
      focus?: Rect;
      blur?: Rect[];
      script: string;
    }
  /** 화면 녹화 영상(public/clips/). from/to: 원본에서 쓸 구간(초), rate: 재생 속도 */
  | {
      kind: 'clip';
      id: string;
      chapter: number;
      round?: string;
      video: string;
      app: string;
      points: string[];
      from?: number;
      to?: number;
      rate?: number;
      /** 원본 소리를 살릴지(기본: 끔 — 내레이션과 겹치지 않게) */
      withSound?: boolean;
      focus?: Rect;
      blur?: Rect[];
      script: string;
    }
  /** 사진 2장을 폴라로이드처럼 */
  | { kind: 'photos'; id: string; chapter: number; round?: string; images: [string, string]; captions: [string, string]; points: string[]; script: string }
  /** 정리·당부용 카드 묶음 */
  | {
      kind: 'cards';
      id: string;
      script: string;
      kicker?: string;
      title: string;
      highlight?: string;
      subtitle?: string;
      cards: CardItem[];
      quote?: string;
      sticker?: string;
    }
  /** 마무리(좋아요·구독) */
  | { kind: 'outro'; id: string; script: string; title?: string; channel: string };

export interface Chapter {
  n: number;
  title: string;
  subtitle: string;
  emoji: string;
  /** 파스텔 바탕색, 진한 글자색(바탕 위에서 대비 4.5:1 이상) */
  soft: string;
  ink: string;
}

/** 대본.md 머리말과 후반 작업 가이드(제목 후보·설명문·태그)에 쓰인다 */
export const META = {
  title: 'AI 시대의 과제, 실제로 해 보기',
  target: '교육자, 학생, AI 초보자',
  tone: '전문적이지만 따뜻한 존댓말',
  titleIdeas: ['AI 시대의 과제, 실제로 해 봤습니다', '코딩 몰라도 됩니다! 말로 요청해서 과제 완성하기'],
  description: '지난 영상에서 이야기한 AI 시대의 과제를 직접 해 봤습니다.',
  tags: ['AI 교육', '클로드 코드', '필로소피 AI 교육'],
};

/** 화면 왼쪽 위에 계속 떠 있는 시리즈 이름 */
export const SERIES = 'AI 시대의 과제 · 실전편';

// 파스텔 색 짝(soft/ink)은 이 다섯 가지를 돌려 쓰면 된다: 라벤더, 하늘, 민트, 복숭아, 분홍
export const CHAPTERS: Chapter[] = [
  { n: 1, title: '요청을 프롬프트로 다듬기', subtitle: '만들고 싶은 것을 말로 설명하면, AI가 자세한 요청서로 바꿔 줘요', emoji: '✍️', soft: '#E7DEFF', ink: '#5B3FD1' },
  { n: 2, title: '코딩 AI에게 맡기기', subtitle: '프롬프트를 붙여 넣고, AI가 일하는 과정을 지켜봐요', emoji: '🤖', soft: '#DCEBFF', ink: '#2F64C8' },
  { n: 3, title: '직접 써 보며 확인하기', subtitle: '진짜로 써 보고, 결과가 맞는지 읽어 봐요', emoji: '🧪', soft: '#D7F5E8', ink: '#1E7A55' },
];

/** 캡처·영상 장면의 창 위쪽에 보이는 프로그램 이름과 주소. 장면의 app 값이 이 키를 가리킨다. */
export const APPS: Record<string, { name: string; url: string; icon: string }> = {
  claude: { name: 'Claude', url: 'claude.ai', icon: '✳️' },
  github: { name: 'GitHub', url: 'github.com', icon: '🐙' },
  web: { name: '웹사이트', url: 'example.netlify.app', icon: '🌐' },
};

export const SCENES: Scene[] = [
  {
    kind: 'title',
    id: 'intro',
    kicker: '지난 영상 후속편 ✨',
    lines: ['AI 시대의 과제,', '실제로 해 보기'],
    subtitle: '초등학생용 SWOT 분석 앱을 AI와 함께 처음부터 끝까지',
    stickers: ['🤖', '✍️', '🚀', '🧭', '💡', '📚'],
    script: `안녕하세요 필로소피입니다 :)
오늘은 AI 시대의 과제를
제가 실제로 해 보면서 보여드리려고 합니다`,
  },
  {
    kind: 'brief',
    id: 'brief',
    label: '📋 오늘의 과제',
    title: ['초등학생도 이해하는', 'SWOT 분석 앱 만들기'],
    highlight: 'SWOT 분석 앱',
    chips: [
      { emoji: '🧒', text: '초등 3학년도 읽는 쉬운 말' },
      { emoji: '🆚', text: '두 회사를 말하면 비교' },
      { emoji: '💬', text: '궁금한 건 더 물어보기' },
    ],
    tiles: [
      { emoji: '💪', big: 'S', label: '잘하는 점', bg: '#DBEAFE', ink: '#1E3A8A' },
      { emoji: '🩹', big: 'W', label: '아쉬운 점', bg: '#E0E7FF', ink: '#312E81' },
      { emoji: '🌱', big: 'O', label: '기회', bg: '#DCFCE7', ink: '#14532D' },
      { emoji: '⚠️', big: 'T', label: '조심할 점', bg: '#FFEDD5', ink: '#7C2D12' },
    ],
    script: `제가 정한 과제는
초등학생도 이해할 수 있는
SWOT 분석 앱을 만드는 거예요`,
  },
  {
    kind: 'flow',
    id: 'flow',
    title: '과제는 이렇게 세 단계로',
    highlight: '세 단계',
    loop: true,
    script: `전체 과정은 세 단계예요
하나씩 보여드릴게요`,
  },
  { kind: 'chapter', id: 'ch1', chapter: 1, script: `첫 번째 단계는
요청을 프롬프트로 다듬는 거예요` },
  {
    kind: 'shot',
    id: 'shot1',
    chapter: 1,
    image: 'sample.png',
    app: 'claude',
    points: ['만들고 싶은 앱을 편하게 설명해요', '자세할수록 원하는 결과에 가까워져요'],
    focus: { x: 0.1, y: 0.35, w: 0.8, h: 0.3 },
    script: `먼저 만들고 싶은 앱을
편하게 설명했어요`,
  },
  { kind: 'chapter', id: 'ch2', chapter: 2, script: `두 번째 단계는
코딩 AI에게 맡기는 거예요` },
  {
    kind: 'clip',
    id: 'clip1',
    chapter: 2,
    round: '화면 녹화',
    video: 'sample.mp4',
    app: 'web',
    points: ['녹화한 화면도 그대로 넣을 수 있어요'],
    from: 0,
    to: 4,
    focus: { x: 0.25, y: 0.25, w: 0.5, h: 0.5 },
    script: `이렇게 녹화한 화면도
그대로 넣을 수 있어요`,
  },
  {
    kind: 'cards',
    id: 'lessons',
    title: 'AI 시대의 과제는 이렇게',
    highlight: '이렇게',
    subtitle: 'AI에게 맡기고 끝나는 게 아니에요',
    cards: [
      { emoji: '🎯', title: '구체적으로 요청하기', text: '프롬프트로 원하는 것을 자세히' },
      { emoji: '🔍', title: '직접 확인하기', text: 'AI 결과를 읽고 판단하기' },
      { emoji: '🔁', title: '다시 요청하기', text: '아쉬운 점을 찾아 더 나아지게' },
    ],
    script: `네 오늘 과정을 정리해 보면요
요청하고 확인하고 다시 요청하는 것
이게 AI 시대의 과제라고 생각합니다`,
  },
  {
    kind: 'outro',
    id: 'outro',
    channel: '필로소피 AI 교육',
    script: `오늘의 영상 여기까지입니다
영상이 도움이 되셨다면
좋아요와 구독을 눌러주시면 감사하겠습니다
감사합니다`,
  },
];

export const FPS = 30;
export const TRANSITION_FRAMES = 15;

/** 녹음 전 임시 길이: 차분한 말하기 속도(초당 약 5.5자) + 앞뒤 여유 */
export function estimateSeconds(script: string): number {
  const chars = script.replace(/\s+/g, '').length;
  return Math.max(4, chars / 5.5 + 1.6);
}

/** 영상 장면에서 실제로 보여 줄 원본 길이(초). 길이를 모르면 null */
export function clipSeconds(scene: Scene, mediaDuration?: number): number | null {
  if (scene.kind !== 'clip') return null;
  const from = scene.from ?? 0;
  const to = scene.to ?? mediaDuration;
  if (to === undefined) return null;
  return Math.max(0.5, (to - from) / (scene.rate ?? 1));
}

/**
 * 장면 길이(프레임).
 * - 녹음이 있으면 녹음 길이 + 1초
 * - 녹음이 없으면 대본 길이로 어림잡고, 영상 장면은 영상 길이보다 짧아지지 않게 한다
 * - 원본 소리를 쓰는 영상 장면(withSound)은 영상 길이 그대로
 */
export function sceneFrames(scene: Scene, voiceSeconds?: number, mediaDuration?: number): number {
  let seconds = voiceSeconds !== undefined ? voiceSeconds + 1.0 : estimateSeconds(scene.script);
  const clip = clipSeconds(scene, mediaDuration);
  if (clip !== null && scene.kind === 'clip' && scene.withSound) {
    // 원본 소리(녹화하며 말한 목소리)를 쓰는 영상은 영상 길이 그대로 간다.
    seconds = clip + 0.5;
  } else if (clip !== null && voiceSeconds === undefined) {
    seconds = Math.max(seconds, clip + 0.5);
  }
  // 전환(겹침) 시간만큼 더해서 말이 잘리지 않게 한다.
  return Math.ceil(seconds * FPS) + TRANSITION_FRAMES;
}
