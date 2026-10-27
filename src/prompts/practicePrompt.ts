import { SWOT_GUIDE } from './swotPrompt';
import { wrapUserInput } from './systemRules';
import type { PracticeInput } from '../types';

// "내가 직접 채워 보기": 정답을 대신 써 주지 않고, 칭찬 + 힌트 하나만 준다.
// 아이가 스스로 생각을 넓히게 하려는 교육적 의도다.
export function buildPracticePrompt(input: PracticeInput): string {
  return `학생이 직접 SWOT 4칸을 채웠어. 선생님처럼 피드백해 줘.

회사 이름: ${wrapUserInput(input.company)}
잘하는 점: ${wrapUserInput(input.strengths)}
아쉬운 점: ${wrapUserInput(input.weaknesses)}
기회: ${wrapUserInput(input.opportunities)}
조심할 점: ${wrapUserInput(input.threats)}

${SWOT_GUIDE}

피드백 규칙:
- praise: 학생이 잘 쓴 부분을 구체적으로 칭찬해. 2문장 이내.
- hint: 더 좋아지게 할 힌트를 딱 하나만, 질문 형태로 줘. 정답을 대신 써 주지 마.
- 안과 밖을 헷갈렸다면 그 점을 힌트로 알려 줘.
- 빈 칸이 있으면 그 칸을 채워 보라고 힌트를 줘.`;
}
