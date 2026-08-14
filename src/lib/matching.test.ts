import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Offer, HelpRequest } from '@/db/schema';
import { distanceKm, normalizeLocation, scoreMatch, suggestionsForRequest } from './matching';

/* Minimal fixtures: only values read by the matching engine. */

const ONE_DAY_AGO = new Date(Date.now() - 86_400_000);

function request(changes: Partial<HelpRequest> = {}): HelpRequest {
  return {
    id: 's1',
    number: 1,
    name: 'María Restrepo',
    phone: '+573001112233',
    isForSomeoneElse: false,
    affectedPeople: 4,
    hasMinors: true,
    hasElderly: false,
    types: ['tools'],
    description: 'Se cayó el techo de la cocina.',
    urgency: 'today',
    department: 'Quindío',
    municipality: 'Armenia',
    zone: 'La Esperanza',
    addressReference: null,
    lat: null,
    lng: null,
    status: 'verified',
    internalNotes: null,
    discardReason: null,
    acceptsDataUse: true,
    acceptsWhatsapp: true,
    createdAt: ONE_DAY_AGO,
    updatedAt: ONE_DAY_AGO,
    contactedAt: null,
    verifiedAt: null,
    connectedAt: null,
    resolvedAt: null,
    ...changes,
  } as HelpRequest;
}

function offer(changes: Partial<Offer> = {}): Offer {
  return {
    id: 'o1',
    number: 1,
    name: 'Pedro Gómez',
    phone: '+573004445566',
    email: null,
    organization: null,
    types: ['tools'],
    description: 'Soy carpintero, tengo herramienta propia.',
    department: 'Quindío',
    municipality: 'Armenia',
    zone: 'La Esperanza',
    radiusKm: 10,
    lat: null,
    lng: null,
    availability: ['today'],
    availabilityNote: null,
    status: 'verified',
    internalNotes: null,
    acceptsDataUse: true,
    acceptsWhatsapp: true,
    createdAt: ONE_DAY_AGO,
    updatedAt: ONE_DAY_AGO,
    verifiedAt: ONE_DAY_AGO,
    ...changes,
  } as Offer;
}

describe('normalizeLocation', () => {
  it('matches equivalent place-name formats', () => {
    assert.equal(normalizeLocation('Bogotá D.C.'), normalizeLocation('bogota dc'));
    assert.equal(normalizeLocation(' Armenia '), normalizeLocation('ARMENIA'));
    assert.notEqual(normalizeLocation('Armenia'), normalizeLocation('Calarcá'));
  });

  it('handles null values', () => {
    assert.equal(normalizeLocation(null), '');
    assert.equal(normalizeLocation(undefined), '');
  });
});

describe('distanceKm', () => {
  it('calculates a known distance (Armenia → Pereira ≈ 40 km)', () => {
    const km = distanceKm(4.5339, -75.6811, 4.8133, -75.6961);
    assert.ok(km > 25 && km < 45, `expected ~31 km, got ${km}`);
  });

  it('returns zero for the same point', () => {
    assert.equal(Math.round(distanceKm(4.5, -75.6, 4.5, -75.6)), 0);
  });
});

describe('scoreMatch — hard filters', () => {
  it('rejects offers with no shared resource type', () => {
    assert.equal(scoreMatch(request({ types: ['food'] }), offer({ types: ['transport'] })), null);
  });

  it('rejects paused or archived volunteers', () => {
    assert.equal(scoreMatch(request(), offer({ status: 'paused' })), null);
    assert.equal(scoreMatch(request(), offer({ status: 'archived' })), null);
  });

  it('rejects offers already linked to the request', () => {
    assert.equal(scoreMatch(request(), offer(), { linkedIds: new Set(['o1']) }), null);
  });

  it('rejects offers outside their own travel radius', () => {
    const distant = scoreMatch(
      request({ lat: 4.5339, lng: -75.6811 }),
      offer({ lat: 4.8133, lng: -75.6961, radiusKm: 5 }),
    );
    assert.equal(distant, null);
  });

  it('accepts a volunteer when their radius reaches the request', () => {
    const nearby = scoreMatch(
      request({ lat: 4.5339, lng: -75.6811 }),
      offer({ lat: 4.8133, lng: -75.6961, radiusKm: 50 }),
    );
    assert.ok(nearby);
  });

  it('rejects a different department for non-portable resources', () => {
    const outside = scoreMatch(
      request({ types: ['food'] }),
      offer({ types: ['food'], department: 'Antioquia', municipality: 'Medellín', radiusKm: 10 }),
    );
    assert.equal(outside, null);
  });

  it('allows a different department for portable resources', () => {
    const remote = scoreMatch(
      request({ types: ['money'] }),
      offer({ types: ['money'], department: 'Antioquia', municipality: 'Medellín', radiusKm: 10 }),
    );
    assert.ok(remote);
    assert.ok(remote.warnings.some((a) => a.includes('otro departamento')));
  });
});

