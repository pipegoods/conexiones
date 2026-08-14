import { randomBytes, scrypt as scryptCb, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCb) as (
  password: string,
  salt: Buffer,
  keylen: number,
) => Promise<Buffer>;

const PASSWORD_HASH_LENGTH = 64;

/**
 * node:crypto scrypt is intentionally used instead of bcrypt or argon2 because
 * it needs no native compilation. Format: scrypt$<salt hex>$<hash hex>.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await scrypt(password, salt, PASSWORD_HASH_LENGTH);
  return `scrypt$${salt.toString('hex')}$${hash.toString('hex')}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [algorithm, saltHex, hashHex] = stored.split('$');
  if (algorithm !== 'scrypt' || !saltHex || !hashHex) return false;

  const salt = Buffer.from(saltHex, 'hex');
  const expected = Buffer.from(hashHex, 'hex');
  const calculated = await scrypt(password, salt, expected.length);

  if (calculated.length !== expected.length) return false;
  return timingSafeEqual(calculated, expected);
}
