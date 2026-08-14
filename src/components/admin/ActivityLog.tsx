import {
  CONNECTION_STATUS_META,
  EVENT_ACTION_LABELS,
  OFFER_STATUS_META,
  REQUEST_STATUS_META,
  type ConnectionStatus,
  type OfferStatus,
  type RequestStatus,
} from '@/lib/catalogs';
import { Card, EmptyState, DateDisplay } from '@/components/admin/Primitives';
import type { LogEvent } from '@/db/schema';

/**
 * Maps a raw status value to its Spanish catalog label for the event entity
 * type. Never render raw values such as "received" on screen.
 */
function statusLabel(entityType: LogEvent['entityType'], status: string | null): string | null {
  if (!status) return status;
  if (entityType === 'request') return REQUEST_STATUS_META[status as RequestStatus]?.label ?? 'Estado no reconocido';
  if (entityType === 'offer') return OFFER_STATUS_META[status as OfferStatus]?.label ?? 'Estado no reconocido';
  if (entityType === 'connection') return CONNECTION_STATUS_META[status as ConnectionStatus]?.label ?? 'Estado no reconocido';
  return 'Estado no reconocido';
}

export function ActivityLog({ log }: { log: LogEvent[] }) {
  return (
    <Card title={`Bitácora (${log.length})`}>
      {log.length === 0 ? (
        <EmptyState>Sin movimientos.</EmptyState>
      ) : (
        <ol className="space-y-4">
          {log.map((e) => (
            <li key={e.id} className="border-l-2 border-neutral-200 pl-4 text-sm">
              <p className="font-semibold text-tinta">
                {e.previousStatus && e.newStatus
                  ? `${statusLabel(e.entityType, e.previousStatus)} → ${statusLabel(e.entityType, e.newStatus)}`
                  : (EVENT_ACTION_LABELS[e.action] ?? 'Acción no reconocida')}
              </p>
              {e.note && <p className="mt-1 text-neutral-600">{e.note}</p>}
              <p className="mt-1 text-xs text-neutral-400">
                {e.actorName ?? 'Sistema'} · <DateDisplay value={e.createdAt} />
              </p>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}
