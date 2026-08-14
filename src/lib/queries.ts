import 'server-only';

import { and, count, desc, eq, ilike, inArray, or, sql } from 'drizzle-orm';

import { connections, db, events, offers, requests } from '@/db';
import type { Connection, LogEvent, Offer, HelpRequest } from '@/db/schema';
import type { OfferStatus, RequestStatus } from './catalogs';
import { suggestionsForRequest, type Suggestion } from './matching';

/** Maximum number of active offers loaded for in-memory scoring. */
const MAX_CANDIDATES = 500;

export const PAGE_SIZE = 25;

/* ------------------------------------------------------------- Requests -- */

export type RequestFilters = {
  status?: RequestStatus;
  search?: string;
  page?: number;
};

export async function listRequests({ status, search, page = 1 }: RequestFilters) {
  const conditions = [];
  if (status) conditions.push(eq(requests.status, status));
  if (search?.trim()) {
    const pattern = `%${search.trim()}%`;
    conditions.push(
      or(
        ilike(requests.name, pattern),
        ilike(requests.phone, pattern),
        ilike(requests.municipality, pattern),
        ilike(requests.description, pattern),
      ),
    );
  }
  const where = conditions.length ? and(...conditions) : undefined;

  const [rows, [total]] = await Promise.all([
    db
      .select()
      .from(requests)
      .where(where)
      // Prioritize unattended urgent requests, then the oldest requests.
      .orderBy(
        sql`case ${requests.status}
              when 'received' then 0
              when 'contacted' then 1
              when 'verified' then 2
              when 'connected' then 3
              when 'resolved' then 4
              else 5 end`,
        sql`case ${requests.urgency}
              when 'immediate' then 0
              when 'today' then 1
              when 'this_week' then 2
              else 3 end`,
        requests.createdAt,
      )
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE),
    db.select({ n: count() }).from(requests).where(where),
  ]);

  return { rows, total: total?.n ?? 0, page, pages: Math.max(1, Math.ceil((total?.n ?? 0) / PAGE_SIZE)) };
}

export type RequestDetail = {
  request: HelpRequest;
  links: { connection: Connection; offer: Offer }[];
  log: LogEvent[];
};

export async function getRequest(id: string): Promise<RequestDetail | null> {
  const [request] = await db.select().from(requests).where(eq(requests.id, id)).limit(1);
  if (!request) return null;

  const [links, log] = await Promise.all([
    db
      .select({ connection: connections, offer: offers })
      .from(connections)
      .innerJoin(offers, eq(connections.offerId, offers.id))
      .where(eq(connections.requestId, id))
      .orderBy(desc(connections.createdAt)),
    db
      .select()
      .from(events)
      .where(and(eq(events.entityType, 'request'), eq(events.entityId, id)))
      .orderBy(desc(events.createdAt)),
  ]);

  return { request, links, log };
}

/**
 * Suggested candidates for a request.
 *
 * SQL prefilters active volunteers in the same department or able to travel
 * anywhere, then scores candidates in memory. For local emergencies this is
 * sufficient; move the calculation to SQL or PostGIS at much larger volumes.
 */
export async function getSuggestionsForRequest(request: HelpRequest): Promise<Suggestion[]> {
  const candidates = await db
    .select()
    .from(offers)
    .where(
      and(
        inArray(offers.status, ['new', 'verified'] satisfies OfferStatus[]),
        or(eq(offers.department, request.department), eq(offers.radiusKm, 999)),
      ),
    )
    .orderBy(desc(offers.status), desc(offers.createdAt))
    .limit(MAX_CANDIDATES);

  const candidateIds = candidates.map((o) => o.id);

  const [linked, loads] = await Promise.all([
    db
      .select({ offerId: connections.offerId })
      .from(connections)
      .where(eq(connections.requestId, request.id)),
    candidateIds.length
      ? db
          .select({ offerId: connections.offerId, n: count() })
          .from(connections)
          .where(
            and(
              inArray(connections.offerId, candidateIds),
              inArray(connections.status, ['proposed', 'accepted']),
            ),
          )
          .groupBy(connections.offerId)
      : Promise.resolve([]),
  ]);

  return suggestionsForRequest(request, candidates, {
    linkedIds: new Set(linked.map((v) => v.offerId)),
    load: new Map(loads.map((c) => [c.offerId, c.n])),
  });
}

