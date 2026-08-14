import type { Metadata } from 'next';

export const SITE_NAME = 'Conexiones';
export const SITE_TAGLINE = 'Conectamos para ayudar';
export const SITE_DESCRIPTION =
  'Conectamos necesidades reales con personas que tienen algo para aportar: tiempo, conocimiento, recursos, herramientas o capacidades. Gratuito, seguro y transparente.';
export const SITE_OG_DESCRIPTION =
  'Cuando algo ocurre, todos nos conectamos. Registra lo que necesitas o pon a disposición lo que puedes aportar.';
export const SITE_LOCALE = 'es_CO';
export const SITE_KEYWORDS = [
  'ayuda humanitaria',
  'voluntarios',
  'emergencias',
  'Colombia',
  'conectar ayuda',
  'donaciones',
  'solidaridad',
  'necesidades',
];

/** Public URL used for metadata, sitemap, and robots. */
export function siteUrl(): URL {
  try {
    return new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000');
  } catch {
    return new URL('http://localhost:3000');
  }
}

export function absoluteUrl(path = '/'): URL {
  return new URL(path, siteUrl());
}

/** Shared metadata for public marketing and form pages. */
export function publicPageMetadata(
  title: string,
  description: string,
  pathname: string,
): Metadata {
  const pageTitle = `${title} · ${SITE_NAME}`;

  return {
    title,
    description,
    alternates: {
      canonical: pathname,
    },
    openGraph: {
      title: pageTitle,
      description,
      url: pathname,
      siteName: SITE_NAME,
      locale: SITE_LOCALE,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description,
    },
  };
}
