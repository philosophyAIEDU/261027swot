# 🎬 파스텔 톤 Remotion 영상 프로젝트

필로소피 AI 교육 스타일 영상을 만드는 프로젝트예요. 장면·대본·핵심 문구가 모두 `src/data/scenes.ts` 한 파일에 있고, 영상과 녹음용 대본(`대본.md`)이 같이 만들어져요.

## 명령어

```bash
npm run studio            # 브라우저에서 미리 보기
npm run stills            # 장면마다 점검용 정지 화면 (out/stills/)
npm run script            # 녹음용 대본 대본.md 만들기
npm run render            # 영상 만들기(1분씩 나눠 만들고 이어 붙임, 멈춰도 이어서 됨) → out/video.mp4
npm run render:subtitles  # 자막을 넣은 영상 → out/video-subtitles.mp4
npm run media             # 캡처·영상을 넣거나 바꾼 뒤 크기 표 다시 만들기
```

## 자료 넣기

| 자료 | 넣는 곳 / 명령 |
| --- | --- |
| PPT | `python3 scripts/extract-pptx.py 발표.pptx` → `public/shots/s01.png …`, 슬라이드 글자·노트는 `slides.json` |
| 캡처 이미지 | `public/shots/` |
| 화면 녹화 영상 | `public/clips/` |
| 장면별 녹음 | `public/voice/` 에 넣고 `src/data/voice.ts`에 적기 |
| 한 번에 녹음한 파일 | `python3 scripts/align-voice.py 녹음.m4a` (쉼으로 나누기) |
| 녹음 + 자막(SRT) | `python3 scripts/align-voice.py 녹음.m4a --srt 자막.srt` (가장 정확, 자막도 들어감) |
| 말하며 녹화한 영상 + 자막(SRT) | 장면을 `clip` + `withSound: true`로 만들고 `python3 scripts/captions-from-srt.py 자막.srt` |

자료를 넣은 뒤에는 `npm run media`로 크기 표를 다시 만들어요.

## 장면 손보기 (`src/data/scenes.ts`)

- `script`: 녹음할 문장. 줄바꿈은 숨 쉬는 곳.
- `points`: 오른쪽에 뜨는 핵심 문구(1~3개).
- `focus: { x, y, w, h }`: 확대해서 강조할 부분(그림 기준 0~1 비율).
- `blur`: 흐리게 가릴 부분(API 키, 이메일, 얼굴 등).
- `CHAPTERS`: 단계 이름·이모지·색. `APPS`: 창 위쪽에 보이는 프로그램 이름·주소.

## 참고

- 글꼴: Jua, Noto Sans KR (SIL Open Font License, `scripts/fetch-fonts.sh`로 받음).
- Remotion은 개인과 직원 3명 이하 회사는 무료이고, 그보다 큰 회사·기관은 회사용 라이선스가 필요해요(remotion.dev/license).
