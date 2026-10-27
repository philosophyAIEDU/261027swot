interface LoadingBuddyProps {
  message?: string;
}

export function LoadingBuddy({ message = '생각하는 중이에요… 🤔' }: LoadingBuddyProps) {
  return (
    <div role="status" aria-live="polite" className="flex flex-col items-center gap-3 rounded-3xl bg-surface p-6 text-center">
      <div aria-hidden="true" className="flex gap-2 text-5xl">
        <span className="inline-block animate-wiggle">🤖</span>
        <span className="inline-block animate-bounce [animation-delay:0.15s]">💭</span>
      </div>
      <p className="text-lg font-bold">{message}</p>
    </div>
  );
}
