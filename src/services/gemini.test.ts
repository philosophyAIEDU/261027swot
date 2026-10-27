import { ApiError } from '@google/genai';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GEMINI_MODEL } from '../config';
import { makeCompare, makeSwot } from '../test/fixtures';
import type { ChatMessage } from '../types';

// 실제 API는 절대 부르지 않는다. SDK의 GoogleGenAI만 가짜로 바꾸고,
// ApiError·Type 같은 나머지는 진짜를 그대로 쓴다.
const generateContent = vi.fn();
const generateContentStream = vi.fn();
const constructedWith = vi.fn();

vi.mock('@google/genai', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@google/genai')>();
  class FakeGoogleGenAI {
    models = { generateContent, generateContentStream };
    constructor(options: unknown) {
      constructedWith(options);
    }
  }
  return { ...actual, GoogleGenAI: FakeGoogleGenAI };
});

const {
  analyzePhoto,
  analyzeOne,
  analyzeTwo,
  askFollowUp,
  buildChatContents,
  detectIntent,
  FRIENDLY_MESSAGES,
  InvalidResponseError,
  NotStoreError,
  toFriendlyError,
  verifyKey,
} = await import('./gemini');

const KEY = 'secret-test-key';

function jsonResponse(data: unknown) {
  return { text: JSON.stringify(data), candidates: [] };
}

function intent(mode: string, companies: string[], kind = 'none') {
  return jsonResponse({ mode, companies, kind, reason: '이유예요.' });
}

beforeEach(() => {
  generateContent.mockReset();
  generateContentStream.mockReset();
  constructedWith.mockReset();
});

describe('detectIntent: 모드 분기', () => {
  it('회사 1개면 single', async () => {
    generateContent.mockResolvedValueOnce(intent('single', ['삼성전자']));
    await expect(detectIntent(KEY, '삼성전자')).resolves.toEqual({ mode: 'single', companies: ['삼성전자'] });
  });

  it('회사 2개면 compare', async () => {
    generateContent.mockResolvedValueOnce(intent('compare', ['농심', '오뚜기']));
    await expect(detectIntent(KEY, '농심이랑 오뚜기 비교')).resolves.toEqual({
      mode: 'compare',
      companies: ['농심', '오뚜기'],
    });
  });

  it('알 수 없으면 unclear', async () => {
    generateContent.mockResolvedValueOnce(intent('unclear', [], 'notCompany'));
    await expect(detectIntent(KEY, '고양이')).resolves.toMatchObject({ mode: 'unclear', kind: 'notCompany' });
  });

  it('실제 사람이면 unclear(person)', async () => {
    generateContent.mockResolvedValueOnce(intent('unclear', [], 'person'));
    await expect(detectIntent(KEY, '우리 선생님')).resolves.toMatchObject({ mode: 'unclear', kind: 'person' });
  });

  it('회사가 3개 이상이면 모델이 compare라고 해도 tooMany로 바꾸고 후보를 준다', async () => {
    generateContent.mockResolvedValueOnce(intent('compare', ['농심', '오뚜기', '삼양']));
    await expect(detectIntent(KEY, '셋 다 비교')).resolves.toEqual({
      mode: 'unclear',
      kind: 'tooMany',
      reason: '이유예요.',
      candidates: ['농심', '오뚜기', '삼양'],
    });
  });

  it('config.ts의 모델 이름과 구조화 출력 설정을 쓰고, 샘플링 값은 넣지 않는다', async () => {
    generateContent.mockResolvedValueOnce(intent('single', ['카카오']));
    await detectIntent(KEY, '카카오');
    const request = generateContent.mock.calls[0]?.[0];
    expect(request.model).toBe(GEMINI_MODEL);
    expect(request.config.responseMimeType).toBe('application/json');
    expect(request.config.responseSchema).toBeDefined();
    expect(request.config).not.toHaveProperty('temperature');
    expect(request.config).not.toHaveProperty('topP');
    expect(request.config).not.toHaveProperty('topK');
    expect(constructedWith).toHaveBeenCalledWith({ apiKey: KEY });
  });
});

