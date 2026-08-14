import Link from 'next/link';

import { Card, EmptyState, RequestBadge, ResourceChips, UrgencyBadge } from '@/components/admin/Primitives';
import { TimeAgo } from '@/components/admin/TimeAgo';
import { REQUEST_STATUSES, REQUEST_STATUS_META } from '@/lib/catalogs';
import { getSummary, listRequests } from '@/lib/queries';

export const dynamic = 'force-dynamic';

export default async function Summary() {
  const [summary, pendingResult] = await Promise.all([
    getSummary(),
    listRequests({ page: 1 }),
  ]);

  const funnel = REQUEST_STATUSES.filter((status) => status !== 'discarded');
  const max = Math.max(1, ...funnel.map((status) => summary.byStatus[status]));

  const needsAttention = pendingResult.rows.filter((s) => ['received', 'contacted', 'verified'].includes(s.status));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Resumen de la red</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Cada solicitud avanza por cinco niveles. Lo que está arriba y sin moverse es lo que hay que empujar.
          </p>
        </div>
      </div>

      {summary.unattendedUrgent > 0 && (
        <div className="rounded-2xl border border-red-300 bg-red-50 p-5">
          <p className="font-bold text-red-800">
            {summary.unattendedUrgent}{' '}
            {summary.unattendedUrgent === 1 ? 'emergencia sin atender' : 'emergencias sin atender'}
          </p>
          <p className="mt-1 text-sm text-red-700">
            Marcadas como “es una emergencia, ahora mismo” y todavía sin verificar.{' '}
            <Link href="/admin/solicitudes?status=received" className="font-semibold underline">
              Ver la bandeja
            </Link>
          </p>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <Card title="Embudo de verificación">
          <ul className="space-y-3">
            {funnel.map((status) => {
              const meta = REQUEST_STATUS_META[status];
              const value = summary.byStatus[status];
              return (
                <li key={status}>
                  <Link
                    href={`/admin/solicitudes?status=${status}`}
                    className="group flex items-center gap-4 rounded-xl p-2 transition hover:bg-neutral-50"
                  >
                    <span className="w-8 shrink-0 text-sm font-bold text-neutral-400">N{meta.level}</span>
                    <span className="w-44 shrink-0 text-sm font-semibold text-tinta">
                      <span aria-hidden="true">{meta.emoji}</span> {meta.label}
                    </span>
                    <span className="h-3 flex-1 overflow-hidden rounded-full bg-neutral-100">
                      <span
                        className="block h-full rounded-full bg-linear-to-r from-marca-rosa to-marca-morado transition-colors"
                        style={{ width: `${Math.round((value / max) * 100)}%` }}
                      />
                    </span>
                    <span className="w-12 shrink-0 text-right text-lg font-extrabold tabular-nums">{value}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          {summary.byStatus.discarded > 0 && (
            <p className="mt-4 border-t border-neutral-100 pt-4 text-sm text-neutral-500">
              Además hay{' '}
              <Link href="/admin/solicitudes?status=discarded" className="font-semibold underline">
                {summary.byStatus.discarded} descartadas
              </Link>{' '}
              (duplicadas, no verificables o fuera de alcance).
            </p>
          )}
        </Card>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
          <Card>
            <p className="text-sm text-neutral-500">Voluntarios disponibles</p>
            <p className="mt-1 text-4xl font-extrabold tabular-nums">{summary.activeVolunteers}</p>
            {summary.unverifiedVolunteers > 0 && (
              <p className="mt-2 text-sm text-amber-700">
                <Link href="/admin/ofertas?status=new" className="font-semibold underline">
                  {summary.unverifiedVolunteers} sin verificar
                </Link>
              </p>
            )}
          </Card>

          <Card>
            <p className="text-sm text-neutral-500">Conexiones abiertas</p>
            <p className="mt-1 text-4xl font-extrabold tabular-nums">{summary.openConnections}</p>
            <p className="mt-2 text-sm text-neutral-500">Propuestas o aceptadas, esperando confirmación.</p>
          </Card>

          <Card>
            <p className="text-sm text-neutral-500">Tiempo mediano hasta verificar</p>
            <p className="mt-1 text-4xl font-extrabold tabular-nums">
              {summary.medianVerificationHours == null
                ? '—'
                : summary.medianVerificationHours < 1
                  ? `${Math.round(summary.medianVerificationHours * 60)} min`
                  : `${summary.medianVerificationHours.toFixed(1)} h`}
            </p>
            <p className="mt-2 text-sm text-neutral-500">Desde que llega la solicitud hasta el nivel 2.</p>
          </Card>
        </div>
      </div>

      <Card
        title="Lo que hay que atender ahora"
        action={
          <Link href="/admin/solicitudes" className="text-sm font-semibold text-marca-morado hover:underline">
            Ver todas →
          </Link>
        }
      >
        {needsAttention.length === 0 ? (
          <EmptyState>No hay nada pendiente. Buen trabajo.</EmptyState>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {needsAttention.slice(0, 8).map((s) => (
              <li key={s.id}>
                <Link
                  href={`/admin/solicitudes/${s.id}`}
                  className="flex flex-wrap items-center gap-3 py-3.5 transition hover:bg-neutral-50"
                >
                  <span className="font-mono text-sm font-bold text-neutral-400">
                    S-{String(s.number).padStart(4, '0')}
                  </span>
                  <RequestBadge status={s.status} />
                  <UrgencyBadge urgency={s.urgency} />
                  <span className="text-sm font-semibold text-tinta">{s.municipality}</span>
                  <span className="min-w-0 flex-1 truncate text-sm text-neutral-500">{s.description}</span>
                  <TimeAgo value={s.createdAt} />
                </Link>
                <div className="pb-3 pl-1">
                  <ResourceChips types={s.types} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
