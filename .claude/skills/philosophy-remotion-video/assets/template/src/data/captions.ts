// 장면별 자막(초 단위, 그 장면 녹음의 시작 기준). align-voice.py --srt 가 자막 파일(SRT)에서 자동으로 채운다.
// 비어 있으면 자막을 켰을 때 대본 줄을 글자 수 비율로 나눠 보여 준다.
export type Cue = { start: number; end: number; text: string };
export const CAPTIONS: Record<string, Cue[]> = {};
