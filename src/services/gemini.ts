import {
  ApiError,
  createPartFromBase64,
  GoogleGenAI,
  type ContentListUnion,
  type Content,
  type GenerateContentConfig,
  type GenerateContentResponse,
  type Schema,
} from '@google/genai';
import { GEMINI_MODEL, MAX_CHAT_TURNS, THINKING_LEVEL } from '../config';
import { buildChatSystemPrompt } from '../prompts/chatPrompt';
import { buildComparePrompt } from '../prompts/comparePrompt';
import { buildIntentPrompt } from '../prompts/intentPrompt';
import { buildPhotoPrompt } from '../prompts/photoPrompt';
import { buildPracticePrompt } from '../prompts/practicePrompt';
import { buildSwotPrompt } from '../prompts/swotPrompt';
import { SYSTEM_RULES } from '../prompts/systemRules';
import {
  isCompareResult,
  isPhotoResponse,
  isPracticeFeedback,
  isRawIntent,
  isSwotResult,
  type RawIntent,
} from '../schemas/guards';
import {
  compareResultSchema,
  intentSchema,
  photoSwotSchema,
  practiceFeedbackSchema,
  swotResultSchema,
} from '../schemas/responseSchemas';
import type {
  Analysis,
  ChatMessage,
  CompareResult,
  FriendlyError,
  IntentResult,
  PhotoInput,
  PracticeFeedback,
  PracticeInput,
  Source,
  SwotResult,
} from '../types';

// 이 앱의 모든 Gemini API 호출은 이 파일에만 있다.
// 컴포넌트는 이 파일을 직접 부르지 않고 커스텀 훅을 통해서만 쓴다.
//
// 공통 원칙(gemini-3.5-flash-lite 기준):
// - temperature, topP, topK 같은 샘플링 값은 넣지 않는다. 이 모델부터 바뀐 부분이라
//   넣으면 오히려 오류나 예상 밖의 결과가 날 수 있다. 생각 수준(thinkingLevel)만 조절한다.
// - 구조화 출력은 responseMimeType + responseSchema로만 받는다.
//   글에서 정규식으로 JSON을 잘라 내는 방식은 쓰지 않는다.

export class InvalidResponseError extends Error {
  constructor() {
    super('AI 응답 형식이 올바르지 않아요.');
    this.name = 'InvalidResponseError';
  }
}

/** 가게 사진이 아닌 사진을 보냈을 때 */
export class NotStoreError extends Error {
  constructor() {
    super('가게 사진이 아니에요.');
    this.name = 'NotStoreError';
  }
}

export interface CallOptions {
  /** Google 검색으로 최신 정보를 찾아볼지 */
  useSearch?: boolean;
}

function createClient(apiKey: string): GoogleGenAI {
  return new GoogleGenAI({ apiKey });
}

function baseConfig(useSearch: boolean | undefined): GenerateContentConfig {
  return {
    systemInstruction: SYSTEM_RULES,
    thinkingConfig: { thinkingLevel: THINKING_LEVEL },
    ...(useSearch ? { tools: [{ googleSearch: {} }] } : {}),
  };
}

/** 그라운딩 메타데이터에서 출처 링크만 뽑는다. http(s) 주소만 남겨 이상한 링크를 막는다. */
export function extractSources(response: GenerateContentResponse): Source[] {
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
  const seen = new Set<string>();
  const sources: Source[] = [];
  for (const chunk of chunks) {
    const uri = chunk.web?.uri;
    if (!uri || !/^https?:\/\//i.test(uri) || seen.has(uri)) continue;
    seen.add(uri);
    sources.push({ title: chunk.web?.title?.trim() || uri, uri });
  }
  return sources;
}

interface JsonResult<T> {
  data: T;
  sources: Source[];
}

/**
 * 구조화 출력(JSON)을 요청하고 타입 가드로 검사한다.
 *
 * 검증·재시도 흐름:
 * 1) 스키마를 지정해 요청한다.
 * 2) JSON.parse에 실패하거나 타입 가드를 통과하지 못하면 "같은 요청을 딱 한 번" 더 보낸다.
 *    모델이 가끔 칸을 빠뜨리는 일은 다시 물으면 대부분 고쳐지기 때문이다.
 * 3) 두 번째도 실패하면 InvalidResponseError를 던져 화면에서 친절한 오류를 보여 준다.
 * API 오류(키 오류·사용량 초과·네트워크)는 다시 보내도 같은 결과일 가능성이 높으므로
 * 재시도하지 않고 바로 위로 올린다. 사용량을 아끼기 위해서다.
 */
async function generateJson<T>(
  apiKey: string,
  prompt: ContentListUnion,
  schema: Schema,
  guard: (value: unknown) => value is T,
  options: CallOptions = {},
): Promise<JsonResult<T>> {
  const ai = createClient(apiKey);
  const maxAttempts = 2;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        ...baseConfig(options.useSearch),
        responseMimeType: 'application/json',
        responseSchema: schema,
      },
    });
    let parsed: unknown;
    try {
      parsed = JSON.parse(response.text ?? '');
    } catch {
      continue;
    }
    if (guard(parsed)) {
      return { data: parsed, sources: extractSources(response) };
    }
  }
  throw new InvalidResponseError();
}

