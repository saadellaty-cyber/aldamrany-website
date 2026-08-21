import { prisma } from '@/lib/db';
import { storage } from '@/lib/storage';
import { slugify } from '@/lib/utils';
import { checkbox, integer, oneOf, optionalText, text } from '@/lib/admin/forms';
import type { MediaAsset } from '@/generated/prisma/client';

/**
 * Database operations behind the generic resource editor.
 *
 * Each entry owns its own Prisma calls, so everything stays type-checked —
 * there is no dynamic model lookup or `any` in this file.
 */

/** The three bands the Capabilities section is grouped into. */
const CAPABILITY_GROUPS = ['EXPERIENCE', 'RESOURCES', 'FIELDS'] as const;

export type ResourceImage = { id: string; url: string; name: string } | null;

export type ResourceRow = {
  id: string;
  title: string;
  subtitle: string | null;
  status: 'DRAFT' | 'PUBLISHED' | null;
  sortOrder: number;
  /** Default values keyed by form input name. */
  values: Record<string, string | number | boolean | null>;
  /** Selected image per image field, keyed by field name. */
  images: Record<string, ResourceImage>;
};

export type ResourceRepo = {
  list(): Promise<ResourceRow[]>;
  create(formData: FormData): Promise<string>;
  update(id: string, formData: FormData): Promise<void>;
  remove(id: string): Promise<void>;
  reorder(ids: string[]): Promise<void>;
  /** Human label used in the activity log. */
  label(formData: FormData): string;
};

const PUBLISH = ['DRAFT', 'PUBLISHED'] as const;

function toImage(asset: MediaAsset | null | undefined): ResourceImage {
  return asset ? { id: asset.id, url: storage().url(asset.storageKey), name: asset.originalName } : null;
}

function status(formData: FormData) {
  return oneOf(formData, 'status', PUBLISH, 'PUBLISHED');
}

/** Reads a bilingual pair as `<base>Ar` / `<base>En`. */
function pair(formData: FormData, base: string) {
  return {
    ar: optionalText(formData, `${base}Ar`),
    en: optionalText(formData, `${base}En`),
  };
}

/** Ensures a slug is present and unique for the given model. */
async function ensureSlug(
  formData: FormData,
  fallbackBase: string,
  exists: (slug: string) => Promise<boolean>,
): Promise<string> {
  const base = slugify(text(formData, 'slug') || fallbackBase) || 'item';

  let candidate = base;
  for (let attempt = 2; attempt < 200; attempt += 1) {
    if (!(await exists(candidate))) return candidate;
    candidate = `${base}-${attempt}`;
  }
  return `${base}-${Date.now()}`;
}

