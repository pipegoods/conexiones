import { randomBytes, scrypt as scryptCb, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCb) as (
  password: string,
  salt: Buffer,
  keylen: number,
) => Promise<Buffer>;

const LARGO_CLAVE = 64;

/**
 * scrypt de node:crypto en vez de bcrypt/argon2 a propósito: no necesita
 * compilación nativa, así el proyecto se instala igual en cualquier máquina del
 * equipo y en el servidor. Formato: scrypt$<salt hex>$<hash hex>.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await scrypt(password, salt, LARGO_CLAVE);
  return `scrypt$${salt.toString('hex')}$${hash.toString('hex')}`;
}

export async function verificarPassword(password: string, almacenado: string): Promise<boolean> {
  const [algoritmo, saltHex, hashHex] = almacenado.split('$');
  if (algoritmo !== 'scrypt' || !saltHex || !hashHex) return false;

  const salt = Buffer.from(saltHex, 'hex');
  const esperado = Buffer.from(hashHex, 'hex');
  const calculado = await scrypt(password, salt, esperado.length);

  if (calculado.length !== esperado.length) return false;
  return timingSafeEqual(calculado, esperado);
}
