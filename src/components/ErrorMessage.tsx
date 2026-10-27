import type { FriendlyError } from '../types';
import { Button } from './Button';

interface ErrorMessageProps {
  error: FriendlyError;
  onRetry?: () => void;
  onGoToKeySetup?: () => void;
}

export function ErrorMessage({ error, onRetry, onGoToKeySetup }: ErrorMessageProps) {
  return (
    <div role="alert" className="flex flex-col gap-3 rounded-3xl border-2 border-danger-ink/40 bg-danger-bg p-5 text-danger-ink">
      <p className="text-lg font-bold">{error.message}</p>
      <div className="flex flex-wrap gap-2">
        {error.kind === 'badKey' && onGoToKeySetup && (
          <Button onClick={onGoToKeySetup}>🔑 키 설정 화면으로 가기</Button>
        )}
        {/* 가게 사진이 아니라는 오류는 같은 사진으로 다시 해 봐야 소용없으므로 다시 시도 버튼을 숨긴다. */}
        {error.kind !== 'badKey' && error.kind !== 'notStore' && onRetry && (
          <Button variant="secondary" onClick={onRetry}>
            🔄 다시 시도
          </Button>
        )}
      </div>
    </div>
  );
}
