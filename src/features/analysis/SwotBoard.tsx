import { useId } from 'react';
import type { SwotResult } from '../../types';
import { HardWordsBox } from './HardWordsBox';
import { QUADRANTS } from './quadrantMeta';
import { ScopeLegend } from './ScopeLegend';
import { SwotQuadrant } from './SwotQuadrant';

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
