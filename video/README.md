# 🎬 AI 시대의 과제, 실제로 해 보기 (후속편) — Remotion 영상

SWOT 탐험대 앱을 AI와 함께 만든 과정을 보여 주는 영상 프로젝트예요. 앱(상위 폴더)과는 따로 동작합니다.

## 바로 해 보기

```bash
cd video
npm install
npm run studio          # 브라우저에서 미리 보기·장면 확인
npm run render          # out/ai-assignment.mp4 (1920×1080, 30fps)
npm run render:preview  # 절반 크기로 빠르게 확인
npm run script          # 대본.md 다시 만들기
```

## 파일 구성

| 위치 | 내용 |
| --- | --- |
| `src/data/scenes.ts` | **모든 장면**: 대본(녹음 문장), 화면 핵심 문구, 확대할 영역, 흐리게 할 영역 |
| `src/data/voice.ts` | 녹음 파일 연결표 |
| `public/shots/` | PPT에서 꺼낸 캡처 39장 (`s01.png` ~ `s39.png`, 슬라이드 순서) |
| `src/scenes/` | 장면 디자인 (오프닝, 과제, 흐름도, 단계 표지, 캡처, 정리, 마무리) |
| `대본.md` | 녹음용 대본 (`npm run script`로 `scenes.ts`에서 자동 생성) |

## 녹음 파일 넣는 법

1. 장면별 녹음 파일을 `public/voice/`에 넣어요. 파일 이름은 대본의 `[녹음 파일: ○○]`과 같게 해요(예: `intro.mp3`, `s01.mp3`).
2. `src/data/voice.ts`에 적어요.
   ```ts
   export const VOICE_FILES: Record<string, string> = {
     intro: 'voice/intro.mp3',
     s01: 'voice/s01.mp3',
   };
   ```
3. 다시 렌더링하면 **장면 길이가 녹음 길이에 맞춰 자동으로** 바뀌어요(녹음 길이 + 1초 여유).

자막을 넣고 싶으면 렌더링할 때 `--props='{"showSubtitles":true}'`를 붙이면 대본이 화면 아래에 나와요.

## 손보기

- **문장·핵심 문구 바꾸기**: `src/data/scenes.ts`의 `script`, `points`를 고치고 `npm run script`로 대본도 다시 만들어요.
- **확대 위치 바꾸기**: 장면의 `focus: { x, y, w, h }` (캡처 기준 0~1 비율)를 고쳐요. 없애면 확대 없이 천천히 다가가는 효과만 나와요.
- **가릴 부분**: `blur`에 같은 방식으로 영역을 적어요(지금은 API 키 목록 화면의 키 이름·프로젝트 이름을 흐리게 처리).
- **색**: `CHAPTERS`의 `soft`(파스텔 바탕)와 `ink`(진한 글자색)를 바꿔요.

## 참고

- 글꼴: Jua, Noto Sans KR — 둘 다 SIL Open Font License (`public/fonts/OFL-*.txt`).
- Remotion은 개인과 직원 3명 이하 회사는 무료이고, 그보다 큰 회사·기관은 회사용 라이선스가 필요해요. 자세한 조건은 remotion.dev/license 를 확인해 주세요.