/** 1단계 판별 결과(평평한 모양)를 앱에서 쓰는 IntentResult로 바꾼다. */
export function normalizeIntent(raw: RawIntent): IntentResult {
  const companies = raw.companies.map((name) => name.trim()).filter((name) => name.length > 0);
  const unique = [...new Set(companies)];

  if (raw.kind === 'person') {
    return { mode: 'unclear', kind: 'person', reason: raw.reason, candidates: [] };
  }
  // 모델이 mode를 뭐라고 했든, 실제 회사 개수를 기준으로 한 번 더 확인한다.
  if (unique.length >= 3) {
    return { mode: 'unclear', kind: 'tooMany', reason: raw.reason, candidates: unique };
  }
  if (raw.mode === 'compare' && unique.length === 2) {
    const [a, b] = unique as [string, string];
    return { mode: 'compare', companies: [a, b] };
  }
  if (raw.mode === 'single' && unique.length === 1) {
    const [only] = unique as [string];
    return { mode: 'single', companies: [only] };
  }
  const kind = raw.kind === 'none' || raw.kind === 'tooMany' ? 'unknown' : raw.kind;
  return { mode: 'unclear', kind, reason: raw.reason, candidates: unique };
}

export async function detectIntent(apiKey: string, input: string): Promise<IntentResult> {
  const { data } = await generateJson(apiKey, buildIntentPrompt(input), intentSchema, isRawIntent);
  return normalizeIntent(data);
}

export async function analyzeOne(
  apiKey: string,
  company: string,
  options: CallOptions = {},
): Promise<Analysis> {
  const { data, sources } = await generateJson<SwotResult>(
    apiKey,
    buildSwotPrompt(company),
    swotResultSchema,
    isSwotResult,
    options,
  );
  return { kind: 'single', result: data, sources };
}

export async function analyzeTwo(
  apiKey: string,
  a: string,
  b: string,
  options: CallOptions = {},
): Promise<Analysis> {
  const { data, sources } = await generateJson<CompareResult>(
    apiKey,
    buildComparePrompt(a, b),
    compareResultSchema,
    isCompareResult,
    options,
  );
  return { kind: 'compare', result: data, sources };
}

/**
 * 가게 사진 한 장으로 SWOT를 분석한다.
 * 사진(이미 브라우저에서 줄이고 위치 정보를 지운 JPEG)과 지시문을 한 user 메시지에 함께 담는다.
 * 사진은 이 요청에만 쓰이고 앱 어디에도 저장하지 않는다.
 */
export async function analyzePhoto(
  apiKey: string,
  photo: PhotoInput,
  options: CallOptions = {},
): Promise<Analysis> {
  const contents: Content[] = [
    {
      role: 'user',
      parts: [
        createPartFromBase64(photo.imageBase64, photo.mimeType),
        { text: buildPhotoPrompt(photo.storeName, photo.note) },
      ],
    },
  ];
  const { data, sources } = await generateJson(apiKey, contents, photoSwotSchema, isPhotoResponse, options);
  if (!data.isStore) throw new NotStoreError();
  // 화면·기록에는 SWOT 결과 모양만 남긴다(isStore·reason 같은 판별용 칸은 버린다).
  const result: SwotResult = {
    company: data.company,
    oneLineIntro: data.oneLineIntro,
    strengths: data.strengths,
    weaknesses: data.weaknesses,
    opportunities: data.opportunities,
    threats: data.threats,
    summary: data.summary,
    hardWords: data.hardWords,
    photoClues: data.photoClues,
  };
  return { kind: 'single', result, sources };
}

export async function coachPractice(apiKey: string, input: PracticeInput): Promise<PracticeFeedback> {
  const { data } = await generateJson(
    apiKey,
    buildPracticePrompt(input),
    practiceFeedbackSchema,
    isPracticeFeedback,
  );
  return data;
}

/**
 * 대화 요청에 보낼 contents를 만든다.
 * - 최근 MAX_CHAT_TURNS턴(질문+답 한 쌍 = 1턴)만 남긴다.
 * - 잘라 낸 결과가 model로 시작하면 버린다(대화는 user로 시작해야 자연스럽다).
 * - 빈 답(스트리밍이 끊긴 경우 등)은 빼고, 같은 역할이 연달아 오면 앞의 것을 버린다.
 * - 마지막은 반드시 새 user 질문이다. contents의 마지막이 model이면 이 모델은 오류를 낸다.
 */
