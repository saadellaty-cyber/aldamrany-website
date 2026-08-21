'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { AuthorizationError, requireAdminAction, requireUserAction } from '@/lib/auth/guard';
import {
  checkbox,
  fail,
  logActivity,
  ok,
  oneOf,
  optionalText,
  text,
  type ActionResult,
} from '@/lib/admin/forms';
import { ADMIN_LOCALES } from '@/lib/admin/i18n';
import { ARABIC_FONT_KEYS, DEFAULT_ARABIC_FONT } from '@/lib/fonts-catalog';
import { normalizePhone } from '@/lib/utils';
import type { SocialPlatform } from '@/generated/prisma/enums';

const SETTINGS_ID = 'default';

/** Saves the singleton site configuration row. */
export async function updateSiteSettings(
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  let user;
  try {
    user = await requireUserAction();
  } catch (error) {
    return fail(error instanceof AuthorizationError ? error.message : 'Not authorised.');
  }

  const whatsappRaw = optionalText(formData, 'whatsappNumber');
  const whatsappDigits = whatsappRaw ? normalizePhone(whatsappRaw) : null;

  if (whatsappRaw && (!whatsappDigits || whatsappDigits.length < 8)) {
    return fail('Enter the WhatsApp number in full international format, for example 201234567890.', {
      whatsappNumber: 'Invalid number.',
    });
  }

  const mapsUrl = optionalText(formData, 'googleMapsUrl');
  if (mapsUrl && !/^https?:\/\//i.test(mapsUrl)) {
    return fail('The Google Maps link must start with https://', {
      googleMapsUrl: 'Invalid link.',
    });
  }

  const data = {
    companyNameAr: optionalText(formData, 'companyNameAr'),
    companyNameEn: optionalText(formData, 'companyNameEn'),
    taglineAr: optionalText(formData, 'taglineAr'),
    taglineEn: optionalText(formData, 'taglineEn'),

    phone: optionalText(formData, 'phone'),
    mobile: optionalText(formData, 'mobile'),
    email: optionalText(formData, 'email')?.toLowerCase() ?? null,
    whatsappNumber: whatsappDigits,
    whatsappFloatingEnabled: checkbox(formData, 'whatsappFloatingEnabled'),

    headOfficeAr: optionalText(formData, 'headOfficeAr'),
    headOfficeEn: optionalText(formData, 'headOfficeEn'),
    branchAr: optionalText(formData, 'branchAr'),
    branchEn: optionalText(formData, 'branchEn'),
    googleMapsUrl: mapsUrl,

    logoPrimaryId: optionalText(formData, 'logoPrimary'),
    logoDarkId: optionalText(formData, 'logoDark'),
    logoLightId: optionalText(formData, 'logoLight'),
    logoMobileId: optionalText(formData, 'logoMobile'),
    faviconId: optionalText(formData, 'favicon'),

    defaultSeoTitleAr: optionalText(formData, 'defaultSeoTitleAr'),
    defaultSeoTitleEn: optionalText(formData, 'defaultSeoTitleEn'),
    defaultSeoDescriptionAr: optionalText(formData, 'defaultSeoDescriptionAr'),
    defaultSeoDescriptionEn: optionalText(formData, 'defaultSeoDescriptionEn'),
    ogImageId: optionalText(formData, 'ogImage'),

    showIcons: checkbox(formData, 'showIcons'),
    arabicFont: oneOf(formData, 'arabicFont', ARABIC_FONT_KEYS, DEFAULT_ARABIC_FONT),
    adminLocale: oneOf(formData, 'adminLocale', ADMIN_LOCALES, 'ar'),

    analyticsId: optionalText(formData, 'analyticsId'),
    googleVerification: optionalText(formData, 'googleVerification'),
    maintenanceMode: checkbox(formData, 'maintenanceMode'),
  };

  await prisma.siteSetting.upsert({
    where: { id: SETTINGS_ID },
    update: data,
    create: { id: SETTINGS_ID, ...data },
  });

  await logActivity(user, {
    action: 'UPDATE',
    entityType: 'SiteSetting',
    entityId: SETTINGS_ID,
    summary: 'Updated site settings',
  });

  revalidatePath('/admin/settings');
  revalidatePath('/', 'layout');

  return ok('Settings saved.');
}

const PLATFORMS: SocialPlatform[] = ['FACEBOOK', 'INSTAGRAM', 'LINKEDIN', 'YOUTUBE', 'TIKTOK', 'X'];

/**
 * Saves the social profile URLs. An empty field clears the link, which removes
 * the icon from the site — nothing is ever invented.
 */
export async function updateSocialLinks(
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  let user;
  try {
    user = await requireUserAction();
  } catch (error) {
    return fail(error instanceof AuthorizationError ? error.message : 'Not authorised.');
  }

  const errors: Record<string, string> = {};
  const updates: Array<{ platform: SocialPlatform; url: string | null }> = [];

  for (const platform of PLATFORMS) {
    const raw = text(formData, platform);
    if (!raw) {
      updates.push({ platform, url: null });
      continue;
    }
    if (!/^https?:\/\/\S+$/i.test(raw)) {
      errors[platform] = 'Enter a full link starting with https://';
      continue;
    }
    updates.push({ platform, url: raw });
  }

  if (Object.keys(errors).length > 0) {
    return fail('Please correct the highlighted links.', errors);
  }

  await prisma.$transaction(
    updates.map((entry, index) =>
      prisma.socialLink.upsert({
        where: { platform: entry.platform },
        update: { url: entry.url },
        create: { platform: entry.platform, url: entry.url, sortOrder: index },
      }),
    ),
  );

  await logActivity(user, {
    action: 'UPDATE',
    entityType: 'SocialLink',
    summary: 'Updated social media links',
  });

  revalidatePath('/admin/social');
  revalidatePath('/', 'layout');

  return ok('Social links saved.');
}

/** Maintenance mode is an administrator-only switch. */
export async function toggleMaintenanceMode(formData: FormData): Promise<void> {
  const user = await requireAdminAction();
  const enabled = checkbox(formData, 'maintenanceMode');

  await prisma.siteSetting.upsert({
    where: { id: SETTINGS_ID },
    update: { maintenanceMode: enabled },
    create: { id: SETTINGS_ID, maintenanceMode: enabled },
  });

  await logActivity(user, {
    action: 'UPDATE',
    entityType: 'SiteSetting',
    summary: `Maintenance mode turned ${enabled ? 'on' : 'off'}`,
  });

  revalidatePath('/admin/settings');
  revalidatePath('/', 'layout');
}
