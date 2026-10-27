# scenes.ts 작성 안내

`src/data/scenes.ts`에서 영상에 맞게 바꿀 것: `META`(제목·설명·태그), `SERIES`(시리즈 이름), `CHAPTERS`(단계), `APPS`(창 이름·주소), `SCENES`(장면).
이 파일은 다른 파일을 import하지 않는다(node 스크립트가 바로 읽기 때문). 타입은 파일 위쪽 `Scene` 정의를 따른다.

## 목차
1. 공통 규칙
2. 장면 종류별 필드와 예시
3. focus·blur 좌표 정하기
4. 단계 색 고르기
5. 장면 구성 예(실제 영상)

## 1. 공통 규칙

- `id`는 영상 안에서 겹치지 않게, 녹음 파일 이름으로도 쓰이니 짧은 영문(예: `intro`, `ch1`, `s03`)으로.
- `script`는 녹음할 말. 줄바꿈 = 숨 쉬는 곳. 화면 지시(`[화면: …]`)는 넣지 않는다(대본.md에 자동으로 붙는다).
- 캡처·영상 장면의 `chapter`는 1부터. 그 단계의 색과 STEP 배지가 쓰인다. 단계 표지(`chapter` 장면)를 그 단계 첫 장면 앞에 둔다.
- `round`(선택): 단계 안의 작은 소제목. 오른쪽 패널에 점선 배지로 뜬다.
- `points`: 1~3개, 한 줄 20자 안팎. 두 줄까지는 괜찮다.

## 2. 장면 종류

### title — 오프닝
```ts
{ kind: 'title', id: 'intro', kicker: '지난 영상 후속편 ✨', lines: ['AI 시대의 과제,', '실제로 해 보기'],
  subtitle: '초등학생용 SWOT 분석 앱을 AI와 함께 처음부터 끝까지', stickers: ['🤖','✍️','🚀','🧭','💡','📚'], script: `…` }
```
`lines`는 1~2줄, 줄마다 8~10자 안팎(140px 글씨). `stickers`는 최대 6개, 화면 가장자리에 둥실 떠 있다.

### brief — 주제 소개
```ts
{ kind: 'brief', id: 'task', label: '📋 오늘의 과제', title: ['초등학생도 이해하는', 'SWOT 분석 앱 만들기'], highlight: 'SWOT 분석 앱',
  chips: [{ emoji: '🧒', text: '초등 3학년도 읽는 쉬운 말' }, …],
  tiles: [{ emoji: '💪', big: 'S', label: '잘하는 점', bg: '#DBEAFE', ink: '#1E3A8A' }, …], script: `…` }
```
`chips` 3~4개(한 줄 20자 이내). `tiles`는 0~4개 — 없으면 카드가 화면 전체 폭을 쓴다.

### flow — 단계 흐름도
```ts
{ kind: 'flow', id: 'flow', title: '과제는 이렇게 다섯 단계로', highlight: '다섯 단계', loop: true, script: `…` }
```
`CHAPTERS` 전체를 원으로 잇는다. `loop: true`면 마지막 단계에서 앞 단계로 "반복!" 화살표.

### chapter — 단계 표지
```ts
{ kind: 'chapter', id: 'ch2', chapter: 2, script: `두 번째 단계는\n코딩 AI에게 맡기는 거예요` }
```

### shot — 캡처
```ts
{ kind: 'shot', id: 's11', chapter: 4, image: 's11.png', app: 'aiStudio',
  points: ['Google AI Studio → Create API key', '키는 다른 사람에게 보여 주지 않기'],
  focus: { x: 0.8, y: 0.04, w: 0.19, h: 0.12 },
  blur: [{ x: 0.19, y: 0.37, w: 0.13, h: 0.62 }], script: `…` }
```
`app`은 `APPS`의 키 — 창 위쪽에 프로그램 이름·주소로 보인다(예: `{ name: 'GitHub', url: 'github.com/계정/저장소', icon: '🐙' }`).
장면 22%~42% 사이에 focus 영역으로 확대하고 주변을 어둡게 한다. focus가 없으면 아주 천천히 다가가기만 한다(그림 전체가 중요할 때).

