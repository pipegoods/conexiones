import { AVAILABILITY_COVERS, RESOURCES, type Availability, type ResourceType } from './catalogs';
import type { Offer, HelpRequest } from '@/db/schema';

/**
 * Suggestion engine.
 *
 * It does not assign anything: it ranks candidates and explains why so an
 * operator can confirm with one click. This is deliberate: a mistaken match in
 * an emergency affects a real person, so the machine proposes and a person decides.
 *
 * Scores range from 0 to 100:
 *   45  resource coverage
 *   30  location proximity
 *   15  availability against request urgency
 *   10  trust based on verification and current workload
 */

export const WEIGHTS = {
  resources: 45,
  location: 30,
  time: 15,
  trust: 10,
} as const;

/** Do not show suggestions below this score to the operator. */
export const MIN_SCORE = 35;

/** Maximum active connections before considering a volunteer overloaded. */
export const MAX_LOAD = 3;

export type Suggestion = {
  offer: Offer;
  score: number;
  reasons: string[];
  warnings: string[];
};

type MatchingContext = {
  /** offer.id -> current proposed or accepted connection count */
  load?: Map<string, number>;
  /** Offer IDs already linked to this request to avoid duplicate suggestions. */
  linkedIds?: Set<string>;
};

/** Normalizes place names so variants such as "Bogotá D.C." match "bogota dc". */
export function normalizeLocation(value: string | null | undefined): string {
  if (!value) return '';
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

/** Distance in kilometers between two coordinates using the Haversine formula. */
export function distanceKm(
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

function intersection(a: readonly ResourceType[], b: readonly ResourceType[]): ResourceType[] {
  const setB = new Set(b);
  return a.filter((t) => setB.has(t));
}

function daysSince(date: Date): number {
  return (Date.now() - date.getTime()) / 86_400_000;
}

/**
 * Scores a request and offer pair.
 * Returns `null` when the pair should not reach the admin panel.
 */
export function scoreMatch(
  request: HelpRequest,
  offer: Offer,
  ctx: MatchingContext = {},
): Suggestion | null {
  // --- Hard filters --------------------------------------------------------
  if (offer.status === 'paused' || offer.status === 'archived') return null;
  if (ctx.linkedIds?.has(offer.id)) return null;

  const sharedTypes = intersection(request.types, offer.types);
  if (sharedTypes.length === 0) return null;

  const reasons: string[] = [];
  const warnings: string[] = [];

  // --- 1. Resources --------------------------------------------------------
  const coverage = sharedTypes.length / request.types.length;
  let score = WEIGHTS.resources * coverage;

  const sharedTypeList = sharedTypes.map((t) => RESOURCES[t].internal.toLowerCase()).join(', ');
  reasons.push(
    coverage === 1
      ? `Cubre todo lo que pidieron (${sharedTypeList})`
      : `Cubre ${sharedTypes.length} de ${request.types.length}: ${sharedTypeList}`,
  );

  // --- 2. Location ---------------------------------------------------------
  const sameMunicipality = normalizeLocation(request.municipality) === normalizeLocation(offer.municipality);
  const sameDepartment =
    normalizeLocation(request.department) === normalizeLocation(offer.department);
  const radius = offer.radiusKm;

  const hasCoordinates =
    request.lat != null && request.lng != null && offer.lat != null && offer.lng != null;

  if (hasCoordinates) {
    const km = distanceKm(request.lat!, request.lng!, offer.lat!, offer.lng!);
    if (km > radius) return null; // It exceeds the declared travel radius.
    // 30 points at the same location, decreasing to 0 at the radius limit.
    score += WEIGHTS.location * (1 - km / Math.max(radius, 1));
    reasons.push(`Está a ${km < 1 ? 'menos de 1' : Math.round(km)} km`);
  } else if (sameMunicipality) {
    score += WEIGHTS.location;
    const sameZone =
      request.zone && offer.zone && normalizeLocation(request.zone) === normalizeLocation(offer.zone);
    reasons.push(
      sameZone
        ? `Mismo municipio y misma zona (${offer.zone})`
        : `Está en ${offer.municipality}, el mismo municipio`,
    );
  } else if (sameDepartment && radius >= 50) {
    score += WEIGHTS.location * 0.4;
    reasons.push(`Está en ${offer.municipality} y dijo que puede desplazarse ${radius === 999 ? 'a cualquier lugar' : `hasta ${radius} km`}`);
    warnings.push('Es de otro municipio: confirma el desplazamiento antes de conectar.');
  } else if (sameDepartment) {
    score += WEIGHTS.location * 0.15;
    warnings.push(
      `Está en ${offer.municipality} y solo se desplaza hasta ${radius} km. Puede que no alcance.`,
    );
  } else {
    // A different department only works for portable resources or offers that
    // can travel anywhere.
    const travelsWell: ResourceType[] = ['money', 'knowledge', 'information', 'contacts', 'profession'];
    const isRemote = sharedTypes.some((t) => travelsWell.includes(t));
    if (!isRemote && radius !== 999) return null;
    reasons.push('Puede ayudar a distancia');
    warnings.push(`Está en otro departamento (${offer.department}).`);
  }

  // --- 3. Time -------------------------------------------------------------
  const coversUrgency = (offer.availability as Availability[]).some((d) =>
    AVAILABILITY_COVERS[d].includes(request.urgency),
  );
  if (coversUrgency) {
    score += WEIGHTS.time;
    reasons.push('Su disponibilidad alcanza para la urgencia de esta solicitud');
  } else {
    warnings.push('Su disponibilidad no cubre esta urgencia. Puede que llegue tarde.');
  }

  // --- 4. Trust ------------------------------------------------------------
  if (offer.status === 'verified') {
    score += WEIGHTS.trust * 0.7;
    reasons.push('Voluntario ya verificado');
  } else {
    warnings.push('Este voluntario todavía no ha sido verificado.');
  }

  const load = ctx.load?.get(offer.id) ?? 0;
  if (load === 0) {
    score += WEIGHTS.trust * 0.3;
  } else if (load >= MAX_LOAD) {
    score -= 10;
    warnings.push(`Ya tiene ${load} conexiones activas. Está saturado.`);
  }

  // An offer from three weeks ago is likely no longer available.
  const ageInDays = daysSince(offer.createdAt);
  if (ageInDays > 21) {
    score -= 8;
    warnings.push(`Se registró hace ${Math.round(ageInDays)} días. Confirma que sigue disponible.`);
  }

  return {
    offer,
    score: Math.max(0, Math.min(100, Math.round(score))),
    reasons,
    warnings,
  };
}

/** Candidates ordered from best to worst for a request. */
export function suggestionsForRequest(
  request: HelpRequest,
  offers: Offer[],
  ctx: MatchingContext = {},
  limit = 10,
): Suggestion[] {
  return offers
    .map((o) => scoreMatch(request, o, ctx))
    .filter((s): s is Suggestion => s !== null && s.score >= MIN_SCORE)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/** Qualitative score label for the admin panel indicator. */
export function matchQuality(score: number): { label: string; className: string } {
  if (score >= 80) return { label: 'Excelente', className: 'bg-emerald-100 text-emerald-800 ring-emerald-300' };
  if (score >= 60) return { label: 'Bueno', className: 'bg-sky-100 text-sky-800 ring-sky-300' };
  if (score >= 45) return { label: 'Aceptable', className: 'bg-amber-100 text-amber-800 ring-amber-300' };
  return { label: 'Débil', className: 'bg-neutral-100 text-neutral-700 ring-neutral-300' };
}
