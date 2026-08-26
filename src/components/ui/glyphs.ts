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
  ['path', { d: 'M3.75 17.25h8a1.75 1.75 0 1 1 0 3.5h-8a1.75 1.75 0 1 1 0-3.5Z' }],
  // Cab and upper structure.
  ['path', { d: 'M4 17.25V12a1.5 1.5 0 0 1 1.5-1.5h5A1.5 1.5 0 0 1 12 12v5.25' }],
  // Boom and dipper arm, drawn as one jointed path: as two they met at a pair
  // of round caps that piled into a blob at the elbow.
  ['path', { d: 'M12 12.25c.5-4.75 2.6-7.75 5.25-7.75L19 10.5' }],
  // Bucket. Deliberately the largest single shape after the tracks — at the
  // size these render it is what tells an excavator from any other machine.
  ['path', { d: 'M15.25 10.5h6.75l-1.4 5.75h-3.95z' }],
]);