/* --------------------------------------------------------------- Offers -- */

export async function listOffers({
  status,
  search,
  page = 1,
}: {
  status?: OfferStatus;
  search?: string;
  page?: number;
}) {
  const conditions = [];
  if (status) conditions.push(eq(offers.status, status));
  if (search?.trim()) {
    const pattern = `%${search.trim()}%`;
    conditions.push(
      or(
        ilike(offers.name, pattern),
        ilike(offers.phone, pattern),
        ilike(offers.municipality, pattern),
        ilike(offers.description, pattern),
        ilike(offers.organization, pattern),
      ),
    );
  }
  const where = conditions.length ? and(...conditions) : undefined;

  const [rows, [total]] = await Promise.all([
    db
      .select()
      .from(offers)
      .where(where)
      .orderBy(desc(offers.createdAt))
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE),
    db.select({ n: count() }).from(offers).where(where),
  ]);

  return { rows, total: total?.n ?? 0, page, pages: Math.max(1, Math.ceil((total?.n ?? 0) / PAGE_SIZE)) };
}

export async function getOffer(id: string) {
  const [offer] = await db.select().from(offers).where(eq(offers.id, id)).limit(1);
  if (!offer) return null;

  const [links, log] = await Promise.all([
    db
      .select({ connection: connections, request: requests })
      .from(connections)
      .innerJoin(requests, eq(connections.requestId, requests.id))
      .where(eq(connections.offerId, id))
      .orderBy(desc(connections.createdAt)),
    db
      .select()
      .from(events)
      .where(and(eq(events.entityType, 'offer'), eq(events.entityId, id)))
      .orderBy(desc(events.createdAt)),
  ]);

  return { offer, links, log };
}

/* ---------------------------------------------------------------- Summary -- */

export type AdminSummary = {
  byStatus: Record<RequestStatus, number>;
  unattendedUrgent: number;
  activeVolunteers: number;
  unverifiedVolunteers: number;
  openConnections: number;
  medianVerificationHours: number | null;
};

export async function getSummary(): Promise<AdminSummary> {
  const [statusRows, [urgent], [vol], [conx], [times]] = await Promise.all([
    db.select({ status: requests.status, n: count() }).from(requests).groupBy(requests.status),
    db
      .select({ n: count() })
      .from(requests)
      .where(and(eq(requests.urgency, 'immediate'), inArray(requests.status, ['received', 'contacted']))),
    db
      .select({
        active: sql<number>`count(*) filter (where ${offers.status} in ('new','verified'))::int`,
        unverified: sql<number>`count(*) filter (where ${offers.status} = 'new')::int`,
      })
      .from(offers),
    db
      .select({ n: count() })
      .from(connections)
      .where(inArray(connections.status, ['proposed', 'accepted'])),
    db
      .select({
        hours: sql<number | null>`percentile_cont(0.5) within group (
          order by extract(epoch from (${requests.verifiedAt} - ${requests.createdAt})) / 3600
        )`,
      })
      .from(requests)
      .where(sql`${requests.verifiedAt} is not null`),
  ]);

  const byStatus = {
    received: 0,
    contacted: 0,
    verified: 0,
    connected: 0,
    resolved: 0,
    discarded: 0,
  } as Record<RequestStatus, number>;

  for (const row of statusRows) byStatus[row.status] = row.n;

  return {
    byStatus,
    unattendedUrgent: urgent?.n ?? 0,
    activeVolunteers: vol?.active ?? 0,
    unverifiedVolunteers: vol?.unverified ?? 0,
    openConnections: conx?.n ?? 0,
    medianVerificationHours: times?.hours != null ? Number(times.hours) : null,
  };
}
