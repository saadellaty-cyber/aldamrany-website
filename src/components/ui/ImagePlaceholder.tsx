import { cn } from '@/lib/utils';

/**
 * Neutral architectural stand-in used wherever a real photograph has not been
 * uploaded yet.
 *
 * Deliberately abstract: it must never be mistaken for a photograph of an
 * actual EL DAMARANY project.
 */
export function ImagePlaceholder({
  className,
  label,
  tone = 'light',
  showMark = true,
}: {
  className?: string;
  label?: string | null;
  tone?: 'light' | 'dark';
  /** Full-bleed heroes use texture only — the mark would sit behind headlines. */
  showMark?: boolean;
}) {
  const stroke = tone === 'dark' ? 'rgba(244,243,239,0.14)' : 'rgba(17,17,17,0.10)';
  // Pattern ids are global in the document; scope by tone so a dark placeholder
  // never reuses the light variant rendered earlier on the page.
  const patternId = `ed-hatch-${tone}`;

  return (
    <div
      aria-hidden="true"
      className={cn(
        'relative flex h-full w-full items-center justify-center overflow-hidden',
        tone === 'dark' ? 'bg-ink-soft' : 'bg-paper-soft',
        className,
      )}
    >
      <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <pattern id={patternId} width="14" height="14" patternUnits="userSpaceOnUse">
            <path d="M-2 12 L12 -2 M0 20 L20 0" stroke={stroke} strokeWidth="1" fill="none" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>

      {showMark ? (
        <div
          className={cn(
            'relative flex flex-col items-center gap-3 px-6 text-center',
            tone === 'dark' ? 'text-paper/45' : 'text-ink/35',
          )}
        >
          <span className="block h-px w-10 bg-current opacity-60" />
          <span className="eyebrow font-sans">EL DAMARANY</span>
          {label ? <span className="max-w-[22ch] text-xs leading-relaxed">{label}</span> : null}
        </div>
      ) : null}
    </div>
  );
}
