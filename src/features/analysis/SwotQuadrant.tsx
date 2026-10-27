import { useId, useState } from 'react';
import type { SwotItem } from '../../types';
import { SCOPE_LABELS, type QuadrantMeta } from './quadrantMeta';

interface SwotQuadrantProps {
  meta: QuadrantMeta;
  items: SwotItem[];
  /** 정적 예시처럼 예시 문장을 처음부터 다 보여 줄 때 */
  alwaysShowExamples?: boolean;
  headingLevel?: 'h3' | 'h4';
}

interface ItemRowProps {
  item: SwotItem;
  alwaysShowExample: boolean;
}

function ItemRow({ item, alwaysShowExample }: ItemRowProps) {
  const [open, setOpen] = useState(false);
  const exampleId = useId();
  const showExample = alwaysShowExample || open;

  return (
    <li className="flex flex-col gap-1 rounded-2xl bg-surface/70 p-3">
      <p className="font-bold">{item.point}</p>
      {!alwaysShowExample && (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={exampleId}
          className="min-h-12 self-start rounded-xl border-2 border-current px-3 text-base font-bold print:hidden"
        >
          {open ? '접기 🙈' : '예를 들면? 👀'}
        </button>
      )}
      {/* 인쇄할 때는 예시를 항상 보여 준다(활동지에서 펼칠 수 없으므로). */}
      <p id={exampleId} hidden={!showExample} className="print-reveal whitespace-pre-wrap">
        <span aria-hidden="true">👉 </span>
        {item.example}
      </p>
    </li>
  );
}

export function SwotQuadrant({ meta, items, alwaysShowExamples = false, headingLevel = 'h3' }: SwotQuadrantProps) {
  const Heading = headingLevel;
  const scope = SCOPE_LABELS[meta.scope];
  return (
    <section
      aria-label={`${meta.letter} ${meta.name}`}
      className={`print-avoid-break flex flex-col gap-3 rounded-3xl border-4 p-4 ${meta.classes}`}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <Heading className="text-xl font-extrabold">
          <span aria-hidden="true">{meta.emoji} </span>
          {meta.letter} {meta.name}
          <span className="ml-1 text-base font-semibold">({meta.english})</span>
        </Heading>
        <span className="rounded-full border-2 border-current px-2 text-sm font-bold">
          <span aria-hidden="true">{scope.emoji} </span>
          {scope.label}
        </span>
      </div>
      <p className="text-base">{meta.description}</p>
      <ul className="flex flex-col gap-2">
        {items.map((item, index) => (
          <ItemRow key={`${index}-${item.point}`} item={item} alwaysShowExample={alwaysShowExamples} />
        ))}
      </ul>
    </section>
  );
}
