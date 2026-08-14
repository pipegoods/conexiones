import type { OfferStatus, RequestStatus } from './catalogs';

/** Request statuses that still need operator attention. */
export const OPEN_REQUEST_STATUSES = [
  'received',
  'contacted',
  'verified',
  'connected',
] as const satisfies readonly RequestStatus[];

/** Offer statuses that count as an active volunteer profile. */
export const OPEN_OFFER_STATUSES = ['new', 'verified'] as const satisfies readonly OfferStatus[];

export function isOpenRequestStatus(status: RequestStatus): boolean {
  return (OPEN_REQUEST_STATUSES as readonly RequestStatus[]).includes(status);
}

export function isOpenOfferStatus(status: OfferStatus): boolean {
  return (OPEN_OFFER_STATUSES as readonly OfferStatus[]).includes(status);
}

export type DuplicateCase = {
  kind: 'request' | 'offer';
  id: string;
  number: number;
  status: RequestStatus | OfferStatus;
};