describe('analyzeOne / analyzeTwo: 검증과 재시도', () => {
  it('올바른 응답은 그대로 돌려준다', async () => {
    generateContent.mockResolvedValueOnce(jsonResponse(makeSwot('농심')));
    const analysis = await analyzeOne(KEY, '농심');
    expect(analysis).toEqual({ kind: 'single', result: makeSwot('농심'), sources: [] });
    expect(generateContent).toHaveBeenCalledTimes(1);
  });

  it('형식이 틀리면 한 번만 다시 묻고, 두 번째가 맞으면 성공한다', async () => {
    generateContent
      .mockResolvedValueOnce({ text: '{"company": "농심"}' })
      .mockResolvedValueOnce(jsonResponse(makeSwot('농심')));
    await expect(analyzeOne(KEY, '농심')).resolves.toMatchObject({ kind: 'single' });
    expect(generateContent).toHaveBeenCalledTimes(2);
  });

  it('두 번 다 틀리면 InvalidResponseError', async () => {
    generateContent.mockResolvedValue({ text: '이건 JSON이 아니에요' });
    await expect(analyzeOne(KEY, '농심')).rejects.toBeInstanceOf(InvalidResponseError);
    expect(generateContent).toHaveBeenCalledTimes(2);
  });

  it('API 오류는 재시도하지 않는다', async () => {
    generateContent.mockRejectedValue(new ApiError({ message: 'quota', status: 429 }));
    await expect(analyzeOne(KEY, '농심')).rejects.toBeInstanceOf(ApiError);
    expect(generateContent).toHaveBeenCalledTimes(1);
  });

  it('비교 분석은 한 번의 호출로 받는다', async () => {
    generateContent.mockResolvedValueOnce(jsonResponse(makeCompare()));
    const analysis = await analyzeTwo(KEY, '농심', '오뚜기');
    expect(analysis.kind).toBe('compare');
    expect(generateContent).toHaveBeenCalledTimes(1);
  });

  it('검색을 켜면 googleSearch 도구를 넣고 출처를 뽑는다', async () => {
    generateContent.mockResolvedValueOnce({
      text: JSON.stringify(makeSwot('농심')),
      candidates: [
        {
          groundingMetadata: {
            groundingChunks: [
              { web: { uri: 'https://example.com/a', title: '기사' } },
              { web: { uri: 'javascript:alert(1)', title: '나쁜 링크' } },
            ],
          },
        },
      ],
    });
    const analysis = await analyzeOne(KEY, '농심', { useSearch: true });
    expect(generateContent.mock.calls[0]?.[0].config.tools).toEqual([{ googleSearch: {} }]);
    expect(analysis.sources).toEqual([{ uri: 'https://example.com/a', title: '기사' }]);
  });
});

describe('analyzePhoto: 가게 사진 분석', () => {
  const photo = { imageBase64: 'BASE64DATA', mimeType: 'image/jpeg', storeName: '행복 떡볶이', note: '학교 앞이에요' };

  function photoResponse() {
    const base = makeSwot('행복 떡볶이');
    return {
      isStore: true,
      reason: '',
      ...base,
      strengths: base.strengths.map((item) => ({ ...item, source: 'photo' })),
      weaknesses: base.weaknesses.map((item) => ({ ...item, source: 'photo' })),
      opportunities: base.opportunities.map((item) => ({ ...item, source: 'guess' })),
      threats: base.threats.map((item) => ({ ...item, source: 'guess' })),
      photoClues: ['메뉴판에 그림이 있어요.', '의자가 네 개 보여요.'],
    };
  }

  it('사진과 지시문을 한 user 메시지에 담아 보낸다', async () => {
    generateContent.mockResolvedValueOnce(jsonResponse(photoResponse()));
    await analyzePhoto(KEY, photo);
    const request = generateContent.mock.calls[0]?.[0];
    expect(request.model).toBe(GEMINI_MODEL);
    expect(request.contents).toHaveLength(1);
    expect(request.contents[0].role).toBe('user');
    expect(request.contents[0].parts[0]).toEqual({ inlineData: { data: 'BASE64DATA', mimeType: 'image/jpeg' } });
    expect(request.contents[0].parts[1].text).toContain('행복 떡볶이');
    expect(request.contents[0].parts[1].text).toContain('학교 앞이에요');
    expect(request.config.responseMimeType).toBe('application/json');
    expect(request.config).not.toHaveProperty('temperature');
  });

  it('결과에는 SWOT 칸과 사진 단서만 남기고 판별용 칸은 버린다', async () => {
    generateContent.mockResolvedValueOnce(jsonResponse(photoResponse()));
    const analysis = await analyzePhoto(KEY, photo);
    expect(analysis.kind).toBe('single');
    expect(analysis.result).not.toHaveProperty('isStore');
    expect(analysis.result).not.toHaveProperty('reason');
    if (analysis.kind !== 'single') throw new Error('single이어야 해요');
    expect(analysis.result.photoClues).toHaveLength(2);
    expect(analysis.result.opportunities[0]?.source).toBe('guess');
  });

  it('가게 사진이 아니면 NotStoreError → 친절한 안내', async () => {
    generateContent.mockResolvedValueOnce(jsonResponse({ isStore: false, reason: '사람 사진이에요.' }));
    const error = await analyzePhoto(KEY, photo).catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(NotStoreError);
    expect(toFriendlyError(error)).toEqual({ kind: 'notStore', message: FRIENDLY_MESSAGES.notStore });
  });

  it('근거 표시가 빠진 답이 오면 한 번 다시 묻는다', async () => {
    const { strengths: _omit, ...partial } = photoResponse();
    generateContent
      .mockResolvedValueOnce(jsonResponse({ ...partial, strengths: makeSwot('x').strengths }))
      .mockResolvedValueOnce(jsonResponse(photoResponse()));
    await expect(analyzePhoto(KEY, photo)).resolves.toMatchObject({ kind: 'single' });
    expect(generateContent).toHaveBeenCalledTimes(2);
  });
});

