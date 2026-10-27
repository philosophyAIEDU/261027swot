import { wrapUserInput } from './systemRules';

// SWOT 4칸의 "쉬운 이름"을 프롬프트에도 그대로 넣는다.
// 화면에 보이는 이름(잘하는 점·아쉬운 점·기회·조심할 점)과 AI가 생각하는 기준이
// 같아야, 아이가 칸 이름과 내용을 연결해서 이해할 수 있기 때문이다.
export const SWOT_GUIDE = `SWOT 4칸의 뜻:
- strengths(잘하는 점): 회사 안에서 이미 잘하고 있는 것
- weaknesses(아쉬운 점): 회사 안에서 아직 부족한 것
- opportunities(기회): 회사 밖, 바깥 세상에서 찾아온 좋은 일
- threats(조심할 점): 회사 밖, 바깥 세상에서 찾아올 수 있는 걱정거리
안(strengths, weaknesses)과 밖(opportunities, threats)을 헷갈리지 마.`;

export const SWOT_ITEM_RULES = `작성 규칙:
- 각 칸에 2~3개씩 써.
- point는 한 문장, example은 아이가 떠올릴 수 있는 생활 속 예시 한 문장이야.
- oneLineIntro는 "○○는 ~을 만드는 회사예요."처럼 한 문장으로 써.
- summary는 전체를 한 줄로 정리해.
- hardWords에는 어쩔 수 없이 쓴 어려운 낱말만 최대 3개 넣고 쉽게 풀어 줘. 없으면 빈 목록이야.
- 정확한 숫자나 연도는 쓰지 마. 확실하지 않으면 "정확한 건 어른과 함께 찾아보세요"라고 써.`;

export function buildSwotPrompt(company: string): string {
  return `아래 회사(또는 가게)를 초등학생 눈높이로 SWOT 분석해 줘.

회사 이름: ${wrapUserInput(company)}

${SWOT_GUIDE}

${SWOT_ITEM_RULES}
- company에는 회사 이름을 그대로 써.
- 잘 모르는 회사나 동네 가게라면, 그런 가게가 흔히 가진 특징으로 일반적인 분석을 해 줘.`;
}
