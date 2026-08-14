import Link from 'next/link';
import type { Metadata } from 'next';

import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { SITE_NAME } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Página no encontrada',
  description: 'La página que buscas no existe o ya no está disponible en Conexiones.',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-5 py-20 text-center">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-marca-morado">Error 404</p>
        <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-tinta md:text-5xl">
          No encontramos esta página
        </h1>
        <p className="mt-4 text-lg text-neutral-600">
          Puede que el enlace esté roto o que la página haya cambiado. {SITE_NAME} sigue activo para
          conectar quien necesita ayuda con quien puede aportar.
        </p>
        <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <Link
            href="/"
            className="rounded-full bg-linear-to-r from-marca-rosa to-marca-morado px-7 py-3 text-center text-sm font-bold text-white shadow-lg shadow-marca-rosa/25 transition hover:brightness-110"
          >
            Ir al inicio
          </Link>
          <Link
            href="/necesito-ayuda"
            className="rounded-full border border-neutral-200 px-7 py-3 text-center text-sm font-bold text-neutral-800 transition hover:border-marca-morado hover:text-marca-morado"
          >
            Necesito ayuda
          </Link>
          <Link
            href="/quiero-ayudar"
            className="rounded-full border border-neutral-200 px-7 py-3 text-center text-sm font-bold text-neutral-800 transition hover:border-marca-morado hover:text-marca-morado"
          >
            Quiero ayudar
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
