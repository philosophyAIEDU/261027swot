import { describe, expect, it } from 'vitest';
import { fitWithin, MAX_FILE_BYTES, validateImageFile } from './prepareImage';

function fakeFile(type: string, size: number): File {
  const file = new File(['x'], 'photo', { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
}

describe('fitWithin', () => {
  it('긴 변이 1024px를 넘으면 비율을 지키며 줄인다', () => {
    expect(fitWithin(4032, 3024)).toEqual({ width: 1024, height: 768 });
    expect(fitWithin(3024, 4032)).toEqual({ width: 768, height: 1024 });
  });

  it('작은 사진은 키우지 않는다', () => {
    expect(fitWithin(800, 600)).toEqual({ width: 800, height: 600 });
  });
});

describe('validateImageFile', () => {
  it('사진 파일은 통과한다', () => {
    expect(validateImageFile(fakeFile('image/jpeg', 1000))).toBeNull();
  });

  it('사진이 아니거나, 너무 크거나, 비어 있으면 안내한다', () => {
    expect(validateImageFile(fakeFile('application/pdf', 1000))).toMatch(/사진 파일만/);
    expect(validateImageFile(fakeFile('image/png', MAX_FILE_BYTES + 1))).toMatch(/너무 커요/);
    expect(validateImageFile(fakeFile('image/png', 0))).toMatch(/빈 파일/);
  });
});
