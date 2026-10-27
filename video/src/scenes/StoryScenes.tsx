import type { ReactNode } from 'react';
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { Background } from '../components/Background';
import { Sticker } from '../components/Sticker';
import { TopBar } from '../components/TopBar';
import { CHAPTERS } from '../data/scenes';
import { COLORS, FONT_BODY, FONT_TITLE } from '../theme';

function usePop(delay: number, damping = 14) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping, stiffness: 120 } });
}

/** 형광펜으로 칠하듯 뒤에 파스텔 띠가 그려지는 글자 */
function Marker({ children, color, delay }: { children: ReactNode; color: string; delay: number }) {
  const frame = useCurrentFrame();
  const width = interpolate(frame, [delay, delay + 20], [0, 100], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  return (
    <span style={{ position: 'relative', display: 'inline-block' }}>
      <span
        style={{
          position: 'absolute',
          left: -12,
          bottom: 8,
          height: '42%',
          width: `calc(${width}% + 24px)`,
          background: color,
          borderRadius: 14,
          zIndex: 0,
        }}
      />
      <span style={{ position: 'relative', zIndex: 1 }}>{children}</span>
    </span>
  );
}

function Card({ children, delay, style }: { children: ReactNode; delay: number; style?: React.CSSProperties }) {
  const pop = usePop(delay);
  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.9)',
        borderRadius: 32,
        boxShadow: `0 24px 60px ${COLORS.shadow}`,
        opacity: pop,
        transform: `translateY(${interpolate(pop, [0, 1], [40, 0])}px) scale(${interpolate(pop, [0, 1], [0.9, 1])})`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ───────────────────────── 오프닝 ─────────────────────────
export function TitleScene() {
  const sub = usePop(34);
  const chip = usePop(6);
  return (
    <AbsoluteFill>
      <Background />
      <Sticker emoji="🤖" size={130} x={180} y={170} delay={10} rotate={-10} />
      <Sticker emoji="✍️" size={110} x={1580} y={180} delay={16} rotate={12} />
      <Sticker emoji="🚀" size={110} x={1600} y={700} delay={22} rotate={-8} />
      <Sticker emoji="🧭" size={120} x={220} y={720} delay={28} rotate={8} />
      <Sticker emoji="💡" size={80} x={1350} y={90} delay={34} />
      <Sticker emoji="📚" size={80} x={470} y={880} delay={40} />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 34 }}>
        <div
          style={{
            fontFamily: FONT_BODY,
            fontWeight: 800,
            fontSize: 34,
            color: CHAPTERS[0]!.ink,
            background: '#FFFFFF',
            padding: '12px 32px',
            borderRadius: 999,
            boxShadow: `0 12px 30px ${COLORS.shadow}`,
            opacity: chip,
            transform: `scale(${chip})`,
          }}
        >
          지난 영상 후속편 ✨
        </div>
        <div style={{ fontFamily: FONT_TITLE, fontSize: 150, color: COLORS.ink, textAlign: 'center', lineHeight: 1.18 }}>
          <Marker color={COLORS.lavender} delay={12}>
            AI 시대의 과제,
          </Marker>
          <br />
          <Marker color={COLORS.mint} delay={24}>
            실제로 해 보기
          </Marker>
        </div>
        <div
          style={{
            fontFamily: FONT_BODY,
            fontWeight: 700,
            fontSize: 42,
            color: COLORS.inkSoft,
            opacity: sub,
            transform: `translateY(${interpolate(sub, [0, 1], [24, 0])}px)`,
          }}
        >
          초등학생용 SWOT 분석 앱을 AI와 함께 처음부터 끝까지
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

// ───────────────────────── 오늘의 과제 ─────────────────────────
const TASK_CHIPS = [
  { emoji: '🧒', text: '초등 3학년도 읽는 쉬운 말' },
  { emoji: '🆚', text: '두 회사를 말하면 비교' },
  { emoji: '💬', text: '궁금한 건 더 물어보기' },
  { emoji: '🔑', text: '내 API 키로 Gemini 연결' },
];
const SWOT_TILES = [
  { letter: 'S', name: '잘하는 점', emoji: '💪', bg: '#DBEAFE', ink: '#1E3A8A' },
  { letter: 'W', name: '아쉬운 점', emoji: '🩹', bg: '#E0E7FF', ink: '#312E81' },
  { letter: 'O', name: '기회', emoji: '🌱', bg: '#DCFCE7', ink: '#14532D' },
  { letter: 'T', name: '조심할 점', emoji: '⚠️', bg: '#FFEDD5', ink: '#7C2D12' },
];

export function TaskScene() {
  return (
    <AbsoluteFill>
      <Background accent={COLORS.butter} />
      <Card delay={0} style={{ position: 'absolute', left: 110, top: 120, width: 980, height: 840, padding: '54px 64px' }}>
        <div style={{ fontFamily: FONT_BODY, fontWeight: 900, fontSize: 34, color: '#B4512A', letterSpacing: 2 }}>📋 오늘의 과제</div>
        <div style={{ fontFamily: FONT_TITLE, fontSize: 80, color: COLORS.ink, lineHeight: 1.2, marginTop: 18 }}>
          초등학생도 이해하는
          <br />
          <Marker color={COLORS.peach} delay={14}>
            SWOT 분석 앱
          </Marker>{' '}
          만들기
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 40 }}>
          {TASK_CHIPS.map((chip, index) => (
            <TaskChip key={chip.text} chip={chip} delay={30 + index * 12} />
          ))}
        </div>
      </Card>
      <div style={{ position: 'absolute', left: 1170, top: 210, display: 'grid', gridTemplateColumns: '300px 300px', gap: 22 }}>
        {SWOT_TILES.map((tile, index) => (
          <SwotTile key={tile.letter} tile={tile} delay={20 + index * 8} />
        ))}
      </div>
    </AbsoluteFill>
  );
}

