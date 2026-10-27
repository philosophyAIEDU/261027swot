import { useId, useRef, useState, type KeyboardEvent } from 'react';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import type { CompareResult } from '../../types';
import { CompareTable } from './CompareTable';
import { SwotBoard } from './SwotBoard';

interface CompareViewProps {
  result: CompareResult;
}

type TabKey = 'a' | 'b' | 'compare';
const TAB_ORDER: TabKey[] = ['a', 'b', 'compare'];

export const MOBILE_QUERY = '(max-width: 640px)';

export function CompareView({ result }: CompareViewProps) {
  const isMobile = useMediaQuery(MOBILE_QUERY);
  const [active, setActive] = useState<TabKey>('a');
  const baseId = useId();
  const tabRefs = useRef<Record<TabKey, HTMLButtonElement | null>>({ a: null, b: null, compare: null });

  const labels: Record<TabKey, string> = {
    a: `A ${result.a.company}`,
    b: `B ${result.b.company}`,
    compare: '비교 ↔️',
  };

  if (!isMobile) {
    return (
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="print-page">
            <SwotBoard result={result.a} label="A" compact />
          </div>
          <div className="print-page">
            <SwotBoard result={result.b} label="B" compact />
          </div>
        </div>
        <CompareTable result={result} />
      </div>
    );
  }

  // 휴대폰에서는 탭으로 나눈다. 탭은 ←/→/Home/End 키로도 옮길 수 있다.
  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const index = TAB_ORDER.indexOf(active);
    let next: TabKey | undefined;
    if (event.key === 'ArrowRight') next = TAB_ORDER[(index + 1) % TAB_ORDER.length];
    if (event.key === 'ArrowLeft') next = TAB_ORDER[(index - 1 + TAB_ORDER.length) % TAB_ORDER.length];
    if (event.key === 'Home') next = TAB_ORDER[0];
    if (event.key === 'End') next = TAB_ORDER[TAB_ORDER.length - 1];
    if (next) {
      event.preventDefault();
      setActive(next);
      tabRefs.current[next]?.focus();
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div role="tablist" aria-label="보고 싶은 화면 고르기" className="grid grid-cols-3 gap-1 rounded-2xl bg-brand-soft p-1 print:hidden">
        {TAB_ORDER.map((key) => {
          const selected = key === active;
          return (
            <button
              key={key}
              ref={(node) => {
                tabRefs.current[key] = node;
              }}
              type="button"
              role="tab"
              id={`${baseId}-tab-${key}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${key}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(key)}
              onKeyDown={onKeyDown}
              className={`min-h-12 truncate rounded-xl px-2 text-base font-bold ${
                selected ? 'bg-brand text-brand-ink' : 'text-ink'
              }`}
            >
              {labels[key]}
            </button>
          );
        })}
      </div>
      {TAB_ORDER.map((key) => (
        <div
          key={key}
          role="tabpanel"
          id={`${baseId}-panel-${key}`}
          aria-labelledby={`${baseId}-tab-${key}`}
          tabIndex={0}
          hidden={key !== active}
          // 숨긴 탭도 인쇄할 때는 모두 보여 준다(print-reveal).
          className="print-page print-reveal"
        >
          {key === 'a' && <SwotBoard result={result.a} label="A" compact />}
          {key === 'b' && <SwotBoard result={result.b} label="B" compact />}
          {key === 'compare' && <CompareTable result={result} />}
        </div>
      ))}
    </div>
  );
}
