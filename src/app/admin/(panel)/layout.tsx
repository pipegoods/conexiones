import type { Metadata } from 'next';
import Link from 'next/link';

import { logOut } from '@/app/admin/actions';
import { Logo } from '@/components/Logo';
import { requireSession } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Panel interno',
  robots: { index: false, follow: false },
};

const NAV = [
  { href: '/admin', text: 'Resumen' },
  { href: '/admin/solicitudes', text: 'Solicitudes' },
  { href: '/admin/ofertas', text: 'Voluntarios' },
];

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();

  return (
    <div className="min-h-dvh bg-nube">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5">
          <div className="flex items-center gap-8">
            <Link href="/admin" aria-label="Panel de Conexiones">
              <Logo showText={false} />
            </Link>
            <nav className="flex items-center gap-6" aria-label="Secciones del panel">
              {NAV.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className="text-sm font-semibold text-neutral-600 transition hover:text-marca-morado"
                >
                  {n.text}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-neutral-500 sm:block">
              {session.name}
              {session.role === 'admin' && (
                <span className="ml-2 rounded-full bg-violet-100 px-2 py-0.5 text-xs font-bold text-marca-morado">
                  admin
                </span>
              )}
            </span>
            <form action={logOut}>
              <button
                type="submit"
                className="rounded-full border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-600 transition hover:bg-neutral-50"
              >
                Salir
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-8">{children}</main>
    </div>
  );
}
