import { useState } from 'react';
import { Button } from '../../components/Button';
import type { UnclearIntent } from './useSwotAnalysis';

interface UnclearHelpProps {
  intent: UnclearIntent;
  disabled: boolean;
  onExample: (text: string) => void;
  onPickOne: (company: string) => void;
  onPickTwo: (a: string, b: string) => void;
}

const EXAMPLES = ['카카오', '농심이랑 오뚜기 비교'];

export function UnclearHelp({ intent, disabled, onExample, onPickOne, onPickTwo }: UnclearHelpProps) {
  const [picked, setPicked] = useState<string[]>([]);

  const togglePick = (company: string) => {
    setPicked((prev) => {
      if (prev.includes(company)) return prev.filter((name) => name !== company);
      // 두 개까지만 고를 수 있다. 세 번째를 누르면 가장 먼저 고른 것이 빠진다.
      return [...prev, company].slice(-2);
    });
  };

  const examples = (
    <div className="flex flex-wrap gap-2">
      {EXAMPLES.map((example) => (
        <Button key={example} variant="secondary" disabled={disabled} onClick={() => onExample(example)}>
          {example}
        </Button>
      ))}
    </div>
  );

  if (intent.kind === 'tooMany') {
    const [first, second] = picked;
    return (
      <section aria-live="polite" className="flex flex-col gap-3 rounded-3xl border-2 border-line bg-surface p-5">
        <p className="text-lg font-bold">
          <span aria-hidden="true">✌️ </span>두 개까지만 비교할 수 있어요. 두 개를 골라 주세요.
        </p>
        <div className="flex flex-wrap gap-2" role="group" aria-label="비교할 회사 고르기">
          {intent.candidates.map((company) => {
            const selected = picked.includes(company);
            return (
              <Button
                key={company}
                variant={selected ? 'primary' : 'secondary'}
                aria-pressed={selected}
                onClick={() => togglePick(company)}
              >
                {selected ? '✅ ' : ''}
                {company}
              </Button>
            );
          })}
        </div>
        <p className="text-ink-soft">{picked.length}개 골랐어요.</p>
        <div className="flex flex-wrap gap-2">
          <Button disabled={disabled || !first || !second} onClick={() => first && second && onPickTwo(first, second)}>
            이 두 회사 비교하기 🆚
          </Button>
          {picked.length === 1 && first && (
            <Button variant="secondary" disabled={disabled} onClick={() => onPickOne(first)}>
              {first}만 알아보기
            </Button>
          )}
        </div>
      </section>
    );
  }

  return (
    <section aria-live="polite" className="flex flex-col gap-3 rounded-3xl border-2 border-line bg-surface p-5">
      {intent.kind === 'person' ? (
        <>
          <p className="text-lg font-bold">
            <span aria-hidden="true">🏪 </span>SWOT는 회사나 가게를 알아볼 때 써요.
          </p>
          <p>친구, 선생님, 연예인 같은 사람은 분석하지 않아요. 궁금한 회사나 가게 이름을 써 볼까요?</p>
        </>
      ) : (
        <>
          <p className="text-lg font-bold">
            <span aria-hidden="true">🧐 </span>음… 어떤 회사인지 잘 모르겠어요.
          </p>
          {intent.reason && <p className="whitespace-pre-wrap">{intent.reason}</p>}
          <p>회사나 가게 이름을 하나, 또는 두 개 써 주세요. 이렇게 해 볼까요?</p>
        </>
      )}
      {examples}
    </section>
  );
}
