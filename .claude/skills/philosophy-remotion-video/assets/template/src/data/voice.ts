// 녹음 파일 연결표: "장면 id: public 안의 파일 경로".
// 장면별 녹음을 받으면 직접 적고, 한 번에 녹음한 파일은 scripts/align-voice.py 가 자동으로 채운다.
// 적힌 장면은 녹음 길이에 맞춰 장면 길이가 바뀐다.
export const VOICE_FILES: Record<string, string> = {};
