import { useId } from 'react';
import type { SwotResult } from '../../types';
import { HardWordsBox } from './HardWordsBox';
import { QUADRANTS } from './quadrantMeta';
import { ScopeLegend } from './ScopeLegend';
import { SOURCE_BADGES, SwotQuadrant } from './SwotQuadrant';

interface SwotBoardProps {
  result: SwotResult;
  /** 두 회사를 나란히 놓을 때처럼 좁은 자리에서는 4칸을 한 줄씩 쌓는다. */
  compact?: boolean;
  label?: string;
}

export function SwotBoard({ result, compact = false, label }: SwotBoardProps) {
  const titleId = useId();
  return (
    <article aria-labelledby={titleId} className="flex min-w-0 flex-col gap-4">
      <header className="flex flex-col gap-1">
        <h2 id={titleId} className="text-2xl font-extrabold sm:text-3xl">
          {label && <span className="mr-2 rounded-xl bg-brand px-2 text-brand-ink">{label}</span>}
          <span aria-hidden="true">🏢 </span>
          {result.company}
        </h2>
        <p className="text-lg whitespace-pre-wrap">{result.oneLineIntro}</p>
      </header>
      {result.photoClues && result.photoClues.length > 0 && (
        <section className="print-avoid-break flex flex-col gap-2 rounded-3xl border-2 border-line bg-surface p-4">
          <h3 className="text-lg font-extrabold">
            <span aria-hidden="true">🔎 </span>사진에서 찾은 단서
          </h3>
          <ul className="ml-5 list-disc">
            {result.photoClues.map((clue) => (
              <li key={clue} className="whitespace-pre-wrap">
                {clue}
              </li>
            ))}
          </ul>
          <p className="text-ink-soft">
            각 칸의 {SOURCE_BADGES.photo.emoji} 표시는 &apos;{SOURCE_BADGES.photo.label}&apos;, {SOURCE_BADGES.guess.emoji} 표시는
            &apos;{SOURCE_BADGES.guess.label}&apos;라는 뜻이에요. 짐작한 내용은 직접 가서 확인해 봐요!
          </p>
        </section>
      )}
      <ScopeLegend />
      <div className={`grid grid-cols-1 gap-3 print:grid-cols-2 print:gap-2 ${compact ? '' : 'md:grid-cols-2'}`}>
        {QUADRANTS.map((meta) => (
          <SwotQuadrant key={meta.key} meta={meta} items={result[meta.key]} />
        ))}
      </div>
      <p className="print-avoid-break rounded-2xl bg-brand-soft p-4 text-lg font-bold whitespace-pre-wrap">
        <span aria-hidden="true">📝 </span>한 줄 정리: {result.summary}
      </p>
      <HardWordsBox words={result.hardWords} />
    </article>
  );
}
