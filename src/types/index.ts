export type IntentResult =
  | { mode: 'single'; companies: [string] }
  | { mode: 'compare'; companies: [string, string] }
  | { mode: 'unclear'; reason: string; kind: UnclearKind; candidates: string[] };

/** 왜 분석할 수 없는지: 3개 이상 / 실제 사람 / 회사가 아님 / 알 수 없음 */
export type UnclearKind = 'tooMany' | 'person' | 'notCompany' | 'unknown';

export interface SwotItem {
  point: string;
  example: string;
}

export interface HardWord {
  word: string;
  meaning: string;
}

export interface SwotResult {
  company: string;
  oneLineIntro: string;
  strengths: SwotItem[];
  weaknesses: SwotItem[];
  opportunities: SwotItem[];
  threats: SwotItem[];
  summary: string;
  hardWords: HardWord[];
}

export interface DifferentThing {
  topic: string;
  a: string;
  b: string;
}

export interface CompareResult {
  a: SwotResult;
  b: SwotResult;
  sameThings: string[];
  differentThings: DifferentThing[];
  kidSummary: string;
}

export type ChatRole = 'user' | 'model';

export interface ChatMessage {
  role: ChatRole;
  text: string;
}

/** Google 검색 그라운딩을 켰을 때 AI가 참고한 웹 페이지 */
export interface Source {
  title: string;
  uri: string;
}

export type Analysis =
  | { kind: 'single'; result: SwotResult; sources: Source[] }
  | { kind: 'compare'; result: CompareResult; sources: Source[] };

export type FriendlyErrorKind = 'badKey' | 'rateLimit' | 'network' | 'invalidResponse';

export interface FriendlyError {
  kind: FriendlyErrorKind;
  message: string;
}

export type QuadrantKey = 'strengths' | 'weaknesses' | 'opportunities' | 'threats';

/** "내가 직접 채워 보기"에서 학생이 쓴 내용 */
export interface PracticeInput {
  company: string;
  strengths: string;
  weaknesses: string;
  opportunities: string;
  threats: string;
}

export interface PracticeFeedback {
  praise: string;
  hint: string;
}
