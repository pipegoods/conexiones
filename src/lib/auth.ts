import 'server-only';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { COOKIE_SESION, firmarSesion, verificarSesion, type Sesion } from './sesion';

export async function iniciarSesion(sesion: Sesion): Promise<void> {
  const token = await firmarSesion(sesion);
  const store = await cookies();
  store.set(COOKIE_SESION, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 8,
  });
}

export async function cerrarSesion(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_SESION);
}

export async function obtenerSesion(): Promise<Sesion | null> {
  const store = await cookies();
  return verificarSesion(store.get(COOKIE_SESION)?.value);
}

/**
 * Para usar al inicio de cada página y cada server action del panel.
 * `proxy.ts` ya bloquea el acceso, pero esta verificación es la que realmente
 * protege: el proxy no se ejecuta en las server actions.
 */
export async function requerirSesion(): Promise<Sesion> {
  const sesion = await obtenerSesion();
  if (!sesion) redirect('/admin/login');
  return sesion;
}