describe('scoreMatch — scoring', () => {
  it('gives a high score with no warnings to a perfect match', () => {
    const r = scoreMatch(request(), offer());
    assert.ok(r);
    assert.ok(r.score >= 90, `expected >=90, got ${r.score}`);
    assert.deepEqual(r.warnings, []);
  });

  it('reduces and explains the score for partial coverage', () => {
    const complete = scoreMatch(request({ types: ['tools'] }), offer({ types: ['tools'] }))!;
    const partial = scoreMatch(
      request({ types: ['tools', 'food', 'transport'] }),
      offer({ types: ['tools'] }),
    )!;

    assert.ok(partial.score < complete.score);
    assert.ok(partial.reasons.some((r) => r.includes('1 de 3')));
  });

  it('warns when availability does not meet the urgency', () => {
    const r = scoreMatch(request({ urgency: 'immediate' }), offer({ availability: ['weekends'] }))!;
    assert.ok(r.warnings.some((a) => a.includes('no cubre esta urgencia')));
  });

  it('warns when the volunteer has not been verified', () => {
    const r = scoreMatch(request(), offer({ status: 'new' }))!;
    assert.ok(r.warnings.some((a) => a.includes('no ha sido verificado')));
    assert.ok(r.score < scoreMatch(request(), offer())!.score);
  });

  it('penalizes an overloaded volunteer', () => {
    const available = scoreMatch(request(), offer())!;
    const overloaded = scoreMatch(request(), offer(), { load: new Map([['o1', 5]]) })!;

    assert.ok(overloaded.score < available.score);
    assert.ok(overloaded.warnings.some((a) => a.includes('saturado')));
  });

  it('penalizes stale offers', () => {
    const stale = scoreMatch(
      request(),
      offer({ createdAt: new Date(Date.now() - 40 * 86_400_000) }),
    )!;
    assert.ok(stale.warnings.some((a) => a.includes('sigue disponible')));
  });

  it('never leaves the 0-100 range', () => {
    const r = scoreMatch(request(), offer({ status: 'new' }), { load: new Map([['o1', 20]]) })!;
    assert.ok(r.score >= 0 && r.score <= 100);
  });
});

describe('suggestionsForRequest', () => {
  it('orders suggestions from best to worst and hides weak matches', () => {
    const helpRequest = request({ types: ['tools', 'manual_labor'] });

    const candidates = [
      offer({ id: 'flojo', types: ['tools'], municipality: 'Calarcá', status: 'new', radiusKm: 5 }),
      offer({ id: 'ideal', types: ['tools', 'manual_labor'] }),
      offer({ id: 'medio', types: ['tools'], availability: ['this_week'] }),
      offer({ id: 'ajeno', types: ['food'] }),
    ];

    const result = suggestionsForRequest(helpRequest, candidates);
    const ids = result.map((r) => r.offer.id);

    assert.equal(ids[0], 'ideal', 'the offer with full coverage must come first');
    assert.ok(!ids.includes('ajeno'), 'an offer with no shared resources must not appear');

    for (let i = 1; i < result.length; i++) {
      assert.ok(result[i - 1].score >= result[i].score, 'suggestions must be ordered descending');
    }
  });

  it('respects the requested limit', () => {
    const candidates = Array.from({ length: 30 }, (_, i) => offer({ id: `o${i}` }));
    assert.equal(suggestionsForRequest(request(), candidates, {}, 5).length, 5);
  });

  it('returns an empty list when no candidate matches', () => {
    assert.deepEqual(suggestionsForRequest(request(), []), []);
  });
});
