import { SWOT_GUIDE, SWOT_ITEM_RULES } from './swotPrompt';
import { wrapUserInput } from './systemRules';

// 두 회사를 따로 두 번 부르지 않고 한 번에 분석하는 이유:
// 비슷한 점·다른 점을 고르려면 모델이 두 회사를 동시에 보고 있어야 하고,
// 호출 횟수도 줄어 무료 사용량을 아낄 수 있다.
// "누가 더 좋다"는 판단을 막는 문장을 꼭 넣어, 우열·투자 판단으로 흐르지 않게 한다.
export function buildComparePrompt(a: string, b: string): string {
  return `두 회사(또는 가게)를 초등학생 눈높이로 각각 SWOT 분석하고, 서로 비교해 줘.

회사 A: ${wrapUserInput(a)}
회사 B: ${wrapUserInput(b)}

${SWOT_GUIDE}

${SWOT_ITEM_RULES}
- a에는 회사 A의 분석, b에는 회사 B의 분석을 넣어.

비교 규칙:
- sameThings: 두 회사가 비슷한 점 2~3개, 각각 한 문장.
- differentThings: 다른 점 2~4개. topic은 "무엇을 만드나요?"처럼 짧은 주제, a와 b는 각 회사 이야기 한 문장.
- kidSummary: "○○는 ~을 잘하고, △△는 ~을 잘해요." 형식으로 한두 문장.
- 어느 회사가 더 좋다, 더 낫다, 사야 한다는 말은 절대 하지 마. 서로 다를 뿐이라고 설명해.`;
}
