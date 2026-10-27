import { useId, useState, type FormEvent } from 'react';
import { Button } from '../../components/Button';
import { LoadingBuddy } from '../../components/LoadingBuddy';
import { API_KEY_HELP_URL } from '../../config';
import type { FriendlyError } from '../../types';

interface ApiKeySetupProps {
  onSubmit: (key: string, remember: boolean) => Promise<FriendlyError | null>;
  onCancel?: () => void;
  initialRemember?: boolean;
}

export function ApiKeySetup({ onSubmit, onCancel, initialRemember = false }: ApiKeySetupProps) {
  const [key, setKey] = useState('');
  const [visible, setVisible] = useState(false);
  const [remember, setRemember] = useState(initialRemember);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<FriendlyError | null>(null);
  const inputId = useId();
  const rememberId = useId();
  const hintId = useId();

  const canSubmit = key.trim().length > 0 && !checking;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;
    setChecking(true);
    setError(null);
    const result = await onSubmit(key, remember);
    setChecking(false);
    if (result) setError(result);
  };

  return (
    <section aria-labelledby="key-setup-title" className="mx-auto flex w-full max-w-2xl flex-col gap-5 rounded-3xl border-2 border-line bg-surface p-5 sm:p-8">
      <h1 id="key-setup-title" className="text-2xl font-extrabold sm:text-3xl">
        어른과 함께 설정해요 🔑
      </h1>
      <p>
        이 앱은 Google의 Gemini AI에게 물어봐요. AI를 쓰려면 <strong>열쇠(API 키)</strong>가 필요해요.
        선생님이나 보호자가 한 번만 넣어 주세요.
      </p>

      <ol className="flex flex-col gap-2 rounded-2xl bg-brand-soft p-4">
        <li>
          <strong>1단계.</strong>{' '}
          <a href={API_KEY_HELP_URL} target="_blank" rel="noopener noreferrer" className="font-bold text-brand underline underline-offset-4">
            Google AI Studio API 키 페이지
          </a>
          에 들어가 Google 계정으로 로그인해요.
        </li>
        <li>
          <strong>2단계.</strong> <q>API 키 만들기(Create API key)</q> 버튼을 눌러 새 키를 만들어요.
        </li>
        <li>
          <strong>3단계.</strong> 만들어진 키를 복사해서 아래 칸에 붙여 넣고 <q>키 확인</q>을 눌러요.
        </li>
      </ol>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <div className="flex flex-col gap-2">
          <label htmlFor={inputId} className="text-lg font-bold">
            Gemini API 키
          </label>
          <div className="flex gap-2">
            <input
              id={inputId}
              type={visible ? 'text' : 'password'}
              value={key}
              onChange={(event) => setKey(event.target.value)}
              autoComplete="off"
              spellCheck={false}
              autoCapitalize="off"
              placeholder="여기에 키를 붙여 넣어요"
              aria-describedby={hintId}
              className="min-h-12 min-w-0 flex-1 rounded-2xl border-2 border-line bg-surface px-4 text-lg"
            />
            <Button
              variant="secondary"
              onClick={() => setVisible((v) => !v)}
              aria-pressed={visible}
              aria-controls={inputId}
            >
              {visible ? '🙈 숨기기' : '👁️ 보기'}
            </Button>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <input
            id={rememberId}
            type="checkbox"
            checked={remember}
            onChange={(event) => setRemember(event.target.checked)}
            className="mt-1 h-6 w-6 shrink-0 accent-brand"
          />
          <label htmlFor={rememberId}>
            <span className="font-bold">이 기기에서 기억하기</span>
            <span className="block text-ink-soft">
              끄면 창(탭)을 닫을 때 키가 지워져요. 공용 컴퓨터에서는 &apos;기억하기&apos;를 끄세요.
            </span>
          </label>
        </div>

        {checking && <LoadingBuddy message="키가 맞는지 확인하는 중이에요… 🔍" />}
        {error && (
          <p role="alert" className="rounded-2xl bg-danger-bg p-4 font-bold text-danger-ink">
            {error.message}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={!canSubmit}>
            ✅ 키 확인
          </Button>
          {onCancel && (
            <Button variant="secondary" onClick={onCancel} disabled={checking}>
              돌아가기
            </Button>
          )}
        </div>
      </form>

      <div id={hintId} className="rounded-2xl bg-notice-bg p-4 text-notice-ink">
        <p className="font-bold">어른이 꼭 알아 두세요 ⚠️</p>
        <ul className="ml-5 list-disc">
          <li>키는 다른 사람에게 보여 주지 마세요.</li>
          <li>공용 컴퓨터에서는 &apos;기억하기&apos;를 끄세요.</li>
          <li>Google AI Studio에서 키 사용량 한도를 설정해 두세요.</li>
          <li>키는 이 브라우저에만 저장되고, Gemini AI에 질문할 때 말고는 어디에도 보내지 않아요.</li>
        </ul>
      </div>
    </section>
  );
}
