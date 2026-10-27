// API 키를 다루는 코드는 이 파일 한 곳에만 둔다.
// 키가 어디에 저장되고 언제 지워지는지 한눈에 확인할 수 있어야
// 교사·학부모가 안심하고 쓸 수 있기 때문이다.
//
// 저장 위치를 고르는 이유:
// - 기본값 sessionStorage: 탭(창)을 닫으면 저절로 지워진다.
//   학교 컴퓨터처럼 여러 사람이 쓰는 기기에서 키가 남지 않게 하려는 것.
// - "이 기기에서 기억하기"를 켰을 때만 localStorage: 집 컴퓨터처럼
//   한 사람만 쓰는 기기에서 매번 키를 넣는 번거로움을 줄인다.
// 키는 Gemini API 호출(SDK가 요청 헤더에 넣음) 외에는 어디에도 보내지 않으며,
// 이 파일은 키를 콘솔에 찍거나 오류 메시지에 담지 않는다.

const STORAGE_KEY = 'swot-kids:gemini-api-key';

export type KeyStorageKind = 'session' | 'local';

export interface StoredApiKey {
  key: string;
  storage: KeyStorageKind;
}

function getStorage(kind: KeyStorageKind): Storage | null {
  // 사생활 보호 모드 등에서는 저장소 접근 자체가 막혀 예외가 날 수 있다.
  try {
    return kind === 'local' ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}

function readFrom(kind: KeyStorageKind): string | null {
  try {
    const value = getStorage(kind)?.getItem(STORAGE_KEY);
    return value && value.trim() ? value : null;
  } catch {
    return null;
  }
}

function removeFrom(kind: KeyStorageKind): void {
  try {
    getStorage(kind)?.removeItem(STORAGE_KEY);
  } catch {
    // 지울 수 없는 저장소는 애초에 저장도 되지 않았으므로 무시해도 된다.
  }
}

/** 저장된 키를 돌려준다. 탭 전용(session)을 먼저 본다. 없으면 null. */
export function loadApiKey(): StoredApiKey | null {
  const sessionKey = readFrom('session');
  if (sessionKey) return { key: sessionKey, storage: 'session' };
  const localKey = readFrom('local');
  if (localKey) return { key: localKey, storage: 'local' };
  return null;
}

/**
 * 키를 저장한다. remember가 true일 때만 localStorage에 둔다.
 * 다른 쪽 저장소에 남은 예전 키는 지워서, 키가 두 군데 흩어져 남지 않게 한다.
 * @returns 저장에 성공했으면 true
 */
export function saveApiKey(key: string, remember: boolean): boolean {
  const trimmed = key.trim();
  if (!trimmed) return false;
  const target: KeyStorageKind = remember ? 'local' : 'session';
  const other: KeyStorageKind = remember ? 'session' : 'local';
  try {
    const storage = getStorage(target);
    if (!storage) return false;
    storage.setItem(STORAGE_KEY, trimmed);
  } catch {
    return false;
  }
  removeFrom(other);
  return true;
}

/** 두 저장소 모두에서 키를 지운다. */
export function clearApiKey(): void {
  removeFrom('session');
  removeFrom('local');
}
