import type { Metadata } from 'next';
import Link from 'next/link';

import { Logo } from '@/components/Logo';

import { LoginForm } from './LoginForm';

export const metadata: Metadata = {
  title: 'Panel interno',
  robots: { index: false, follow: false },
};

export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <main className="grid min-h-dvh place-items-center bg-nube px-4 py-10 sm:px-5 sm:py-12">
      <div className="w-full max-w-sm">
        <div className="flex justify-center">
          <Logo />
        </div>

        <div className="mt-8 rounded-3xl bg-white p-6 shadow-xl ring-1 ring-neutral-100 sm:p-8">
          <h1 className="text-xl font-extrabold tracking-tight">Panel interno</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Solo para el equipo de verificación y conexión.
          </p>

          <div className="mt-7">
            <LoginForm next={next} />
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-neutral-500">
          <Link href="/" className="hover:text-marca-morado">
            ← Volver al sitio público
          </Link>
        </p>
      </div>
    </main>
  );
}
