import Link from 'next/link';
import { notFound } from 'next/navigation';

import { updateRequestStatus } from '@/app/admin/actions';
import { ActivityLog } from '@/components/admin/ActivityLog';
import { InternalNotes } from '@/components/admin/InternalNotes';
import { Card, DateDisplay, EmptyState } from '@/components/admin/Primitives';
import { RequestConnections } from '@/components/admin/RequestConnections';
import { RequestContact } from '@/components/admin/RequestContact';
import { RequestDetails } from '@/components/admin/RequestDetails';
import { VolunteerSuggestions } from '@/components/admin/VolunteerSuggestions';
import { REQUEST_STATUS_META, REQUEST_TRANSITIONS } from '@/lib/catalogs';
import { getRequest, getSuggestionsForRequest } from '@/lib/queries';

export const dynamic = 'force-dynamic';

export default async function RequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getRequest(id);
  if (!data) notFound();

  const { request, links, log } = data;
  const transitions = REQUEST_TRANSITIONS[request.status];

  // Suggestions only make sense after verifying that the request is real.
  const suggestions = ['verified', 'connected'].includes(request.status)
    ? await getSuggestionsForRequest(request)
    : [];

  return (
    <div className="space-y-6">
      <Link href="/admin/solicitudes" className="text-sm font-semibold text-neutral-500 hover:text-marca-morado">
        ← Volver a solicitudes
      </Link>

      <RequestDetails request={request} />

      <ActivityLog log={log} />

      <RequestContact request={request} />

      {/* ------------------------------------------------- Suggestions -- */}
      {['verified', 'connected'].includes(request.status) && (
        <VolunteerSuggestions request={request} suggestions={suggestions} />
      )}

      {/* ------------------------------------------------- Connections -- */}
      <RequestConnections request={request} links={links} />

      {/* ------------------------------------------------------ Column -- */}
      <div className="space-y-6">
        <Card title="Mover de nivel">
          {transitions.length === 0 ? (
            <EmptyState>Este caso está cerrado.</EmptyState>
          ) : (
            <form action={updateRequestStatus} className="space-y-3">
              <input type="hidden" name="id" value={request.id} />
              <label className="block text-sm font-semibold text-neutral-600">
                Nota (queda en la bitácora)
                <textarea
                  name="note"
                  rows={2}
                  placeholder="Ejemplo: hablé con ella, confirmó la dirección y que son 4 personas."
                  className="mt-1.5 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm"
                />
              </label>

              <div className="flex flex-col gap-2">
                {transitions.map((t) => {
                  const m = REQUEST_STATUS_META[t];
                  return (
                    <button
                      key={t}
                      type="submit"
                      name="status"
                      value={t}
                      className={`rounded-xl px-4 py-3 text-left text-sm font-bold transition hover:brightness-95 ${
                        t === 'discarded'
                          ? 'bg-neutral-100 text-neutral-700'
                          : 'bg-linear-to-r from-marca-rosa to-marca-morado text-white'
                      }`}
                    >
                      <span aria-hidden="true">{m.emoji}</span> Pasar a {m.label}
                    </button>
                  );
                })}
              </div>
            </form>
          )}
        </Card>

        <Card title="Línea de tiempo">
          <ol className="space-y-3 text-sm">
            <Milestone label="Recibida" value={request.createdAt} />
            <Milestone label="Contactada" value={request.contactedAt} />
            <Milestone label="Verificada" value={request.verifiedAt} />
            <Milestone label="Conectada" value={request.connectedAt} />
            <Milestone label="Resuelta" value={request.resolvedAt} />
          </ol>
        </Card>

        <InternalNotes id={request.id} internalNotes={request.internalNotes ?? ''} />
      </div>
    </div>
  );
}

function Milestone({ label, value }: { label: string; value: Date | null }) {
  return (
    <li className="flex items-center justify-between gap-3">
      <span className={value ? 'font-semibold text-tinta' : 'text-neutral-400'}>{label}</span>
      <span className="text-neutral-500">
        <DateDisplay value={value} />
      </span>
    </li>
  );
}
