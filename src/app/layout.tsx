import type { Metadata, Viewport } from 'next';
import { Geist } from 'next/font/google';

import './globals.css';

const geist = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

let metadataBaseUrl: URL;
try {
  metadataBaseUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000');
} catch {
  metadataBaseUrl = new URL('http://localhost:3000');
}

export const metadata: Metadata = {
  metadataBase: metadataBaseUrl,
  title: {
    default: 'Conexiones — Conectamos para ayudar',
    template: '%s · Conexiones',
  },
  description:
    'Conectamos necesidades reales con personas que tienen algo para aportar: tiempo, conocimiento, recursos, herramientas o capacidades. Gratuito, seguro y transparente.',
  openGraph: {
    title: 'Conexiones — Conectamos para ayudar',
    description:
      'Cuando algo ocurre, todos nos conectamos. Registra lo que necesitas o pon a disposición lo que puedes aportar.',
    locale: 'es_CO',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: '#7c3aed',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-CO">
      <body className={`${geist.variable} antialiased`}>{children}</body>
    </html>
  );
}
