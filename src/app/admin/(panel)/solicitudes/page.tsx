import Link from 'next/link';

import {
  Card,
  DateDisplay,
  EmptyState,
  RequestBadge,
  ResourceChips,
  UrgencyBadge,
} from '@/components/admin/Primitives';
import { TimeAgo } from '@/components/admin/TimeAgo';
import { REQUEST_STATUSES, REQUEST_STATUS_META, type RequestStatus } from '@/lib/catalogs';
import { listRequests } from '@/lib/queries';
import { requestCode } from '@/lib/whatsapp';

export const dynamic = 'force-dynamic';

type PageProps = {
  searchParams: Promise<{ 'estado'?: string; 'pagina'?: string; status?: string; page?: string; q?: string }>;
};

export default async function Requests({ searchParams }: PageProps) {
  const params = await searchParams;
  const statusParam = params['estado'] ?? params.status;
  const status = REQUEST_STATUSES.includes(statusParam as RequestStatus)
    ? (statusParam as RequestStatus)
    : undefined;
  const search = params.q ?? '';
  const page = Math.max(1, Number(params['pagina'] ?? params.page) || 1);

  const { rows, total, pages } = await listRequests({ status, search, page });

  const filterLink = (st?: RequestStatus) => {
    const sp = new URLSearchParams();
    if (st) sp.set('estado', st);
    if (search) sp.set('q', search);
    const query = sp.toString();
    return `/admin/solicitudes${query ? `?${query}` : ''}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Solicitudes</h1>
        <p className="mt-1 text-sm text-neutral-500">
          {total} {total === 1 ? 'solicitud' : 'solicitudes'}
          {status ? ` en estado “${REQUEST_STATUS_META[status].label}”` : ''}.
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
            Todas
          </Link>
          {REQUEST_STATUSES.map((st) => (
            <Link
              key={st}
              href={filterLink(st)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                status === st ? 'bg-tinta text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              <span aria-hidden="true">{REQUEST_STATUS_META[st].emoji}</span> {REQUEST_STATUS_META[st].label}
            </Link>
          ))}
        </div>

        <form method="get" className="mt-4 flex gap-2">
          {status && <input type="hidden" name="estado" value={status} />}
          <input
            type="search"
            name="q"
            defaultValue={search}
            placeholder="Buscar por nombre, teléfono, municipio o descripción…"
            aria-label="Buscar solicitudes"
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
        <EmptyState>No hay solicitudes con esos criterios.</EmptyState>
      ) : (
        <ul className="space-y-3">
          {rows.map((s) => (
            <li key={s.id}>
              <Link
                href={`/admin/solicitudes/${s.id}`}
                className="block rounded-2xl bg-white p-5 ring-1 ring-neutral-200 transition hover:ring-marca-morado"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-mono text-sm font-bold text-neutral-400">{requestCode(s.number)}</span>
                  <RequestBadge status={s.status} />
                  <UrgencyBadge urgency={s.urgency} />
                  <span className="ml-auto text-sm">
                    <TimeAgo value={s.createdAt} /> · <DateDisplay value={s.createdAt} />
                  </span>
                </div>

                <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-neutral-700">{s.description}</p>

                <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-neutral-500">
                  <span className="font-semibold text-tinta">{s.name}</span>
                  <span>
                    📍 {s.municipality}
                    {s.zone ? `, ${s.zone}` : ''}
                  </span>
                  <span>
                    👥 {s.affectedPeople} {s.affectedPeople === 1 ? 'persona' : 'personas'}
                  </span>
                  {s.hasMinors && <span className="text-amber-700">Hay menores</span>}
                  {s.hasElderly && <span className="text-amber-700">Hay adultos mayores</span>}
                </div>

                <div className="mt-3">
                  <ResourceChips types={s.types} />
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
                href={`/admin/solicitudes?${sp.toString()}`}
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
