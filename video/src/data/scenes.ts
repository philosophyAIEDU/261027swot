// 영상의 모든 장면이 이 파일 하나에 있다.
// - script: 내레이션 대본(녹음할 문장). 줄바꿈 = 숨 쉬는 곳.
// - points: 화면 오른쪽에 뜨는 짧은 핵심 문구.
// - focus: 캡처에서 확대해 강조할 영역(0~1 비율, 이미지 기준).
// 장면 길이는 대본 길이로 자동 계산되고, 녹음 파일이 생기면 녹음 길이를 따른다(voice.ts).
// 이 파일은 node에서도 바로 읽을 수 있도록 다른 파일을 import하지 않는다(대본 내보내기 스크립트용).

export type Rect = { x: number; y: number; w: number; h: number };

export type AppKind = 'claude' | 'claudeCode' | 'github' | 'netlify' | 'swot' | 'aiStudio' | 'photo';

export type Scene =
  | { kind: 'title'; id: string; script: string }
  | { kind: 'task'; id: string; script: string }
  | { kind: 'flow'; id: string; script: string }
  | { kind: 'chapter'; id: string; chapter: number; script: string }
  | {
      kind: 'shot';
      id: string;
      chapter: number;
      /** 5단계(다시 요청하기)의 몇 번째 요청인지 */
      round?: 1 | 2 | 3;
      image: string;
      app: AppKind;
      points: string[];
      focus?: Rect;
      /** 공개하면 안 되는 부분을 흐리게 */
      blur?: Rect[];
      script: string;
    }
  | { kind: 'photos'; id: string; chapter: number; round: 2; images: [string, string]; captions: [string, string]; points: string[]; script: string }
  | { kind: 'lessons'; id: string; script: string }
  | { kind: 'teacher'; id: string; script: string }
  | { kind: 'outro'; id: string; script: string };

export interface Chapter {
  n: number;
  title: string;
  subtitle: string;
  emoji: string;
  /** 파스텔 바탕색, 진한 글자색 */
  soft: string;
  ink: string;
}

export const CHAPTERS: Chapter[] = [
  { n: 1, title: '요청을 프롬프트로 다듬기', subtitle: '만들고 싶은 것을 말로 설명하면, AI가 자세한 요청서로 바꿔 줘요', emoji: '✍️', soft: '#E7DEFF', ink: '#5B3FD1' },
  { n: 2, title: '코딩 AI에게 맡기기', subtitle: '프롬프트를 붙여 넣고, AI가 일하는 과정을 지켜봐요', emoji: '🤖', soft: '#DCEBFF', ink: '#2F64C8' },
  { n: 3, title: '인터넷에 올리기', subtitle: 'GitHub에 저장하고 Netlify로 사이트 주소를 만들어요', emoji: '🚀', soft: '#D7F5E8', ink: '#1E7A55' },
  { n: 4, title: '직접 써 보며 확인하기', subtitle: '진짜로 써 보고, 결과가 맞는지 읽어 봐요', emoji: '🧪', soft: '#FFE3D6', ink: '#B4512A' },
  { n: 5, title: '다시 요청하기', subtitle: '아쉬운 점을 찾아 세 번 더 요청했어요', emoji: '🔁', soft: '#FFDDEB', ink: '#B0336F' },
];

export const ROUNDS: Record<1 | 2 | 3, string> = {
  1: '다시 요청 ① SWOT 개념 설명',
  2: '다시 요청 ② 가게 사진 분석',
  3: '다시 요청 ③ 유명한 회사 예시',
};

export const APP_LABELS: Record<AppKind, { name: string; url: string; icon: string }> = {
  claude: { name: 'Claude', url: 'claude.ai · 코딩 AI 프롬프트 전문가팀', icon: '✳️' },
  claudeCode: { name: 'Claude Code', url: 'claude.ai/code · philosophyAIEDU/261027swot', icon: '⌨️' },
  github: { name: 'GitHub', url: 'github.com/philosophyAIEDU/261027swot', icon: '🐙' },
  netlify: { name: 'Netlify', url: 'app.netlify.com · philoswot', icon: '🌐' },
  swot: { name: 'SWOT 탐험대', url: 'philoswot.netlify.app', icon: '🧭' },
  aiStudio: { name: 'Google AI Studio', url: 'aistudio.google.com/apikey', icon: '🔑' },
  photo: { name: '테스트 사진', url: '테스트용 가게 사진', icon: '📷' },
};

