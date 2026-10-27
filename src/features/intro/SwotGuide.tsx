import type { ReactNode } from 'react';
import { SCOPE_LABELS } from '../analysis/quadrantMeta';

// SWOT 개념 설명은 AI 없이 보여 주는 고정 글이다.
// 이 글만 읽어도 "SWOT가 무엇인지, 어떻게 하는지, 좋은 점과 한계가 무엇인지" 알 수 있게 한다.
// 예시는 소개 카드와 같은 "학교 앞 떡볶이 가게"로 통일해, 아이가 한 장면으로 이어서 생각하게 한다.

export const GUIDE_ID = 'swot-guide';

interface GuideSectionProps {
  emoji: string;
  title: string;
  children: ReactNode;
}

function GuideSection({ emoji, title, children }: GuideSectionProps) {
  return (
    <section className="print-avoid-break flex flex-col gap-3">
      <h3 className="text-xl font-extrabold">
        <span aria-hidden="true">{emoji} </span>
        {title}
      </h3>
      {children}
    </section>
  );
}

const STEPS: string[] = [
  '알아볼 회사나 가게를 하나 정해요.',
  '먼저 안을 봐요. 잘하는 점 💪과 아쉬운 점 🩹을 써요.',
  '다음은 밖을 봐요. 기회 🌱와 조심할 점 ⚠️을 써요.',
  '4칸을 보며 "그럼 앞으로 어떻게 하면 좋을까?" 계획을 세워요.',
];

const PAIRS: { emojis: string; title: string; example: string }[] = [
  {
    emojis: '💪 + 🌱',
    title: '잘하는 점으로 기회 잡기',
    example: '떡볶이가 맛있으니, 새 아파트에 이사 온 가족에게 알려요.',
  },
  {
    emojis: '🩹 + 🌱',
    title: '기회로 아쉬운 점 채우기',
    example: '날씨가 추워지니, 어묵 메뉴를 더해 적은 메뉴를 늘려요.',
  },
  {
    emojis: '💪 + ⚠️',
    title: '잘하는 점으로 걱정 막기',
    example: '옆에 분식집이 생겨도, 학교 바로 앞이라는 점을 살려요.',
  },
  {
    emojis: '🩹 + ⚠️',
    title: '약점과 걱정이 만나지 않게 하기',
    example: '가게가 좁아서 손님을 놓칠 수 있으니, 포장 손님을 받아요.',
  },
];

const PROS: { title: string; detail: string }[] = [
  { title: '쉬워요', detail: '종이 한 장에 4칸만 그리면 누구나 할 수 있어요.' },
  { title: '한눈에 보여요', detail: '좋은 점과 걱정거리를 한 장에 모아 볼 수 있어요.' },
  {
    title: '안과 밖을 나눠 생각해요',
    detail: '우리가 바꿀 수 있는 것과 바꿀 수 없는 것을 구분하게 해 줘요.',
  },
  { title: '계획 세우기에 좋아요', detail: '칸끼리 짝지어 보면 "다음에 할 일"이 떠올라요.' },
  { title: '함께 이야기하기 좋아요', detail: '친구들과 생각을 나누고 서로 비교하기 쉬워요.' },
  { title: '어디에나 쓸 수 있어요', detail: '회사, 동네 가게, 학교 축제 부스 계획에도 쓸 수 있어요.' },
];

const CONS: { title: string; detail: string }[] = [
  {
    title: '정답이 하나가 아니에요',
    detail: '같은 회사라도 사람마다 다르게 쓸 수 있어요. 쓴 사람의 생각이 들어가요.',
  },
  {
    title: '칸을 헷갈리기 쉬워요',
    detail: '"날씨가 추워요"는 가게 안의 일이 아니라 밖의 일이에요. 안과 밖을 잘 나눠야 해요.',
  },
  {
    title: '무엇이 더 중요한지는 안 알려 줘요',
    detail: '4칸에 적힌 것들이 모두 똑같이 중요해 보여요. 어떤 일이 더 큰지는 따로 생각해야 해요.',
  },
  {
    title: '"지금"만 찍은 사진 같아요',
    detail: '세상은 계속 바뀌어요. 시간이 지나면 4칸을 다시 채워야 해요.',
  },
  {
    title: '정리일 뿐, 해결은 아니에요',
    detail: '4칸을 채운다고 문제가 저절로 풀리지 않아요. 계획을 세우고 실천해야 해요.',
  },
  {
    title: '정보가 틀리면 결과도 틀려요',
    detail: '잘못 알고 쓰면 분석도 틀려요. AI가 만든 내용도 그래서 어른과 함께 확인해요.',
  },
];

