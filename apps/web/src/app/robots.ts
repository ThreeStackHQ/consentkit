import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/domains', '/consent-logs', '/analytics', '/settings', '/billing', '/dashboard', '/api/'],
      },
    ],
    sitemap: 'https://consentkit.threestack.io/sitemap.xml',
  };
}
