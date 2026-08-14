import Link from 'next/link';

import { Logo } from './Logo';

const LINKS = [
  { href: '/#como-funciona', text: 'Cómo funciona' },
  { href: '/#sobre-nosotros', text: 'Sobre nosotros' },
  { href: '/#transparencia', text: 'Transparencia' },
  { href: '/#preguntas', text: 'Preguntas' },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-neutral-100 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between gap-4 px-5">
        <Link href="/" aria-label="Conexiones, ir al inicio">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Navegación principal">
          {LINKS.map((e) => (
            <Link
              key={e.href}
              href={e.href}
              className="text-sm font-semibold text-neutral-700 transition hover:text-marca-morado"
            >
              {e.text}
            </Link>
          ))}
        </nav>

        <Link
          href="/quiero-ayudar"
          className="rounded-full bg-linear-to-r from-marca-rosa to-marca-morado px-6 py-3 text-sm font-bold text-white shadow-lg shadow-marca-rosa/25 transition hover:brightness-110 active:scale-[0.98]"
        >
          Quiero ayudar
        </Link>
      </div>
    </header>
  );
}
