import 'server-only';

import { and, count, desc, eq, ilike, inArray, or, sql } from 'drizzle-orm';

import { conexiones, db, eventos, ofertas, solicitudes } from '@/db';
import type { Conexion, Evento, Oferta, Solicitud } from '@/db/schema';
import type { EstadoOferta, EstadoSolicitud } from './catalogos';
import { sugerenciasParaSolicitud, type Sugerencia } from './matching';

/** Cuántas ofertas activas traemos como máximo para puntuar en memoria. */
const TOPE_CANDIDATOS = 500;

export const POR_PAGINA = 25;

/* ------------------------------------------------------------ Solicitudes -- */

export type FiltrosSolicitudes = {
  estado?: EstadoSolicitud;
  busqueda?: string;
  pagina?: number;
};

export async function listarSolicitudes({ estado, busqueda, pagina = 1 }: FiltrosSolicitudes) {
  const condiciones = [];
  if (estado) condiciones.push(eq(solicitudes.estado, estado));
  if (busqueda?.trim()) {
    const patron = `%${busqueda.trim()}%`;
    condiciones.push(
      or(
        ilike(solicitudes.nombre, patron),
        ilike(solicitudes.telefono, patron),
        ilike(solicitudes.municipio, patron),
        ilike(solicitudes.descripcion, patron),
      ),
    );
  }
  const donde = condiciones.length ? and(...condiciones) : undefined;

  const [filas, [total]] = await Promise.all([
    db
      .select()
      .from(solicitudes)
      .where(donde)
      // Primero lo urgente y sin atender; dentro de eso, lo más viejo primero:
      // en una emergencia, quien lleva más tiempo esperando va de primero.
      .orderBy(
        sql`case ${solicitudes.estado}
              when 'recibida' then 0
              when 'contactada' then 1
              when 'verificada' then 2
              when 'conectada' then 3
              when 'resuelta' then 4
              else 5 end`,
        sql`case ${solicitudes.urgencia}
              when 'inmediata' then 0
              when 'hoy' then 1
              when 'esta_semana' then 2
              else 3 end`,
        solicitudes.creadoEn,
      )
      .limit(POR_PAGINA)
      .offset((pagina - 1) * POR_PAGINA),
    db.select({ n: count() }).from(solicitudes).where(donde),
  ]);

  return { filas, total: total?.n ?? 0, pagina, paginas: Math.max(1, Math.ceil((total?.n ?? 0) / POR_PAGINA)) };
}

export type SolicitudCompleta = {
  solicitud: Solicitud;
  conexiones: { conexion: Conexion; oferta: Oferta }[];
  bitacora: Evento[];
};

export async function obtenerSolicitud(id: string): Promise<SolicitudCompleta | null> {
  const [solicitud] = await db.select().from(solicitudes).where(eq(solicitudes.id, id)).limit(1);
  if (!solicitud) return null;

  const [vinculos, bitacora] = await Promise.all([
    db
      .select({ conexion: conexiones, oferta: ofertas })
      .from(conexiones)
      .innerJoin(ofertas, eq(conexiones.ofertaId, ofertas.id))
      .where(eq(conexiones.solicitudId, id))
      .orderBy(desc(conexiones.creadoEn)),
    db
      .select()
      .from(eventos)
      .where(and(eq(eventos.entidad, 'solicitud'), eq(eventos.entidadId, id)))
      .orderBy(desc(eventos.creadoEn)),
  ]);

  return { solicitud, conexiones: vinculos, bitacora };
}

/**
 * Candidatos sugeridos para una solicitud.
 *
 * Pre-filtramos en SQL lo obvio (voluntarios activos, mismo departamento o gente
 * que dijo que va a cualquier lado) y puntuamos en memoria. Con los volúmenes de
 * una emergencia local esto sobra; si algún día son decenas de miles, este es el
 * punto donde el cálculo se baja a SQL o a PostGIS.
 */
export async function sugerenciasPara(solicitud: Solicitud): Promise<Sugerencia[]> {
  const candidatos = await db
    .select()
    .from(ofertas)
    .where(
      and(
        inArray(ofertas.estado, ['nueva', 'verificada'] satisfies EstadoOferta[]),
        or(eq(ofertas.departamento, solicitud.departamento), eq(ofertas.radioKm, 999)),
      ),
    )
    .orderBy(desc(ofertas.estado), desc(ofertas.creadoEn))
    .limit(TOPE_CANDIDATOS);

  const idsCandidatos = candidatos.map((o) => o.id);

  const [vinculadas, cargas] = await Promise.all([
    db
      .select({ ofertaId: conexiones.ofertaId })
      .from(conexiones)
      .where(eq(conexiones.solicitudId, solicitud.id)),
    idsCandidatos.length
      ? db
          .select({ ofertaId: conexiones.ofertaId, n: count() })
          .from(conexiones)
          .where(
            and(
              inArray(conexiones.ofertaId, idsCandidatos),
              inArray(conexiones.estado, ['propuesta', 'aceptada']),
            ),
          )
          .groupBy(conexiones.ofertaId)
      : Promise.resolve([]),
  ]);

  return sugerenciasParaSolicitud(solicitud, candidatos, {
    yaVinculadas: new Set(vinculadas.map((v) => v.ofertaId)),
    carga: new Map(cargas.map((c) => [c.ofertaId, c.n])),
  });
}