export const RESOURCE_REPOS: Record<string, ResourceRepo> = {
  /* --- Services ---------------------------------------------------------- */
  services: {
    label: (formData) => text(formData, 'titleEn') || text(formData, 'titleAr'),
    async list() {
      const rows = await prisma.service.findMany({
        orderBy: { sortOrder: 'asc' },
        include: { image: true },
      });
      return rows.map((row) => ({
        id: row.id,
        title: row.titleEn || row.titleAr,
        subtitle: row.titleAr,
        status: row.status,
        sortOrder: row.sortOrder,
        values: {
          titleAr: row.titleAr,
          titleEn: row.titleEn,
          descriptionAr: row.descriptionAr,
          descriptionEn: row.descriptionEn,
          slug: row.slug,
          icon: row.icon,
          featured: row.featured,
        },
        images: { image: toImage(row.image) },
      }));
    },
    async create(formData) {
      const title = pair(formData, 'title');
      const description = pair(formData, 'description');
      const count = await prisma.service.count();

      const created = await prisma.service.create({
        data: {
          titleAr: title.ar ?? '',
          titleEn: title.en ?? '',
          descriptionAr: description.ar,
          descriptionEn: description.en,
          slug: await ensureSlug(formData, title.en ?? title.ar ?? 'service', async (slug) =>
            Boolean(await prisma.service.findUnique({ where: { slug }, select: { id: true } })),
          ),
          icon: optionalText(formData, 'icon'),
          imageId: optionalText(formData, 'image'),
          featured: checkbox(formData, 'featured'),
          status: status(formData),
          sortOrder: count,
        },
      });
      return created.id;
    },
    async update(id, formData) {
      const title = pair(formData, 'title');
      const description = pair(formData, 'description');

      await prisma.service.update({
        where: { id },
        data: {
          titleAr: title.ar ?? '',
          titleEn: title.en ?? '',
          descriptionAr: description.ar,
          descriptionEn: description.en,
          slug: await ensureSlug(formData, title.en ?? title.ar ?? 'service', async (slug) =>
            Boolean(
              await prisma.service.findFirst({
                where: { slug, NOT: { id } },
                select: { id: true },
              }),
            ),
          ),
          icon: optionalText(formData, 'icon'),
          imageId: optionalText(formData, 'image'),
          featured: checkbox(formData, 'featured'),
          status: status(formData),
        },
      });
    },
    async remove(id) {
      await prisma.service.delete({ where: { id } });
    },
    async reorder(ids) {
      await prisma.$transaction(
        ids.map((id, index) => prisma.service.update({ where: { id }, data: { sortOrder: index } })),
      );
    },
  },

  /* --- Sectors ----------------------------------------------------------- */
  sectors: {
    label: (formData) => text(formData, 'nameEn') || text(formData, 'nameAr'),
    async list() {
      const rows = await prisma.sector.findMany({
        orderBy: { sortOrder: 'asc' },
        include: { image: true, _count: { select: { projects: true } } },
      });
      return rows.map((row) => ({
        id: row.id,
        title: row.nameEn || row.nameAr,
        subtitle: `${row.nameAr} · ${row._count.projects} project${row._count.projects === 1 ? '' : 's'}`,
        status: row.status,
        sortOrder: row.sortOrder,
        values: {
          nameAr: row.nameAr,
          nameEn: row.nameEn,
          descriptionAr: row.descriptionAr,
          descriptionEn: row.descriptionEn,
          slug: row.slug,
          icon: row.icon,
        },
        images: { image: toImage(row.image) },
      }));
    },
    async create(formData) {
      const name = pair(formData, 'name');
      const description = pair(formData, 'description');
      const count = await prisma.sector.count();

      const created = await prisma.sector.create({
        data: {
          nameAr: name.ar ?? '',
          nameEn: name.en ?? '',
          descriptionAr: description.ar,
          descriptionEn: description.en,
          slug: await ensureSlug(formData, name.en ?? name.ar ?? 'sector', async (slug) =>
            Boolean(await prisma.sector.findUnique({ where: { slug }, select: { id: true } })),
          ),
          icon: optionalText(formData, 'icon'),
          imageId: optionalText(formData, 'image'),
          status: status(formData),
          sortOrder: count,
        },
      });
      return created.id;
    },
    async update(id, formData) {
      const name = pair(formData, 'name');
      const description = pair(formData, 'description');

      await prisma.sector.update({
        where: { id },
        data: {
          nameAr: name.ar ?? '',
          nameEn: name.en ?? '',
          descriptionAr: description.ar,
          descriptionEn: description.en,
          slug: await ensureSlug(formData, name.en ?? name.ar ?? 'sector', async (slug) =>
            Boolean(
              await prisma.sector.findFirst({ where: { slug, NOT: { id } }, select: { id: true } }),
            ),
          ),
          icon: optionalText(formData, 'icon'),
          imageId: optionalText(formData, 'image'),
          status: status(formData),
        },
      });
    },
    async remove(id) {
      await prisma.sector.delete({ where: { id } });
    },
    async reorder(ids) {
      await prisma.$transaction(
        ids.map((id, index) => prisma.sector.update({ where: { id }, data: { sortOrder: index } })),
      );
    },
  },

  /* --- Capabilities ------------------------------------------------------ */
  capabilities: {
    label: (formData) => text(formData, 'titleEn') || text(formData, 'titleAr'),
    async list() {
      const rows = await prisma.capability.findMany({
        orderBy: [{ group: 'asc' }, { sortOrder: 'asc' }],
        include: { image: true },
      });
      return rows.map((row) => ({
        id: row.id,
        title: row.titleEn || row.titleAr,
        subtitle: row.titleAr,
        status: row.status,
        sortOrder: row.sortOrder,
        values: {
          titleAr: row.titleAr,
          titleEn: row.titleEn,
          descriptionAr: row.descriptionAr,
          descriptionEn: row.descriptionEn,
          group: row.group,
          slug: row.slug,
          icon: row.icon,
        },
        images: { image: toImage(row.image) },
      }));
    },
    async create(formData) {
      const title = pair(formData, 'title');
      const description = pair(formData, 'description');
      const count = await prisma.capability.count();

      const created = await prisma.capability.create({
        data: {
          titleAr: title.ar ?? '',
          titleEn: title.en ?? '',
          descriptionAr: description.ar,
          descriptionEn: description.en,
          slug: await ensureSlug(formData, title.en ?? title.ar ?? 'capability', async (slug) =>
            Boolean(await prisma.capability.findUnique({ where: { slug }, select: { id: true } })),
          ),
          group: oneOf(formData, 'group', CAPABILITY_GROUPS, 'FIELDS'),
          icon: optionalText(formData, 'icon'),
          imageId: optionalText(formData, 'image'),
          status: status(formData),
          sortOrder: count,
        },
      });
      return created.id;
    },
    async update(id, formData) {
      const title = pair(formData, 'title');
      const description = pair(formData, 'description');

      await prisma.capability.update({
        where: { id },
        data: {
          titleAr: title.ar ?? '',
          titleEn: title.en ?? '',
          descriptionAr: description.ar,
          descriptionEn: description.en,
          slug: await ensureSlug(formData, title.en ?? title.ar ?? 'capability', async (slug) =>
            Boolean(
              await prisma.capability.findFirst({
                where: { slug, NOT: { id } },
                select: { id: true },
              }),
            ),
          ),
          group: oneOf(formData, 'group', CAPABILITY_GROUPS, 'FIELDS'),
          icon: optionalText(formData, 'icon'),
          imageId: optionalText(formData, 'image'),
          status: status(formData),
        },
      });
    },
    async remove(id) {
      await prisma.capability.delete({ where: { id } });
    },
    async reorder(ids) {
      await prisma.$transaction(
        ids.map((id, index) =>
          prisma.capability.update({ where: { id }, data: { sortOrder: index } }),
        ),
      );
    },
  },

  /* --- Quality & Safety -------------------------------------------------- */
  quality: {
    label: (formData) => text(formData, 'titleEn') || text(formData, 'titleAr'),
    async list() {
      const rows = await prisma.qualitySection.findMany({
        orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
        include: { image: true },
      });
      return rows.map((row) => ({
        id: row.id,
        title: row.titleEn || row.titleAr,
        subtitle: `${row.category === 'QUALITY' ? 'Quality' : 'Safety'} · ${row.titleAr}`,
        status: row.status,
        sortOrder: row.sortOrder,
        values: {
          titleAr: row.titleAr,
          titleEn: row.titleEn,
          bodyAr: row.bodyAr,
          bodyEn: row.bodyEn,
          category: row.category,
          slug: row.slug,
          icon: row.icon,
        },
        images: { image: toImage(row.image) },
      }));
    },
    async create(formData) {
      const title = pair(formData, 'title');
      const body = pair(formData, 'body');
      const count = await prisma.qualitySection.count();

      const created = await prisma.qualitySection.create({
        data: {
          titleAr: title.ar ?? '',
          titleEn: title.en ?? '',
          bodyAr: body.ar,
          bodyEn: body.en,
          category: oneOf(formData, 'category', ['QUALITY', 'SAFETY'] as const, 'QUALITY'),
          slug: await ensureSlug(formData, title.en ?? title.ar ?? 'theme', async (slug) =>
            Boolean(
              await prisma.qualitySection.findUnique({ where: { slug }, select: { id: true } }),
            ),
          ),
          icon: optionalText(formData, 'icon'),
          imageId: optionalText(formData, 'image'),
          status: status(formData),
          sortOrder: count,
        },
      });
      return created.id;
    },
    async update(id, formData) {
      const title = pair(formData, 'title');
      const body = pair(formData, 'body');

      await prisma.qualitySection.update({
        where: { id },
        data: {
          titleAr: title.ar ?? '',
          titleEn: title.en ?? '',
          bodyAr: body.ar,
          bodyEn: body.en,
          category: oneOf(formData, 'category', ['QUALITY', 'SAFETY'] as const, 'QUALITY'),
          slug: await ensureSlug(formData, title.en ?? title.ar ?? 'theme', async (slug) =>
            Boolean(
              await prisma.qualitySection.findFirst({
                where: { slug, NOT: { id } },
                select: { id: true },
              }),
            ),
          ),
          icon: optionalText(formData, 'icon'),
          imageId: optionalText(formData, 'image'),
          status: status(formData),
        },
      });
    },
    async remove(id) {
      await prisma.qualitySection.delete({ where: { id } });
    },
    async reorder(ids) {
      await prisma.$transaction(
        ids.map((id, index) =>
          prisma.qualitySection.update({ where: { id }, data: { sortOrder: index } }),
        ),
      );
    },
  },

  /* --- Risk management --------------------------------------------------- */
  risk: {
    label: (formData) => text(formData, 'titleEn') || text(formData, 'titleAr'),
    async list() {
      const rows = await prisma.riskItem.findMany({
        orderBy: [{ sortOrder: 'asc' }, { stepNumber: 'asc' }],
        include: { image: true },
      });
      return rows.map((row) => ({
        id: row.id,
        title: `${String(row.stepNumber).padStart(2, '0')} — ${row.titleEn || row.titleAr}`,
        subtitle: row.titleAr,
        status: row.status,
        sortOrder: row.sortOrder,
        values: {
          stepNumber: row.stepNumber,
          titleAr: row.titleAr,
          titleEn: row.titleEn,
          descriptionAr: row.descriptionAr,
          descriptionEn: row.descriptionEn,
        },
        images: { image: toImage(row.image) },
      }));
    },
    async create(formData) {
      const title = pair(formData, 'title');
      const description = pair(formData, 'description');
      const count = await prisma.riskItem.count();

      const created = await prisma.riskItem.create({
        data: {
          stepNumber: integer(formData, 'stepNumber') ?? count + 1,
          titleAr: title.ar ?? '',
          titleEn: title.en ?? '',
          descriptionAr: description.ar,
          descriptionEn: description.en,
          imageId: optionalText(formData, 'image'),
          status: status(formData),
          sortOrder: count,
        },
      });
      return created.id;
    },
    async update(id, formData) {
      const title = pair(formData, 'title');
      const description = pair(formData, 'description');
      const existing = await prisma.riskItem.findUnique({ where: { id } });

      await prisma.riskItem.update({
        where: { id },
        data: {
          stepNumber: integer(formData, 'stepNumber') ?? existing?.stepNumber ?? 1,
          titleAr: title.ar ?? '',
          titleEn: title.en ?? '',
          descriptionAr: description.ar,
          descriptionEn: description.en,
          imageId: optionalText(formData, 'image'),
          status: status(formData),
        },
      });
    },
    async remove(id) {
      await prisma.riskItem.delete({ where: { id } });
    },
    async reorder(ids) {
      await prisma.$transaction(
        ids.map((id, index) =>
          prisma.riskItem.update({ where: { id }, data: { sortOrder: index } }),
        ),
      );
    },
  },

  /* --- Timeline ---------------------------------------------------------- */
  timeline: {
    label: (formData) => text(formData, 'year'),
    async list() {
      const rows = await prisma.timelineItem.findMany({
        orderBy: [{ year: 'asc' }, { sortOrder: 'asc' }],
        include: { image: true },
      });
      return rows.map((row) => ({
        id: row.id,
        title: `${row.year} — ${row.titleEn || row.titleAr || ''}`.trim(),
        subtitle: row.titleAr,
        status: row.status,
        sortOrder: row.sortOrder,
        values: {
          year: row.year,
          titleAr: row.titleAr,
          titleEn: row.titleEn,
          descriptionAr: row.descriptionAr,
          descriptionEn: row.descriptionEn,
        },
        images: { image: toImage(row.image) },
      }));
    },
    async create(formData) {
      const title = pair(formData, 'title');
      const description = pair(formData, 'description');
      const count = await prisma.timelineItem.count();

      const created = await prisma.timelineItem.create({
        data: {
          year: integer(formData, 'year') ?? new Date().getFullYear(),
          titleAr: title.ar,
          titleEn: title.en,
          descriptionAr: description.ar,
          descriptionEn: description.en,
          imageId: optionalText(formData, 'image'),
          status: status(formData),
          sortOrder: count,
        },
      });
      return created.id;
    },
    async update(id, formData) {
      const title = pair(formData, 'title');
      const description = pair(formData, 'description');
      const existing = await prisma.timelineItem.findUnique({ where: { id } });

      await prisma.timelineItem.update({
        where: { id },
        data: {
          year: integer(formData, 'year') ?? existing?.year ?? new Date().getFullYear(),
          titleAr: title.ar,
          titleEn: title.en,
          descriptionAr: description.ar,
          descriptionEn: description.en,
          imageId: optionalText(formData, 'image'),
          status: status(formData),
        },
      });
    },
    async remove(id) {
      await prisma.timelineItem.delete({ where: { id } });
    },
    async reorder(ids) {
      await prisma.$transaction(
        ids.map((id, index) =>
          prisma.timelineItem.update({ where: { id }, data: { sortOrder: index } }),
        ),
      );
    },
  },

  /* --- Statistics -------------------------------------------------------- */
  statistics: {
    label: (formData) => text(formData, 'labelEn') || text(formData, 'labelAr'),
    async list() {
      const rows = await prisma.statistic.findMany({ orderBy: { sortOrder: 'asc' } });
      return rows.map((row) => ({
        id: row.id,
        title: `${row.value ?? '—'} · ${row.labelEn || row.labelAr}`,
        subtitle: row.value ? row.labelAr : 'No value — hidden on the website',
        status: row.status,
        sortOrder: row.sortOrder,
        values: {
          labelAr: row.labelAr,
          labelEn: row.labelEn,
          value: row.value,
          prefix: row.prefix,
          suffix: row.suffix,
          key: row.key,
        },
        images: {},
      }));
    },
    async create(formData) {
      const label = pair(formData, 'label');
      const count = await prisma.statistic.count();

      const created = await prisma.statistic.create({
        data: {
          key: await ensureSlug(
            formData,
            label.en ?? label.ar ?? 'statistic',
            async (slug) =>
              Boolean(await prisma.statistic.findUnique({ where: { key: slug }, select: { id: true } })),
          ),
          labelAr: label.ar ?? '',
          labelEn: label.en ?? '',
          value: optionalText(formData, 'value'),
          prefix: optionalText(formData, 'prefix'),
          suffix: optionalText(formData, 'suffix'),
          status: status(formData),
          sortOrder: count,
        },
      });
      return created.id;
    },
    async update(id, formData) {
      const label = pair(formData, 'label');
      const existing = await prisma.statistic.findUnique({ where: { id } });

      await prisma.statistic.update({
        where: { id },
        data: {
          key: text(formData, 'key') || existing?.key || `stat-${Date.now()}`,
          labelAr: label.ar ?? '',
          labelEn: label.en ?? '',
          value: optionalText(formData, 'value'),
          prefix: optionalText(formData, 'prefix'),
          suffix: optionalText(formData, 'suffix'),
          status: status(formData),
        },
      });
    },
    async remove(id) {
      await prisma.statistic.delete({ where: { id } });
    },
    async reorder(ids) {
      await prisma.$transaction(
        ids.map((id, index) =>
          prisma.statistic.update({ where: { id }, data: { sortOrder: index } }),
        ),
      );
    },
  },

  /* --- Project collections ----------------------------------------------- */
  collections: {
    label: (formData) => text(formData, 'nameEn') || text(formData, 'nameAr'),
    async list() {
      const rows = await prisma.projectCollection.findMany({
        orderBy: { sortOrder: 'asc' },
        include: { coverImage: true, _count: { select: { projects: true } } },
      });
      return rows.map((row) => ({
        id: row.id,
        title: row.nameEn || row.nameAr,
        subtitle: `${row.nameAr} · ${row._count.projects} project${row._count.projects === 1 ? '' : 's'}`,
        status: row.status,
        sortOrder: row.sortOrder,
        values: {
          nameAr: row.nameAr,
          nameEn: row.nameEn,
          descriptionAr: row.descriptionAr,
          descriptionEn: row.descriptionEn,
          slug: row.slug,
        },
        images: { coverImage: toImage(row.coverImage) },
      }));
    },
    async create(formData) {
      const name = pair(formData, 'name');
      const description = pair(formData, 'description');
      const count = await prisma.projectCollection.count();

      const created = await prisma.projectCollection.create({
        data: {
          nameAr: name.ar ?? '',
          nameEn: name.en ?? '',
          descriptionAr: description.ar,
          descriptionEn: description.en,
          slug: await ensureSlug(formData, name.en ?? name.ar ?? 'collection', async (slug) =>
            Boolean(
              await prisma.projectCollection.findUnique({ where: { slug }, select: { id: true } }),
            ),
          ),
          coverImageId: optionalText(formData, 'coverImage'),
          status: status(formData),
          sortOrder: count,
        },
      });
      return created.id;
    },
    async update(id, formData) {
      const name = pair(formData, 'name');
      const description = pair(formData, 'description');

      await prisma.projectCollection.update({
        where: { id },
        data: {
          nameAr: name.ar ?? '',
          nameEn: name.en ?? '',
          descriptionAr: description.ar,
          descriptionEn: description.en,
          slug: await ensureSlug(formData, name.en ?? name.ar ?? 'collection', async (slug) =>
            Boolean(
              await prisma.projectCollection.findFirst({
                where: { slug, NOT: { id } },
                select: { id: true },
              }),
            ),
          ),
          coverImageId: optionalText(formData, 'coverImage'),
          status: status(formData),
        },
      });
    },
    async remove(id) {
      await prisma.projectCollection.delete({ where: { id } });
    },
    async reorder(ids) {
      await prisma.$transaction(
        ids.map((id, index) =>
          prisma.projectCollection.update({ where: { id }, data: { sortOrder: index } }),
        ),
      );
    },
  },

  /* --- Navigation -------------------------------------------------------- */
  navigation: {
    label: (formData) => text(formData, 'labelEn') || text(formData, 'labelAr'),
    async list() {
      const rows = await prisma.navigationItem.findMany({
        orderBy: [{ location: 'asc' }, { sortOrder: 'asc' }],
      });
      return rows.map((row) => ({
        id: row.id,
        title: `${row.labelEn || row.labelAr} → ${row.href}`,
        subtitle: `${row.location === 'HEADER' ? 'Header' : 'Footer'} · ${row.labelAr}${row.enabled ? '' : ' · hidden'}`,
        status: null,
        sortOrder: row.sortOrder,
        values: {
          labelAr: row.labelAr,
          labelEn: row.labelEn,
          href: row.href,
          location: row.location,
          isExternal: row.isExternal,
          enabled: row.enabled,
        },
        images: {},
      }));
    },
    async create(formData) {
      const label = pair(formData, 'label');
      const location = oneOf(formData, 'location', ['HEADER', 'FOOTER'] as const, 'HEADER');
      const count = await prisma.navigationItem.count({ where: { location } });

      const created = await prisma.navigationItem.create({
        data: {
          labelAr: label.ar ?? '',
          labelEn: label.en ?? '',
          href: text(formData, 'href') || '/',
          location,
          isExternal: checkbox(formData, 'isExternal'),
          enabled: checkbox(formData, 'enabled'),
          sortOrder: count,
        },
      });
      return created.id;
    },
    async update(id, formData) {
      const label = pair(formData, 'label');

      await prisma.navigationItem.update({
        where: { id },
        data: {
          labelAr: label.ar ?? '',
          labelEn: label.en ?? '',
          href: text(formData, 'href') || '/',
          location: oneOf(formData, 'location', ['HEADER', 'FOOTER'] as const, 'HEADER'),
          isExternal: checkbox(formData, 'isExternal'),
          enabled: checkbox(formData, 'enabled'),
        },
      });
    },
    async remove(id) {
      await prisma.navigationItem.delete({ where: { id } });
    },
    async reorder(ids) {
      await prisma.$transaction(
        ids.map((id, index) =>
          prisma.navigationItem.update({ where: { id }, data: { sortOrder: index } }),
        ),
      );
    },
  },
};

export function getResourceRepo(key: string): ResourceRepo | null {
  return RESOURCE_REPOS[key] ?? null;
}