const QUIZ: { question: string; answer: string; reason: string }[] = [
  {
    question: '떡볶이 소스를 가게만의 비밀 방법으로 만들어요.',
    answer: '안 🏠 · 잘하는 점 💪',
    reason: '가게가 스스로 해낸 좋은 일이에요.',
  },
  {
    question: '요즘 매운 음식이 유행이에요.',
    answer: '밖 🌍 · 기회 🌱',
    reason: '유행은 가게가 정할 수 없지만, 가게에 좋은 일이에요.',
  },
  {
    question: '사장님 혼자 일해서 손님이 많으면 오래 기다려요.',
    answer: '안 🏠 · 아쉬운 점 🩹',
    reason: '가게 안의 일이고, 가게가 바꿀 수 있는 부족한 점이에요.',
  },
  {
    question: '비가 많이 오는 날에는 학생들이 바로 집에 가요.',
    answer: '밖 🌍 · 조심할 점 ⚠️',
    reason: '날씨는 가게가 바꿀 수 없고, 손님이 줄 수 있는 걱정거리예요.',
  },
];

export function SwotGuide() {
  const inside = SCOPE_LABELS.inside;
  const outside = SCOPE_LABELS.outside;

  return (
    <section
      id={GUIDE_ID}
      aria-labelledby="guide-title"
      tabIndex={-1}
      className="flex flex-col gap-6 rounded-3xl border-2 border-line bg-surface p-5 sm:p-6"
    >
      <div className="flex flex-col gap-2">
        <h2 id="guide-title" className="text-2xl font-extrabold">
          <span aria-hidden="true">📚 </span>SWOT 쉽게 알아보기
        </h2>
        <p>
          SWOT 분석은 회사나 가게가 <strong>지금 어떤 상태인지</strong> 한눈에 정리하는 방법이에요.
        </p>
        <p>
          병원에서 건강검진을 받으면 튼튼한 곳과 조심할 곳을 알 수 있지요? SWOT는 회사의{' '}
          <strong>건강검진표</strong> 같은 거예요.
        </p>
        <p>
          회사뿐 아니라 동네 가게, 학교 축제 부스 같은 계획에도 쓸 수 있어요. 큰 회사의 어른들도 실제로 쓰는
          방법이에요.
        </p>
      </div>

      <GuideSection emoji="❓" title="4칸은 두 가지 질문으로 나뉘어요">
        <ol className="ml-6 list-decimal">
          <li>
            <strong>회사 안의 일인가요, 밖의 일인가요?</strong>
            <ul className="ml-5 list-disc">
              <li>
                <span className="font-bold text-inside">
                  <span aria-hidden="true">{inside.emoji} </span>안
                </span>
                : 회사가 스스로 바꿀 수 있는 것이에요. 예: 맛, 가게 크기, 일하는 사람
              </li>
              <li>
                <span className="font-bold text-outside">
                  <span aria-hidden="true">{outside.emoji} </span>밖
                </span>
                : 회사가 마음대로 못 바꾸는 것이에요. 예: 날씨, 유행, 옆 가게
              </li>
            </ul>
          </li>
          <li>
            <strong>좋은 일인가요, 걱정되는 일인가요?</strong>
          </li>
        </ol>
        <p>두 질문을 합치면 4칸이 돼요.</p>
        <table className="w-full table-fixed border-collapse text-center">
          <caption className="sr-only">안과 밖, 좋은 일과 걱정되는 일로 나눈 SWOT 4칸</caption>
          <thead>
            <tr>
              <td className="w-1/4 p-1" />
              <th scope="col" className="p-2">
                <span aria-hidden="true">😊 </span>좋은 일
              </th>
              <th scope="col" className="p-2">
                <span aria-hidden="true">😟 </span>걱정되는 일
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row" className="p-2 text-inside">
                <span aria-hidden="true">{inside.emoji} </span>안
              </th>
              <td className="rounded-2xl border-4 border-s-line bg-s-bg p-2 font-bold text-s-ink">
                <span aria-hidden="true">💪 </span>S 잘하는 점
              </td>
              <td className="rounded-2xl border-4 border-w-line bg-w-bg p-2 font-bold text-w-ink">
                <span aria-hidden="true">🩹 </span>W 아쉬운 점
              </td>
            </tr>
            <tr>
              <th scope="row" className="p-2 text-outside">
                <span aria-hidden="true">{outside.emoji} </span>밖
              </th>
              <td className="rounded-2xl border-4 border-o-line bg-o-bg p-2 font-bold text-o-ink">
                <span aria-hidden="true">🌱 </span>O 기회
              </td>
              <td className="rounded-2xl border-4 border-t-line bg-t-bg p-2 font-bold text-t-ink">
                <span aria-hidden="true">⚠️ </span>T 조심할 점
              </td>
            </tr>
          </tbody>
        </table>
      </GuideSection>

      <GuideSection emoji="🪜" title="SWOT 분석은 이렇게 해요">
        <ol className="ml-6 list-decimal">
          {STEPS.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <p className="font-bold">한 걸음 더: 칸끼리 짝지어 계획 세우기</p>
        <p>4칸을 다 채웠다면, 두 칸씩 짝지어 &quot;그럼 뭘 하면 좋을까?&quot;를 생각해 봐요.</p>
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {PAIRS.map((pair) => (
            <li key={pair.title} className="rounded-2xl border-2 border-line bg-brand-soft p-3">
              <span className="block font-bold">
                <span aria-hidden="true">{pair.emojis} </span>
                {pair.title}
              </span>
              <span aria-hidden="true">👉 </span>
              {pair.example}
            </li>
          ))}
        </ul>
      </GuideSection>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <GuideSection emoji="👍" title="SWOT 분석의 장점">
          <ul className="flex flex-col gap-2">
            {PROS.map((item) => (
              <li key={item.title} className="rounded-2xl border-2 border-o-line bg-o-bg p-3 text-o-ink">
                <span className="block font-bold">
                  <span aria-hidden="true">✅ </span>
                  {item.title}
                </span>
                {item.detail}
              </li>
            ))}
          </ul>
        </GuideSection>

        <GuideSection emoji="👎" title="SWOT 분석의 단점">
          <ul className="flex flex-col gap-2">
            {CONS.map((item) => (
              <li key={item.title} className="rounded-2xl border-2 border-t-line bg-t-bg p-3 text-t-ink">
                <span className="block font-bold">
                  <span aria-hidden="true">⚡ </span>
                  {item.title}
                </span>
                {item.detail}
              </li>
            ))}
          </ul>
        </GuideSection>
      </div>

      <GuideSection emoji="🧩" title="퀴즈: 안일까, 밖일까?">
        <p>떡볶이 가게 이야기예요. 어느 칸에 들어갈지 생각한 다음, 눌러서 정답을 확인해 봐요.</p>
        <ul className="flex flex-col gap-2">
          {QUIZ.map((item) => (
            <li key={item.question}>
              <details className="rounded-2xl border-2 border-line p-3">
                <summary className="min-h-12 cursor-pointer py-2 font-bold">{item.question}</summary>
                <p>
                  <strong>정답: {item.answer}</strong>
                </p>
                <p>{item.reason}</p>
              </details>
            </li>
          ))}
        </ul>
      </GuideSection>

      <p className="rounded-2xl bg-brand-soft p-4 text-lg font-bold">
        <span aria-hidden="true">📝 </span>한 줄 정리: SWOT는 안(💪 🩹)과 밖(🌱 ⚠️)을 나눠 보는 회사의 건강검진표예요.
        쉽고 한눈에 보이지만, 정답이 아니라 생각을 정리하는 도구예요.
      </p>
    </section>
  );
}
