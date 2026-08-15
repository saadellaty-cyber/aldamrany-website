import type { MetadataRoute } from 'next';
import { getSiteSettings } from '@/lib/content/site';
import { env } from '@/lib/env';

export const dynamic = 'force-dynamic';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const settings = await getSiteSettings();

  // While maintenance mode is on, keep the whole site out of the index.
  if (settings.maintenanceMode) {
    return { rules: [{ userAgent: '*', disallow: '/' }] };
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/admin/', '/api/'],
      },
    ],
    sitemap: `${env.siteUrl}/sitemap.xml`,
    host: env.siteUrl,
  };
}
