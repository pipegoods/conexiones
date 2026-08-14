import 'server-only';

import { sql } from 'drizzle-orm';

import { db, hasDatabase, offers, requests } from '@/db';

export type Stats = {
  received: number;
  verified: number;
  connected: number;
  resolved: number;
  volunteers: number;
};

const EMPTY_STATS: Stats = {
  received: 0,
  verified: 0,
  connected: 0,
  resolved: 0,
  volunteers: 0,
};

/**
 * Public funnel statistics. They are intentionally cumulative: a resolved
 * request was also verified and connected, so it remains in those totals.
 *
 * Never exposes personal data; it returns only counts.
 */
export async function getStats(): Promise<Stats> {
  if (!hasDatabase) return EMPTY_STATS;

  try {
    const [requestsRow] = await db
      .select({
        received: sql<number>`count(*) filter (where ${requests.status} <> 'discarded')::int`,
        verified: sql<number>`count(*) filter (where ${requests.status} in ('verified','connected','resolved'))::int`,
        connected: sql<number>`count(*) filter (where ${requests.status} in ('connected','resolved'))::int`,
        resolved: sql<number>`count(*) filter (where ${requests.status} = 'resolved')::int`,
      })
      .from(requests);

    const [offersRow] = await db
      .select({
        volunteers: sql<number>`count(*) filter (where ${offers.status} in ('new','verified'))::int`,
      })
      .from(offers);

    return {
      received: requestsRow?.received ?? 0,
      verified: requestsRow?.verified ?? 0,
      connected: requestsRow?.connected ?? 0,
      resolved: requestsRow?.resolved ?? 0,
      volunteers: offersRow?.volunteers ?? 0,
    };
  } catch (error) {
    // The landing page must remain available if the database is unavailable or misconfigured.
    console.error('[stats] no se pudieron leer las cifras:', error);
    return EMPTY_STATS;
  }
}
