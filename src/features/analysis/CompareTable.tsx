import type { CompareResult } from '../../types';

interface CompareTableProps {
  result: CompareResult;
}

export function CompareTable({ result }: CompareTableProps) {
  const { a, b } = result;
  return (
    <section aria-label="두 회사 비교" className="flex flex-col gap-4">
      <p className="rounded-2xl bg-brand-soft p-4 text-lg font-bold whitespace-pre-wrap">
        <span aria-hidden="true">🧒 </span>
        {result.kidSummary}
      </p>

      <div className="print-avoid-break rounded-3xl border-2 border-line bg-surface p-4">
        <h3 className="text-xl font-extrabold">
          <span aria-hidden="true">🤝 </span>비슷한 점
        </h3>
        <ul className="mt-2 ml-5 list-disc">
          {result.sameThings.map((thing) => (
            <li key={thing} className="whitespace-pre-wrap">
              {thing}
            </li>
          ))}
        </ul>
      </div>

      <div className="print-avoid-break rounded-3xl border-2 border-line bg-surface p-4">
        <h3 className="text-xl font-extrabold">
          <span aria-hidden="true">↔️ </span>다른 점
        </h3>
        <table className="mt-2 w-full table-fixed border-collapse text-left">
          <caption className="sr-only">
            {a.company}와(과) {b.company}의 다른 점
          </caption>
          <thead>
            <tr className="border-b-2 border-line">
              <th scope="col" className="w-1/4 p-2">
                주제
              </th>
              <th scope="col" className="p-2">
                A {a.company}
              </th>
              <th scope="col" className="p-2">
                B {b.company}
              </th>
            </tr>
          </thead>
          <tbody>
            {result.differentThings.map((thing) => (
              <tr key={thing.topic} className="border-b border-line align-top">
                <th scope="row" className="p-2 font-bold">
                  {thing.topic}
                </th>
                <td className="p-2 whitespace-pre-wrap">{thing.a}</td>
                <td className="p-2 whitespace-pre-wrap">{thing.b}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-ink-soft">
        <span aria-hidden="true">⚖️ </span>두 회사는 서로 다를 뿐, 어느 쪽이 더 좋다고 정할 수는 없어요.
      </p>
    </section>
  );
}
