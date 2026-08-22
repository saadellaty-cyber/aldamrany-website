/**
 * The icon set offered in the dashboard and rendered on the public site.
 *
 * A fixed, curated list rather than the whole of lucide: the editor picks from
 * a gallery of icons that actually suit a contracting company, and the public
 * bundle only ever contains these.
 *
 * Names are stored in the database, so entries may be added freely but an
 * existing `key` must never be renamed.
 */
export const ICON_KEYS = [
  // Roads and paving
  'road',
  'truck',
  'construction',
  'traffic-cone',
  'layers',
  'ruler',
  // Structures
  'bridge',
  'building',
  'factory',
  'warehouse',
  'tunnel',
  'equipment',
  // Utilities and energy
  'pipeline',
  'fuel',
  'zap',
  'droplets',
  // Quality, safety and process
  'shield-check',
  'hard-hat',
  'clipboard-check',
  'badge-check',
  'search-check',
  'triangle-alert',
  'siren',
  'eye',
  // People and delivery
  'users',
  'handshake',
  'target',
  'trending-up',
  'calendar-check',
  'map-pin',
  'settings',
  'wrench',
] as const;

export type IconKey = (typeof ICON_KEYS)[number];

export function isIconKey(value: unknown): value is IconKey {
  return typeof value === 'string' && (ICON_KEYS as readonly string[]).includes(value);
}

/** Arabic and English labels for the picker. */
export const ICON_LABELS: Record<IconKey, { ar: string; en: string }> = {
  road: { ar: 'طريق', en: 'Road' },
  truck: { ar: 'شاحنة', en: 'Truck' },
  construction: { ar: 'إنشاءات', en: 'Construction' },
  'traffic-cone': { ar: 'مخروط مروري', en: 'Traffic cone' },
  layers: { ar: 'طبقات', en: 'Layers' },
  ruler: { ar: 'قياس', en: 'Measurement' },
  bridge: { ar: 'كوبري', en: 'Bridge' },
  building: { ar: 'مبنى', en: 'Building' },
  factory: { ar: 'مصنع', en: 'Factory' },
  warehouse: { ar: 'مستودع', en: 'Warehouse' },
  tunnel: { ar: 'نفق', en: 'Tunnel' },
  equipment: { ar: 'معدات', en: 'Equipment' },
  pipeline: { ar: 'خطوط أنابيب', en: 'Pipeline' },
  fuel: { ar: 'وقود', en: 'Fuel' },
  zap: { ar: 'كهرباء', en: 'Power' },
  droplets: { ar: 'مياه', en: 'Water' },
  'shield-check': { ar: 'حماية', en: 'Protection' },
  'hard-hat': { ar: 'خوذة سلامة', en: 'Safety helmet' },
  'clipboard-check': { ar: 'قائمة فحص', en: 'Checklist' },
  'badge-check': { ar: 'اعتماد', en: 'Certified' },
  'search-check': { ar: 'تفتيش', en: 'Inspection' },
  'triangle-alert': { ar: 'تحذير', en: 'Warning' },
  siren: { ar: 'طوارئ', en: 'Emergency' },
  eye: { ar: 'مراقبة', en: 'Monitoring' },
  users: { ar: 'فريق', en: 'Team' },
  handshake: { ar: 'شراكة', en: 'Partnership' },
  target: { ar: 'هدف', en: 'Target' },
  'trending-up': { ar: 'تطور', en: 'Growth' },
  'calendar-check': { ar: 'جدول زمني', en: 'Schedule' },
  'map-pin': { ar: 'موقع', en: 'Location' },
  settings: { ar: 'تشغيل', en: 'Operations' },
  wrench: { ar: 'صيانة', en: 'Maintenance' },
};

/**
 * Sensible default icon for seeded content, matched by slug. Keeps freshly
 * seeded services and themes from looking unfinished before an editor has
 * chosen anything.
 */
export const DEFAULT_ICON_BY_SLUG: Record<string, IconKey> = {
  // Services
  'roads-paving': 'road',
  'asphalt-works': 'layers',
  infrastructure: 'pipeline',
  'concrete-works': 'building',
  contracting: 'handshake',
  // Sectors
  asphalt: 'layers',
  concrete: 'building',
  bridges: 'bridge',
  tunnels: 'tunnel',
  industrial: 'factory',
  'oil-gas': 'fuel',
  educational: 'building',
  facilities: 'warehouse',
  // Capabilities. These sit next to one another in a grid, so no two may fall
  // back to the same mark — a row of identical icons reads as a rendering bug.
  'technical-expertise': 'ruler',
  'specialized-teams': 'users',
  'operational-capabilities': 'equipment',
  roads: 'road',
  paving: 'construction',
  'project-execution': 'calendar-check',
  // Quality and safety
  quality: 'badge-check',
  materials: 'layers',
  accuracy: 'target',
  supervision: 'eye',
  'technical-specifications': 'clipboard-check',
  safety: 'shield-check',
  'occupational-health': 'shield-check',
  ppe: 'hard-hat',
  'site-safety': 'traffic-cone',
  'equipment-movement': 'equipment',
  'vehicle-movement': 'truck',
};

/** The icon to render for a record: its own choice, else a slug-based default. */
export function resolveIcon(icon: string | null | undefined, slug?: string): IconKey | null {
  if (isIconKey(icon)) return icon;
  if (slug && DEFAULT_ICON_BY_SLUG[slug]) return DEFAULT_ICON_BY_SLUG[slug];
  return null;
}
