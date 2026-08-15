import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/**
 * When media is served from an object-storage domain (Cloudflare R2), that
 * origin has to be allow-listed for next/image. With STORAGE_DRIVER=local the
 * images are same-origin and no pattern is needed.
 */
function mediaRemotePatterns() {
  const publicUrl = process.env.R2_PUBLIC_URL?.trim();
  if (!publicUrl) return [];

  try {
    const { protocol, hostname, port } = new URL(publicUrl);
    return [
      {
        protocol: protocol.replace(':', '') as 'http' | 'https',
        hostname,
        port: port || undefined,
        pathname: '/**',
      },
    ];
  } catch {
    return [];
  }
}

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  // The dev server only serves its client chunks to recognised origins; without
  // this, opening the site on 127.0.0.1 or a LAN address returns 403 for those
  // chunks and the page never becomes interactive. Development only.
  allowedDevOrigins: ['127.0.0.1', 'localhost'],

  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [390, 640, 750, 828, 1080, 1200, 1440, 1920, 2048, 2560],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: mediaRemotePatterns(),
  },

  experimental: {
    serverActions: {
      // Editor forms carry many bilingual fields; uploads go through the
      // dedicated route handler instead, which is not bound by this limit.
      bodySizeLimit: '2mb',
    },
  },

  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default withNextIntl(nextConfig);
