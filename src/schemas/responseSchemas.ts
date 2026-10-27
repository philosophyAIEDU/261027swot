import { Type, type Schema } from '@google/genai';

// Gemini에게 "이 모양의 JSON으로만 답해"라고 알려 주는 스키마들.
// 스키마를 주더라도 모델이 가끔 칸을 빠뜨릴 수 있으므로,
// 받은 뒤에는 반드시 guards.ts의 런타임 타입 가드로 다시 검사한다.

const swotItemList: Schema = {
  type: Type.ARRAY,
  minItems: '2',
  maxItems: '3',
  items: {
    type: Type.OBJECT,
    properties: {
      point: { type: Type.STRING, description: '한 문장으로 쓴 핵심 내용' },
      example: { type: Type.STRING, description: '초등학생이 떠올릴 수 있는 쉬운 예시 한 문장' },
    },
    required: ['point', 'example'],
    propertyOrdering: ['point', 'example'],
  },
};

export const swotResultSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    company: { type: Type.STRING },
    oneLineIntro: { type: Type.STRING, description: '"○○는 ~을 만드는 회사예요." 한 문장' },
    strengths: swotItemList,
    weaknesses: swotItemList,
    opportunities: swotItemList,
    threats: swotItemList,
    summary: { type: Type.STRING, description: '전체 한 줄 정리' },
    hardWords: {
      type: Type.ARRAY,
      maxItems: '3',
      items: {
        type: Type.OBJECT,
        properties: {
          word: { type: Type.STRING },
          meaning: { type: Type.STRING },
        },
        required: ['word', 'meaning'],
        propertyOrdering: ['word', 'meaning'],
      },
    },
  },
  required: [
    'company',
    'oneLineIntro',
    'strengths',
    'weaknesses',
    'opportunities',
    'threats',
    'summary',
    'hardWords',
  ],
  propertyOrdering: [
    'company',
    'oneLineIntro',
    'strengths',
    'weaknesses',
    'opportunities',
    'threats',
    'summary',
    'hardWords',
  ],
};

export const compareResultSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    a: swotResultSchema,
    b: swotResultSchema,
    sameThings: { type: Type.ARRAY, minItems: '2', maxItems: '3', items: { type: Type.STRING } },
    differentThings: {
      type: Type.ARRAY,
      minItems: '2',
      maxItems: '4',
      items: {
        type: Type.OBJECT,
        properties: {
          topic: { type: Type.STRING },
          a: { type: Type.STRING },
          b: { type: Type.STRING },
        },
        required: ['topic', 'a', 'b'],
        propertyOrdering: ['topic', 'a', 'b'],
      },
    },
    kidSummary: { type: Type.STRING },
  },
  required: ['a', 'b', 'sameThings', 'differentThings', 'kidSummary'],
  propertyOrdering: ['a', 'b', 'sameThings', 'differentThings', 'kidSummary'],
};

// 1단계 판별 결과. 모델이 다루기 쉽도록 유니언 대신 평평한 객체로 받고,
// gemini.ts에서 앱이 쓰는 IntentResult 유니언 타입으로 바꾼다.
export const intentSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    mode: { type: Type.STRING, format: 'enum', enum: ['single', 'compare', 'unclear'] },
    companies: { type: Type.ARRAY, items: { type: Type.STRING } },
    kind: {
      type: Type.STRING,
      format: 'enum',
      enum: ['none', 'tooMany', 'person', 'notCompany', 'unknown'],
      description: 'mode가 unclear일 때 이유의 종류, 아니면 none',
    },
    reason: { type: Type.STRING },
  },
  required: ['mode', 'companies', 'kind', 'reason'],
  propertyOrdering: ['mode', 'companies', 'kind', 'reason'],
};

export const practiceFeedbackSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    praise: { type: Type.STRING },
    hint: { type: Type.STRING },
  },
  required: ['praise', 'hint'],
  propertyOrdering: ['praise', 'hint'],
};