export function buildChatContents(history: ChatMessage[], question: string): Content[] {
  const cleaned = history.filter((message) => message.text.trim().length > 0);
  const pairs: ChatMessage[] = [];
  for (const message of cleaned) {
    const last = pairs[pairs.length - 1];
    if (last && last.role === message.role) pairs.pop();
    pairs.push(message);
  }
  let recent = pairs.slice(-(MAX_CHAT_TURNS - 1) * 2);
  while (recent[0]?.role === 'model') recent = recent.slice(1);
  // 새 질문을 붙이기 직전 마지막이 user면(답을 못 받은 질문) 그 질문은 버린다.
  while (recent[recent.length - 1]?.role === 'user') recent = recent.slice(0, -1);

  const contents: Content[] = recent.map((message) => ({
    role: message.role,
    parts: [{ text: message.text }],
  }));
  contents.push({ role: 'user', parts: [{ text: question }] });
  return contents;
}

/** 분석 결과를 대화 맥락으로 쓰기 좋게 짧은 JSON 글로 만든다. */
export function summarizeAnalysis(analysis: Analysis): string {
  return JSON.stringify(analysis.result);
}

/**
 * 추가 질문에 스트리밍으로 답한다. 글자가 올 때마다 onText에 "지금까지 모은 전체 글"을 준다.
 * @returns 최종 답과 출처
 */
export async function askFollowUp(
  apiKey: string,
  analysis: Analysis,
  history: ChatMessage[],
  question: string,
  onText: (textSoFar: string) => void,
  options: CallOptions = {},
): Promise<{ text: string; sources: Source[] }> {
  const ai = createClient(apiKey);
  const stream = await ai.models.generateContentStream({
    model: GEMINI_MODEL,
    contents: buildChatContents(history, question),
    config: {
      ...baseConfig(options.useSearch),
      systemInstruction: buildChatSystemPrompt(summarizeAnalysis(analysis)),
    },
  });
  let text = '';
  const sources: Source[] = [];
  for await (const chunk of stream) {
    const piece = chunk.text ?? '';
    if (piece) {
      text += piece;
      onText(text);
    }
    for (const source of extractSources(chunk)) {
      if (!sources.some((existing) => existing.uri === source.uri)) sources.push(source);
    }
  }
  if (!text.trim()) throw new InvalidResponseError();
  return { text, sources };
}

/**
 * 키가 맞는지 아주 짧은 요청으로 확인한다.
 * 키가 틀리면 ApiError(400/401/403)가 나므로, 성공하면 키가 맞다고 본다.
 */
export async function verifyKey(apiKey: string): Promise<void> {
  const ai = createClient(apiKey);
  await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: '안녕이라고만 답해.',
    config: {
      thinkingConfig: { thinkingLevel: THINKING_LEVEL },
      maxOutputTokens: 16,
    },
  });
}

export const FRIENDLY_MESSAGES = {
  badKey: '열쇠(API 키)가 맞지 않아요. 어른에게 확인해 달라고 해요 🔑',
  rateLimit: 'AI가 잠깐 쉬고 있어요. 1분 뒤에 다시 해 봐요 ⏳',
  network: '인터넷이 잘 안 되는 것 같아요 📶',
  invalidResponse: 'AI의 답이 조금 이상하게 왔어요. 다시 해 볼까요? 🔄',
  notStore: '가게 사진이 아닌 것 같아요. 가게의 겉모습이나 안쪽이 보이는 사진을 넣어 주세요 🏪',
} as const;

/**
 * 어떤 오류든 아이 눈높이 메시지로 바꾼다.
 * 원래 오류 메시지는 화면에 보여 주지 않는다. 요청 정보(키 포함 가능성)가
 * 섞여 있을 수 있어, 키가 화면이나 로그에 새지 않게 하기 위해서다.
 */
export function toFriendlyError(error: unknown): FriendlyError {
  if (error instanceof NotStoreError) {
    return { kind: 'notStore', message: FRIENDLY_MESSAGES.notStore };
  }
  if (error instanceof InvalidResponseError) {
    return { kind: 'invalidResponse', message: FRIENDLY_MESSAGES.invalidResponse };
  }
  if (error instanceof ApiError) {
    if (error.status === 429) return { kind: 'rateLimit', message: FRIENDLY_MESSAGES.rateLimit };
    if (error.status === 401 || error.status === 403) {
      return { kind: 'badKey', message: FRIENDLY_MESSAGES.badKey };
    }
    if (error.status === 400) {
      // Gemini는 틀린 키에 400("API key not valid")을 돌려준다. 하지만 400은 요청 모양이
      // 잘못됐을 때도 나므로, 키 문제라고 적힌 경우만 키 화면으로 보낸다.
      // (멀쩡한 키를 다시 넣게 만드는 헛수고를 막기 위해서)
      if (/api[\s_-]?key/i.test(error.message)) {
        return { kind: 'badKey', message: FRIENDLY_MESSAGES.badKey };
      }
      return { kind: 'invalidResponse', message: FRIENDLY_MESSAGES.invalidResponse };
    }
  }
  return { kind: 'network', message: FRIENDLY_MESSAGES.network };
}
