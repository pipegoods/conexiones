'use client';

import Link from 'next/link';
import { useCallback, useEffect, useId, useRef, useState } from 'react';

import { Logo } from './Logo';

const LINKS = [
  { href: '/#como-funciona', text: 'Cómo funciona' },
  { href: '/#sobre-nosotros', text: 'Sobre nosotros' },
  { href: '/#transparencia', text: 'Transparencia' },
  { href: '/#preguntas', text: 'Preguntas' },
];

const ctaClassName =
  'rounded-full bg-linear-to-r from-marca-rosa to-marca-morado px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-marca-rosa/25 transition hover:brightness-110 active:scale-[0.98] sm:px-6 sm:py-3';

export function Header() {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    menuButtonRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        close();
        return;
      }

      if (event.key !== 'Tab' || !menuRef.current) return;

      const focusables = Array.from(
        menuRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'),
      );
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';

    const firstLink = menuRef.current?.querySelector<HTMLElement>('a[href]');
    firstLink?.focus();

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, close]);

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-100 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:h-20 sm:px-5">
        <Link href="/" aria-label="Conexiones, ir al inicio">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Navegación principal">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-semibold text-neutral-700 transition hover:text-marca-morado"
            >
              {link.text}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/quiero-ayudar" className={`hidden sm:inline-flex ${ctaClassName}`}>
            Quiero ayudar
          </Link>

          <button
            ref={menuButtonRef}
            type="button"
            className="grid h-10 w-10 place-items-center rounded-xl border border-neutral-200 text-neutral-700 transition hover:border-marca-morado hover:text-marca-morado lg:hidden"
            aria-expanded={open}
            aria-controls={menuId}
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {open && (
        <>
          <div
            className="fixed inset-0 top-16 z-40 bg-black/20 sm:top-20 lg:hidden"
            aria-hidden="true"
            onClick={close}
          />
          <nav
            id={menuId}
            ref={menuRef}
            className="fixed inset-x-0 top-16 z-50 max-h-[calc(100dvh-4rem)] overflow-y-auto border-b border-neutral-100 bg-white px-4 py-5 shadow-lg sm:top-20 sm:max-h-[calc(100dvh-5rem)] lg:hidden"
            aria-label="Navegación principal"
          >
            <ul className="space-y-1">
              {LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={close}
                    className="block rounded-xl px-4 py-3 text-base font-semibold text-neutral-700 transition hover:bg-violet-50 hover:text-marca-morado"
                  >
                    {link.text}
                  </Link>
                </li>
              ))}
            </ul>

            <Link href="/quiero-ayudar" onClick={close} className={`mt-4 block w-full text-center ${ctaClassName}`}>
              Quiero ayudar
            </Link>
          </nav>
        </>
      )}
    </header>
  );
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
    </svg>
  );
}
