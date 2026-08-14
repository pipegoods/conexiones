import Link from 'next/link';

import { Card, DateDisplay, EmptyState, OfferBadge, ResourceChips } from '@/components/admin/Primitives';
import { DuplicatePhoneChip } from '@/components/admin/DuplicatePhoneWarning';
import {
  AVAILABILITY_LABELS,
  OFFER_STATUSES,
  OFFER_STATUS_META,
  RADIUS_LABELS,
  type Availability,
  type OfferStatus,
} from '@/lib/catalogs';
import { getOfferIdsWithDuplicatePhone, listOffers } from '@/lib/queries';
import { formatPhone } from '@/lib/validations';
import { offerCode } from '@/lib/whatsapp';

export const dynamic = 'force-dynamic';

type PageProps = {
  searchParams: Promise<{ 'estado'?: string; 'pagina'?: string; status?: string; page?: string; q?: string }>;
};

export default async function Offers({ searchParams }: PageProps) {
  const params = await searchParams;
  const statusParam = params['estado'] ?? params.status;
  const status = OFFER_STATUSES.includes(statusParam as OfferStatus)
    ? (statusParam as OfferStatus)
    : undefined;
  const search = params.q ?? '';
  const page = Math.max(1, Number(params['pagina'] ?? params.page) || 1);

  const { rows, total, pages } = await listOffers({ status, search, page });
  const duplicateIds = await getOfferIdsWithDuplicatePhone(rows.map((o) => ({ id: o.id, phone: o.phone })));

  const filterLink = (st?: OfferStatus) => {
    const sp = new URLSearchParams();
    if (st) sp.set('estado', st);
    if (search) sp.set('q', search);
    const query = sp.toString();
    return `/admin/ofertas${query ? `?${query}` : ''}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Voluntarios</h1>
        <p className="mt-1 text-sm text-neutral-500">
          {total} {total === 1 ? 'persona registrada' : 'personas registradas'} con algo para aportar.
        </p>
      </div>

      <Card>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={filterLink()}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              !status ? 'bg-tinta text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            Todos
          </Link>
          {OFFER_STATUSES.map((st) => (
            <Link
              key={st}
              href={filterLink(st)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                status === st ? 'bg-tinta text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              <span aria-hidden="true">{OFFER_STATUS_META[st].emoji}</span> {OFFER_STATUS_META[st].label}
            </Link>
          ))}
        </div>

        <form method="get" className="mt-4 flex gap-2">
          {status && <input type="hidden" name="estado" value={status} />}
          <input
            type="search"
            name="q"
            defaultValue={search}
            placeholder="Buscar por nombre, teléfono, municipio, oficio u organización…"
            aria-label="Buscar voluntarios"
            className="flex-1 rounded-xl border border-neutral-200 px-4 py-2.5 text-sm focus:border-marca-morado focus:ring-2 focus:ring-marca-morado/20"
          />
          <button
            type="submit"
            className="rounded-xl bg-tinta px-5 py-2.5 text-sm font-bold text-white transition hover:brightness-125"
          >
            Buscar
          </button>
        </form>
      </Card>

      {rows.length === 0 ? (
        <EmptyState>No hay voluntarios con esos criterios.</EmptyState>
      ) : (
        <ul className="space-y-3">
          {rows.map((o) => (
            <li key={o.id}>
              <Link
                href={`/admin/ofertas/${o.id}`}
                className="block rounded-2xl bg-white p-5 ring-1 ring-neutral-200 transition hover:ring-marca-morado"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-mono text-sm font-bold text-neutral-400">{offerCode(o.number)}</span>
                  <OfferBadge status={o.status} />
                  {duplicateIds.has(o.id) && <DuplicatePhoneChip />}
                  <span className="font-bold text-tinta">{o.name}</span>
                  {o.organization && <span className="text-sm text-neutral-500">({o.organization})</span>}
                  <span className="ml-auto text-sm text-neutral-400">
                    <DateDisplay value={o.createdAt} />
                  </span>
                </div>

                <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-neutral-700">{o.description}</p>

                <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-neutral-500">
                  <span className="font-mono">{formatPhone(o.phone)}</span>
                  <span>
                    📍 {o.municipality} · {RADIUS_LABELS[o.radiusKm]}
                  </span>
                  <span>
                    🕒 {(o.availability as Availability[]).map((d) => AVAILABILITY_LABELS[d]).join(', ')}
                  </span>
                </div>

                <div className="mt-3">
                  <ResourceChips types={o.types} side="offering" />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {pages > 1 && (
        <nav className="flex justify-center gap-2" aria-label="Paginación">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => {
            const sp = new URLSearchParams();
            if (status) sp.set('estado', status);
            if (search) sp.set('q', search);
            sp.set('pagina', String(p));
            return (
              <Link
                key={p}
                href={`/admin/ofertas?${sp.toString()}`}
                aria-current={p === page ? 'page' : undefined}
                className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                  p === page ? 'bg-tinta text-white' : 'bg-white text-neutral-600 ring-1 ring-neutral-200'
                }`}
              >
                {p}
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}
