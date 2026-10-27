import { useCurrentFrame } from 'remotion';
import { FONT_BODY } from '../theme';

interface SubtitleProps {
  script: string;
  /** 말하는 구간(프레임) */
  start: number;
  end: number;
}

// 대본 줄을 글자 수 비율로 나눠 차례로 보여 주는 자막(선택 기능)
export function Subtitle({ script, start, end }: SubtitleProps) {
  const frame = useCurrentFrame();
  const lines = script.split('\n').map((line) => line.trim()).filter(Boolean);
  const total = lines.reduce((sum, line) => sum + line.length, 0);
  if (frame < start || frame >= end || total === 0) return null;
  const position = ((frame - start) / (end - start)) * total;
  let acc = 0;
  let current = lines[lines.length - 1]!;
  for (const line of lines) {
    acc += line.length;
    if (position < acc) {
      current = line;
      break;
    }
  }
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
        }}
      >
        {current}
      </div>
    </div>
  );
}
