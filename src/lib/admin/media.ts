import { prisma } from '@/lib/db';
import { storage } from '@/lib/storage';
import type { Prisma } from '@/generated/prisma/client';

/**
 * Every place a media asset can be referenced. Counting all of them is what
 * lets the library warn before deleting something that is still in use.
 */
const USAGE_COUNTS = {
  projectImages: true,
  projectOgImages: true,
  collectionCovers: true,
  sectorImages: true,
  serviceImages: true,
  timelineImages: true,
  capabilityImages: true,
  qualityImages: true,
  riskImages: true,
  homepageImages: true,
  pageHeroImages: true,
  pageOgImages: true,
  contentBlockImages: true,
  settingsLogoPrimary: true,
  settingsLogoDark: true,
  settingsLogoLight: true,
  settingsLogoMobile: true,
  settingsFavicon: true,
  settingsOgImage: true,
} as const satisfies Prisma.MediaAssetCountOutputTypeSelect;

const listSelect = {
  id: true,
  storageKey: true,
  originalName: true,
  mimeType: true,
  fileSize: true,
  width: true,
  height: true,
  blurDataUrl: true,
  altAr: true,
  altEn: true,
  captionAr: true,
  captionEn: true,
  focalX: true,
  focalY: true,
  mobileFocalX: true,
  mobileFocalY: true,
  createdAt: true,
  _count: { select: USAGE_COUNTS },
} satisfies Prisma.MediaAssetSelect;

export type MediaListItem = {
  id: string;
  url: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  width: number | null;
  height: number | null;
  blurDataUrl: string | null;
  altAr: string | null;
  altEn: string | null;
  captionAr: string | null;
  captionEn: string | null;
  focalX: number;
  focalY: number;
  mobileFocalX: number;
  mobileFocalY: number;
  createdAt: string;
  usageCount: number;
};

function totalUsage(counts: Record<string, number>): number {
  return Object.values(counts).reduce((sum, value) => sum + value, 0);
}

function toListItem(asset: Prisma.MediaAssetGetPayload<{ select: typeof listSelect }>): MediaListItem {
  const { _count, storageKey, createdAt, ...rest } = asset;
  return {
    ...rest,
    url: storage().url(storageKey),
    createdAt: createdAt.toISOString(),
    usageCount: totalUsage(_count as unknown as Record<string, number>),
  };
}

export const MEDIA_PAGE_SIZE = 48;

export async function listMediaAssets(options: {
  query?: string;
  page?: number;
  pageSize?: number;
  unusedOnly?: boolean;
} = {}): Promise<{ items: MediaListItem[]; total: number; page: number; pageCount: number }> {
  const pageSize = options.pageSize ?? MEDIA_PAGE_SIZE;
  const page = Math.max(1, options.page ?? 1);

  const query = options.query?.trim();
  const where: Prisma.MediaAssetWhereInput = query
    ? {
        OR: [
          { originalName: { contains: query, mode: 'insensitive' } },
          { altAr: { contains: query, mode: 'insensitive' } },
          { altEn: { contains: query, mode: 'insensitive' } },
          { captionAr: { contains: query, mode: 'insensitive' } },
          { captionEn: { contains: query, mode: 'insensitive' } },
        ],
      }
    : {};

  const [rows, total] = await Promise.all([
    prisma.mediaAsset.findMany({
      where,
      select: listSelect,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.mediaAsset.count({ where }),
  ]);

  let items = rows.map(toListItem);
  if (options.unusedOnly) items = items.filter((item) => item.usageCount === 0);

  return { items, total, page, pageCount: Math.max(1, Math.ceil(total / pageSize)) };
}

export async function getMediaAsset(id: string): Promise<MediaListItem | null> {
  const asset = await prisma.mediaAsset.findUnique({ where: { id }, select: listSelect });
  return asset ? toListItem(asset) : null;
}

export type UsageEntry = { type: string; label: string; count: number };

/** Human-readable breakdown of where an asset is used, for the delete warning. */
export async function getMediaUsage(id: string): Promise<UsageEntry[]> {
  const asset = await prisma.mediaAsset.findUnique({
    where: { id },
    select: { _count: { select: USAGE_COUNTS } },
  });
  if (!asset) return [];

  const labels: Record<string, string> = {
    projectImages: 'Project galleries',
    projectOgImages: 'Project social images',
    collectionCovers: 'Collection covers',
    sectorImages: 'Sectors',
    serviceImages: 'Services',
    timelineImages: 'Timeline entries',
    capabilityImages: 'Capabilities',
    qualityImages: 'Quality & Safety',
    riskImages: 'Risk management',
    homepageImages: 'Homepage sections',
    pageHeroImages: 'Page heroes',
    pageOgImages: 'Page social images',
    contentBlockImages: 'Content blocks',
    settingsLogoPrimary: 'Primary logo',
    settingsLogoDark: 'Dark logo',
    settingsLogoLight: 'Light logo',
    settingsLogoMobile: 'Mobile logo',
    settingsFavicon: 'Favicon',
    settingsOgImage: 'Default social image',
  };

  return Object.entries(asset._count as unknown as Record<string, number>)
    .filter(([, count]) => count > 0)
    .map(([type, count]) => ({ type, label: labels[type] ?? type, count }));
}

/** Compact list used by the image picker dialogs. */
export async function listMediaForPicker(query?: string): Promise<MediaListItem[]> {
  const { items } = await listMediaAssets({ query, pageSize: 60 });
  return items;
}
