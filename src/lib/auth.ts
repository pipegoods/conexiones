import 'server-only';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { SESSION_COOKIE, signSession, verifySession, type Session } from './session';

export async function startSession(session: Session): Promise<void> {
  const token = await signSession(session);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 8,
  });
}

export async function endSession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  return verifySession(store.get(SESSION_COOKIE)?.value);
}

/**
 * Use at the start of every panel page and server action. `proxy.ts` blocks
 * navigation, but this verification provides the actual protection because the
 * proxy does not execute in server actions.
 */
export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) redirect('/admin/login');
  return session;
}
