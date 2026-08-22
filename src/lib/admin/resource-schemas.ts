/**
 * Serialisable descriptions of the simple, list-shaped CMS entities.
 *
 * The dashboard renders one generic editor from these schemas, so adding a
 * field to (say) Services is a one-line change rather than a new screen. The
 * matching database operations live in `resource-repos.ts`.
 *
 * This module contains no server-only imports: the client editor imports it
 * directly.
 */

export type ResourceFieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'date'
  | 'select'
  | 'checkbox'
  | 'image'
  | 'icon'
  | 'bilingualText'
  | 'bilingualTextarea';

export type ResourceField = {
  /** For bilingual fields this is the base name, yielding `<name>Ar` / `<name>En`. */
  name: string;
  label: string;
  type: ResourceFieldType;
  required?: boolean;
  help?: string;
  placeholder?: string;
  rows?: number;
  options?: Array<{ value: string; label: string }>;
  /** Rendered full width in the two-column grid. */
  wide?: boolean;
};

export type ResourceSchema = {
  key: string;
  title: string;
  singular: string;
  description: string;
  fields: ResourceField[];
  /** Shows the Draft / Published control and status column. */
  hasStatus: boolean;
  /** Enables drag-to-reorder. */
  hasOrder: boolean;
  /** Warns that this content is referenced by projects. */
  note?: string;
};

const PUBLISH_HELP = 'Drafts are hidden from the public website.';

