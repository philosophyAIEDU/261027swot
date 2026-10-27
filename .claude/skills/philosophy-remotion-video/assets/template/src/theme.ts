import { continueRender, delayRender, staticFile } from 'remotion';

// 폰트는 public/fonts에 파일로 넣어 두고 직접 불러온다(렌더할 때 인터넷 없이도 같은 모양).
// 제목: Jua(둥글고 친근한 느낌), 본문: Noto Sans KR. 둘 다 SIL Open Font License.
export const FONT_TITLE = 'Jua, "Noto Sans KR", sans-serif';
export const FONT_BODY = '"Noto Sans KR", sans-serif';

let loaded = false;
export function loadFonts(): void {
  if (loaded || typeof document === 'undefined') return;
  loaded = true;
  const handle = delayRender('폰트 불러오기');
  const faces = [
    new FontFace('Jua', `url(${staticFile('fonts/Jua-Regular.ttf')})`),
    new FontFace('Noto Sans KR', `url(${staticFile('fonts/NotoSansKR.ttf')})`, { weight: '100 900' }),
  ];
  Promise.all(faces.map((face) => face.load()))
    .then((ready) => {
      ready.forEach((face) => document.fonts.add(face));
      continueRender(handle);
    })
    .catch((error: unknown) => {
      console.error(error);
      continueRender(handle);
    });
}

// 파스텔 팔레트. 글자는 항상 진한 남보라(ink)로 써서 밝은 바탕 위에서도 또렷하게 보이게 한다.
export const COLORS = {
  ink: '#2B2645',
  inkSoft: '#5D5878',
  paper: '#FFFDFB',
  lavender: '#E7DEFF',
  sky: '#DCEBFF',
  mint: '#D7F5E8',
  peach: '#FFE3D6',
  pink: '#FFDDEB',
  butter: '#FFF2C4',
  shadow: 'rgba(91, 63, 209, 0.16)',
};
