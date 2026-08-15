import type { Metadata } from 'next';
import { getSiteSettings } from '@/lib/content/site';
import { getCurrentUser } from '@/lib/auth/guard';
import { storage } from '@/lib/storage';
import { SiteSettingsForm, type SiteSettingsValues } from '@/components/admin/SiteSettingsForm';
import { PageHeading } from '@/components/admin/ui';
import type { MediaAsset } from '@/generated/prisma/client';

export const metadata: Metadata = { title: 'Site Settings' };

function toImage(asset: MediaAsset | null) {
  return asset
    ? { id: asset.id, url: storage().url(asset.storageKey), name: asset.originalName }
    : null;
}

export default async function SettingsPage() {
  const [settings, user] = await Promise.all([getSiteSettings(), getCurrentUser()]);

  const values: SiteSettingsValues = {
    companyNameAr: settings.companyNameAr,
    companyNameEn: settings.companyNameEn,
    taglineAr: settings.taglineAr,
    taglineEn: settings.taglineEn,
    phone: settings.phone,
    mobile: settings.mobile,
    email: settings.email,
    whatsappNumber: settings.whatsappNumber,
    whatsappFloatingEnabled: settings.whatsappFloatingEnabled,
    headOfficeAr: settings.headOfficeAr,
    headOfficeEn: settings.headOfficeEn,
    branchAr: settings.branchAr,
    branchEn: settings.branchEn,
    googleMapsUrl: settings.googleMapsUrl,
    defaultSeoTitleAr: settings.defaultSeoTitleAr,
    defaultSeoTitleEn: settings.defaultSeoTitleEn,
    defaultSeoDescriptionAr: settings.defaultSeoDescriptionAr,
    defaultSeoDescriptionEn: settings.defaultSeoDescriptionEn,
    analyticsId: settings.analyticsId,
    googleVerification: settings.googleVerification,
    maintenanceMode: settings.maintenanceMode,
    logoPrimary: toImage(settings.logoPrimary),
    logoDark: toImage(settings.logoDark),
    logoLight: toImage(settings.logoLight),
    logoMobile: toImage(settings.logoMobile),
    favicon: toImage(settings.favicon),
    ogImage: toImage(settings.ogImage),
  };

  return (
    <>
      <PageHeading
        title="Site Settings"
        description="Company details, contact channels, logo and search-engine defaults for the whole website."
        breadcrumbs={[{ label: 'Configuration' }, { label: 'Site Settings' }]}
      />

      <SiteSettingsForm values={values} canToggleMaintenance={user?.role === 'ADMIN'} />
    </>
  );
}
