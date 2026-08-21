import { TopicPatternArt } from '@/components/ui/TopicPatternArt';
import { cn } from '@/lib/utils';

/**
 * Topical stand-in artwork for content that has no photograph yet.
 *
 * These are drawn, not photographed, on purpose: a stock construction photo
 * would sit on the page looking like a picture of an EL DAMARANY project when
 * it is nothing of the kind. Each pattern nods at its subject — lane markings
 * for roads, aggregate for asphalt, a hatched shield for safety — so the block
 * reads as designed rather than unfinished, and is replaced the moment a real
 * photograph is uploaded.
 */
export type TopicPatternName =
  | 'roads'
  | 'asphalt'
  | 'infrastructure'
  | 'concrete'
  | 'contracting'
  | 'quality'
  | 'safety'
  | 'risk'
  | 'generic';

/** Maps a content slug to the closest pattern. */
export function patternForSlug(slug: string | null | undefined): TopicPatternName {
  if (!slug) return 'generic';

  const table: Record<string, TopicPatternName> = {
    'roads-paving': 'roads',
    roads: 'roads',
    paving: 'roads',
    'asphalt-works': 'asphalt',
    asphalt: 'asphalt',
    infrastructure: 'infrastructure',
    tunnels: 'infrastructure',
    bridges: 'infrastructure',
    'oil-gas': 'infrastructure',
    'concrete-works': 'concrete',
    concrete: 'concrete',
    industrial: 'concrete',
    facilities: 'concrete',
    educational: 'concrete',
    contracting: 'contracting',
    'project-execution': 'contracting',
    quality: 'quality',
    materials: 'quality',
    accuracy: 'quality',
    supervision: 'quality',
    'technical-specifications': 'quality',
    safety: 'safety',
    'occupational-health': 'safety',
    ppe: 'safety',
    'site-safety': 'safety',
    'equipment-movement': 'safety',
    'vehicle-movement': 'safety',
  };

  return table[slug] ?? 'generic';
}

/** The repeating texture behind the line art, chosen per subject. */
function backgroundFor(name: TopicPatternName): 'grid' | 'aggregate' | 'rebar' | 'hazard' {
  if (name === 'asphalt') return 'aggregate';
  if (name === 'concrete') return 'rebar';
  if (name === 'safety') return 'hazard';
  return 'grid';
}

export function TopicPattern({
  name,
  className,
  label,
}: {
  name: TopicPatternName;
  className?: string;
  /** Optional caption drawn at the foot of the artwork. */
  label?: string | null;
}) {
  // Pattern ids are document-global, so scope them to the variant being drawn.
  const id = `topic-${name}`;
  const background = backgroundFor(name);

  return (
    <div
      aria-hidden="true"
      className={cn('relative h-full w-full overflow-hidden bg-ink-soft', className)}
    >
      {/* Texture: tiles in screen pixels, so no viewBox. */}
      <svg className="absolute inset-0 h-full w-full">
        <defs>
          <pattern id={`${id}-grid`} width="28" height="28" patternUnits="userSpaceOnUse">
            <path d="M28 0 L0 0 0 28" fill="none" stroke="rgba(244,243,239,0.07)" strokeWidth="1" />
          </pattern>
          <pattern id={`${id}-aggregate`} width="18" height="18" patternUnits="userSpaceOnUse">
            <circle cx="4" cy="5" r="1.4" fill="rgba(244,243,239,0.13)" />
            <circle cx="13" cy="11" r="1.1" fill="rgba(244,243,239,0.1)" />
            <circle cx="8" cy="15" r="0.9" fill="rgba(244,243,239,0.12)" />
          </pattern>
          <pattern id={`${id}-rebar`} width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M0 12 H24 M12 0 V24" stroke="rgba(244,243,239,0.08)" strokeWidth="1" />
          </pattern>
          <pattern
            id={`${id}-hazard`}
            width="22"
            height="22"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <rect width="11" height="22" fill="rgba(212,175,55,0.06)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${id}-${background})`} />
      </svg>

      {/* Line art: proportional, so it gets its own coordinate space. */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <TopicPatternArt name={name} />
      </svg>

      {label ? (
        <div className="absolute inset-x-0 bottom-0 p-4">
          <span className="eyebrow text-paper/40">{label}</span>
        </div>
      ) : null}
    </div>
  );
}
