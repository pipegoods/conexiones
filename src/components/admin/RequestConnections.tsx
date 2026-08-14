import Link from 'next/link';

import { updateConnection } from '@/app/admin/actions';
import { WhatsappButton } from '@/components/admin/WhatsappButton';
import { DateDisplay, ConnectionBadge, Card, EmptyState } from '@/components/admin/Primitives';
import { formatPhone } from '@/lib/validations';
import {
  whatsappLink,
  requestCode,
  introductionMessageForRequester,
  introductionMessageForVolunteer,
} from '@/lib/whatsapp';
import type { Connection, Offer, HelpRequest } from '@/db/schema';

export function RequestConnections({
  request,
  links,
}: {
  request: HelpRequest;
  links: { connection: Connection; offer: Offer }[];
}) {
  return (
    <Card title={`Conexiones de este caso (${links.length})`}>
      {links.length === 0 ? (
        <EmptyState>Todavía no hay ningún voluntario vinculado a esta solicitud.</EmptyState>
      ) : (
        <ul className="space-y-4">
          {links.map(({ connection, offer }) => (
            <li key={connection.id} className="rounded-2xl border border-neutral-200 p-5">
              <div className="flex flex-wrap items-center gap-3">
                <ConnectionBadge status={connection.status} />
                <Link
                  href={`/admin/ofertas/${offer.id}`}
                  className="font-bold text-tinta hover:text-marca-morado hover:underline"
                >
                  {offer.name}
                </Link>
                <span className="font-mono text-sm text-neutral-600">{formatPhone(offer.phone)}</span>
                <span className="ml-auto text-xs text-neutral-400">
                  puntaje {connection.score} · <DateDisplay value={connection.createdAt} />
                </span>
              </div>

              {connection.reasons && (
                <p className="mt-2 text-xs text-neutral-500">Por qué se propuso: {connection.reasons}</p>
              )}

              {connection.status === 'accepted' && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <WhatsappButton
                    link={whatsappLink(request.phone, introductionMessageForRequester(request, offer))}
                    entityType="request"
                    entityId={request.id}
                    detail={`Se le pasó el contacto de ${offer.name}.`}
                  >
                    Pasarle el contacto a {request.name.split(' ')[0]}
                  </WhatsappButton>
                  <WhatsappButton
                    link={whatsappLink(offer.phone, introductionMessageForVolunteer(offer, request))}
                    entityType="offer"
                    entityId={offer.id}
                    detail={`Se le pasó el contacto de la solicitud ${requestCode(request.number)}.`}
                    variant="secondary"
                  >
                    Pasarle el contacto a {offer.name.split(' ')[0]}
                  </WhatsappButton>
                </div>
              )}

              <form action={updateConnection} className="mt-4 border-t border-neutral-100 pt-4">
                <input type="hidden" name="id" value={connection.id} />
                <label className="block text-sm font-semibold text-neutral-600">
                  Nota
                  <input
                    type="text"
                    name="note"
                    placeholder="Opcional: anota el contexto de esta conexión."
                    className="mt-1.5 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
                  />
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {connection.status === 'proposed' && (
                    <>
                      <StatusButton value="accepted" accent="green">
                        El voluntario aceptó
                      </StatusButton>
                      <StatusButton value="rejected">No pudo</StatusButton>
                    </>
                  )}
                  {connection.status === 'accepted' && (
                    <>
                      <StatusButton value="confirmed" accent="green">
                        La ayuda llegó (cierra el caso)
                      </StatusButton>
                      <StatusButton value="cancelled">Se cayó</StatusButton>
                    </>
                  )}
                  {['rejected', 'cancelled'].includes(connection.status) && (
                    <StatusButton value="proposed">Reabrir la propuesta</StatusButton>
                  )}
                </div>
              </form>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function StatusButton({
  value,
  accent,
  children,
}: {
  value: string;
  accent?: 'green';
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      name="status"
      value={value}
      className={`rounded-xl px-4 py-2 text-sm font-bold transition hover:brightness-95 ${
        accent === 'green' ? 'bg-emerald-600 text-white' : 'bg-neutral-100 text-neutral-700'
      }`}
    >
      {children}
    </button>
  );
}
