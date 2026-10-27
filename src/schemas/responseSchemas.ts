import { Type, type Schema } from '@google/genai';

// Gemini에게 "이 모양의 JSON으로만 답해"라고 알려 주는 스키마들.
// 스키마를 주더라도 모델이 가끔 칸을 빠뜨릴 수 있으므로,
// 받은 뒤에는 반드시 guards.ts의 런타임 타입 가드로 다시 검사한다.

function buildItemList(withSource: boolean): Schema {
  const properties: Record<string, Schema> = {
    point: { type: Type.STRING, description: '한 문장으로 쓴 핵심 내용' },
    example: { type: Type.STRING, description: '초등학생이 떠올릴 수 있는 쉬운 예시 한 문장' },
  };
  const required = ['point', 'example'];
  if (withSource) {
    properties.source = {
      type: Type.STRING,
      format: 'enum',
      enum: ['photo', 'guess'],
      description: '사진에서 직접 보이면 photo, 사진에 없어서 짐작했으면 guess',
    };
    required.push('source');
  }
  return {
    type: Type.ARRAY,
    minItems: '2',
    maxItems: '3',
    items: { type: Type.OBJECT, properties, required, propertyOrdering: required },
  };
}

const swotItemList = buildItemList(false);
const photoItemList = buildItemList(true);

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

// 가게 사진 분석. isStore를 맨 앞에 두어 모델이 먼저 "가게 사진이 맞는지"부터 판단하게 한다.
// 가게 사진이 아니면 나머지 칸은 비워도 되도록 isStore·reason만 필수로 둔다.
// (나머지 칸이 빠졌는지는 guards.ts의 isPhotoResponse가 다시 확인한다.)
export const photoSwotSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    isStore: { type: Type.BOOLEAN, description: '가게·식당·시장 등 장사하는 곳의 사진이면 true' },
    reason: { type: Type.STRING, description: 'isStore가 false일 때 그 이유 한 문장' },
    company: { type: Type.STRING },
    oneLineIntro: { type: Type.STRING },
    photoClues: {
      type: Type.ARRAY,
      minItems: '2',
      maxItems: '5',
      items: { type: Type.STRING },
      description: '사진에서 직접 보이는 단서',
    },
    strengths: photoItemList,
    weaknesses: photoItemList,
    opportunities: photoItemList,
    threats: photoItemList,
    summary: { type: Type.STRING },
    hardWords: swotResultSchema.properties?.hardWords ?? { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ['isStore', 'reason'],
  propertyOrdering: [
    'isStore',
    'reason',
    'company',
    'oneLineIntro',
    'photoClues',
    'strengths',
    'weaknesses',
    'opportunities',
    'threats',
    'summary',
    'hardWords',
  ],
};
