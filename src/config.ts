import { ThinkingLevel } from '@google/genai';

// 모델을 바꿀 때는 이 한 줄만 고친다.
export const GEMINI_MODEL = 'gemini-3.5-flash-lite';

// 3.5 Flash-Lite부터는 temperature·topP·topK 대신 생각 수준만 조절한다.
// 아이들이 기다리지 않도록 가장 빠른 MINIMAL을 기본으로 쓴다.
export const THINKING_LEVEL = ThinkingLevel.MINIMAL;

export const MAX_QUESTION_LENGTH = 300;
export const MAX_CHAT_TURNS = 10;
export const MAX_SEARCH_LENGTH = 100;
export const MAX_HISTORY_ITEMS = 5;

export const API_KEY_HELP_URL = 'https://aistudio.google.com/apikey';
