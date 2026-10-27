import { useCallback, useState } from 'react';
import { coachPractice, toFriendlyError } from '../../services/gemini';
import type { FriendlyError, PracticeFeedback, PracticeInput } from '../../types';

export interface UsePractice {
  feedback: PracticeFeedback | null;
  isLoading: boolean;
  error: FriendlyError | null;
  submit: (input: PracticeInput) => void;
}

export function usePractice(apiKey: string | null): UsePractice {
  const [feedback, setFeedback] = useState<PracticeFeedback | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<FriendlyError | null>(null);

  const submit = useCallback(
    (input: PracticeInput) => {
      if (!apiKey || isLoading) return;
      setIsLoading(true);
      setError(null);
      setFeedback(null);
      coachPractice(apiKey, input)
        .then(setFeedback)
        .catch((caught: unknown) => setError(toFriendlyError(caught)))
        .finally(() => setIsLoading(false));
    },
    [apiKey, isLoading],
  );

  return { feedback, isLoading, error, submit };
}
