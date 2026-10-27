import { SCOPE_LABELS } from './quadrantMeta';

export function ScopeLegend() {
  return (
    <ul aria-label="안과 밖 구분" className="flex flex-wrap gap-2 text-base">
      <li className={`rounded-full border-2 px-3 py-1 font-bold ${SCOPE_LABELS.inside.classes}`}>
        <span aria-hidden="true">{SCOPE_LABELS.inside.emoji} </span>
        안({SCOPE_LABELS.inside.detail}): S 💪, W 🩹
      </li>
      <li className={`rounded-full border-2 px-3 py-1 font-bold ${SCOPE_LABELS.outside.classes}`}>
        <span aria-hidden="true">{SCOPE_LABELS.outside.emoji} </span>
        밖({SCOPE_LABELS.outside.detail}): O 🌱, T ⚠️
      </li>
    </ul>
  );
}
