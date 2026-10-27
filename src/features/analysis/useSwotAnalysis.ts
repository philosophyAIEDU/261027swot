import { useCallback, useEffect, useReducer, useRef } from 'react';
import { analyzeOne, analyzePhoto, analyzeTwo, detectIntent, toFriendlyError } from '../../services/gemini';
import type { Analysis, FriendlyError, IntentResult, PhotoInput } from '../../types';

export type UnclearIntent = Extract<IntentResult, { mode: 'unclear' }>;

export type AnalysisState =
  | { status: 'idle' }
  | { status: 'loading'; message: string }
  | { status: 'unclear'; intent: UnclearIntent }
  | { status: 'done'; analysis: Analysis; requestId: number }
  | { status: 'error'; error: FriendlyError };

type Action =
  | { type: 'loading'; message: string }
  | { type: 'unclear'; intent: UnclearIntent }
  | { type: 'done'; analysis: Analysis; requestId: number }
  | { type: 'error'; error: FriendlyError }
  | { type: 'reset' };

function reducer(_state: AnalysisState, action: Action): AnalysisState {
  switch (action.type) {
    case 'loading':
      return { status: 'loading', message: action.message };
    case 'unclear':
      return { status: 'unclear', intent: action.intent };
    case 'done':
      return { status: 'done', analysis: action.analysis, requestId: action.requestId };
    case 'error':
      return { status: 'error', error: action.error };
    case 'reset':
      return { status: 'idle' };
  }
}

type Request =
  | { type: 'query'; text: string }
  | { type: 'single'; company: string }
  | { type: 'compare'; a: string; b: string }
  // 사진은 "다시 시도"를 위해 이 요청 객체(메모리)에만 잠깐 들고 있고, 어디에도 저장하지 않는다.
  | { type: 'photo'; photo: PhotoInput };

interface Options {
  useSearch: boolean;
  onDone?: (analysis: Analysis) => void;
}

export interface UseSwotAnalysis {
  state: AnalysisState;
  isLoading: boolean;
  /** 자유 입력: 1단계에서 모드를 판별한 뒤 분석한다. */
  search: (text: string) => void;
  /** 회사 하나를 바로 분석한다(1단계 생략). */
  analyzeCompany: (company: string) => void;
  /** 회사 이름 칸 2개로 직접 비교한다(1단계 생략). */
  compareTwo: (a: string, b: string) => void;
  /** 가게 사진 한 장으로 분석한다. */
  analyzeStorePhoto: (photo: PhotoInput) => void;
  retry: () => void;
  reset: () => void;
  showSaved: (analysis: Analysis) => void;
}

const THINKING = '생각하는 중이에요… 🤔';

export function useSwotAnalysis(apiKey: string | null, { useSearch, onDone }: Options): UseSwotAnalysis {
  const [state, dispatch] = useReducer(reducer, { status: 'idle' });
  // 가장 최근 요청 번호. 예전 요청의 답이 늦게 와도 화면을 덮어쓰지 않게 한다.
  const latestRequest = useRef(0);
  const lastRequest = useRef<Request | null>(null);
  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  const run = useCallback(
    async (request: Request) => {
      if (!apiKey) return;
      const requestId = latestRequest.current + 1;
      latestRequest.current = requestId;
      lastRequest.current = request;
      const isCurrent = () => latestRequest.current === requestId;

      try {
        if (request.type === 'photo') {
          dispatch({ type: 'loading', message: '사진 속 가게를 살펴보는 중이에요… 📷🤔' });
          const analysis = await analyzePhoto(apiKey, request.photo, { useSearch });
          if (!isCurrent()) return;
          dispatch({ type: 'done', analysis, requestId });
          onDoneRef.current?.(analysis);
          return;
        }
        let target: { mode: 'single'; company: string } | { mode: 'compare'; a: string; b: string };
        if (request.type === 'query') {
          dispatch({ type: 'loading', message: THINKING });
          const intent = await detectIntent(apiKey, request.text);
          if (!isCurrent()) return;
          if (intent.mode === 'unclear') {
            dispatch({ type: 'unclear', intent });
            return;
          }
          target =
            intent.mode === 'single'
              ? { mode: 'single', company: intent.companies[0] }
              : { mode: 'compare', a: intent.companies[0], b: intent.companies[1] };
        } else if (request.type === 'single') {
          target = { mode: 'single', company: request.company };
        } else {
          target = { mode: 'compare', a: request.a, b: request.b };
        }

        dispatch({
          type: 'loading',
          message:
            target.mode === 'single'
              ? `${target.company}의 SWOT 4칸을 채우는 중이에요… 🤔`
              : `${target.a}와(과) ${target.b}를 비교하는 중이에요… 🤔`,
        });
        const analysis =
          target.mode === 'single'
            ? await analyzeOne(apiKey, target.company, { useSearch })
            : await analyzeTwo(apiKey, target.a, target.b, { useSearch });
        if (!isCurrent()) return;
        dispatch({ type: 'done', analysis, requestId });
        onDoneRef.current?.(analysis);
      } catch (error) {
        if (!isCurrent()) return;
        dispatch({ type: 'error', error: toFriendlyError(error) });
      }
    },
    [apiKey, useSearch],
  );

  const isLoading = state.status === 'loading';

  const search = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;
      void run({ type: 'query', text: trimmed });
    },
    [run, isLoading],
  );

  const analyzeCompany = useCallback(
    (company: string) => {
      const trimmed = company.trim();
      if (!trimmed || isLoading) return;
      void run({ type: 'single', company: trimmed });
    },
    [run, isLoading],
  );

  const compareTwo = useCallback(
    (a: string, b: string) => {
      const first = a.trim();
      const second = b.trim();
      if (!first || !second || isLoading) return;
      void run({ type: 'compare', a: first, b: second });
    },
    [run, isLoading],
  );

  const analyzeStorePhoto = useCallback(
    (photo: PhotoInput) => {
      if (!photo.imageBase64 || isLoading) return;
      void run({ type: 'photo', photo });
    },
    [run, isLoading],
  );

  const retry = useCallback(() => {
    if (lastRequest.current && !isLoading) void run(lastRequest.current);
  }, [run, isLoading]);

  const reset = useCallback(() => {
    latestRequest.current += 1;
    dispatch({ type: 'reset' });
  }, []);

  const showSaved = useCallback((analysis: Analysis) => {
    latestRequest.current += 1;
    dispatch({ type: 'done', analysis, requestId: latestRequest.current });
  }, []);

  return { state, isLoading, search, analyzeCompany, compareTwo, analyzeStorePhoto, retry, reset, showSaved };
}