### clip — 화면 녹화
```ts
{ kind: 'clip', id: 'demo', chapter: 3, video: 'demo.mp4', app: 'web', from: 12, to: 30, rate: 1.5,
  points: ['결과가 바로 나와요'], focus: { … }, script: `…` }
```
- `from`/`to`: 원본에서 쓸 구간(초). `rate`: 재생 속도(긴 대기 시간은 1.5~2배로).
- 녹음(내레이션) 장면이 영상보다 길면 마지막 화면에서 멈춰 있다. 녹음이 없으면 장면이 영상 길이보다 짧아지지 않는다.
- `withSound: true`: 녹화하며 말한 원래 소리를 쓴다. 이때 장면 길이 = 영상 길이, 이 장면은 내레이션 싱크 대상에서 빠진다. 자막은 `captions-from-srt.py`로.
- mov·webm도 되지만 렌더가 느리면 `ffmpeg -i in.mov -c:v libx264 -pix_fmt yuv420p -c:a aac out.mp4`로 바꿔 둔다.

### photos — 사진 두 장
```ts
{ kind: 'photos', id: 'photos', chapter: 5, round: '다시 요청 ② 가게 사진 분석', images: ['s24.png','s25.png'],
  captions: ['분위기 있는 레스토랑', '오래된 동네 식당'], points: ['분위기가 다른 사진 두 장으로 테스트'], script: `…` }
```

### cards — 정리·당부
```ts
{ kind: 'cards', id: 'lessons', title: 'AI 시대의 과제는 이렇게', highlight: '이렇게', subtitle: 'AI에게 맡기고 끝나는 게 아니에요',
  cards: [{ emoji: '🎯', title: '구체적으로 요청하기', text: '프롬프트로 원하는 것을 자세히' }, …], script: `…` }
// 선생님께 당부형: kicker: '선생님들께', quote: 'AI 시대에는 결과보다 과정이 생각을 더 잘 보여 줘요', sticker: '🧑‍🏫'
```
카드 2~4개. `quote`가 있고 카드가 3개 이하면 가로로 납작한 카드 + 아래 인용문 배치가 된다.

### outro — 마무리
```ts
{ kind: 'outro', id: 'outro', channel: '필로소피 AI 교육', script: `오늘의 영상 여기까지입니다\n…` }
```

## 3. focus·blur 좌표 정하기

좌표는 **그림 크기 기준 비율**(0~1): `x`·`y`는 왼쪽 위 모서리, `w`·`h`는 폭·높이.
그림을 Read로 보면서 대략 정하고(예: 1158×813 그림에서 오른쪽 절반 위쪽 → `x: 0.53, y: 0.1, w: 0.46, h: 0.5`), `node scripts/stills.ts <id>`로 확인해 고친다.
- 강조 영역은 글자 덩어리 하나(문단, 버튼, 입력창) 정도가 좋다. 너무 작으면 최대 확대(2.4배)에서 멈춘다.
- blur는 확대와 함께 움직인다. 키·이메일·계정 번호·사람 얼굴은 확대 전 전체 화면에서 가려졌는지 꼭 확인한다(장면 시작 직후 프레임).

## 4. 단계 색

| 이름 | soft(바탕) | ink(글자) |
| --- | --- | --- |
| 라벤더 | `#E7DEFF` | `#5B3FD1` |
| 하늘 | `#DCEBFF` | `#2F64C8` |
| 민트 | `#D7F5E8` | `#1E7A55` |
| 복숭아 | `#FFE3D6` | `#B4512A` |
| 분홍 | `#FFDDEB` | `#B0336F` |

단계 순서대로 위 색을 차례로 쓴다. 다른 색을 쓰려면 ink가 soft·흰 바탕 위에서 대비 4.5:1 이상인지 확인한다.

## 5. 장면 구성 예 (실제 영상: "AI 시대의 과제, 실제로 해 보기", 49장면 9.6분)

intro(title) → task(brief) → flow → ch1 → s01, s02 → ch2 → s03~s06 → ch3 → s07~s09 → ch4 → s10~s17 → ch5 → 다시 요청 ①(s18~s21, s32~s34) → ②(s22, s23, photos, s26~s31) → ③(s35~s39) → lessons(cards) → teacher(cards, quote) → outro.
캡처 한 장 = 장면 하나가 기본이고, 장면당 대본 2~7줄. 짧은 장면(1~2줄)은 커밋 기록·버튼 하나 보여 주기처럼 화면이 단순할 때만.
