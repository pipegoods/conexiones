import { DISPONIBILIDAD_CUBRE, RECURSOS, type Disponibilidad, type TipoRecurso } from './catalogos';
import type { Oferta, Solicitud } from '@/db/schema';

/**
 * Motor de sugerencias.
 *
 * No asigna nada: ordena candidatos y explica por qué, para que un operador
 * confirme con un clic. Esa decisión es deliberada — un match equivocado en una
 * emergencia le llega a una persona real, así que la máquina propone y una
 * persona dispone.
 *
 * El puntaje va de 0 a 100 y se reparte así:
 *   45  qué tanto de lo que la persona necesita alcanza a cubrir el voluntario
 *   30  qué tan cerca está
 *   15  si su disponibilidad alcanza para la urgencia de la solicitud
 *   10  confianza: si ya está verificado y qué tan cargado está
 */

export const PESOS = {
  recursos: 45,
  ubicacion: 30,
  tiempo: 15,
  confianza: 10,
} as const;

/** Umbral por debajo del cual no vale la pena mostrarle el candidato al operador. */
export const SCORE_MINIMO = 35;

/** Máximo de conexiones activas antes de considerar que un voluntario está saturado. */
export const CARGA_MAXIMA = 3;

export type Sugerencia = {
  oferta: Oferta;
  score: number;
  razones: string[];
  advertencias: string[];
};

type ContextoMatching = {
  /** oferta.id -> número de conexiones activas (propuesta/aceptada) que ya tiene */
  carga?: Map<string, number>;
  /** ids de ofertas ya vinculadas a esta solicitud (para no repetir la propuesta) */
  yaVinculadas?: Set<string>;
};

