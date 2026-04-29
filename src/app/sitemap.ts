import { MetadataRoute } from 'next'
import { CONFIG } from '@/src/config';
import { getAllHubs } from '@/src/actions/hubs';

const baseUrl = CONFIG.APP_URL || 'https://www.qareeb.cc';
// Arabic listed first to signal higher importance to Arabic search engines
const locales = ['ar', 'en'];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Static public pages — Arabic URLs come first for search engine prioritization
  const staticPages: Array<{ path: string; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']; priority: number }> = [
    { path: '', changeFrequency: 'daily', priority: 1.0 },
    { path: '/hubs', changeFrequency: 'daily', priority: 0.9 },
    { path: '/about', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/contact', changeFrequency: 'monthly', priority: 0.6 },
    { path: '/submit', changeFrequency: 'monthly', priority: 0.5 },
  ];

  const staticRoutes: MetadataRoute.Sitemap = staticPages.flatMap(({ path, changeFrequency, priority }) =>
    locales.map(locale => ({
      url: `${baseUrl}/${locale}${path}`,
      lastModified: now,
      changeFrequency,
      priority,
    }))
  );

  // Dynamic hub pages
  let hubRoutes: MetadataRoute.Sitemap = [];
  try {
    const res = await getAllHubs('en');
    const hubs = Array.isArray(res.data) ? res.data : [];
    const approvedHubs = hubs.filter((h: any) => h.status === 'approved' && h.slug);

    hubRoutes = approvedHubs.flatMap((hub: any) =>
      locales.map(locale => ({
        url: `${baseUrl}/${locale}/hubs/${hub.slug}`,
        lastModified: hub.updated_at ? new Date(hub.updated_at) : now,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }))
    );
  } catch {
    // If the API is unreachable during build, skip dynamic routes
  }

  return [...staticRoutes, ...hubRoutes];
}
