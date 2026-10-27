import { SWOT_GUIDE, SWOT_ITEM_RULES } from './swotPrompt';
import { wrapUserInput } from './systemRules';

// 사진 한 장으로는 가게 "안"(잘하는 점·아쉬운 점)의 단서는 보여도,
// "밖"(기회·조심할 점)은 거의 보이지 않는다. 그래서 각 항목마다 근거(source)를 적게 해,
// 사진에서 본 것과 짐작한 것을 아이가 구분해서 읽게 한다. 근거와 추측을 나누는 연습이기도 하다.
//
// 사진에는 사람 얼굴, 차 번호판, 전화번호 같은 개인 정보가 찍힐 수 있다.
// 어린이 앱이므로 이런 정보는 읽거나 묘사하지 않도록 명시한다.
export function buildPhotoPrompt(storeName: string, note: string): string {
  const name = storeName.trim();
  const memo = note.trim();
  return `학생이 가게 사진을 한 장 보냈어. 사진을 보고 이 가게를 초등학생 눈높이로 SWOT 분석해 줘.

${name ? `가게 이름(학생이 쓴 것): ${wrapUserInput(name)}` : '가게 이름: 학생이 쓰지 않았어.'}
${memo ? `학생 메모: ${wrapUserInput(memo)}` : '학생 메모: 없어.'}

먼저 확인해:
- 가게, 식당, 카페, 시장 가게처럼 물건이나 음식을 파는 곳의 사진이면 isStore는 true야.
- 사람만 찍힌 사진, 동물, 풍경, 숙제 사진처럼 가게가 아니면 isStore는 false야. reason에 이유를 한 문장으로 쓰고 나머지 칸은 비워 둬.

${SWOT_GUIDE}

${SWOT_ITEM_RULES}

사진 분석 규칙:
- company: 가게 이름을 학생이 썼으면 그대로 써. 안 썼으면 간판에 보이는 가게 이름을 쓰고, 그것도 없으면 "사진 속 분식집"처럼 써.
- oneLineIntro: "○○는 ~을 파는 가게예요." 한 문장.
- photoClues: 사진에서 직접 보이는 것 2~5개를 짧게 써. 예: "메뉴판에 그림이 있어요", "의자가 네 개 보여요".
- 각 항목의 source: 사진에서 직접 보이는 것이 근거면 "photo", 사진에 없어서 짐작했으면 "guess".
- 기회와 조심할 점은 보통 사진에 안 보이니 대부분 "guess"일 거야. 짐작인 항목은 "~일 수도 있어요"처럼 부드럽게 써.
- 학생 메모에 있는 내용(위치, 주변 모습 등)은 짐작할 때 참고해.
- 사진 속 사람의 얼굴, 옷차림, 나이, 생김새는 절대 말하지 마.
- 전화번호, 차 번호판, 주소처럼 개인 정보로 보이는 글자는 읽지도 쓰지도 마.
- 가게가 지저분하다거나 별로라고 깎아내리지 말고, 아쉬운 점도 부드럽게 써.`;
}
