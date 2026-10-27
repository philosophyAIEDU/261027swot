import { Button } from '../../components/Button';
import { analysisTitle, type HistoryEntry } from './useHistory';

interface RecentListProps {
  entries: HistoryEntry[];
  onOpen: (entry: HistoryEntry) => void;
  onRemove: (id: string) => void;
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? '' : `${date.getMonth() + 1}월 ${date.getDate()}일`;
}

export function RecentList({ entries, onOpen, onRemove }: RecentListProps) {
  if (entries.length === 0) return null;
  return (
    <section aria-labelledby="recent-title" className="flex flex-col gap-3 rounded-3xl border-2 border-line bg-surface p-5 print:hidden">
      <h2 id="recent-title" className="text-xl font-extrabold">
        <span aria-hidden="true">🕘 </span>최근에 알아본 회사
      </h2>
      <ul className="flex flex-col gap-2">
        {entries.map((entry) => {
          const title = analysisTitle(entry.analysis);
          return (
            <li key={entry.id} className="flex items-center gap-2">
              <Button variant="secondary" className="flex-1 justify-between text-left" onClick={() => onOpen(entry)}>
                <span>
                  <span aria-hidden="true">{entry.analysis.kind === 'single' ? '🏢 ' : '🆚 '}</span>
                  {title}
                </span>
                <span className="text-base font-normal text-ink-soft">{formatDate(entry.savedAt)}</span>
              </Button>
              <Button variant="ghost" onClick={() => onRemove(entry.id)} aria-label={`${title} 기록 지우기`}>
                <span aria-hidden="true">✖️</span>
              </Button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
