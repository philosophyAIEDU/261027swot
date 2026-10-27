import { useId, useState, type FormEvent, type KeyboardEvent } from 'react';
import { Button } from '../../components/Button';
import { ErrorMessage } from '../../components/ErrorMessage';
import { MAX_QUESTION_LENGTH } from '../../config';
import type { Analysis } from '../../types';
import { SourceList } from '../analysis/SourceList';
import { SuggestedQuestions } from './SuggestedQuestions';
import { useFollowUpChat } from './useFollowUpChat';

interface FollowUpChatProps {
  apiKey: string | null;
  analysis: Analysis;
  useSearch: boolean;
  onGoToKeySetup: () => void;
}

function suggestionsFor(analysis: Analysis): string[] {
  const when = analysis.kind === 'single' ? '이 회사는 언제 생겼어요?' : '두 회사는 언제 생겼어요?';
  return ['기회를 더 잘 쓰려면 어떻게 해요?', '조심할 점은 어떻게 막아요?', when];
}

export function FollowUpChat({ apiKey, analysis, useSearch, onGoToKeySetup }: FollowUpChatProps) {
  const { messages, sources, isStreaming, error, ask, retry } = useFollowUpChat(apiKey, analysis, useSearch);
  const [draft, setDraft] = useState('');
  const inputId = useId();
  const counterId = useId();

  const submit = (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    if (!draft.trim() || isStreaming) return;
    ask(draft);
    setDraft('');
  };

  // Enter로 보내고, Shift+Enter로 줄을 바꾼다. (한글 조합 중 Enter는 무시)
  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      submit();
    }
  };

  return (
    <section aria-labelledby="chat-title" className="flex flex-col gap-4 rounded-3xl border-2 border-line bg-surface p-5 sm:p-6 print:hidden">
      <h2 id="chat-title" className="text-2xl font-extrabold">
        <span aria-hidden="true">💬 </span>궁금한 걸 더 물어보세요!
      </h2>
      <SuggestedQuestions questions={suggestionsFor(analysis)} disabled={isStreaming} onPick={ask} />

      {messages.length > 0 && (
        <ol aria-label="대화" aria-live="polite" className="flex flex-col gap-3">
          {messages.map((message, index) => (
            <li
              key={index}
              className={`max-w-[90%] rounded-3xl p-4 whitespace-pre-wrap ${
                message.role === 'user' ? 'self-end bg-brand text-brand-ink' : 'self-start bg-brand-soft text-ink'
              }`}
            >
              <span className="block text-base font-bold">{message.role === 'user' ? '🙋 나' : '🤖 AI 선생님'}</span>
              {message.text || (isStreaming && index === messages.length - 1 ? '생각하는 중이에요… 🤔' : '')}
            </li>
          ))}
        </ol>
      )}

      <SourceList sources={sources} />
      {error && <ErrorMessage error={error} onRetry={retry} onGoToKeySetup={onGoToKeySetup} />}

      <form onSubmit={submit} className="flex flex-col gap-2">
        <label htmlFor={inputId} className="font-bold">
          내 질문
        </label>
        <textarea
          id={inputId}
          value={draft}
          onChange={(event) => setDraft(event.target.value.slice(0, MAX_QUESTION_LENGTH))}
          onKeyDown={onKeyDown}
          maxLength={MAX_QUESTION_LENGTH}
          rows={2}
          aria-describedby={counterId}
          placeholder="예: 이 회사는 어떤 물건을 제일 많이 팔아요?"
          className="w-full rounded-2xl border-2 border-line bg-surface p-3 text-lg placeholder:text-ink-soft"
        />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span id={counterId} className="text-base text-ink-soft">
            {draft.length} / {MAX_QUESTION_LENGTH}자
          </span>
          <Button type="submit" disabled={isStreaming || !draft.trim()}>
            물어보기 📨
          </Button>
        </div>
      </form>
    </section>
  );
}
