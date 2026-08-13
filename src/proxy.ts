import { NextResponse, type NextRequest } from 'next/server';

import { COOKIE_SESION, verificarSesion } from '@/lib/sesion';

/**
 * En Next.js 16 el antiguo `middleware.ts` se llama `proxy.ts`.
 *
 * Esto es solo la primera barrera: bloquea la navegación al panel. La
 * verificación que de verdad importa vive en `requerirSesion()`, porque el proxy
 * no corre en server actions.
 */
export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!pathname.startsWith('/admin')) return NextResponse.next();

  const sesion = await verificarSesion(req.cookies.get(COOKIE_SESION)?.value);
  const esLogin = pathname === '/admin/login';

  if (!sesion && !esLogin) {
    const url = req.nextUrl.clone();
    url.pathname = '/admin/login';
    url.searchParams.set('siguiente', pathname);
    return NextResponse.redirect(url);
  }

  if (sesion && esLogin) {
    const url = req.nextUrl.clone();
    url.pathname = '/admin';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
