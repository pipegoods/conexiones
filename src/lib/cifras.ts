import 'server-only';

import { sql } from 'drizzle-orm';

import { db, hayBaseDeDatos, ofertas, solicitudes } from '@/db';

export type Cifras = {
  recibidas: number;
  verificadas: number;
  conectadas: number;
  resueltas: number;
  voluntarios: number;
};

const CIFRAS_VACIAS: Cifras = {
  recibidas: 0,
  verificadas: 0,
  conectadas: 0,
  resueltas: 0,
  voluntarios: 0,
};

/**
 * Las cifras públicas del embudo. Son acumulativas a propósito: una necesidad
 * resuelta también fue verificada y conectada en su momento, así que sigue
 * contando en esas columnas. Así los números cuentan la historia del embudo y no
 * se "vacían" a medida que los casos avanzan.
 *
 * Nunca expone datos personales: solo conteos.
 */
export async function obtenerCifras(): Promise<Cifras> {
  if (!hayBaseDeDatos) return CIFRAS_VACIAS;

  try {
    const [solicitudesFila] = await db
      .select({
        recibidas: sql<number>`count(*) filter (where ${solicitudes.estado} <> 'descartada')::int`,
        verificadas: sql<number>`count(*) filter (where ${solicitudes.estado} in ('verificada','conectada','resuelta'))::int`,
        conectadas: sql<number>`count(*) filter (where ${solicitudes.estado} in ('conectada','resuelta'))::int`,
        resueltas: sql<number>`count(*) filter (where ${solicitudes.estado} = 'resuelta')::int`,
      })
      .from(solicitudes);

    const [ofertasFila] = await db
      .select({
        voluntarios: sql<number>`count(*) filter (where ${ofertas.estado} in ('nueva','verificada'))::int`,
      })
      .from(ofertas);

    return {
      recibidas: solicitudesFila?.recibidas ?? 0,
      verificadas: solicitudesFila?.verificadas ?? 0,
      conectadas: solicitudesFila?.conectadas ?? 0,
      resueltas: solicitudesFila?.resueltas ?? 0,
      voluntarios: ofertasFila?.voluntarios ?? 0,
    };
  } catch (error) {
    // La portada nunca debe caerse porque la base esté dormida o mal configurada:
    // es la puerta de entrada para alguien que necesita ayuda ya.
    console.error('[cifras] no se pudieron leer las cifras:', error);
    return CIFRAS_VACIAS;
  }
}