/** Normaliza un nombre de lugar: "Bogotá D.C. " y "bogota dc" deben cruzarse. */
export function normalizarLugar(valor: string | null | undefined): string {
  if (!valor) return '';
  return valor
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

/** Distancia en km entre dos coordenadas (fórmula de Haversine). */
export function distanciaKm(
  aLat: number,
  aLng: number,
  bLat: number,
  bLng: number,
): number {
  const R = 6371;
  const rad = (g: number) => (g * Math.PI) / 180;
  const dLat = rad(bLat - aLat);
  const dLng = rad(bLng - aLng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(aLat)) * Math.cos(rad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function interseccion(a: readonly TipoRecurso[], b: readonly TipoRecurso[]): TipoRecurso[] {
  const setB = new Set(b);
  return a.filter((t) => setB.has(t));
}

function diasDesde(fecha: Date): number {
  return (Date.now() - fecha.getTime()) / 86_400_000;
}

/**
 * Puntúa una pareja necesidad/capacidad.
 * Devuelve `null` cuando el cruce no tiene sentido y no debe llegar al panel.
 */
export function puntuar(
  solicitud: Solicitud,
  oferta: Oferta,
  ctx: ContextoMatching = {},
): Sugerencia | null {
  // --- Filtros duros -------------------------------------------------------
  if (oferta.estado === 'pausada' || oferta.estado === 'archivada') return null;
  if (ctx.yaVinculadas?.has(oferta.id)) return null;

  const comunes = interseccion(solicitud.tipos, oferta.tipos);
  if (comunes.length === 0) return null;

  const razones: string[] = [];
  const advertencias: string[] = [];

  // --- 1. Recursos ---------------------------------------------------------
  const cobertura = comunes.length / solicitud.tipos.length;
  let score = PESOS.recursos * cobertura;

  const listaComunes = comunes.map((t) => RECURSOS[t].panel.toLowerCase()).join(', ');
  razones.push(
    cobertura === 1
      ? `Cubre todo lo que pidieron (${listaComunes})`
      : `Cubre ${comunes.length} de ${solicitud.tipos.length}: ${listaComunes}`,
  );

  // --- 2. Ubicación --------------------------------------------------------
  const mismoMunicipio = normalizarLugar(solicitud.municipio) === normalizarLugar(oferta.municipio);
  const mismoDepartamento =
    normalizarLugar(solicitud.departamento) === normalizarLugar(oferta.departamento);
  const radio = oferta.radioKm;

  const hayCoordenadas =
    solicitud.lat != null && solicitud.lng != null && oferta.lat != null && oferta.lng != null;

  if (hayCoordenadas) {
    const km = distanciaKm(solicitud.lat!, solicitud.lng!, oferta.lat!, oferta.lng!);
    if (km > radio) return null; // se sale de lo que dijo que puede desplazarse
    // 30 puntos si está encima, decayendo hasta 0 en el borde de su radio.
    score += PESOS.ubicacion * (1 - km / Math.max(radio, 1));
    razones.push(`Está a ${km < 1 ? 'menos de 1' : Math.round(km)} km`);
  } else if (mismoMunicipio) {
    score += PESOS.ubicacion;
    const mismaZona =
      solicitud.zona && oferta.zona && normalizarLugar(solicitud.zona) === normalizarLugar(oferta.zona);
    razones.push(
      mismaZona
        ? `Mismo municipio y misma zona (${oferta.zona})`
        : `Está en ${oferta.municipio}, el mismo municipio`,
    );
  } else if (mismoDepartamento && radio >= 50) {
    score += PESOS.ubicacion * 0.4;
    razones.push(`Está en ${oferta.municipio} y dijo que puede desplazarse ${radio === 999 ? 'a cualquier lugar' : `hasta ${radio} km`}`);
    advertencias.push('Es de otro municipio: confirma el desplazamiento antes de conectar.');
  } else if (mismoDepartamento) {
    score += PESOS.ubicacion * 0.15;
    advertencias.push(
      `Está en ${oferta.municipio} y solo se desplaza hasta ${radio} km. Puede que no alcance.`,
    );
  } else {
    // Otro departamento: solo tiene sentido para recursos que viajan (dinero,
    // conocimientos, información, contactos) o si dijo que va a cualquier lado.
    const viajaBien: TipoRecurso[] = ['dinero', 'conocimientos', 'informacion', 'contactos', 'profesion'];
    const remoto = comunes.some((t) => viajaBien.includes(t));
    if (!remoto && radio !== 999) return null;
    razones.push('Puede ayudar a distancia');
    advertencias.push(`Está en otro departamento (${oferta.departamento}).`);
  }

  // --- 3. Tiempo -----------------------------------------------------------
  const cubreUrgencia = (oferta.disponibilidad as Disponibilidad[]).some((d) =>
    DISPONIBILIDAD_CUBRE[d].includes(solicitud.urgencia),
  );
  if (cubreUrgencia) {
    score += PESOS.tiempo;
    razones.push('Su disponibilidad alcanza para la urgencia de esta solicitud');
  } else {
    advertencias.push('Su disponibilidad no cubre esta urgencia. Puede que llegue tarde.');
  }

  // --- 4. Confianza --------------------------------------------------------
  if (oferta.estado === 'verificada') {
    score += PESOS.confianza * 0.7;
    razones.push('Voluntario ya verificado');
  } else {
    advertencias.push('Este voluntario todavía no ha sido verificado.');
  }

  const carga = ctx.carga?.get(oferta.id) ?? 0;
  if (carga === 0) {
    score += PESOS.confianza * 0.3;
  } else if (carga >= CARGA_MAXIMA) {
    score -= 10;
    advertencias.push(`Ya tiene ${carga} conexiones activas. Está saturado.`);
  }

  // Una oferta de hace tres semanas probablemente ya no está disponible.
  const antiguedad = diasDesde(oferta.creadoEn);
  if (antiguedad > 21) {
    score -= 8;
    advertencias.push(`Se registró hace ${Math.round(antiguedad)} días. Confirma que sigue disponible.`);
  }

  return {
    oferta,
    score: Math.max(0, Math.min(100, Math.round(score))),
    razones,
    advertencias,
  };
}

/** Candidatos ordenados de mejor a peor para una solicitud. */
export function sugerenciasParaSolicitud(
  solicitud: Solicitud,
  ofertas: Oferta[],
  ctx: ContextoMatching = {},
  limite = 10,
): Sugerencia[] {
  return ofertas
    .map((o) => puntuar(solicitud, o, ctx))
    .filter((s): s is Sugerencia => s !== null && s.score >= SCORE_MINIMO)
    .sort((a, b) => b.score - a.score)
    .slice(0, limite);
}

/** Etiqueta cualitativa del puntaje, para pintar el semáforo en el panel. */
export function calidadDelMatch(score: number): { label: string; clase: string } {
  if (score >= 80) return { label: 'Excelente', clase: 'bg-emerald-100 text-emerald-800 ring-emerald-300' };
  if (score >= 60) return { label: 'Bueno', clase: 'bg-sky-100 text-sky-800 ring-sky-300' };
  if (score >= 45) return { label: 'Aceptable', clase: 'bg-amber-100 text-amber-800 ring-amber-300' };
  return { label: 'Débil', clase: 'bg-neutral-100 text-neutral-700 ring-neutral-300' };
}
