import type { CSSProperties, ReactNode } from 'react';
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { Background } from '../components/Background';
import { Sticker } from '../components/Sticker';
import { TopBar } from '../components/TopBar';
import { CHAPTERS, type CardItem, type Chip, type Scene, type Tile } from '../data/scenes';
import { COLORS, FONT_BODY, FONT_TITLE } from '../theme';

const PASTELS = [COLORS.lavender, COLORS.sky, COLORS.mint, COLORS.peach, COLORS.pink, COLORS.butter];

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

/** 문장 속 highlight 부분만 형광펜 처리 */
function Highlighted({ text, highlight, color, delay }: { text: string; highlight?: string; color: string; delay: number }) {
  if (!highlight || !text.includes(highlight)) return <>{text}</>;
  const [before, ...rest] = text.split(highlight);
  return (
    <>
      {before}
      <Marker color={color} delay={delay}>
        {highlight}
      </Marker>
      {rest.join(highlight)}
    </>
  );
}

function Card({ children, delay, style }: { children: ReactNode; delay: number; style?: CSSProperties }) {
  const pop = usePop(delay);
  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.92)',
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
const STICKER_SPOTS = [
  { x: 180, y: 170, size: 130, rotate: -10 },
  { x: 1580, y: 180, size: 110, rotate: 12 },
  { x: 1600, y: 700, size: 110, rotate: -8 },
  { x: 220, y: 720, size: 120, rotate: 8 },
  { x: 1350, y: 90, size: 80, rotate: 0 },
  { x: 470, y: 880, size: 80, rotate: 0 },
];

