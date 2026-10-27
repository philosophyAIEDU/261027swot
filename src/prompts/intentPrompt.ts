import { wrapUserInput } from './systemRules';

// 1단계: 학생이 쓴 문장에서 "몇 개의 회사를 알고 싶은지"만 뽑는다.
// 분석까지 한 번에 시키지 않는 이유: 회사가 3개 이상이거나 실제 사람일 때
// 아이에게 먼저 되묻고, 쓸데없이 긴 분석 호출을 하지 않기 위해서다.
export function buildIntentPrompt(input: string): string {
  return `학생이 아래처럼 썼어. 학생이 SWOT 분석을 하고 싶은 회사나 가게를 찾아 줘.

${wrapUserInput(input)}

규칙:
- 회사·가게·브랜드 이름이 1개면 mode는 "single"이야.
- 2개면 mode는 "compare"야. 예: "농심이랑 오뚜기 비교해 줘".
- 3개 이상이면 mode는 "unclear", kind는 "tooMany"야. companies에 이름을 모두 넣어.
- 친구, 선생님, 가족, 연예인, 운동선수처럼 실제 사람을 분석해 달라고 하면 mode는 "unclear", kind는 "person"이야. companies는 빈 목록으로 둬.
- 회사가 아닌 것(동물, 음식 이름, 숙제 질문 등)이면 mode는 "unclear", kind는 "notCompany"야.
- 무슨 뜻인지 모르겠으면 mode는 "unclear", kind는 "unknown"이야.
- companies에는 회사 이름만 깔끔하게 넣어. 예: "삼성전자랑" → "삼성전자".
- reason에는 왜 그렇게 판단했는지 초등학생이 이해할 짧은 한 문장을 써.`;
}
