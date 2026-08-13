import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';

import * as schema from './schema';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  // A propósito no lanzamos aquí: `next build` importa este módulo y el sitio
  // debe poder compilarse sin base de datos. Quien consulta se encarga de fallar
  // con gracia (ver `obtenerCifras`).
  console.warn('[db] Falta DATABASE_URL. Copia .env.example a .env.local y pega la cadena de Neon.');
}

/**
 * Usamos el driver por WebSocket (neon-serverless) y no el HTTP, porque el panel
 * necesita transacciones: cambiar el estado de una solicitud y escribir su evento
 * en la bitácora tienen que pasar juntos o no pasar.
 */
const pool = new Pool({ connectionString: connectionString ?? 'postgres://sin-configurar' });

export const db = drizzle({ client: pool, schema });

export const hayBaseDeDatos = Boolean(connectionString);

export * from './schema';
