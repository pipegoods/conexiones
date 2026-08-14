import { SignJWT, jwtVerify } from 'jose';

import type { Role } from './catalogs';

/**
 * Internal-panel session stored in a signed JWT HS256 cookie.
 *
 * This file must not import `node:crypto` or the database driver: `proxy.ts`
 * runs in the Edge runtime and can only use Web Crypto, which jose uses internally.
 */

export const SESSION_COOKIE = 'conexiones_session';
const SESSION_DURATION = '8h';

export type Session = {
  userId: string;
  name: string;
  email: string;
  role: Role;
};

function secretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      'SESSION_SECRET falta o es muy corto. Genera uno con: openssl rand -base64 32',
    );
  }
  return new TextEncoder().encode(secret);
}

export async function signSession(session: Session): Promise<string> {
  return new SignJWT({ ...session })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(SESSION_DURATION)
    .sign(secretKey());
}

export async function verifySession(token: string | undefined): Promise<Session | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    if (!payload.userId || !payload.role) return null;
    return {
      userId: String(payload.userId),
      name: String(payload.name ?? ''),
      email: String(payload.email ?? ''),
      role: payload.role as Role,
    };
  } catch {
    return null;
  }
}
