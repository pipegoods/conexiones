import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';

import * as schema from './schema';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  // Do not throw here: `next build` imports this module and the site must build
  // without a database. Query callers handle failures gracefully.
  console.warn('[db] Falta DATABASE_URL. Copia .env.example a .env.local y pega la cadena de Neon.');
}

/**
 * Use the WebSocket neon-serverless driver rather than HTTP because the panel
 * needs transactions: a request status change and its log event must commit together.
 */
const pool = new Pool({ connectionString: connectionString ?? 'postgres://sin-configurar' });

export const db = drizzle({ client: pool, schema });

export const hasDatabase = Boolean(connectionString);

export * from './schema';
