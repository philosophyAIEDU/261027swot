// 사진을 AI에게 보내기 전에 브라우저 안에서 손질한다.
//
// 왜 줄이는가: 휴대폰 사진은 수 MB라 그대로 보내면 느리고 사용량도 많이 든다.
//   가게 모습을 알아보는 데는 긴 변 1024px이면 충분하다.
// 왜 JPEG로 다시 그리는가: 캔버스에 다시 그려 저장하면 사진 파일 속 EXIF 정보
//   (찍은 위치 GPS, 기기 정보 등)가 모두 사라진다. 어린이가 찍은 사진의 위치가
//   밖으로 나가지 않게 하려는 것이다.

export const MAX_IMAGE_SIDE = 1024;
export const MAX_FILE_BYTES = 20 * 1024 * 1024;
const JPEG_QUALITY = 0.85;

export interface PreparedImage {
  base64: string;
  mimeType: 'image/jpeg';
  /** 미리보기용 data: 주소 */
  dataUrl: string;
}

export class ImagePrepareError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ImagePrepareError';
  }
}

/** 고를 수 없는 파일이면 아이 눈높이 안내를, 괜찮으면 null을 돌려준다. */
export function validateImageFile(file: File): string | null {
  if (!file.type.startsWith('image/')) return '사진 파일만 넣을 수 있어요 🖼️';
  if (file.size > MAX_FILE_BYTES) return '사진이 너무 커요. 20MB보다 작은 사진을 골라 주세요 📏';
  if (file.size === 0) return '빈 파일이에요. 다른 사진을 골라 주세요.';
  return null;
}

/** 가로세로 비율을 지키면서 긴 변이 maxSide를 넘지 않게 한다(키우지는 않는다). */
export function fitWithin(width: number, height: number, maxSide: number = MAX_IMAGE_SIDE): {
  width: number;
  height: number;
} {
  const longest = Math.max(width, height);
  if (longest <= maxSide) return { width, height };
  const scale = maxSide / longest;
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
}

async function decode(file: File): Promise<ImageBitmap> {
  try {
    // 사진의 회전 정보는 반영해서 바로 세운 뒤 그린다.
    return await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    throw new ImagePrepareError('이 사진은 열 수 없어요. JPG나 PNG 사진을 넣어 주세요.');
  }
}

export async function prepareImage(file: File): Promise<PreparedImage> {
  const problem = validateImageFile(file);
  if (problem) throw new ImagePrepareError(problem);

  const bitmap = await decode(file);
  const size = fitWithin(bitmap.width, bitmap.height);
  const canvas = document.createElement('canvas');
  canvas.width = size.width;
  canvas.height = size.height;
  const context = canvas.getContext('2d');
  if (!context) {
    bitmap.close();
    throw new ImagePrepareError('이 브라우저에서는 사진을 준비할 수 없어요.');
  }
  // 투명한 PNG도 JPEG에서 검게 나오지 않도록 흰 바탕을 먼저 칠한다.
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, size.width, size.height);
  context.drawImage(bitmap, 0, 0, size.width, size.height);
  bitmap.close();

  const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
  const base64 = dataUrl.slice(dataUrl.indexOf(',') + 1);
  if (!base64) throw new ImagePrepareError('사진을 준비하지 못했어요. 다른 사진을 골라 주세요.');
  return { base64, mimeType: 'image/jpeg', dataUrl };
}