function TaskChip({ chip, delay }: { chip: (typeof TASK_CHIPS)[number]; delay: number }) {
  const pop = usePop(delay);
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        background: COLORS.paper,
        border: `3px solid ${COLORS.lavender}`,
        borderRadius: 22,
        padding: '14px 24px',
        fontFamily: FONT_BODY,
        fontWeight: 700,
        fontSize: 34,
        color: COLORS.ink,
        opacity: pop,
        transform: `scale(${interpolate(pop, [0, 1], [0.85, 1])})`,
      }}
    >
      <span style={{ fontSize: 40 }}>{chip.emoji}</span>
      {chip.text}
    </div>
  );
}

function SwotTile({ tile, delay }: { tile: (typeof SWOT_TILES)[number]; delay: number }) {
  const pop = usePop(delay, 11);
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        height: 300,
        borderRadius: 34,
        background: tile.bg,
        border: `5px solid ${tile.ink}33`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        color: tile.ink,
        boxShadow: `0 20px 44px ${COLORS.shadow}`,
        transform: `scale(${pop}) rotate(${Math.sin((frame + delay * 4) / 30) * 2}deg)`,
      }}
    >
      <div style={{ fontSize: 76 }}>{tile.emoji}</div>
      <div style={{ fontFamily: FONT_TITLE, fontSize: 74 }}>{tile.letter}</div>
      <div style={{ fontFamily: FONT_BODY, fontWeight: 800, fontSize: 32 }}>{tile.name}</div>
    </div>
  );
}