export const SCENES: Scene[] = [
  {
    kind: 'title',
    id: 'intro',
    script: `안녕하세요 필로소피입니다 :)
지난 영상에서는
AI 시대에는 과제가 어떻게 달라져야 하는지
이야기를 나눠 봤는데요
오늘은 그 후속편으로
AI 시대의 과제를 제가 실제로 해 보면서
처음부터 끝까지 그대로 보여드리려고 합니다`,
  },
  {
    kind: 'task',
    id: 'task',
    script: `제가 정한 과제는 이거예요
초등학생도 이해할 수 있는
SWOT 분석 앱을 만드는 거예요
회사 이름을 넣으면 아주 쉬운 말로 분석해 주고
두 회사를 말하면 비교도 해 주고
궁금한 건 더 물어볼 수 있는 앱이에요`,
  },
  {
    kind: 'flow',
    id: 'flow',
    script: `전체 과정은 크게 다섯 단계예요
요청을 프롬프트로 다듬고
코딩 AI에게 맡기고
인터넷에 올린 다음
직접 써 보면서 확인하고
아쉬운 건 다시 요청하는 거죠
하나씩 보여드릴게요`,
  },

  // ───────── 1단계 ─────────
  { kind: 'chapter', id: 'ch1', chapter: 1, script: `네 첫 번째 단계는
요청을 프롬프트로 다듬는 거예요` },
  {
    kind: 'shot',
    id: 's01',
    chapter: 1,
    image: 's01.png',
    app: 'claude',
    points: ['만들고 싶은 앱을 편하게 설명해요', '조건: Gemini 모델 · API 키 · 두 회사 비교'],
    focus: { x: 0.01, y: 0.4, w: 0.98, h: 0.46 },
    script: `먼저 제가 쓰고 있는
코딩 AI 프롬프트 전문가팀 프로젝트에
만들고 싶은 앱을 그냥 편하게 설명했어요
초등학생도 이해할 수 있는 SWOT 분석 앱이고
Gemini 모델을 쓰고
사용자가 API 키를 넣고
두 회사를 비교해 주는 기능까지요`,
  },
  {
    kind: 'shot',
    id: 's02',
    chapter: 1,
    image: 's02.png',
    app: 'claude',
    points: ['프롬프트도 AI가 만들어 줘요', '자세할수록 원하는 결과에 가까워져요'],
    focus: { x: 0.53, y: 0.1, w: 0.46, h: 0.5 },
    script: `그러면 이렇게 아주 자세한 프롬프트를 만들어 줘요
작업 목표, 배경, 기술 스택
필수 기능까지 다 정리돼 있죠
이걸 왜 하냐면
코딩 AI에게 자세하게 요청할수록
우리가 원하는 결과가 나올 확률이 높아지기 때문이에요
그래서 프롬프트 자체를 AI한테 부탁하는 거죠`,
  },

  // ───────── 2단계 ─────────
  { kind: 'chapter', id: 'ch2', chapter: 2, script: `두 번째 단계는
코딩 AI에게 맡기는 거예요` },
  {
    kind: 'shot',
    id: 's03',
    chapter: 2,
    image: 's03.png',
    app: 'claudeCode',
    points: ['Claude Code에 프롬프트 붙여 넣기', 'GitHub 저장소를 연결해 둬요'],
    focus: { x: 0.26, y: 0.53, w: 0.73, h: 0.46 },
    script: `이 프롬프트를 복사해서
클로드 코드에 붙여 넣었어요
여기 아래를 보시면 GitHub 저장소가 연결돼 있죠
이렇게 해 두면 AI가 만든 코드가
제 저장소에 바로 올라가요`,
  },
  {
    kind: 'shot',
    id: 's04',
    chapter: 2,
    image: 's04.png',
    app: 'claudeCode',
    points: ['막히면 다른 방법으로 확인해요', '일하는 과정이 그대로 보여요'],
    focus: { x: 0.0, y: 0.05, w: 1.0, h: 0.13 },
    script: `그러면 AI가 알아서 작업을 시작하는데요
여기서 재밌는 게
구글 공식 문서에 접속이 안 되니까
설치된 패키지를 직접 열어서
최신 사용법을 확인하겠다고 해요
그냥 넘어가지 않고
스스로 확인하는 과정이 다 보이는 거죠`,
  },
  {
    kind: 'shot',
    id: 's05',
    chapter: 2,
    image: 's05.png',
    app: 'claudeCode',
    points: ['확인하지 못한 것도 솔직하게 알려 줘요', '판단하는 건 우리의 몫'],
    focus: { x: 0.0, y: 0.18, w: 1.0, h: 0.54 },
    script: `작업이 끝나면 이렇게 보고를 해 주는데요
저는 이 '알아 두실 점'이 굉장히 중요하다고 생각해요
확인하지 못한 부분
요청과 다르게 처리한 부분을
솔직하게 알려 주거든요
이런 걸 읽고 판단하는 게
바로 AI 시대에 우리가 할 일이에요`,
  },
  {
    kind: 'shot',
    id: 's06',
    chapter: 2,
    image: 's06.png',
    app: 'claudeCode',
    points: ['PR 만들어 주세요 → merge', '코딩을 몰라도 말로 진행해요'],
    focus: { x: 0.0, y: 0.03, w: 1.0, h: 0.4 },
    script: `그다음에 PR을 만들어 달라고 하고
merge라고 하면
제 저장소의 main에 합쳐집니다
코딩을 몰라도
이렇게 말로 요청해서 진행할 수 있어요`,
  },

  // ───────── 3단계 ─────────
  { kind: 'chapter', id: 'ch3', chapter: 3, script: `세 번째 단계는
인터넷에 올리는 거예요` },
  {
    kind: 'shot',
    id: 's07',
    chapter: 3,
    image: 's07.png',
    app: 'github',
    points: ['AI가 만든 코드가 저장소에 올라왔어요'],
    focus: { x: 0.32, y: 0.3, w: 0.68, h: 0.68 },
    script: `GitHub에 들어가 보면
AI가 만든 파일들이 이렇게 올라와 있어요`,
  },
  {
    kind: 'shot',
    id: 's08',
    chapter: 3,
    image: 's08.png',
    app: 'github',
    points: ['README에 사용법이 정리돼 있어요', '선생님 눈높이로 쓴 안내'],
    focus: { x: 0.02, y: 0.08, w: 0.96, h: 0.42 },
    script: `README도 한글로 친절하게 써 줬는데요
실행 방법, API 키 발급 방법
수업 활용 팁까지 정리돼 있어서
선생님들이 보셔도 어렵지 않아요`,
  },
  {
    kind: 'shot',
    id: 's09',
    chapter: 3,
    image: 's09.png',
    app: 'netlify',
    points: ['Netlify에 저장소를 연결해요', '사이트 주소 완성!'],
    focus: { x: 0.3, y: 0.06, w: 0.34, h: 0.26 },
    script: `그리고 Netlify에서 이 저장소를 연결하면
이렇게 사이트 주소가 생겨요
이제 누구나 이 주소로 들어와서
앱을 쓸 수 있게 된 거죠`,
  },

  // ───────── 4단계 ─────────
  { kind: 'chapter', id: 'ch4', chapter: 4, script: `네 번째 단계는
직접 써 보면서 확인하는 거예요` },
  {
    kind: 'shot',
    id: 's10',
    chapter: 4,
    image: 's10.png',
    app: 'swot',
    points: ['API 키는 어른이 넣어요', '키 발급 3단계 안내'],
    focus: { x: 0.22, y: 0.1, w: 0.56, h: 0.34 },
    script: `사이트에 들어가면
처음에 '어른과 함께 설정해요' 화면이 나와요
학생이 아니라 선생님이나 보호자가
API 키를 넣도록 만든 거예요`,
  },
  {
    kind: 'shot',
    id: 's11',
    chapter: 4,
    image: 's11.png',
    app: 'aiStudio',
    points: ['Google AI Studio → Create API key', '키는 다른 사람에게 보여 주지 않기'],
    focus: { x: 0.8, y: 0.04, w: 0.19, h: 0.12 },
    blur: [
      { x: 0.19, y: 0.37, w: 0.13, h: 0.62 },
      { x: 0.355, y: 0.37, w: 0.12, h: 0.62 },
    ],
    script: `API 키는 Google AI Studio에서 받으시면 돼요
여기 오른쪽 위에 Create API key를 누르시면
새 키가 만들어집니다
키는 비밀번호 같은 거라서
다른 사람에게 보여 주시면 안 돼요`,
  },
  {
    kind: 'shot',
    id: 's12',
    chapter: 4,
    image: 's12.png',
    app: 'swot',
    points: ['키 확인을 누르면 시험해 보고 저장', '공용 컴퓨터에서는 기억하기 끄기'],
    focus: { x: 0.21, y: 0.46, w: 0.58, h: 0.27 },
    script: `받은 키를 붙여 넣고 키 확인을 누르면
AI가 짧게 시험해 보고 저장해요
공용 컴퓨터에서는 '기억하기'를
끄시는 게 좋습니다`,
  },
  {
    kind: 'shot',
    id: 's13',
    chapter: 4,
    image: 's13.png',
    app: 'swot',
    points: ['S 잘하는 점 · W 아쉬운 점', 'O 기회 · T 조심할 점'],
    focus: { x: 0.01, y: 0.44, w: 0.98, h: 0.27 },
    script: `들어가면 이렇게 홈 화면이 나와요
SWOT를 아이들 말로 바꿔서
잘하는 점, 아쉬운 점, 기회, 조심할 점
이렇게 네 칸으로 보여 줍니다`,
  },
  {
    kind: 'shot',
    id: 's14',
    chapter: 4,
    image: 's14.png',
    app: 'swot',
    points: ['예시: 학교 앞 떡볶이 가게', '안(S·W)과 밖(O·T)을 색으로 구분'],
    script: `학교 앞 떡볶이 가게 예시도 있어요
가게 안의 일과 밖의 일을
색깔로 나눠서 보여 주니까
아이들이 훨씬 쉽게 이해할 수 있겠죠`,
  },
  {
    kind: 'shot',
    id: 's15',
    chapter: 4,
    image: 's15.png',
    app: 'swot',
    points: ['두 회사 비교하기', '엔비디아 vs AMD'],
    focus: { x: 0.02, y: 0.56, w: 0.96, h: 0.39 },
    script: `그럼 진짜로 써 볼게요
두 회사 비교하기를 눌러서
엔비디아랑 AMD를 넣어 봤어요`,
  },
  {
    kind: 'shot',
    id: 's16',
    chapter: 4,
    image: 's16.png',
    app: 'swot',
    points: ['어려운 말을 아이들 말로', '두 회사를 나란히 비교'],
    focus: { x: 0.0, y: 0.0, w: 1.0, h: 0.14 },
    script: `와 두 회사가 이렇게 나란히 나와요
그래픽 카드는 똑똑한 그림 그리기 장치
CPU는 컴퓨터의 머리 역할을 하는 장치처럼
어려운 말을 아이들 말로 바꿔 줬어요`,
  },
  {
    kind: 'shot',
    id: 's17',
    chapter: 4,
    image: 's17.png',
    app: 'swot',
    points: ['결과를 직접 읽고 확인하기', 'AI가 만든 내용은 틀릴 수도 있어요'],
    focus: { x: 0.0, y: 0.8, w: 1.0, h: 0.2 },
    script: `기회와 조심할 점, 한 줄 정리까지 나오는데요
여기서 중요한 건
그냥 믿고 끝내는 게 아니라
내용이 맞는지 직접 읽어 보는 거예요
AI가 만든 내용은 틀릴 수도 있으니까요`,
  },

  // ───────── 5단계 ─────────
  { kind: 'chapter', id: 'ch5', chapter: 5, script: `그리고 마지막 단계
써 보면서 아쉬운 점이 보이면
다시 요청하는 거예요
저는 세 번 더 요청했어요` },

  // 다시 요청 ①
  {
    kind: 'shot',
    id: 's18',
    chapter: 5,
    round: 1,
    image: 's18.png',
    app: 'claudeCode',
    points: ['처음 보는 사람에겐 어렵겠다!', 'SWOT 개념·장점·단점 설명 요청'],
    focus: { x: 0.17, y: 0.0, w: 0.83, h: 0.14 },
    script: `첫 번째로 써 보니까
SWOT를 처음 보는 사람은
조금 어렵겠다는 생각이 들었어요
그래서 SWOT의 개념과 장점, 단점을
쉽게 설명해 달라고 요청했습니다`,
  },
  {
    kind: 'shot',
    id: 's19',
    chapter: 5,
    round: 1,
    image: 's19.png',
    app: 'claudeCode',
    points: ['회사의 건강검진표 비유', '장점 6 · 단점 6 · 퀴즈'],
    focus: { x: 0.0, y: 0.04, w: 1.0, h: 0.56 },
    script: `그랬더니 어떤 내용을 넣었는지
이렇게 정리해서 알려 줘요
건강검진표 비유도 쓰고
장점 여섯 가지, 단점 여섯 가지
퀴즈까지 만들었네요`,
  },
  {
    kind: 'shot',
    id: 's20',
    chapter: 5,
    round: 1,
    image: 's20.png',
    app: 'claudeCode',
    points: ['확인하고 → PR → merge'],
    focus: { x: 0.0, y: 0.5, w: 1.0, h: 0.5 },
    script: `확인하고 나서
PR 만들고 merge 해 달라고 하면 끝이에요`,
  },
  {
    kind: 'shot',
    id: 's21',
    chapter: 5,
    round: 1,
    image: 's21.png',
    app: 'github',
    points: ['커밋 = 과정의 기록', '언제, 무엇을 바꿨는지 남아요'],
    focus: { x: 0.25, y: 0.33, w: 0.73, h: 0.32 },
    script: `GitHub의 커밋 기록을 보면
어떤 걸 언제 바꿨는지가 다 남아 있어요
이게 이제 굉장히 중요한데요
과정이 기록으로 남으니까
나중에 돌아보기도 좋고
선생님이 학생의 과정을 보기에도 좋아요`,
  },
  {
    kind: 'shot',
    id: 's32',
    chapter: 5,
    round: 1,
    image: 's32.png',
    app: 'swot',
    points: ['SWOT 쉽게 알아보기', '두 가지 질문 → 네 칸'],
    focus: { x: 0.0, y: 0.2, w: 1.0, h: 0.37 },
    script: `실제 사이트에 들어가 보면
이렇게 'SWOT 쉽게 알아보기'가 생겼어요
안과 밖, 좋은 일과 걱정되는 일
두 가지 질문으로 네 칸을 설명해 줍니다`,
  },
  {
    kind: 'shot',
    id: 's33',
    chapter: 5,
    round: 1,
    image: 's33.png',
    app: 'swot',
    points: ['장점과 단점을 한눈에', '"정답이 하나가 아니에요"'],
    focus: { x: 0.5, y: 0.0, w: 0.5, h: 0.53 },
    script: `장점과 단점도 아이들 말로 정리돼 있고요
특히 단점에
정답이 하나가 아니에요
AI가 만든 내용도 확인해요 같은 게 들어가 있어서
저는 이 부분이 마음에 들었어요`,
  },
  {
    kind: 'shot',
    id: 's34',
    chapter: 5,
    round: 1,
    image: 's34.png',
    app: 'swot',
    points: ['스스로 생각해 보고 → 정답 확인'],
    script: `퀴즈를 누르면 정답과 이유가 나와요
아이들이 스스로 생각해 보고
확인할 수 있게 한 거죠`,
  },

  // 다시 요청 ②
  {
    kind: 'shot',
    id: 's22',
    chapter: 5,
    round: 2,
    image: 's22.png',
    app: 'claudeCode',
    points: ['되는지 먼저 물어보기', '사진만으로는 밖의 일이 잘 안 보여요'],
    focus: { x: 0.0, y: 0.6, w: 1.0, h: 0.4 },
    script: `두 번째로는
가게 사진만 넣어도 분석해 주면 좋겠다
이런 생각이 들었어요
그래서 이게 가능한지 먼저 물어봤는데요
사진만으로는 가게 밖의 일
그러니까 기회와 조심할 점은
잘 안 보인다고 미리 알려 주더라고요`,
  },
  {
    kind: 'shot',
    id: 's23',
    chapter: 5,
    round: 2,
    image: 's23.png',
    app: 'claudeCode',
    points: ['본 것과 짐작을 나눠서 보여 주기', '위치 정보 지우기 · 개인 정보 보호'],
    focus: { x: 0.0, y: 0.03, w: 1.0, h: 0.5 },
    script: `그래서 사진에서 직접 본 것과
짐작한 것을 나눠서 보여 주겠다고
계획을 세워 줬어요
사진 속 위치 정보를 지우고
사람 얼굴 같은 개인 정보는 다루지 않는 것까지요
계획을 보고 괜찮으면 진행하면 됩니다`,
  },
  {
    kind: 'photos',
    id: 'photos',
    chapter: 5,
    round: 2,
    images: ['s24.png', 's25.png'],
    captions: ['분위기 있는 레스토랑', '오래된 동네 식당'],
    points: ['분위기가 다른 사진 두 장으로 테스트'],
    script: `테스트용으로는
이렇게 분위기가 아주 다른
식당 사진 두 장을 준비했어요`,
  },
  {
    kind: 'shot',
    id: 's26',
    chapter: 5,
    round: 2,
    image: 's26.png',
    app: 'claudeCode',
    points: ['사용 방법 정리', '개인정보를 어떻게 지켰는지까지'],
    focus: { x: 0.0, y: 0.75, w: 1.0, h: 0.25 },
    script: `완성되고 나면 사용 방법과
개인정보를 어떻게 보호했는지까지
정리해서 알려 줍니다`,
  },
  {
    kind: 'shot',
    id: 's27',
    chapter: 5,
    round: 2,
    image: 's27.png',
    app: 'github',
    points: ['기록이 하나 더 쌓였어요'],
    focus: { x: 0.25, y: 0.29, w: 0.73, h: 0.1 },
    script: `커밋 기록에도
가게 사진 분석 기능이 추가됐죠`,
  },
  {
    kind: 'shot',
    id: 's28',
    chapter: 5,
    round: 2,
    image: 's28.png',
    app: 'swot',
    points: ['홈 화면에 새 기능 등장'],
    focus: { x: 0.02, y: 0.69, w: 0.5, h: 0.3 },
    script: `홈 화면에
가게 사진으로 알아보기가 생겼어요`,
  },
  {
    kind: 'shot',
    id: 's29',
    chapter: 5,
    round: 2,
    image: 's29.png',
    app: 'swot',
    points: ['사진 + 가게 이름 + 주변 메모', '메모를 쓰면 더 정확해져요'],
    focus: { x: 0.02, y: 0.48, w: 0.96, h: 0.5 },
    script: `사진을 넣고
가게 이름이나 주변 메모도 쓸 수 있어요
쓰면 더 정확해집니다`,
  },
  {
    kind: 'shot',
    id: 's30',
    chapter: 5,
    round: 2,
    image: 's30.png',
    app: 'swot',
    points: ['사진에서 봤어요 vs 짐작이에요', '근거와 추측을 구분하는 연습'],
    focus: { x: 0.02, y: 0.08, w: 0.96, h: 0.6 },
    script: `결과를 보시면
사진에서 찾은 단서가 먼저 나오고요
각 항목마다 사진에서 봤어요
짐작이에요가 붙어 있어요
아이들이 근거와 추측을 구분하는
연습이 되는 거죠`,
  },
  {
    kind: 'shot',
    id: 's31',
    chapter: 5,
    round: 2,
    image: 's31.png',
    app: 'swot',
    points: ['추가 질문에도 쉬운 말로 답해요'],
    focus: { x: 0.0, y: 0.38, w: 1.0, h: 0.37 },
    script: `그리고 개선할 점이 뭐냐고 물어보면
이렇게 쉬운 말로 답해 줍니다`,
  },

  // 다시 요청 ③
  {
    kind: 'shot',
    id: 's35',
    chapter: 5,
    round: 3,
    image: 's35.png',
    app: 'claudeCode',
    points: ['유명한 회사 예시 10개 요청', '숫자·날짜, 우열 판단은 빼기'],
    focus: { x: 0.0, y: 0.08, w: 1.0, h: 0.2 },
    script: `세 번째로는
실제 유명한 회사 예시를
열 개 정도 올려 달라고 했어요
그랬더니 정확해야 하니까
숫자나 날짜는 빼고
누가 더 좋다는 말도 하지 않겠다고 해요`,
  },
  {
    kind: 'shot',
    id: 's36',
    chapter: 5,
    round: 3,
    image: 's36.png',
    app: 'claudeCode',
    points: ['병합하기 전에 직접 훑어보기', '이게 진짜 중요한 습관'],
    focus: { x: 0.0, y: 0.25, w: 1.0, h: 0.18 },
    script: `그리고 AI가 쓴 글이라
사실을 직접 대조하지 못했으니
병합하기 전에 한 번 훑어보라고 권해요
이런 게 진짜 중요한 습관이에요`,
  },
  {
    kind: 'shot',
    id: 's37',
    chapter: 5,
    round: 3,
    image: 's37.png',
    app: 'github',
    points: ['확인 → merge'],
    focus: { x: 0.04, y: 0.17, w: 0.94, h: 0.17 },
    script: `그렇게 확인하고 merge까지 했습니다`,
  },
  {
    kind: 'shot',
    id: 's38',
    chapter: 5,
    round: 3,
    image: 's38.png',
    app: 'swot',
    points: ['유명한 회사 10곳', 'AI를 기다리지 않고 바로 보기'],
    focus: { x: 0.01, y: 0.54, w: 0.98, h: 0.45 },
    script: `홈 화면에 유명한 회사 열 곳이 생겼어요
삼성전자, 레고, 닌텐도, 디즈니까지
AI를 기다리지 않고 바로 볼 수 있어요`,
  },
  {
    kind: 'shot',
    id: 's39',
    chapter: 5,
    round: 3,
    image: 's39.png',
    app: 'swot',
    points: ['수업 예시로 바로 활용'],
    script: `디즈니를 눌러 보면
이렇게 네 칸이 바로 나와요
수업에서 예시로 보여 주기 좋겠죠`,
  },

  // ───────── 정리 ─────────
  {
    kind: 'lessons',
    id: 'lessons',
    script: `네 오늘 과정을 정리해 보면요
AI 시대의 과제는
AI에게 맡기고 끝나는 게 아니에요
원하는 걸 구체적으로 요청하고
결과를 직접 확인하고
아쉬우면 다시 요청하고
그 과정을 기록으로 남기는 것
이게 AI 시대의 과제라고 생각합니다`,
  },
  {
    kind: 'teacher',
    id: 'teacher',
    script: `지금 보고 계신 선생님들도
결과물만 보시기보다
어떤 프롬프트로 요청했는지
AI와 어떤 대화를 나눴는지
커밋 기록에 무엇이 남았는지를
함께 보시면 좋을 것 같습니다
AI 시대에는 결과보다 과정이
학생의 생각을 더 잘 보여 주니까요`,
  },
  {
    kind: 'outro',
    id: 'outro',
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

export function sceneFrames(scene: Scene, voiceSeconds?: number): number {
  const seconds = voiceSeconds !== undefined ? voiceSeconds + 1.0 : estimateSeconds(scene.script);
  // 전환(겹침) 시간만큼 더해 줘서 말이 잘리지 않게 한다.
  return Math.ceil(seconds * FPS) + TRANSITION_FRAMES;
}