describe('toFriendlyError: 오류 코드별 메시지', () => {
  it.each([401, 403])('%i → 키 오류', (status) => {
    expect(toFriendlyError(new ApiError({ message: 'denied', status }))).toEqual({
      kind: 'badKey',
      message: FRIENDLY_MESSAGES.badKey,
    });
  });

  it('400 + API key 문구 → 키 오류', () => {
    const error = new ApiError({ message: 'API key not valid. Please pass a valid API key.', status: 400 });
    expect(toFriendlyError(error).kind).toBe('badKey');
  });

  it('429 → 잠깐 쉬기', () => {
    expect(toFriendlyError(new ApiError({ message: 'quota', status: 429 }))).toEqual({
      kind: 'rateLimit',
      message: FRIENDLY_MESSAGES.rateLimit,
    });
  });

  it('네트워크 오류 → 인터넷 안내', () => {
    expect(toFriendlyError(new TypeError('Failed to fetch'))).toEqual({
      kind: 'network',
      message: FRIENDLY_MESSAGES.network,
    });
  });

  it('오류 메시지에 원래 오류 글(키가 섞일 수 있음)을 담지 않는다', () => {
    const friendly = toFriendlyError(new ApiError({ message: `bad key ${KEY}`, status: 403 }));
    expect(friendly.message).not.toContain(KEY);
  });

  it('응답 형식 오류 → 다시 해 보기', () => {
    expect(toFriendlyError(new InvalidResponseError()).kind).toBe('invalidResponse');
  });
});

describe('대화 요청: 마지막은 항상 user', () => {
  function lastRole(history: ChatMessage[]) {
    const contents = buildChatContents(history, '새 질문');
    return { contents, last: contents[contents.length - 1] };
  }

  it('기록이 없어도 user 질문 하나로 끝난다', () => {
    const { contents, last } = lastRole([]);
    expect(contents).toHaveLength(1);
    expect(last).toEqual({ role: 'user', parts: [{ text: '새 질문' }] });
  });

  it('기록이 model로 끝나도 새 user 질문이 마지막이다', () => {
    const { last, contents } = lastRole([
      { role: 'user', text: 'Q1' },
      { role: 'model', text: 'A1' },
    ]);
    expect(last?.role).toBe('user');
    expect(contents.map((content) => content.role)).toEqual(['user', 'model', 'user']);
  });

  it('답을 못 받은 질문, 빈 답, model로 시작하는 기록을 정리한다', () => {
    const { contents } = lastRole([
      { role: 'model', text: '먼저 온 답' },
      { role: 'user', text: 'Q1' },
      { role: 'model', text: '' },
      { role: 'user', text: 'Q2' },
      { role: 'model', text: 'A2' },
      { role: 'user', text: '답 없는 질문' },
    ]);
    expect(contents.map((content) => content.role)).toEqual(['user', 'model', 'user']);
    expect(contents[0]?.parts?.[0]?.text).toBe('Q2');
  });

  it('최근 10턴(새 질문 포함)만 보낸다', () => {
    const history: ChatMessage[] = [];
    for (let i = 0; i < 15; i += 1) {
      history.push({ role: 'user', text: `Q${i}` }, { role: 'model', text: `A${i}` });
    }
    const { contents, last } = lastRole(history);
    expect(contents).toHaveLength(19);
    expect(contents[0]).toEqual({ role: 'user', parts: [{ text: 'Q6' }] });
    expect(last?.role).toBe('user');
  });

  it('askFollowUp은 스트리밍으로 글자를 모으고 요청의 마지막은 user다', async () => {
    async function* fakeStream() {
      yield { text: '안녕', candidates: [] };
      yield { text: '하세요', candidates: [] };
    }
    generateContentStream.mockResolvedValueOnce(fakeStream());
    const seen: string[] = [];
    const result = await askFollowUp(
      KEY,
      { kind: 'single', result: makeSwot('농심'), sources: [] },
      [
        { role: 'user', text: 'Q1' },
        { role: 'model', text: 'A1' },
      ],
      '질문이에요',
      (text) => seen.push(text),
    );
    expect(seen).toEqual(['안녕', '안녕하세요']);
    expect(result.text).toBe('안녕하세요');
    const request = generateContentStream.mock.calls[0]?.[0];
    expect(request.contents[request.contents.length - 1].role).toBe('user');
    expect(request.config.systemInstruction).toContain('농심');
  });
});

describe('verifyKey', () => {
  it('키가 틀리면 ApiError를 그대로 던진다', async () => {
    generateContent.mockRejectedValueOnce(new ApiError({ message: 'denied', status: 403 }));
    await expect(verifyKey(KEY)).rejects.toBeInstanceOf(ApiError);
  });
});