/* ----------------------------------------------------------------- Ofertas -- */

export async function listarOfertas({
  estado,
  busqueda,
  pagina = 1,
}: {
  estado?: EstadoOferta;
  busqueda?: string;
  pagina?: number;
}) {
  const condiciones = [];
  if (estado) condiciones.push(eq(ofertas.estado, estado));
  if (busqueda?.trim()) {
    const patron = `%${busqueda.trim()}%`;
    condiciones.push(
      or(
        ilike(ofertas.nombre, patron),
        ilike(ofertas.telefono, patron),
        ilike(ofertas.municipio, patron),
        ilike(ofertas.descripcion, patron),
        ilike(ofertas.organizacion, patron),
      ),
    );
  }
  const donde = condiciones.length ? and(...condiciones) : undefined;

  const [filas, [total]] = await Promise.all([
    db
      .select()
      .from(ofertas)
      .where(donde)
      .orderBy(desc(ofertas.creadoEn))
      .limit(POR_PAGINA)
      .offset((pagina - 1) * POR_PAGINA),
    db.select({ n: count() }).from(ofertas).where(donde),
  ]);

  return { filas, total: total?.n ?? 0, pagina, paginas: Math.max(1, Math.ceil((total?.n ?? 0) / POR_PAGINA)) };
}

export async function obtenerOferta(id: string) {
  const [oferta] = await db.select().from(ofertas).where(eq(ofertas.id, id)).limit(1);
  if (!oferta) return null;

  const [vinculos, bitacora] = await Promise.all([
    db
      .select({ conexion: conexiones, solicitud: solicitudes })
      .from(conexiones)
      .innerJoin(solicitudes, eq(conexiones.solicitudId, solicitudes.id))
      .where(eq(conexiones.ofertaId, id))
      .orderBy(desc(conexiones.creadoEn)),
    db
      .select()
      .from(eventos)
      .where(and(eq(eventos.entidad, 'oferta'), eq(eventos.entidadId, id)))
      .orderBy(desc(eventos.creadoEn)),
  ]);

  return { oferta, conexiones: vinculos, bitacora };
}

/* ---------------------------------------------------------------- Resumen -- */

export type ResumenPanel = {
  porEstado: Record<EstadoSolicitud, number>;
  urgentesSinAtender: number;
  voluntariosActivos: number;
  voluntariosSinVerificar: number;
  conexionesAbiertas: number;
  tiempoMedianoVerificacionHoras: number | null;
};

export async function obtenerResumen(): Promise<ResumenPanel> {
  const [porEstadoFilas, [urgentes], [vol], [conx], [tiempos]] = await Promise.all([
    db.select({ estado: solicitudes.estado, n: count() }).from(solicitudes).groupBy(solicitudes.estado),
    db
      .select({ n: count() })
      .from(solicitudes)
      .where(and(eq(solicitudes.urgencia, 'inmediata'), inArray(solicitudes.estado, ['recibida', 'contactada']))),
    db
      .select({
        activos: sql<number>`count(*) filter (where ${ofertas.estado} in ('nueva','verificada'))::int`,
        sinVerificar: sql<number>`count(*) filter (where ${ofertas.estado} = 'nueva')::int`,
      })
      .from(ofertas),
    db
      .select({ n: count() })
      .from(conexiones)
      .where(inArray(conexiones.estado, ['propuesta', 'aceptada'])),
    db
      .select({
        horas: sql<number | null>`percentile_cont(0.5) within group (
          order by extract(epoch from (${solicitudes.verificadoEn} - ${solicitudes.creadoEn})) / 3600
        )`,
      })
      .from(solicitudes)
      .where(sql`${solicitudes.verificadoEn} is not null`),
  ]);

  const porEstado = {
    recibida: 0,
    contactada: 0,
    verificada: 0,
    conectada: 0,
    resuelta: 0,
    descartada: 0,
  } as Record<EstadoSolicitud, number>;

  for (const fila of porEstadoFilas) porEstado[fila.estado] = fila.n;

  return {
    porEstado,
    urgentesSinAtender: urgentes?.n ?? 0,
    voluntariosActivos: vol?.activos ?? 0,
    voluntariosSinVerificar: vol?.sinVerificar ?? 0,
    conexionesAbiertas: conx?.n ?? 0,
    tiempoMedianoVerificacionHoras: tiempos?.horas != null ? Number(tiempos.horas) : null,
  };
}
