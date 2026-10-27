import { SYSTEM_RULES } from './systemRules';

// 추가 질문 대화에서는 "지금 화면에 보이는 분석 결과"를 시스템 지시문에 넣는다.
// 대화 기록(contents)에 넣지 않는 이유: 대화를 최근 10턴만 남기고 잘라 내도
// 분석 맥락은 사라지지 않게 하고, contents가 항상 user 메시지로 끝나도록
// 구조를 단순하게 유지하기 위해서다.
export function buildChatSystemPrompt(analysisSummary: string): string {
  return `${SYSTEM_RULES}

[지금 하고 있는 활동]
학생은 방금 아래 SWOT 분석 결과를 보았어. 학생의 추가 질문에 답해 줘.
${analysisSummary}

[답하는 방법]
- 3~5문장으로 짧게 답해.
- 분석 결과와 관련 있게 설명하고, 필요하면 "잘하는 점", "기회" 같은 칸 이름을 써.
- 회사가 생긴 해처럼 정확한 사실이 필요하면, 확실할 때만 말하고 아니면 어른과 함께 찾아보자고 해.
- 질문이 SWOT나 회사와 상관없거나 위험하면, 부드럽게 거절하고 회사 이야기로 돌아오자고 말해.`;
}
