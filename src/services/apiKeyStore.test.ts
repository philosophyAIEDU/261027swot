import { describe, expect, it } from 'vitest';
import { clearApiKey, loadApiKey, saveApiKey } from './apiKeyStore';

const STORAGE_KEY = 'swot-kids:gemini-api-key';

describe('apiKeyStore', () => {
  it('키가 없으면 null을 돌려준다', () => {
    expect(loadApiKey()).toBeNull();
  });

  it('기본(기억하기 끔)은 sessionStorage에만 저장한다', () => {
    expect(saveApiKey('  test-key  ', false)).toBe(true);
    expect(window.sessionStorage.getItem(STORAGE_KEY)).toBe('test-key');
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
    expect(loadApiKey()).toEqual({ key: 'test-key', storage: 'session' });
  });

  it('기억하기를 켜면 localStorage에 저장하고 session 쪽 예전 키는 지운다', () => {
    saveApiKey('old-key', false);
    saveApiKey('new-key', true);
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe('new-key');
    expect(window.sessionStorage.getItem(STORAGE_KEY)).toBeNull();
    expect(loadApiKey()).toEqual({ key: 'new-key', storage: 'local' });
  });

  it('기억하기를 다시 끄면 localStorage의 키를 지운다', () => {
    saveApiKey('remembered', true);
    saveApiKey('session-only', false);
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
    expect(loadApiKey()).toEqual({ key: 'session-only', storage: 'session' });
  });

  it('빈 키는 저장하지 않는다', () => {
    expect(saveApiKey('   ', true)).toBe(false);
    expect(loadApiKey()).toBeNull();
  });

  it('clearApiKey는 두 저장소 모두에서 지운다', () => {
    window.sessionStorage.setItem(STORAGE_KEY, 'a');
    window.localStorage.setItem(STORAGE_KEY, 'b');
    clearApiKey();
    expect(window.sessionStorage.getItem(STORAGE_KEY)).toBeNull();
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
    expect(loadApiKey()).toBeNull();
  });
});
