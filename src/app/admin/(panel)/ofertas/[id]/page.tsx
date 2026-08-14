import Link from 'next/link';
import { notFound } from 'next/navigation';

import { updateOfferStatus } from '@/app/admin/actions';
import {
  Card,
  ConnectionBadge,
  DateDisplay,
  EmptyState,
  OfferBadge,
  RequestBadge,
  ResourceChips,
} from '@/components/admin/Primitives';
import { WhatsappButton } from '@/components/admin/WhatsappButton';
import { ActivityLog } from '@/components/admin/ActivityLog';
import {
  AVAILABILITY_LABELS,
  OFFER_STATUS_META,
  OFFER_TRANSITIONS,
  RADIUS_LABELS,
  type Availability,
} from '@/lib/catalogs';
import { getOffer } from '@/lib/queries';
import { formatPhone } from '@/lib/validations';
import { offerCode, requestCode, whatsappLink } from '@/lib/whatsapp';

export const dynamic = 'force-dynamic';

export default async function OfferDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getOffer(id);
  if (!data) notFound();

  const { offer: o, links, log } = data;
  const transitions = OFFER_TRANSITIONS[o.status];

  const verificationMessage = [
    `Hola ${o.name.split(' ')[0]}, te escribimos de *Conexiones*.`,
    ``,
    `Gracias por registrarte (${offerCode(o.number)}). Queremos confirmar tu información antes de proponerte casos:`,
    `1. ¿Sigues disponible?`,
    `2. ¿Confirmas que puedes aportar: ${o.description}?`,
    `3. ¿Sigues en ${o.municipality}?`,
  ].join('\n');

  return (
    <div className="space-y-6">
      <Link href="/admin/ofertas" className="text-sm font-semibold text-neutral-500 hover:text-marca-morado">
        ← Volver a voluntarios
      </Link>

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-mono text-2xl font-extrabold tracking-tight">{offerCode(o.number)}</h1>
        <OfferBadge status={o.status} />
        <span className="ml-auto text-sm text-neutral-500">
          Registrado <DateDisplay value={o.createdAt} />
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <Card title="Qué pone a disposición">
            <ResourceChips types={o.types} side="offering" />
            <p className="mt-4 whitespace-pre-line leading-relaxed text-neutral-800">{o.description}</p>

            <dl className="mt-6 grid gap-4 border-t border-neutral-100 pt-5 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-bold uppercase tracking-wide text-neutral-400">Se desplaza</dt>
                <dd className="mt-1 text-sm text-neutral-800">{RADIUS_LABELS[o.radiusKm]}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-wide text-neutral-400">Ubicación</dt>
                <dd className="mt-1 text-sm text-neutral-800">
                  {o.municipality}, {o.department}
                  {o.zone && <span className="block text-neutral-500">{o.zone}</span>}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-wide text-neutral-400">Disponibilidad</dt>
                <dd className="mt-1 text-sm text-neutral-800">
                  {(o.availability as Availability[]).map((d) => AVAILABILITY_LABELS[d]).join(', ')}
                  {o.availabilityNote && (
                    <span className="block text-neutral-500">{o.availabilityNote}</span>
                  )}
                </dd>
              </div>
              {o.organization && (
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wide text-neutral-400">Organización</dt>
                  <dd className="mt-1 text-sm text-neutral-800">{o.organization}</dd>
                </div>
              )}
            </dl>
          </Card>

          <Card title="Contacto">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-lg font-bold text-tinta">{o.name}</p>
                <p className="mt-0.5 font-mono text-sm text-neutral-600">{formatPhone(o.phone)}</p>
                {o.email && <p className="mt-0.5 text-sm text-neutral-500">{o.email}</p>}
              </div>

              <WhatsappButton
                link={whatsappLink(o.phone, verificationMessage)}
                entityType="offer"
                entityId={o.id}
                detail="Se envió el mensaje de verificación al voluntario."
              >
                {o.status === 'new' ? 'Escribir para verificar' : 'Escribir'}
              </WhatsappButton>
            </div>
          </Card>

          <Card title={`Casos en los que ha participado (${links.length})`}>
            {links.length === 0 ? (
              <EmptyState>Todavía no le hemos propuesto ningún caso.</EmptyState>
            ) : (
              <ul className="space-y-3">
                {links.map(({ connection, request }) => (
                  <li key={connection.id}>
                    <Link
                      href={`/admin/solicitudes/${request.id}`}
                      className="flex flex-wrap items-center gap-3 rounded-xl border border-neutral-200 p-4 transition hover:border-marca-morado"
                    >
                      <span className="font-mono text-sm font-bold text-neutral-400">
                        {requestCode(request.number)}
                      </span>
                      <ConnectionBadge status={connection.status} />
                      <RequestBadge status={request.status} />
                      <span className="min-w-0 flex-1 truncate text-sm text-neutral-600">
                        {request.description}
                      </span>
                      <span className="text-xs text-neutral-400">
                        <DateDisplay value={connection.createdAt} />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Estado del voluntario">
            {transitions.length === 0 ? (
              <EmptyState>Sin acciones disponibles.</EmptyState>
            ) : (
              <form action={updateOfferStatus} className="space-y-3">
                <input type="hidden" name="id" value={o.id} />
                <label className="block text-sm font-semibold text-neutral-600">
                  Nota (queda en la bitácora)
                  <textarea
                    name="note"
                    rows={2}
                    className="mt-1.5 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm"
                  />
                </label>

                <div className="flex flex-col gap-2">
                  {transitions.map((t) => (
                    <button
                      key={t}
                      type="submit"
                      name="status"
                      value={t}
                      className={`rounded-xl px-4 py-3 text-left text-sm font-bold transition hover:brightness-95 ${
                        t === 'verified'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-neutral-100 text-neutral-700'
                      }`}
                    >
                      <span aria-hidden="true">{OFFER_STATUS_META[t].emoji}</span> Marcar como{' '}
                      {OFFER_STATUS_META[t].label}
                    </button>
                  ))}
                </div>
              </form>
            )}
          </Card>

          <ActivityLog log={log} />
        </div>
      </div>
    </div>
  );
}
