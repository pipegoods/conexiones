import 'server-only';

import { and, count, desc, eq, ilike, inArray, ne, or, sql } from 'drizzle-orm';

import { connections, db, events, offers, requests } from '@/db';
import type { Connection, LogEvent, Offer, HelpRequest } from '@/db/schema';
import type { OfferStatus, RequestStatus, Urgency } from './catalogs';
import {
  OPEN_OFFER_STATUSES,
  OPEN_REQUEST_STATUSES,
  type DuplicateCase,
} from './duplicates';
import { suggestionsForRequest, type Suggestion } from './matching';

/** Maximum number of active offers loaded for in-memory scoring. */
const MAX_CANDIDATES = 500;

export const PAGE_SIZE = 25;

/* -------------------------------------------------------- Duplicate phone -- */

export async function findOpenRequestByPhone(phone: string) {
  const [row] = await db
    .select({ id: requests.id, number: requests.number })
    .from(requests)
    .where(and(eq(requests.phone, phone), inArray(requests.status, [...OPEN_REQUEST_STATUSES])))
    .orderBy(desc(requests.createdAt))
    .limit(1);

  return row ?? null;
}

export async function findOpenOfferByPhone(phone: string) {
  const [row] = await db
    .select({ id: offers.id, number: offers.number, status: offers.status })
    .from(offers)
    .where(and(eq(offers.phone, phone), inArray(offers.status, [...OPEN_OFFER_STATUSES])))
    .limit(1);

  return row ?? null;
}

export async function getDuplicateCasesForRequest(
  phone: string,
  excludeId: string,
): Promise<DuplicateCase[]> {
  const [otherRequests, openOffers] = await Promise.all([
    db
      .select({ id: requests.id, number: requests.number, status: requests.status })
      .from(requests)
      .where(
        and(
          eq(requests.phone, phone),
          ne(requests.id, excludeId),
          inArray(requests.status, [...OPEN_REQUEST_STATUSES]),
        ),
      )
      .orderBy(desc(requests.createdAt)),
    db
      .select({ id: offers.id, number: offers.number, status: offers.status })
      .from(offers)
      .where(and(eq(offers.phone, phone), inArray(offers.status, [...OPEN_OFFER_STATUSES]))),
  ]);

  return [
    ...otherRequests.map((r) => ({ kind: 'request' as const, ...r })),
    ...openOffers.map((o) => ({ kind: 'offer' as const, ...o })),
  ];
}

export async function getDuplicateCasesForOffer(phone: string): Promise<DuplicateCase[]> {
  const openRequests = await db
    .select({ id: requests.id, number: requests.number, status: requests.status })
    .from(requests)
    .where(and(eq(requests.phone, phone), inArray(requests.status, [...OPEN_REQUEST_STATUSES])))
    .orderBy(desc(requests.createdAt));

  return openRequests.map((r) => ({ kind: 'request' as const, ...r }));
}

/** Batch lookup for list rows: which request IDs have another open case on the same phone. */
export async function getRequestIdsWithDuplicatePhone(
  items: { id: string; phone: string }[],
): Promise<Set<string>> {
  if (items.length === 0) return new Set();

  const phones = [...new Set(items.map((i) => i.phone))];
  const [openRequests, openOffers] = await Promise.all([
    db
      .select({ id: requests.id, phone: requests.phone })
      .from(requests)
      .where(and(inArray(requests.phone, phones), inArray(requests.status, [...OPEN_REQUEST_STATUSES]))),
    db
      .select({ phone: offers.phone })
      .from(offers)
      .where(and(inArray(offers.phone, phones), inArray(offers.status, [...OPEN_OFFER_STATUSES]))),
  ]);

  const requestsByPhone = new Map<string, string[]>();
  for (const row of openRequests) {
    const ids = requestsByPhone.get(row.phone) ?? [];
    ids.push(row.id);
    requestsByPhone.set(row.phone, ids);
  }

  const phonesWithOpenOffer = new Set(openOffers.map((o) => o.phone));
  const flagged = new Set<string>();

  for (const item of items) {
    const siblings = (requestsByPhone.get(item.phone) ?? []).filter((id) => id !== item.id);
    if (siblings.length > 0 || phonesWithOpenOffer.has(item.phone)) {
      flagged.add(item.id);
    }
  }

  return flagged;
}

/** Batch lookup for offer list rows: open requests on the same phone. */
export async function getOfferIdsWithDuplicatePhone(
  items: { id: string; phone: string }[],
): Promise<Set<string>> {
  if (items.length === 0) return new Set();

  const phones = [...new Set(items.map((i) => i.phone))];
  const openRequests = await db
    .select({ phone: requests.phone })
    .from(requests)
    .where(and(inArray(requests.phone, phones), inArray(requests.status, [...OPEN_REQUEST_STATUSES])));

  const phonesWithOpenRequest = new Set(openRequests.map((r) => r.phone));
  const flagged = new Set<string>();

  for (const item of items) {
    if (phonesWithOpenRequest.has(item.phone)) flagged.add(item.id);
  }

  return flagged;
}

/* ------------------------------------------------------------- Requests -- */

export type RequestFilters = {
  status?: RequestStatus;
  search?: string;
  page?: number;
  department?: string;
  municipality?: string;
  urgency?: Urgency;
};

const requestOrder = [
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
] as const;

export async function listRequests({
  status,
  search,
  page = 1,
  department,
  municipality,
  urgency,
}: RequestFilters) {
  const conditions = [];
  if (status) conditions.push(eq(requests.status, status));
  if (department) conditions.push(eq(requests.department, department));
  if (municipality) conditions.push(eq(requests.municipality, municipality));
  if (urgency) conditions.push(eq(requests.urgency, urgency));
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
      .orderBy(...requestOrder)
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE),
    db.select({ n: count() }).from(requests).where(where),
  ]);

  return { rows, total: total?.n ?? 0, page, pages: Math.max(1, Math.ceil((total?.n ?? 0) / PAGE_SIZE)) };
}

/** Pending requests for the admin dashboard, ordered by operational priority. */
export async function listPendingRequests(limit = 8) {
  return db
    .select()
    .from(requests)
    .where(inArray(requests.status, ['received', 'contacted', 'verified']))
    .orderBy(...requestOrder)
    .limit(limit);
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
