import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { OfferStatus, RequestStatus } from './catalogs';
import {
  isOpenOfferStatus,
  isOpenRequestStatus,
  OPEN_OFFER_STATUSES,
  OPEN_REQUEST_STATUSES,
} from './duplicates';

describe('duplicate detection helpers', () => {
  it('treats active request statuses as open', () => {
    for (const status of OPEN_REQUEST_STATUSES) {
      assert.equal(isOpenRequestStatus(status), true);
    }
  });

  it('treats closed request statuses as not open', () => {
    const closed: RequestStatus[] = ['resolved', 'discarded'];
    for (const status of closed) {
      assert.equal(isOpenRequestStatus(status), false);
    }
  });

  it('treats active offer statuses as open', () => {
    for (const status of OPEN_OFFER_STATUSES) {
      assert.equal(isOpenOfferStatus(status), true);
    }
  });

  it('treats inactive offer statuses as not open', () => {
    const inactive: OfferStatus[] = ['paused', 'archived'];
    for (const status of inactive) {
      assert.equal(isOpenOfferStatus(status), false);
    }
  });
});
