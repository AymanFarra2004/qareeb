import { MetadataRoute } from 'next'
import { CONFIG } from '@/src/config'
;

const baseUrl = CONFIG.APP_URL;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/dashboard', '/auth', '/api'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
