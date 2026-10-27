import introExample from '../../data/introExample.json';
import { QUADRANTS } from '../analysis/quadrantMeta';
import { ScopeLegend } from '../analysis/ScopeLegend';
import { SwotQuadrant } from '../analysis/SwotQuadrant';
import type { SwotResult } from '../../types';

// 예시는 AI를 부르지 않는 정적 데이터다. 키가 없어도, 인터넷이 느려도 바로 보인다.
const example: SwotResult = introExample;

export function SwotIntroCard() {
  return (
    <section aria-labelledby="intro-title" className="flex flex-col gap-4 rounded-3xl border-2 border-line bg-surface p-5 sm:p-6">
      <h2 id="intro-title" className="text-2xl font-extrabold">
        SWOT가 뭐예요? <span aria-hidden="true">🤔</span>
      </h2>
      <p>
        SWOT는 회사나 가게를 <strong>4칸</strong>으로 나눠 살펴보는 방법이에요. 4칸의 영어 첫 글자를 모으면 S·W·O·T가 돼요.
      </p>
      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {QUADRANTS.map((meta) => (
          <li key={meta.key} className={`rounded-2xl border-2 p-3 ${meta.classes}`}>
            <span className="text-lg font-extrabold">
              <span aria-hidden="true">{meta.emoji} </span>
              {meta.letter} {meta.name}
            </span>{' '}
            <span className="text-base">({meta.english})</span>
            <span className="block">{meta.description}</span>
          </li>
        ))}
      </ul>
      <ScopeLegend />

      <h3 className="mt-2 text-xl font-extrabold">
        예시: {example.company} <span aria-hidden="true">🍢</span>
      </h3>
      <p>{example.oneLineIntro}</p>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {QUADRANTS.map((meta) => (
          <SwotQuadrant key={meta.key} meta={meta} items={example[meta.key]} alwaysShowExamples headingLevel="h4" />
        ))}
      </div>
      <p className="rounded-2xl bg-brand-soft p-3 font-bold">
        <span aria-hidden="true">📝 </span>
        {example.summary}
      </p>
    </section>
  );
}
