import { useId, useState, type ChangeEvent, type FormEvent } from 'react';
import { Button } from '../../components/Button';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import type { PhotoInput } from '../../types';
import { ImagePrepareError, prepareImage, type PreparedImage } from './prepareImage';

interface PhotoUploadProps {
  disabled: boolean;
  onSubmit: (photo: PhotoInput) => void;
  /** 테스트에서 캔버스 없이 돌리기 위해 바꿔 끼울 수 있다. */
  prepare?: (file: File) => Promise<PreparedImage>;
}

const MAX_NAME_LENGTH = 50;
const MAX_NOTE_LENGTH = 200;

const pickerLabelClass =
  'inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 px-4 py-2 text-base font-bold ' +
  'peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-[3px] peer-focus-visible:outline-solid peer-focus-visible:outline-focus ' +
  'peer-disabled:cursor-not-allowed peer-disabled:opacity-60';

export function PhotoUpload({ disabled, onSubmit, prepare = prepareImage }: PhotoUploadProps) {
  const [image, setImage] = useState<PreparedImage | null>(null);
  const [preparing, setPreparing] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [storeName, setStoreName] = useState('');
  const [note, setNote] = useState('');
  const isTouchDevice = useMediaQuery('(pointer: coarse)');
  const baseId = useId();

  const busy = disabled || preparing;

  const onFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // 같은 사진을 다시 골라도 change가 일어나도록 비워 둔다.
    event.target.value = '';
    if (!file) return;
    setPreparing(true);
    setFileError(null);
    try {
      setImage(await prepare(file));
    } catch (error) {
      setImage(null);
      setFileError(error instanceof ImagePrepareError ? error.message : '사진을 준비하지 못했어요. 다른 사진을 골라 주세요.');
    } finally {
      setPreparing(false);
    }
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!image || busy) return;
    onSubmit({ imageBase64: image.base64, mimeType: image.mimeType, storeName, note });
  };

  return (
    <section aria-labelledby={`${baseId}-title`} className="flex flex-col gap-4 rounded-3xl border-2 border-brand bg-surface p-5 sm:p-6 print:hidden">
      <h2 id={`${baseId}-title`} className="text-2xl font-extrabold">
        <span aria-hidden="true">📷 </span>가게 사진으로 알아보기
      </h2>
      <p>
        가게 사진을 한 장 넣으면 AI가 사진을 보고 SWOT 4칸을 채워 줘요. 사진에서 <strong>직접 본 것</strong>과{' '}
        <strong>짐작한 것</strong>을 나눠서 알려 줘요.
      </p>

      <div className="rounded-2xl bg-notice-bg p-4 text-notice-ink">
        <p className="font-bold">
          <span aria-hidden="true">⚠️ </span>사진 찍을 때 약속해요
        </p>
        <ul className="ml-5 list-disc">
          <li>사람 얼굴이 나오지 않게 가게 모습만 찍어요.</li>
          <li>차 번호판이나 전화번호 같은 글자는 나오지 않게 해요.</li>
          <li>가게 안을 찍을 때는 먼저 사장님께 여쭤봐요.</li>
          <li>사진은 저장하지 않아요. 분석할 때만 AI에게 보내고, 사진 속 위치 정보는 지우고 보내요.</li>
        </ul>
      </div>

      <form onSubmit={submit} className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          <div>
            <input
              id={`${baseId}-file`}
              type="file"
              accept="image/*"
              onChange={onFileChange}
              disabled={busy}
              className="peer sr-only"
            />
            <label htmlFor={`${baseId}-file`} className={`${pickerLabelClass} border-brand bg-brand text-brand-ink`}>
              <span aria-hidden="true">🖼️</span> {image ? '다른 사진 고르기' : '사진 고르기'}
            </label>
          </div>
          {isTouchDevice && (
            <div>
              <input
                id={`${baseId}-camera`}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={onFileChange}
                disabled={busy}
                className="peer sr-only"
              />
              <label htmlFor={`${baseId}-camera`} className={`${pickerLabelClass} border-line bg-surface text-ink`}>
                <span aria-hidden="true">📸</span> 카메라로 찍기
              </label>
            </div>
          )}
        </div>

        <div aria-live="polite">
          {preparing && <p className="font-bold">사진을 준비하는 중이에요… 🖼️</p>}
          {fileError && (
            <p role="alert" className="rounded-2xl bg-danger-bg p-3 font-bold text-danger-ink">
              {fileError}
            </p>
          )}
          {image && !preparing && (
            <img
              src={image.dataUrl}
              alt="고른 가게 사진 미리보기"
              className="max-h-80 w-auto max-w-full rounded-2xl border-2 border-line object-contain"
            />
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label htmlFor={`${baseId}-name`} className="font-bold">
              가게 이름 <span className="font-normal text-ink-soft">(몰라도 괜찮아요)</span>
            </label>
            <input
              id={`${baseId}-name`}
              value={storeName}
              onChange={(event) => setStoreName(event.target.value)}
              maxLength={MAX_NAME_LENGTH}
              placeholder="예: 행복 떡볶이"
              className="min-h-12 w-full min-w-0 rounded-2xl border-2 border-line bg-surface px-4 text-lg placeholder:text-ink-soft"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor={`${baseId}-note`} className="font-bold">
              가게 주변 메모 <span className="font-normal text-ink-soft">(쓰면 더 정확해져요)</span>
            </label>
            <input
              id={`${baseId}-note`}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              maxLength={MAX_NOTE_LENGTH}
              placeholder="예: 학교 앞이고, 근처에 공원이 있어요"
              className="min-h-12 w-full min-w-0 rounded-2xl border-2 border-line bg-surface px-4 text-lg placeholder:text-ink-soft"
            />
          </div>
        </div>

        <Button type="submit" disabled={!image || busy} className="self-start">
          사진으로 SWOT 알아보기 🔍
        </Button>
      </form>
    </section>
  );
}
