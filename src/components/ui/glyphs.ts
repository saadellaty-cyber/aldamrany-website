import { createLucideIcon } from 'lucide-react';

/**
 * Icons drawn for this site, for marks the icon library does not carry.
 *
 * Built with `createLucideIcon` rather than hand-written SVG so they inherit
 * the library's rendering contract exactly — the 24x24 viewBox, `currentColor`
 * for the stroke, round caps and joins, and a stroke width the caller sets.
 * That is what lets them take the site's gold from a `text-gold` class and
 * follow it through the day and night themes without knowing either exists.
 *
 * Drawn to the same margins as the library's own icons: everything sits inside
 * the inner 20x20 box, so a custom mark never looks larger than its neighbours
 * in a row.
 */

/**
 * A tracked excavator, boom raised and bucket forward.
 *
 * Stands in for heavy plant generally. The library's nearest mark is a farm
 * tractor, which reads as agriculture rather than road building.
 */
export const Excavator = createLucideIcon('Excavator', [
  // Track frame.
  ['path', { d: 'M4.25 16h7a2 2 0 1 1 0 4h-7a2 2 0 1 1 0-4Z' }],
  // Cab and upper structure.
  ['path', { d: 'M5.75 16v-4A1.25 1.25 0 0 1 7 10.75h4A1.25 1.25 0 0 1 12.25 12v4' }],
  // Boom, curved as on the machine.
  ['path', { d: 'M12.25 11.75c.7-3.7 2.55-5.85 4.7-5.85' }],
  // Dipper arm.
  ['path', { d: 'm16.95 5.9 1.6 5.1' }],
  // Bucket.
  ['path', { d: 'M15.75 11h5.5l-1 4.1h-3.5z' }],
]);
