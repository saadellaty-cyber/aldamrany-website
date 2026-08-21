import {
  BadgeCheck,
  Building2,
  CalendarCheck,
  ClipboardCheck,
  Construction,
  Container,
  Cylinder,
  Droplets,
  Eye,
  Factory,
  Fuel,
  Handshake,
  HardHat,
  Layers,
  MapPin,
  Route,
  Ruler,
  SearchCheck,
  Settings,
  ShieldCheck,
  Siren,
  Spline,
  Target,
  TrafficCone,
  TrendingUp,
  TriangleAlert,
  Truck,
  Users,
  Warehouse,
  Waypoints,
  Wrench,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import type { IconKey } from '@/lib/icons';
import { cn } from '@/lib/utils';

/**
 * Maps the stored icon keys onto concrete glyphs. Keeping the mapping here
 * means the database never stores a library-specific component name, so the
 * icon set can be swapped without touching any content.
 */
const GLYPHS: Record<IconKey, LucideIcon> = {
  road: Route,
  truck: Truck,
  construction: Construction,
  'traffic-cone': TrafficCone,
  layers: Layers,
  ruler: Ruler,
  bridge: Spline,
  building: Building2,
  factory: Factory,
  warehouse: Warehouse,
  tunnel: Cylinder,
  equipment: Container,
  pipeline: Waypoints,
  fuel: Fuel,
  zap: Zap,
  droplets: Droplets,
  'shield-check': ShieldCheck,
  'hard-hat': HardHat,
  'clipboard-check': ClipboardCheck,
  'badge-check': BadgeCheck,
  'search-check': SearchCheck,
  'triangle-alert': TriangleAlert,
  siren: Siren,
  eye: Eye,
  users: Users,
  handshake: Handshake,
  target: Target,
  'trending-up': TrendingUp,
  'calendar-check': CalendarCheck,
  'map-pin': MapPin,
  settings: Settings,
  wrench: Wrench,
};

/** Renders one of the curated icons. Decorative by default. */
export function Icon({
  name,
  className,
  label,
}: {
  name: IconKey;
  className?: string;
  /** Supply only when the icon carries meaning that the text does not. */
  label?: string;
}) {
  const Glyph = GLYPHS[name];
  if (!Glyph) return null;

  return (
    <Glyph
      className={cn('size-6 shrink-0', className)}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      strokeWidth={1.5}
    />
  );
}

export { GLYPHS as ICON_GLYPHS };
