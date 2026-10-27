// 녹음 파일 연결표. 녹음을 받으면 public/voice/ 에 넣고 여기에 "장면 id: 파일 이름"을 적는다.
// 예) intro: 'voice/intro.mp3'
// 적힌 장면은 녹음 길이에 맞춰 장면 길이가 자동으로 바뀐다.
export const VOICE_FILES: Record<string, string> = {};
