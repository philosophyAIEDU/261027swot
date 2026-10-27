import famousExamples from '../../data/famousExamples.json';
import type { SwotResult } from '../../types';

// 유명한 회사 10곳의 SWOT 예시. AI를 부르지 않는 고정 데이터라 키가 없어도, 사용량 걱정 없이 바로 볼 수 있다.
// 내용은 숫자·날짜 없이 널리 알려진 사실만 쉬운 말로 정리했고,
// 어느 회사가 더 좋다는 판단이나 투자 이야기는 넣지 않았다.

export interface FamousExample {
  id: string;
  emoji: string;
  category: string;
  result: SwotResult;
}

export const FAMOUS_EXAMPLES: FamousExample[] = famousExamples;

interface FamousExamplesProps {
  onOpen: (result: SwotResult) => void;
}

export function FamousExamples({ onOpen }: FamousExamplesProps) {
  return (
    <section aria-labelledby="famous-title" className="flex flex-col gap-3 rounded-3xl border-2 border-line bg-surface p-5 sm:p-6 print:hidden">
      <h2 id="famous-title" className="text-2xl font-extrabold">
        <span aria-hidden="true">🌟 </span>유명한 회사 SWOT 예시
      </h2>
      <p>잘 아는 회사를 골라 SWOT 4칸을 바로 살펴봐요. AI를 기다리지 않아도 돼요.</p>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {FAMOUS_EXAMPLES.map((example) => (
          <li key={example.id}>
            <button
              type="button"
              onClick={() => onOpen(example.result)}
              className="flex min-h-12 w-full flex-col items-center justify-center gap-1 rounded-2xl border-2 border-line bg-surface p-3 text-center hover:border-brand hover:bg-brand-soft"
            >
              <span aria-hidden="true" className="text-3xl">
                {example.emoji}
              </span>
              <span className="font-extrabold">{example.result.company}</span>
              <span className="text-sm text-ink-soft">{example.category}</span>
            </button>
          </li>
        ))}
      </ul>
      <p className="text-base text-ink-soft">
        <span aria-hidden="true">ℹ️ </span>널리 알려진 내용을 쉽게 정리한 예시예요. 회사 사정은 계속 바뀌니, 최신 내용은 어른과
        함께 찾아보세요. 어느 회사가 더 좋다고 정하는 게 아니라, 회사마다 다른 점을 살펴보는 거예요.
      </p>
    </section>
  );
}
