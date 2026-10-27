import { useCallback, useEffect, useRef, useState } from 'react';
import { MAX_CHAT_TURNS, MAX_QUESTION_LENGTH } from '../../config';
import { askFollowUp, toFriendlyError } from '../../services/gemini';
import type { Analysis, ChatMessage, FriendlyError, Source } from '../../types';

export interface UseFollowUpChat {
  messages: ChatMessage[];
  sources: Source[];
  isStreaming: boolean;
  error: FriendlyError | null;
  ask: (question: string) => void;
  retry: () => void;
}

/** 대화는 최근 MAX_CHAT_TURNS턴(질문+답 = 1턴)만 화면과 기억에 남긴다. */
function keepRecent(messages: ChatMessage[]): ChatMessage[] {
  return messages.slice(-MAX_CHAT_TURNS * 2);
}

export function useFollowUpChat(apiKey: string | null, analysis: Analysis, useSearch: boolean): UseFollowUpChat {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<FriendlyError | null>(null);
  const lastQuestion = useRef<string | null>(null);
  // 화면을 떠난 뒤 늦게 온 글자가 상태를 바꾸지 않도록 한다.
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const send = useCallback(
    async (question: string, history: ChatMessage[]) => {
      if (!apiKey) return;
      lastQuestion.current = question;
      setIsStreaming(true);
      setError(null);
      setSources([]);
      setMessages(keepRecent([...history, { role: 'user', text: question }, { role: 'model', text: '' }]));

      const replaceAnswer = (text: string) => {
        if (!alive.current) return;
        setMessages((prev) => {
          const next = [...prev];
          next[next.length - 1] = { role: 'model', text };
          return next;
        });
      };

      try {
        const { text, sources: found } = await askFollowUp(apiKey, analysis, history, question, replaceAnswer, {
          useSearch,
        });
        replaceAnswer(text);
        if (alive.current) setSources(found);
      } catch (caught) {
        if (!alive.current) return;
        // 실패한 질문과 빈 답은 대화에서 빼서, 다음 요청이 항상 깔끔한 user/model 짝이 되게 한다.
        setMessages(history);
        setError(toFriendlyError(caught));
      } finally {
        if (alive.current) setIsStreaming(false);
      }
    },
    [apiKey, analysis, useSearch],
  );

  const ask = useCallback(
    (question: string) => {
      const trimmed = question.trim().slice(0, MAX_QUESTION_LENGTH);
      if (!trimmed || isStreaming) return;
      void send(trimmed, messages);
    },
    [send, isStreaming, messages],
  );

  const retry = useCallback(() => {
    if (lastQuestion.current && !isStreaming) void send(lastQuestion.current, messages);
  }, [send, isStreaming, messages]);

  return { messages, sources, isStreaming, error, ask, retry };
}
