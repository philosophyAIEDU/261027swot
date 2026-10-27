import type { Source } from '../../types';

interface SourceListProps {
  sources: Source[];
}

export function SourceList({ sources }: SourceListProps) {
  if (sources.length === 0) return null;
  return (
    <section className="rounded-3xl border-2 border-line bg-surface p-4">
      <h3 className="text-lg font-extrabold">
        <span aria-hidden="true">🌐 </span>AI가 참고한 곳
      </h3>
      <ul className="mt-2 ml-5 list-disc">
        {sources.map((source) => (
          <li key={source.uri}>
            <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-brand underline underline-offset-4">
              {source.title}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
