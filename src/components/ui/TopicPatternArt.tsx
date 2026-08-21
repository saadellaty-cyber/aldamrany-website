import type { TopicPatternName } from '@/components/ui/TopicPattern';

/**
 * Line art for each subject, drawn in a fixed 0–100 by 0–100 space.
 *
 * Kept separate from the tiled background because the two need different
 * coordinate systems: the tiles repeat in screen pixels, while these shapes
 * are proportional. Percentages are valid in x/y attributes but never inside a
 * path's `d`, so everything here is plain numbers.
 */
const LINE = 'rgba(244,243,239,0.16)';
const LINE_STRONG = 'rgba(244,243,239,0.3)';
const YELLOW = 'rgba(255,216,1,0.34)';

export function TopicPatternArt({ name }: { name: TopicPatternName }) {
  switch (name) {
    case 'roads':
      return (
        <>
          {/* Lane edges converging towards a horizon. */}
          <g stroke={LINE_STRONG} strokeWidth="1.2" strokeLinecap="round">
            <path d="M 8 100 L 42 22" />
            <path d="M 92 100 L 58 22" />
          </g>
          <path
            d="M 50 100 L 50 24"
            stroke={YELLOW}
            strokeWidth="2"
            strokeDasharray="7 9"
            strokeLinecap="round"
          />
        </>
      );

    case 'asphalt':
      return (
        <>
          {/* Layers being laid, one over another. */}
          <g stroke={LINE_STRONG} strokeWidth="1">
            <path d="M 0 60 L 100 56" />
            <path d="M 0 72 L 100 68" />
          </g>
          <path d="M 0 72 L 100 68 L 100 100 L 0 100 Z" fill="rgba(0,0,0,0.2)" />
          <path d="M 0 84 L 100 80" stroke={YELLOW} strokeWidth="1.5" />
        </>
      );

    case 'infrastructure':
      return (
        <>
          {/* A span carried on piers. */}
          <g stroke={LINE_STRONG} strokeWidth="1.4" fill="none">
            <path d="M 6 46 Q 50 18 94 46" />
            <path d="M 6 46 L 94 46" />
          </g>
          <g stroke={LINE} strokeWidth="1">
            <path d="M 26 46 L 26 82" />
            <path d="M 50 46 L 50 82" />
            <path d="M 74 46 L 74 82" />
          </g>
          <path d="M 0 82 L 100 82" stroke={YELLOW} strokeWidth="1.5" />
        </>
      );

    case 'concrete':
      return (
        <>
          {/* Formwork with reinforcement running through it. */}
          <g stroke={LINE_STRONG} strokeWidth="1.2" fill="none">
            <path d="M 18 26 L 82 26 L 82 74 L 18 74 Z" />
            <path d="M 18 50 L 82 50" />
            <path d="M 50 26 L 50 74" />
          </g>
          <path d="M 18 74 L 82 74" stroke={YELLOW} strokeWidth="1.6" />
        </>
      );

    case 'contracting':
      return (
        <>
          {/* A plan view: two plots and the route between them. */}
          <g stroke={LINE_STRONG} strokeWidth="1.2" fill="none">
            <path d="M 12 24 L 42 24 L 42 50 L 12 50 Z" />
            <path d="M 56 46 L 86 46 L 86 76 L 56 76 Z" />
          </g>
          <path
            d="M 42 37 L 50 37 L 50 61 L 56 61"
            stroke={YELLOW}
            strokeWidth="1.6"
            fill="none"
            strokeLinecap="round"
          />
        </>
      );

    case 'quality':
      return (
        <>
          {/* A measuring scale, and a checked datum above it. */}
          <g stroke={LINE_STRONG} strokeWidth="1.2">
            <path d="M 16 70 L 84 70" />
            <path d="M 24 70 L 24 62" />
            <path d="M 36 70 L 36 62" />
            <path d="M 48 70 L 48 62" />
            <path d="M 60 70 L 60 62" />
            <path d="M 72 70 L 72 62" />
          </g>
          <path
            d="M 42 38 L 48 45 L 60 31"
            stroke={YELLOW}
            strokeWidth="2.4"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      );

    case 'safety':
      return (
        <>
          {/* A shield, as used on site signage. */}
          <path
            d="M 50 22 L 68 31 L 68 55 Q 68 71 50 80 Q 32 71 32 55 L 32 31 Z"
            stroke={YELLOW}
            strokeWidth="1.6"
            fill="rgba(212,175,55,0.07)"
          />
          <path
            d="M 43 51 L 48 57 L 58 44"
            stroke={YELLOW}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      );

    case 'risk':
      return (
        <>
          {/* Identify, assess, respond, monitor — a connected sequence. */}
          <path d="M 16 50 L 84 50" stroke={LINE_STRONG} strokeWidth="1.2" />
          {[22, 40, 60, 78].map((x, index) => (
            <circle
              key={x}
              cx={x}
              cy="50"
              r="5"
              fill={index === 3 ? 'rgba(212,175,55,0.25)' : 'rgba(244,243,239,0.08)'}
              stroke={index === 3 ? YELLOW : LINE_STRONG}
              strokeWidth="1.2"
            />
          ))}
        </>
      );

    default:
      return null;
  }
}