// ───────────────────────── 전체 흐름 ─────────────────────────
export function FlowScene({ duration }: { duration: number }) {
  const frame = useCurrentFrame();
  const startX = 210;
  const gapX = 375;
  const y = 560;
  // 장면 길이 안에서 단계마다 차례로 불이 켜진다.
  const stepAt = (index: number) => 20 + index * Math.round((duration * 0.62) / CHAPTERS.length);
  const lineProgress = interpolate(frame, [stepAt(0), stepAt(CHAPTERS.length - 1)], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const loop = usePop(stepAt(CHAPTERS.length - 1) + 12);
  return (
    <AbsoluteFill>
      <Background accent={COLORS.sky} />
      <div style={{ position: 'absolute', top: 120, width: '100%', textAlign: 'center' }}>
        <div style={{ fontFamily: FONT_TITLE, fontSize: 92, color: COLORS.ink }}>
          과제는 이렇게 <Marker color={COLORS.sky} delay={6}>다섯 단계</Marker>로
        </div>
      </div>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        <line
          x1={startX}
          y1={y}
          x2={startX + (CHAPTERS.length - 1) * gapX * lineProgress}
          y2={y}
          stroke="#B9AEE8"
          strokeWidth={10}
          strokeDasharray="4 22"
          strokeLinecap="round"
        />
        <path
          d={`M ${startX + 4 * gapX} ${y + 215} C ${startX + 4 * gapX} ${y + 360}, ${startX + 3 * gapX} ${y + 360}, ${startX + 3 * gapX} ${y + 225}`}
          fill="none"
          stroke={CHAPTERS[4]!.ink}
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray="600"
          strokeDashoffset={600 * (1 - loop)}
          markerEnd="url(#arrow)"
        />
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={CHAPTERS[4]!.ink} />
          </marker>
        </defs>
      </svg>
      <div
        style={{
          position: 'absolute',
          left: startX + 3.5 * gapX - 110,
          top: y + 330,
          width: 220,
          textAlign: 'center',
          fontFamily: FONT_TITLE,
          fontSize: 38,
          color: CHAPTERS[4]!.ink,
          opacity: loop,
        }}
      >
        반복!
      </div>
      {CHAPTERS.map((chapter, index) => (
        <FlowNode key={chapter.n} chapter={chapter} x={startX + index * gapX} y={y} delay={stepAt(index)} />
      ))}
    </AbsoluteFill>
  );
}

function FlowNode({ chapter, x, y, delay }: { chapter: (typeof CHAPTERS)[number]; x: number; y: number; delay: number }) {
  const pop = usePop(delay, 10);
  return (
    <div
      style={{
        position: 'absolute',
        left: x - 175,
        top: y - 110,
        width: 350,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 18,
        transform: `scale(${pop})`,
      }}
    >
      <div
        style={{
          width: 220,
          height: 220,
          borderRadius: '50%',
          background: chapter.soft,
          border: `6px solid ${chapter.ink}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 100,
          boxShadow: `0 20px 44px ${COLORS.shadow}`,
          position: 'relative',
        }}
      >
        {chapter.emoji}
        <div
          style={{
            position: 'absolute',
            top: -6,
            right: -6,
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: chapter.ink,
            color: '#FFFFFF',
            fontFamily: FONT_TITLE,
            fontSize: 38,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {chapter.n}
        </div>
      </div>
      <div style={{ fontFamily: FONT_BODY, fontWeight: 800, fontSize: 31, color: COLORS.ink, textAlign: 'center', lineHeight: 1.3 }}>
        {chapter.title}
      </div>
    </div>
  );
}

// ───────────────────────── 단계 표지 ─────────────────────────
export function ChapterScene({ chapterNumber }: { chapterNumber: number }) {
  const chapter = CHAPTERS[chapterNumber - 1]!;
  const frame = useCurrentFrame();
  const circle = usePop(2, 12);
  const title = usePop(10);
  const sub = usePop(20);
  return (
    <AbsoluteFill>
      <Background accent={chapter.soft} />
      <TopBar chapter={chapter.n} />
      <div
        style={{
          position: 'absolute',
          left: 170,
          top: 290,
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: chapter.soft,
          border: `10px solid #FFFFFF`,
          boxShadow: `0 40px 90px ${COLORS.shadow}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `scale(${circle}) rotate(${interpolate(circle, [0, 1], [-30, 0])}deg)`,
        }}
      >
        <div style={{ fontFamily: FONT_TITLE, fontSize: 330, color: chapter.ink, lineHeight: 1, marginTop: 30 }}>{chapter.n}</div>
        <div style={{ position: 'absolute', right: -20, bottom: 10, fontSize: 150, transform: `rotate(${Math.sin(frame / 20) * 8}deg)` }}>
          {chapter.emoji}
        </div>
      </div>
      <div style={{ position: 'absolute', left: 780, top: 360, width: 1000 }}>
        <div
          style={{
            fontFamily: FONT_BODY,
            fontWeight: 900,
            fontSize: 40,
            letterSpacing: 6,
            color: chapter.ink,
            opacity: title,
          }}
        >
          STEP {chapter.n}
        </div>
        <div
          style={{
            fontFamily: FONT_TITLE,
            fontSize: 112,
            lineHeight: 1.15,
            color: COLORS.ink,
            marginTop: 10,
            opacity: title,
            transform: `translateX(${interpolate(title, [0, 1], [60, 0])}px)`,
          }}
        >
          {chapter.title}
        </div>
        <div
          style={{
            fontFamily: FONT_BODY,
            fontWeight: 600,
            fontSize: 42,
            lineHeight: 1.5,
            color: COLORS.inkSoft,
            marginTop: 30,
            opacity: sub,
          }}
        >
          {chapter.subtitle}
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ───────────────────────── 정리 ─────────────────────────
const LESSONS = [
  { emoji: '🎯', title: '구체적으로 요청하기', text: '프롬프트로 원하는 것을 자세히' },
  { emoji: '🔍', title: '직접 확인하기', text: 'AI 결과를 읽고 판단하기' },
  { emoji: '🔁', title: '다시 요청하기', text: '아쉬운 점을 찾아 더 나아지게' },
  { emoji: '📝', title: '기록 남기기', text: '대화와 커밋으로 과정 남기기' },
];
const LESSON_COLORS = [COLORS.lavender, COLORS.sky, COLORS.pink, COLORS.mint];

export function LessonsScene({ duration }: { duration: number }) {
  const at = (index: number) => Math.round(duration * (0.3 + index * 0.13));
  return (
    <AbsoluteFill>
      <Background accent={COLORS.lavender} />
      <div style={{ position: 'absolute', top: 130, width: '100%', textAlign: 'center' }}>
        <div style={{ fontFamily: FONT_TITLE, fontSize: 96, color: COLORS.ink }}>
          AI 시대의 과제는 <Marker color={COLORS.butter} delay={10}>이렇게</Marker>
        </div>
        <div style={{ fontFamily: FONT_BODY, fontWeight: 700, fontSize: 40, color: COLORS.inkSoft, marginTop: 16 }}>
          AI에게 맡기고 끝나는 게 아니에요
        </div>
      </div>
      <div style={{ position: 'absolute', left: 110, right: 110, top: 470, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 30 }}>
        {LESSONS.map((lesson, index) => (
          <Card key={lesson.title} delay={at(index)} style={{ padding: '46px 30px', textAlign: 'center', background: '#FFFFFF' }}>
            <div
              style={{
                width: 150,
                height: 150,
                margin: '0 auto',
                borderRadius: '50%',
                background: LESSON_COLORS[index],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 80,
              }}
            >
              {lesson.emoji}
            </div>
            <div style={{ fontFamily: FONT_TITLE, fontSize: 50, color: COLORS.ink, marginTop: 28 }}>{lesson.title}</div>
            <div style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: 31, color: COLORS.inkSoft, marginTop: 14, lineHeight: 1.45 }}>
              {lesson.text}
            </div>
          </Card>
        ))}
      </div>
    </AbsoluteFill>
  );
}

const WINDOWS = [
  { emoji: '✍️', title: '프롬프트', text: '무엇을 요청했나' },
  { emoji: '💬', title: 'AI와의 대화', text: '어떻게 확인했나' },
  { emoji: '🗂️', title: '커밋 기록', text: '무엇을 고쳐 나갔나' },
];

export function TeacherScene({ duration }: { duration: number }) {
  const at = (index: number) => Math.round(duration * (0.2 + index * 0.12));
  const quote = usePop(Math.round(duration * 0.68));
  return (
    <AbsoluteFill>
      <Background accent={COLORS.peach} />
      <Sticker emoji="🧑‍🏫" size={140} x={1640} y={110} delay={6} rotate={6} />
      <div style={{ position: 'absolute', left: 140, top: 140 }}>
        <div style={{ fontFamily: FONT_BODY, fontWeight: 900, fontSize: 36, letterSpacing: 4, color: '#B4512A' }}>선생님들께</div>
        <div style={{ fontFamily: FONT_TITLE, fontSize: 92, color: COLORS.ink, marginTop: 10 }}>
          결과물보다 <Marker color={COLORS.peach} delay={10}>과정</Marker>을 함께 봐 주세요
        </div>
      </div>
      <div style={{ position: 'absolute', left: 140, right: 140, top: 430, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 36 }}>
        {WINDOWS.map((item, index) => (
          <Card key={item.title} delay={at(index)} style={{ padding: '40px 40px', display: 'flex', gap: 26, alignItems: 'center' }}>
            <div style={{ fontSize: 86 }}>{item.emoji}</div>
            <div>
              <div style={{ fontFamily: FONT_TITLE, fontSize: 52, color: COLORS.ink }}>{item.title}</div>
              <div style={{ fontFamily: FONT_BODY, fontWeight: 700, fontSize: 34, color: COLORS.inkSoft, marginTop: 6 }}>{item.text}</div>
            </div>
          </Card>
        ))}
      </div>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 760,
          textAlign: 'center',
          fontFamily: FONT_TITLE,
          fontSize: 58,
          color: COLORS.ink,
          opacity: quote,
          transform: `translateY(${interpolate(quote, [0, 1], [30, 0])}px)`,
        }}
      >
        “AI 시대에는 결과보다 과정이 생각을 더 잘 보여 줘요”
      </div>
    </AbsoluteFill>
  );
}

// ───────────────────────── 마무리 ─────────────────────────
export function OutroScene() {
  const frame = useCurrentFrame();
  const title = usePop(4);
  const like = usePop(22, 9);
  const sub = usePop(32, 9);
  const press = (start: number) =>
    interpolate(frame, [start, start + 5, start + 12], [1, 0.9, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill>
      <Background accent={COLORS.pink} />
      <Sticker emoji="🎉" size={120} x={240} y={200} delay={10} rotate={-12} />
      <Sticker emoji="💜" size={100} x={1580} y={230} delay={16} />
      <Sticker emoji="🌷" size={100} x={300} y={760} delay={22} rotate={10} />
      <Sticker emoji="✨" size={90} x={1560} y={760} delay={28} />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 50 }}>
        <div style={{ fontFamily: FONT_TITLE, fontSize: 120, color: COLORS.ink, opacity: title, transform: `scale(${interpolate(title, [0, 1], [0.9, 1])})` }}>
          오늘의 영상 여기까지입니다
        </div>
        <div style={{ display: 'flex', gap: 36 }}>
          <div
            style={{
              fontFamily: FONT_BODY,
              fontWeight: 900,
              fontSize: 48,
              color: CHAPTERS[0]!.ink,
              background: '#FFFFFF',
              padding: '24px 54px',
              borderRadius: 999,
              boxShadow: `0 20px 50px ${COLORS.shadow}`,
              transform: `scale(${like * press(48)})`,
            }}
          >
            👍 좋아요
          </div>
          <div
            style={{
              fontFamily: FONT_BODY,
              fontWeight: 900,
              fontSize: 48,
              color: '#FFFFFF',
              background: '#E0567F',
              padding: '24px 54px',
              borderRadius: 999,
              boxShadow: `0 20px 50px ${COLORS.shadow}`,
              transform: `scale(${sub * press(62)})`,
            }}
          >
            🔔 구독
          </div>
        </div>
        <div style={{ fontFamily: FONT_TITLE, fontSize: 52, color: COLORS.inkSoft, opacity: sub }}>필로소피 AI 교육</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
