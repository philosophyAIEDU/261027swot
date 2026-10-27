import type { HardWord } from '../../types';

interface HardWordsBoxProps {
  words: HardWord[];
}

export function HardWordsBox({ words }: HardWordsBoxProps) {
  if (words.length === 0) return null;
  return (
    <section className="print-avoid-break rounded-3xl border-2 border-dashed border-line bg-surface p-4">
      <h3 className="text-lg font-extrabold">
        <span aria-hidden="true">📖 </span>어려운 낱말 사전
      </h3>
      <dl className="mt-2 flex flex-col gap-2">
        {words.map((item) => (
          <div key={item.word} className="flex flex-col sm:flex-row sm:gap-2">
            <dt className="font-bold">{item.word}</dt>
            <dd className="whitespace-pre-wrap">
              <span aria-hidden="true" className="hidden sm:inline">
                :{' '}
              </span>
              {item.meaning}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
