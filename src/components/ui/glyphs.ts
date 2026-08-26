import { createLucideIcon } from 'lucide-react';

/**
 * Icons drawn for this site, for marks the icon library does not carry.
 *
 * Built with `createLucideIcon` rather than hand-written SVG so they inherit
 * the library's rendering contract — the 24x24 viewBox and `currentColor` —
 * which is what lets them take the site's gold from a `text-gold` class and
 * follow it through the day and night themes without knowing either exists.
 */

/**
 * A tracked excavator, traced from the mark the client supplied.
 *
 * Solid rather than outlined, unlike the rest of the set, because the supplied
 * mark is solid and that shape was asked for. It carries no colour of its own:
 * every part is `currentColor`, and the cab glass and the six rollers are holes
 * punched with `evenodd` rather than painted light, so whatever the icon sits
 * on shows through them in either theme.
 *
 * Every part of the reference is here at its own proportions — the trapezoid
 * cab and its glass, the bar beneath it, the track frame and its six rollers,
 * the boom, the arm and the bucket. What is not the reference's is the pose:
 * the mark is a logo, two and a third times wider than it is tall, and laid out
 * that way inside a square icon box it shrinks to a band across the middle and
 * loses the rollers and the glass at the size this actually renders. The boom
 * is raised so the machine stands up and fills the box instead.
 *
 * The boom is stroked rather than filled — the reference has a blunt heel, a
 * rounded apex and a squared tip, which is what a stroke with a butt cap and a
 * round join already gives. Its width is set on the element, so the 1.5 the
 * caller passes for the outlined icons never reaches it.
 */
export const Excavator = createLucideIcon('Excavator', [
  // Track frame, with the six rollers punched out of it.
  [
    'path',
    {
      d:
        'M2.53 17.34h9.94a1.23 1.23 0 0 1 0 2.46H2.53a1.23 1.23 0 0 1 0-2.46Z' +
        'M1.85 18.57a.8.8 0 1 0 1.6 0 .8.8 0 1 0-1.6 0Z' +
        'M3.81 18.57a.8.8 0 1 0 1.6 0 .8.8 0 1 0-1.6 0Z' +
        'M5.78 18.57a.8.8 0 1 0 1.6 0 .8.8 0 1 0-1.6 0Z' +
        'M7.74 18.57a.8.8 0 1 0 1.6 0 .8.8 0 1 0-1.6 0Z' +
        'M9.71 18.57a.8.8 0 1 0 1.6 0 .8.8 0 1 0-1.6 0Z' +
        'M11.67 18.57a.8.8 0 1 0 1.6 0 .8.8 0 1 0-1.6 0Z',
      fill: 'currentColor',
      fillRule: 'evenodd',
      stroke: 'none',
    },
  ],
  // The bar the cab sits on.
  ['path', { d: 'M2.83 16.55h8.91v.73H2.83Z', fill: 'currentColor', stroke: 'none' }],
  // Cab, with the glass punched out.
  [
    'path',
    {
      d: 'M3.51 11.39h7.61l.98 5.1H1.79ZM2.96 14.64h8.16L10.69 12H4.12Z',
      fill: 'currentColor',
      fillRule: 'evenodd',
      stroke: 'none',
    },
  ],
  // Boom and dipper arm.
  [
    'path',
    {
      d: 'M10.6 15.3 16 5.1l4.2 6.6',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: '2.65',
      strokeLinecap: 'butt',
      strokeLinejoin: 'round',
    },
  ],
  // Bucket.
  [
    'path',
    {
      d: 'M18.9 10.5 23.2 12.3 22.9 15.7 21 17.6 19.9 15.1 19.2 12.6Z',
      fill: 'currentColor',
      stroke: 'none',
    },
  ],
]);
