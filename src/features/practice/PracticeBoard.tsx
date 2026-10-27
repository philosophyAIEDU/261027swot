import { useId, useState, type FormEvent } from 'react';
import { Button } from '../../components/Button';
import { ErrorMessage } from '../../components/ErrorMessage';
import { LoadingBuddy } from '../../components/LoadingBuddy';
import type { PracticeInput, QuadrantKey } from '../../types';
import { QUADRANTS } from '../analysis/quadrantMeta';
import { usePractice } from './usePractice';

interface PracticeBoardProps {
  apiKey: string | null;
  onGoToKeySetup: () => void;
}

const MAX_CELL_LENGTH = 200;

const EMPTY: PracticeInput = { company: '', strengths: '', weaknesses: '', opportunities: '', threats: '' };

export function PracticeBoard({ apiKey, onGoToKeySetup }: PracticeBoardProps) {
  const [input, setInput] = useState<PracticeInput>(EMPTY);
  const { feedback, isLoading, error, submit } = usePractice(apiKey);
  const baseId = useId();

  const filledCount = QUADRANTS.filter((meta) => input[meta.key].trim()).length;
  const canSubmit = input.company.trim().length > 0 && filledCount > 0 && !isLoading;

  const setField = (key: keyof PracticeInput, value: string) => setInput((prev) => ({ ...prev, [key]: value }));

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (canSubmit) submit(input);
  };

  return (
    <section aria-labelledby={`${baseId}-title`} className="flex flex-col gap-4 rounded-3xl border-2 border-line bg-surface p-5 sm:p-6">
      <h2 id={`${baseId}-title`} className="text-2xl font-extrabold">
        <span aria-hidden="true">✍️ </span>내가 직접 채워 보기
      </h2>
      <p>회사나 가게를 하나 정해서 4칸을 직접 채워 보세요. 다 쓰면 AI 선생님이 칭찬과 힌트를 줘요.</p>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor={`${baseId}-company`} className="text-lg font-bold">
            어떤 회사(가게)인가요?
          </label>
          <input
            id={`${baseId}-company`}
            value={input.company}
            onChange={(event) => setField('company', event.target.value)}
            maxLength={100}
            placeholder="예: 우리 동네 빵집"
            className="min-h-12 w-full rounded-2xl border-2 border-line bg-surface px-4 text-lg placeholder:text-ink-soft"
          />
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {QUADRANTS.map((meta) => {
            const key: QuadrantKey = meta.key;
            return (
              <div key={key} className={`flex flex-col gap-1 rounded-3xl border-4 p-3 ${meta.classes}`}>
                <label htmlFor={`${baseId}-${key}`} className="text-lg font-extrabold">
                  <span aria-hidden="true">{meta.emoji} </span>
                  {meta.letter} {meta.name}
                  <span className="block text-base font-normal">{meta.description}</span>
                </label>
                <textarea
                  id={`${baseId}-${key}`}
                  value={input[key]}
                  onChange={(event) => setField(key, event.target.value)}
                  maxLength={MAX_CELL_LENGTH}
                  rows={3}
                  className="w-full rounded-2xl border-2 border-line bg-surface p-3 text-lg text-ink"
                />
              </div>
            );
          })}
        </div>
        <Button type="submit" disabled={!canSubmit} className="self-start">
          AI 선생님께 보여 주기 🙌
        </Button>
      </form>

      {isLoading && <LoadingBuddy />}
      {error && <ErrorMessage error={error} onRetry={() => submit(input)} onGoToKeySetup={onGoToKeySetup} />}
      {feedback && (
        <div aria-live="polite" className="flex flex-col gap-2 rounded-3xl bg-brand-soft p-4">
          <p className="text-lg font-bold whitespace-pre-wrap">
            <span aria-hidden="true">🌟 </span>
            {feedback.praise}
          </p>
          <p className="whitespace-pre-wrap">
            <span aria-hidden="true">💡 힌트: </span>
            <span className="sr-only">힌트: </span>
            {feedback.hint}
          </p>
        </div>
      )}
    </section>
  );
}
