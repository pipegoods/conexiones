import { NextResponse, type NextRequest } from 'next/server';

import { SESSION_COOKIE, verifySession } from '@/lib/session';

/**
 * In Next.js 16, the former `middleware.ts` is named `proxy.ts`.
 *
 * This is only the first barrier: it blocks panel navigation. The essential
 * verification lives in `requireSession()` because proxies do not run in server actions.
 */
export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!pathname.startsWith('/admin')) return NextResponse.next();

  const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
  const isLoginPage = pathname === '/admin/login';

  if (!session && !isLoginPage) {
    const url = req.nextUrl.clone();
    url.pathname = '/admin/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  if (session && isLoginPage) {
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
