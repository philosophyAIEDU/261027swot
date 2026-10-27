import type { CompareResult, SwotResult } from '../types';

export function makeSwot(company: string): SwotResult {
  return {
    company,
    oneLineIntro: `${company}는 라면을 만드는 회사예요.`,
    strengths: [
      { point: '맛있는 라면을 많이 만들어요.', example: '마트에 가면 이 회사 라면이 여러 줄 놓여 있어요.' },
      { point: '오래된 회사예요.', example: '할머니도 어릴 때 먹었대요.' },
    ],
    weaknesses: [{ point: '새 메뉴가 적어요.', example: '늘 비슷한 라면만 보여요.' }],
    opportunities: [{ point: '외국에서 라면이 인기예요.', example: '외국 친구들도 라면을 좋아해요.' }],
    threats: [{ point: '비슷한 회사가 많아요.', example: '마트에 다른 라면도 많아요.' }],
    summary: '맛있는 라면으로 사랑받는 회사예요.',
    hardWords: [{ word: '수출', meaning: '다른 나라에 물건을 파는 것' }],
  };
}

export function makeCompare(): CompareResult {
  return {
    a: makeSwot('농심'),
    b: makeSwot('오뚜기'),
    sameThings: ['둘 다 라면을 만들어요.', '둘 다 오래된 회사예요.'],
    differentThings: [
      { topic: '대표 음식', a: '매운 라면이 유명해요.', b: '카레가 유명해요.' },
      { topic: '만드는 것', a: '과자도 만들어요.', b: '소스도 만들어요.' },
    ],
    kidSummary: '농심은 라면을 잘 만들고, 오뚜기는 카레를 잘 만들어요.',
  };
}
