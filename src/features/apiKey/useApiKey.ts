import { useCallback, useState } from 'react';
import { clearApiKey, loadApiKey, saveApiKey, type StoredApiKey } from '../../services/apiKeyStore';
import { toFriendlyError, verifyKey } from '../../services/gemini';
import type { FriendlyError } from '../../types';

export interface UseApiKey {
  apiKey: string | null;
  remembered: boolean;
  /** 키를 시험해 보고 맞으면 저장한다. 문제가 있으면 아이 눈높이 오류를 돌려준다. */
  verifyAndSave: (key: string, remember: boolean) => Promise<FriendlyError | null>;
  clear: () => void;
}

export function useApiKey(): UseApiKey {
  const [stored, setStored] = useState<StoredApiKey | null>(loadApiKey);

  const verifyAndSave = useCallback(async (key: string, remember: boolean) => {
    const trimmed = key.trim();
    if (!trimmed) return null;
    try {
      await verifyKey(trimmed);
    } catch (error) {
      return toFriendlyError(error);
    }
    // 저장소가 막힌 브라우저라도 이번 방문 동안은 쓸 수 있도록 메모리에는 들고 있는다.
    const saved = saveApiKey(trimmed, remember);
    setStored(saved ? loadApiKey() : { key: trimmed, storage: 'session' });
    return null;
  }, []);

  const clear = useCallback(() => {
    clearApiKey();
    setStored(null);
  }, []);

  return {
    apiKey: stored?.key ?? null,
    remembered: stored?.storage === 'local',
    verifyAndSave,
    clear,
  };
}
