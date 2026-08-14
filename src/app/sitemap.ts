import type { MetadataRoute } from 'next';

import { absoluteUrl } from '@/lib/site';

const PUBLIC_ROUTES: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
  priority: number;
}> = [
  { path: '/', changeFrequency: 'daily', priority: 1 },
  { path: '/necesito-ayuda', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/quiero-ayudar', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/privacidad', changeFrequency: 'monthly', priority: 0.4 },
  { path: '/terminos', changeFrequency: 'monthly', priority: 0.4 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return PUBLIC_ROUTES.map(({ path, changeFrequency, priority }) => ({
    url: absoluteUrl(path).href,
    lastModified,
    changeFrequency,
    priority,
  }));
}