export function TitleScene({ scene }: { scene: Extract<Scene, { kind: 'title' }> }) {
  const sub = usePop(34);
  const chip = usePop(6);
  const stickers = scene.stickers ?? ['✨', '💡', '📚', '🚀'];
  return (
    <AbsoluteFill>
      <Background />
      {stickers.slice(0, STICKER_SPOTS.length).map((emoji, index) => {
        const spot = STICKER_SPOTS[index]!;
        return <Sticker key={index} emoji={emoji} size={spot.size} x={spot.x} y={spot.y} delay={10 + index * 6} rotate={spot.rotate} />;
      })}
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 34, padding: '0 260px' }}>
        {scene.kicker && (
          <div
            style={{
              fontFamily: FONT_BODY,
              fontWeight: 800,
              fontSize: 34,
              color: CHAPTERS[0]?.ink ?? COLORS.ink,
              background: '#FFFFFF',
              padding: '12px 32px',
              borderRadius: 999,
              boxShadow: `0 12px 30px ${COLORS.shadow}`,
              opacity: chip,
              transform: `scale(${chip})`,
            }}
          >
            {scene.kicker}
          </div>
        )}
        <div style={{ fontFamily: FONT_TITLE, fontSize: 140, color: COLORS.ink, textAlign: 'center', lineHeight: 1.18 }}>
          {scene.lines.map((line, index) => (
            <div key={line}>
              <Marker color={PASTELS[(index * 2) % PASTELS.length]!} delay={12 + index * 12}>
                {line}
              </Marker>
            </div>
          ))}
        </div>
        {scene.subtitle && (
          <div
            style={{
              fontFamily: FONT_BODY,
              fontWeight: 700,
              fontSize: 42,
              color: COLORS.inkSoft,
              textAlign: 'center',
              opacity: sub,
              transform: `translateY(${interpolate(sub, [0, 1], [24, 0])}px)`,
            }}
          >
            {scene.subtitle}
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

// ───────────────────────── 주제 소개 카드 ─────────────────────────
function BriefChip({ chip, delay }: { chip: Chip; delay: number }) {
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

function BriefTile({ tile, delay }: { tile: Tile; delay: number }) {
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
      {tile.big && <div style={{ fontFamily: FONT_TITLE, fontSize: 74 }}>{tile.big}</div>}
      <div style={{ fontFamily: FONT_BODY, fontWeight: 800, fontSize: 32, textAlign: 'center' }}>{tile.label}</div>
    </div>
  );
}

export function BriefScene({ scene }: { scene: Extract<Scene, { kind: 'brief' }> }) {
  const tiles = scene.tiles ?? [];
  const wide = tiles.length === 0;
  return (
    <AbsoluteFill>
      <Background accent={COLORS.butter} />
      <Card
        delay={0}
        style={{ position: 'absolute', left: 110, top: 120, width: wide ? 1700 : 980, height: 840, padding: '54px 64px' }}
      >
        <div style={{ fontFamily: FONT_BODY, fontWeight: 900, fontSize: 34, color: '#B4512A', letterSpacing: 2 }}>{scene.label}</div>
        <div style={{ fontFamily: FONT_TITLE, fontSize: 80, color: COLORS.ink, lineHeight: 1.2, marginTop: 18 }}>
          {scene.title.map((line) => (
            <div key={line}>
              <Highlighted text={line} highlight={scene.highlight} color={COLORS.peach} delay={14} />
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 40 }}>
          {scene.chips.map((chip, index) => (
            <BriefChip key={chip.text} chip={chip} delay={30 + index * 12} />
          ))}
        </div>
      </Card>
      {!wide && (
        <div style={{ position: 'absolute', left: 1170, top: 210, display: 'grid', gridTemplateColumns: '300px 300px', gap: 22 }}>
          {tiles.slice(0, 4).map((tile, index) => (
            <BriefTile key={tile.label} tile={tile} delay={20 + index * 8} />
          ))}
        </div>
      )}
    </AbsoluteFill>
  );
}

// ───────────────────────── 전체 흐름 ─────────────────────────
function FlowNode({ chapter, x, y, delay, width }: { chapter: (typeof CHAPTERS)[number]; x: number; y: number; delay: number; width: number }) {
  const pop = usePop(delay, 10);
  return (
    <div
      style={{
        position: 'absolute',
        left: x - width / 2,
        top: y - 110,
        width,
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

export function FlowScene({ scene, duration }: { scene: Extract<Scene, { kind: 'flow' }>; duration: number }) {
  const frame = useCurrentFrame();
  const count = CHAPTERS.length;
  // 단계 수에 맞춰 화면 폭(1500px)을 나눈다.
  const gapX = count > 1 ? Math.min(420, 1500 / (count - 1)) : 0;
  const startX = 960 - (gapX * (count - 1)) / 2;
  const y = 560;
  const stepAt = (index: number) => 20 + index * Math.round((duration * 0.62) / Math.max(count, 1));
  const lineProgress = interpolate(frame, [stepAt(0), stepAt(count - 1)], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const loop = usePop(stepAt(count - 1) + 12);
  const last = CHAPTERS[count - 1];
  const showLoop = scene.loop && count >= 2 && last;
  return (
    <AbsoluteFill>
      <Background accent={COLORS.sky} />
      <div style={{ position: 'absolute', top: 120, width: '100%', textAlign: 'center' }}>
        <div style={{ fontFamily: FONT_TITLE, fontSize: 92, color: COLORS.ink }}>
          <Highlighted text={scene.title} highlight={scene.highlight} color={COLORS.sky} delay={6} />
        </div>
      </div>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        <line
          x1={startX}
          y1={y}
          x2={startX + (count - 1) * gapX * lineProgress}
          y2={y}
          stroke="#B9AEE8"
          strokeWidth={10}
          strokeDasharray="4 22"
          strokeLinecap="round"
        />
        {showLoop && (
          <>
            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill={last.ink} />
              </marker>
            </defs>
            <path
              d={`M ${startX + (count - 1) * gapX} ${y + 215} C ${startX + (count - 1) * gapX} ${y + 360}, ${startX + (count - 2) * gapX} ${y + 360}, ${startX + (count - 2) * gapX} ${y + 225}`}
              fill="none"
              stroke={last.ink}
              strokeWidth={8}
              strokeLinecap="round"
              strokeDasharray="600"
              strokeDashoffset={600 * (1 - loop)}
              markerEnd={loop > 0.92 ? "url(#arrow)" : undefined}
            />
          </>
        )}
      </svg>
      {showLoop && (
        <div
          style={{
            position: 'absolute',
            left: startX + (count - 1.5) * gapX - 110,
            top: y + 330,
            width: 220,
            textAlign: 'center',
            fontFamily: FONT_TITLE,
            fontSize: 38,
            color: last.ink,
            opacity: loop,
          }}
        >
          반복!
        </div>
      )}
      {CHAPTERS.map((chapter, index) => (
        <FlowNode key={chapter.n} chapter={chapter} x={startX + index * gapX} y={y} delay={stepAt(index)} width={Math.max(300, gapX - 20)} />
      ))}
    </AbsoluteFill>
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
          border: '10px solid #FFFFFF',
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
        <div style={{ fontFamily: FONT_BODY, fontWeight: 900, fontSize: 40, letterSpacing: 6, color: chapter.ink, opacity: title }}>
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
        <div style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: 42, lineHeight: 1.5, color: COLORS.inkSoft, marginTop: 30, opacity: sub }}>
          {chapter.subtitle}
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ───────────────────────── 카드 묶음(정리·당부) ─────────────────────────
function CardBox({ card, index, delay, compact }: { card: CardItem; index: number; delay: number; compact: boolean }) {
  if (compact) {
    return (
      <Card delay={delay} style={{ padding: '40px 40px', display: 'flex', gap: 26, alignItems: 'center' }}>
        <div style={{ fontSize: 86 }}>{card.emoji}</div>
        <div>
          <div style={{ fontFamily: FONT_TITLE, fontSize: 52, color: COLORS.ink }}>{card.title}</div>
          <div style={{ fontFamily: FONT_BODY, fontWeight: 700, fontSize: 34, color: COLORS.inkSoft, marginTop: 6 }}>{card.text}</div>
        </div>
      </Card>
    );
  }
  return (
    <Card delay={delay} style={{ padding: '46px 30px', textAlign: 'center', background: '#FFFFFF' }}>
      <div
        style={{
          width: 150,
          height: 150,
          margin: '0 auto',
          borderRadius: '50%',
          background: PASTELS[index % PASTELS.length],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 80,
        }}
      >
        {card.emoji}
      </div>
      <div style={{ fontFamily: FONT_TITLE, fontSize: 50, color: COLORS.ink, marginTop: 28 }}>{card.title}</div>
      <div style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: 31, color: COLORS.inkSoft, marginTop: 14, lineHeight: 1.45 }}>
        {card.text}
      </div>
    </Card>
  );
}

export function CardsScene({ scene, duration }: { scene: Extract<Scene, { kind: 'cards' }>; duration: number }) {
  // 카드 3개 이하는 가로로 납작하게, 4개는 세로로 큰 카드로 놓는다.
  const compact = scene.cards.length <= 3 && Boolean(scene.quote);
  const at = (index: number) => Math.round(duration * (0.25 + index * 0.12));
  const quote = usePop(Math.round(duration * 0.68));
  return (
    <AbsoluteFill>
      <Background accent={COLORS.lavender} />
      {scene.sticker && <Sticker emoji={scene.sticker} size={140} x={1640} y={110} delay={6} rotate={6} />}
      <div style={{ position: 'absolute', top: 130, left: 140, right: 140, textAlign: compact ? 'left' : 'center' }}>
        {scene.kicker && (
          <div style={{ fontFamily: FONT_BODY, fontWeight: 900, fontSize: 36, letterSpacing: 4, color: '#B4512A' }}>{scene.kicker}</div>
        )}
        <div style={{ fontFamily: FONT_TITLE, fontSize: 92, color: COLORS.ink, marginTop: 8 }}>
          <Highlighted text={scene.title} highlight={scene.highlight} color={COLORS.butter} delay={10} />
        </div>
        {scene.subtitle && (
          <div style={{ fontFamily: FONT_BODY, fontWeight: 700, fontSize: 40, color: COLORS.inkSoft, marginTop: 16 }}>{scene.subtitle}</div>
        )}
      </div>
      <div
        style={{
          position: 'absolute',
          left: compact ? 140 : 110,
          right: compact ? 140 : 110,
          top: compact ? 430 : 470,
          display: 'grid',
          gridTemplateColumns: `repeat(${scene.cards.length}, 1fr)`,
          gap: compact ? 36 : 30,
        }}
      >
        {scene.cards.map((card, index) => (
          <CardBox key={card.title} card={card} index={index} delay={at(index)} compact={compact} />
        ))}
      </div>
      {scene.quote && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 780,
            textAlign: 'center',
            fontFamily: FONT_TITLE,
            fontSize: 58,
            color: COLORS.ink,
            opacity: quote,
            transform: `translateY(${interpolate(quote, [0, 1], [30, 0])}px)`,
          }}
        >
          “{scene.quote}”
        </div>
      )}
    </AbsoluteFill>
  );
}

// ───────────────────────── 마무리 ─────────────────────────
export function OutroScene({ scene }: { scene: Extract<Scene, { kind: 'outro' }> }) {
  const frame = useCurrentFrame();
  const title = usePop(4);
  const like = usePop(22, 9);
  const sub = usePop(32, 9);
  const press = (start: number) =>
    interpolate(frame, [start, start + 5, start + 12], [1, 0.9, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const button: CSSProperties = {
    fontFamily: FONT_BODY,
    fontWeight: 900,
    fontSize: 48,
    padding: '24px 54px',
    borderRadius: 999,
    boxShadow: `0 20px 50px ${COLORS.shadow}`,
  };
  return (
    <AbsoluteFill>
      <Background accent={COLORS.pink} />
      <Sticker emoji="🎉" size={120} x={240} y={200} delay={10} rotate={-12} />
      <Sticker emoji="💜" size={100} x={1580} y={230} delay={16} />
      <Sticker emoji="🌷" size={100} x={300} y={760} delay={22} rotate={10} />
      <Sticker emoji="✨" size={90} x={1560} y={760} delay={28} />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 50 }}>
        <div style={{ fontFamily: FONT_TITLE, fontSize: 120, color: COLORS.ink, opacity: title, transform: `scale(${interpolate(title, [0, 1], [0.9, 1])})` }}>
          {scene.title ?? '오늘의 영상 여기까지입니다'}
        </div>
        <div style={{ display: 'flex', gap: 36 }}>
          <div style={{ ...button, color: CHAPTERS[0]?.ink ?? COLORS.ink, background: '#FFFFFF', transform: `scale(${like * press(48)})` }}>👍 좋아요</div>
          <div style={{ ...button, color: '#FFFFFF', background: '#E0567F', transform: `scale(${sub * press(62)})` }}>🔔 구독</div>
        </div>
        <div style={{ fontFamily: FONT_TITLE, fontSize: 52, color: COLORS.inkSoft, opacity: sub }}>{scene.channel}</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
