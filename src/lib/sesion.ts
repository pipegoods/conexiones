import { SignJWT, jwtVerify } from 'jose';

import type { Rol } from './catalogos';

/**
 * Sesión del panel interno en una cookie firmada (JWT HS256).
 *
 * Este archivo NO puede importar `node:crypto` ni el driver de base de datos:
 * `proxy.ts` corre en el runtime edge y solo puede usar Web Crypto, que es lo
 * que usa jose por debajo.
 */

export const COOKIE_SESION = 'conexiones_sesion';
const DURACION_SESION = '8h';

export type Sesion = {
  usuarioId: string;
  nombre: string;
  email: string;
  rol: Rol;
};

function claveSecreta(): Uint8Array {
  const secreto = process.env.SESSION_SECRET;
  if (!secreto || secreto.length < 16) {
    throw new Error(
      'SESSION_SECRET falta o es muy corto. Genera uno con: openssl rand -base64 32',
    );
  }
  return new TextEncoder().encode(secreto);
}

export async function firmarSesion(sesion: Sesion): Promise<string> {
  return new SignJWT({ ...sesion })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(DURACION_SESION)
    .sign(claveSecreta());
}

export async function verificarSesion(token: string | undefined): Promise<Sesion | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, claveSecreta());
    if (!payload.usuarioId || !payload.rol) return null;
    return {
      usuarioId: String(payload.usuarioId),
      nombre: String(payload.nombre ?? ''),
      email: String(payload.email ?? ''),
      rol: payload.rol as Rol,
    };
  } catch {
    return null;
  }
}
