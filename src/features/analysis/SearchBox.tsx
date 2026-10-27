import { useId, useState, type FormEvent } from 'react';
import { Button } from '../../components/Button';
import { MAX_SEARCH_LENGTH } from '../../config';

interface SearchBoxProps {
  disabled: boolean;
  useSearch: boolean;
  onToggleSearch: (next: boolean) => void;
  onSearch: (text: string) => void;
  onCompare: (a: string, b: string) => void;
}

export function SearchBox({ disabled, useSearch, onToggleSearch, onSearch, onCompare }: SearchBoxProps) {
  const [text, setText] = useState('');
  const [compareOpen, setCompareOpen] = useState(false);
  const [companyA, setCompanyA] = useState('');
  const [companyB, setCompanyB] = useState('');
  const searchId = useId();
  const aId = useId();
  const bId = useId();
  const groundingId = useId();
  const compareFormId = useId();

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!disabled && text.trim()) onSearch(text);
  };

  const submitCompare = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!disabled && companyA.trim() && companyB.trim()) onCompare(companyA, companyB);
  };

  const inputClass =
    'min-h-14 w-full min-w-0 rounded-2xl border-2 border-line bg-surface px-4 text-lg placeholder:text-ink-soft';

  return (
    <section aria-label="회사 찾기" className="flex flex-col gap-4 rounded-3xl border-2 border-brand bg-surface p-5 sm:p-6 print:hidden">
      <form onSubmit={submitSearch} className="flex flex-col gap-3">
        <label htmlFor={searchId} className="text-xl font-extrabold">
          <span aria-hidden="true">🔍 </span>궁금한 회사 이름을 써 보세요!
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            id={searchId}
            value={text}
            onChange={(event) => setText(event.target.value)}
            maxLength={MAX_SEARCH_LENGTH}
            placeholder="예: 삼성전자, 또는 '삼성전자랑 LG전자 비교해 줘'"
            className={inputClass}
          />
          <Button type="submit" disabled={disabled || !text.trim()} className="sm:min-w-32">
            알아보기 🚀
          </Button>
        </div>
      </form>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="secondary"
          onClick={() => setCompareOpen((open) => !open)}
          aria-expanded={compareOpen}
          aria-controls={compareFormId}
        >
          <span aria-hidden="true">↔️</span> 두 회사 비교하기
        </Button>
        <div className="flex items-center gap-2">
          <input
            id={groundingId}
            type="checkbox"
            checked={useSearch}
            onChange={(event) => onToggleSearch(event.target.checked)}
            className="h-6 w-6 shrink-0 accent-brand"
          />
          <label htmlFor={groundingId}>
            <span aria-hidden="true">🌐 </span>Google 검색으로 최신 정보도 찾아보기
          </label>
        </div>
      </div>

      {compareOpen && (
        <form id={compareFormId} onSubmit={submitCompare} className="flex flex-col gap-3 rounded-2xl bg-brand-soft p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label htmlFor={aId} className="font-bold">
                회사 A
              </label>
              <input
                id={aId}
                value={companyA}
                onChange={(event) => setCompanyA(event.target.value)}
                maxLength={MAX_SEARCH_LENGTH}
                placeholder="예: 농심"
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor={bId} className="font-bold">
                회사 B
              </label>
              <input
                id={bId}
                value={companyB}
                onChange={(event) => setCompanyB(event.target.value)}
                maxLength={MAX_SEARCH_LENGTH}
                placeholder="예: 오뚜기"
                className={inputClass}
              />
            </div>
          </div>
          <Button type="submit" disabled={disabled || !companyA.trim() || !companyB.trim()} className="self-start">
            비교해 보기 🆚
          </Button>
        </form>
      )}
    </section>
  );
}
