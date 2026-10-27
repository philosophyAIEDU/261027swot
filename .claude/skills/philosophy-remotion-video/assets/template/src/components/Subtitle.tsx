import { useCurrentFrame, useVideoConfig } from 'remotion';
import type { Cue } from '../data/captions';
import { FONT_BODY } from '../theme';

interface SubtitleProps {
  script: string;
  /** 말하는 구간(프레임) */
  start: number;
  end: number;
  /** 실제 자막(SRT에서 온 것). 있으면 이 시각대로 보여 준다. */
  cues?: Cue[];
}

function currentText({ script, start, end, cues }: SubtitleProps, frame: number, fps: number): string | null {
  if (cues && cues.length > 0) {
    const t = (frame - start) / fps;
    return cues.find((cue) => t >= cue.start && t < cue.end)?.text ?? null;
  }
  // 자막 파일이 없으면 대본 줄을 글자 수 비율로 나눠 차례로 보여 준다.
  const lines = script.split('\n').map((line) => line.trim()).filter(Boolean);
  const total = lines.reduce((sum, line) => sum + line.length, 0);
  if (frame < start || frame >= end || total === 0) return null;
  const position = ((frame - start) / (end - start)) * total;
  let acc = 0;
  for (const line of lines) {
    acc += line.length;
    if (position < acc) return line;
  }
  return lines[lines.length - 1] ?? null;
}

export function Subtitle(props: SubtitleProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const text = currentText(props, frame, fps);
  if (!text) return null;
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 34, display: 'flex', justifyContent: 'center' }}>
      <div
        style={{
          fontFamily: FONT_BODY,
          fontWeight: 700,
          fontSize: 40,
          color: '#FFFFFF',
          background: 'rgba(43,38,69,0.78)',
          padding: '10px 30px',
          borderRadius: 18,
          maxWidth: 1500,
          textAlign: 'center',
          whiteSpace: 'pre-line',
        }}
      >
        {text}
      </div>
    </div>
  );
}