export const RESOURCE_SCHEMAS: Record<string, ResourceSchema> = {
  news: {
    key: 'news',
    title: 'News',
    singular: 'News item',
    description:
      'Announcements shown on the homepage and the News page, newest first. Nothing appears on the website until an item is published.',
    hasStatus: true,
    hasOrder: false,
    fields: [
      { name: 'title', label: 'Headline', type: 'bilingualText', required: true },
      {
        name: 'excerpt',
        label: 'Short summary',
        type: 'bilingualTextarea',
        rows: 2,
        help: 'One or two lines, shown on the card. The full text goes below.',
      },
      { name: 'body', label: 'Full text', type: 'bilingualTextarea', rows: 8 },
      {
        name: 'publishedAt',
        label: 'Date',
        type: 'date',
        help: 'The date shown on the card. Set it to when the work happened, not when you type it.',
      },
      { name: 'image', label: 'Image', type: 'image' },
      { name: 'slug', label: 'URL fragment', type: 'text' },
    ],
  },

  partners: {
    key: 'partners',
    title: 'Partners',
    singular: 'Partner',
    description:
      'Organisations shown in the partners strip. A partner with no logo uploaded is left off the website rather than shown as an empty box.',
    hasStatus: true,
    hasOrder: true,
    fields: [
      { name: 'name', label: 'Organisation', type: 'bilingualText', required: true },
      { name: 'logo', label: 'Logo', type: 'image', help: 'Preferably on a transparent background.' },
      {
        name: 'url',
        label: 'Website',
        type: 'text',
        placeholder: 'https://…',
        help: 'Optional. When set, the logo links to it.',
      },
      { name: 'slug', label: 'URL fragment', type: 'text' },
    ],
  },

  services: {
    key: 'services',
    title: 'Services',
    singular: 'Service',
    description:
      'The fields of work shown on the homepage and the Services page. Drag to change the order they appear in.',
    hasStatus: true,
    hasOrder: true,
    fields: [
      { name: 'title', label: 'Service name', type: 'bilingualText', required: true },
      { name: 'description', label: 'Description', type: 'bilingualTextarea', rows: 4 },
      { name: 'slug', label: 'URL fragment', type: 'text', help: 'Used for links such as /services#roads-paving.' },
      { name: 'icon', label: 'Icon', type: 'icon', help: 'Shown beside the service. Icons can be hidden site-wide in Site Settings.' },
      { name: 'image', label: 'Image', type: 'image' },
      { name: 'featured', label: 'Show on the homepage', type: 'checkbox' },
    ],
  },

  sectors: {
    key: 'sectors',
    title: 'Sectors',
    singular: 'Sector',
    description:
      'Sectors classify projects and drive the filters on the Projects page. A sector with no published projects is listed as text only.',
    hasStatus: true,
    hasOrder: true,
    note: 'Deleting a sector does not delete its projects — they simply lose their sector.',
    fields: [
      { name: 'name', label: 'Sector name', type: 'bilingualText', required: true },
      { name: 'description', label: 'Description', type: 'bilingualTextarea', rows: 3 },
      { name: 'slug', label: 'URL fragment', type: 'text' },
      { name: 'icon', label: 'Icon', type: 'icon' },
      { name: 'image', label: 'Image', type: 'image' },
    ],
  },

  capabilities: {
    key: 'capabilities',
    title: 'Capabilities',
    singular: 'Capability',
    description:
      'Technical and operational capabilities, shown in three bands. Choose which band each one belongs to, then drag to order it within that band.',
    hasStatus: true,
    hasOrder: true,
    fields: [
      { name: 'title', label: 'Capability', type: 'bilingualText', required: true },
      { name: 'description', label: 'Description', type: 'bilingualTextarea', rows: 3 },
      {
        name: 'group',
        label: 'Band',
        type: 'select',
        options: [
          { value: 'EXPERIENCE', label: 'Experience & delivery' },
          { value: 'RESOURCES', label: 'Resources' },
          { value: 'FIELDS', label: 'Fields of work' },
        ],
      },
      { name: 'slug', label: 'URL fragment', type: 'text' },
      { name: 'icon', label: 'Icon', type: 'icon' },
      { name: 'image', label: 'Image', type: 'image' },
    ],
  },

  quality: {
    key: 'quality',
    title: 'Quality & Safety',
    singular: 'Theme',
    description:
      'Themes shown in the two columns of the Quality & Safety page. Choose which column each one belongs to.',
    hasStatus: true,
    hasOrder: true,
    fields: [
      { name: 'title', label: 'Theme', type: 'bilingualText', required: true },
      { name: 'body', label: 'Description', type: 'bilingualTextarea', rows: 4 },
      {
        name: 'category',
        label: 'Column',
        type: 'select',
        options: [
          { value: 'QUALITY', label: 'Quality' },
          { value: 'SAFETY', label: 'Safety' },
        ],
      },
      { name: 'slug', label: 'URL fragment', type: 'text' },
      { name: 'icon', label: 'Icon', type: 'icon' },
      { name: 'image', label: 'Image', type: 'image' },
    ],
  },

  risk: {
    key: 'risk',
    title: 'Risk Management',
    singular: 'Step',
    description: 'The steps of the risk-management process, drawn as a numbered sequence.',
    hasStatus: true,
    hasOrder: true,
    fields: [
      { name: 'stepNumber', label: 'Step number', type: 'number', required: true },
      { name: 'title', label: 'Step name', type: 'bilingualText', required: true },
      { name: 'description', label: 'Description', type: 'bilingualTextarea', rows: 3 },
      { name: 'image', label: 'Image', type: 'image' },
    ],
  },

  timeline: {
    key: 'timeline',
    title: 'Company Timeline',
    singular: 'Milestone',
    description:
      'Milestones in the company history, shown on the About page. Only add years you can confirm.',
    hasStatus: true,
    hasOrder: true,
    fields: [
      { name: 'year', label: 'Year', type: 'number', required: true },
      { name: 'title', label: 'Title', type: 'bilingualText' },
      { name: 'description', label: 'Description', type: 'bilingualTextarea', rows: 3 },
      { name: 'image', label: 'Image', type: 'image' },
    ],
  },

  statistics: {
    key: 'statistics',
    title: 'Statistics',
    singular: 'Statistic',
    description:
      'Figures shown on the homepage and About page. A statistic with an empty value is hidden automatically — never invent a number.',
    hasStatus: true,
    hasOrder: true,
    fields: [
      { name: 'label', label: 'Label', type: 'bilingualText', required: true },
      { name: 'value', label: 'Value', type: 'text', help: 'Leave empty to hide this statistic.' },
      { name: 'prefix', label: 'Prefix', type: 'text', placeholder: 'e.g. +' },
      { name: 'suffix', label: 'Suffix', type: 'text', placeholder: 'e.g. +' },
      { name: 'key', label: 'Reference key', type: 'text', help: 'Internal identifier; must be unique.' },
    ],
  },

  collections: {
    key: 'collections',
    title: 'Project Collections',
    singular: 'Collection',
    description:
      'Umbrella groups such as “Alexandria Governorate Projects”. Assign projects to a collection from the project editor.',
    hasStatus: true,
    hasOrder: true,
    fields: [
      { name: 'name', label: 'Collection name', type: 'bilingualText', required: true },
      { name: 'description', label: 'Description', type: 'bilingualTextarea', rows: 3 },
      { name: 'slug', label: 'URL fragment', type: 'text' },
      { name: 'coverImage', label: 'Cover image', type: 'image' },
    ],
  },

  navigation: {
    key: 'navigation',
    title: 'Navigation',
    singular: 'Menu item',
    description:
      'Links in the header and footer menus. Internal links start with a slash, for example /projects — the language prefix is added automatically.',
    hasStatus: false,
    hasOrder: true,
    fields: [
      { name: 'label', label: 'Label', type: 'bilingualText', required: true },
      { name: 'href', label: 'Link', type: 'text', required: true, placeholder: '/projects' },
      {
        name: 'location',
        label: 'Menu',
        type: 'select',
        options: [
          { value: 'HEADER', label: 'Header' },
          { value: 'FOOTER', label: 'Footer' },
        ],
      },
      { name: 'isExternal', label: 'External link (opens in a new tab)', type: 'checkbox' },
      { name: 'enabled', label: 'Visible on the website', type: 'checkbox' },
    ],
  },
};

export const PUBLISH_STATUS_HELP = PUBLISH_HELP;

export function getResourceSchema(key: string): ResourceSchema | null {
  return RESOURCE_SCHEMAS[key] ?? null;
}

export const RESOURCE_KEYS = Object.keys(RESOURCE_SCHEMAS);
