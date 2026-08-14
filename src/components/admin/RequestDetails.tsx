import { Card, ResourceChips, DataPoint } from '@/components/admin/Primitives';
import type { HelpRequest } from '@/db/schema';

export function RequestDetails({ request }: { request: HelpRequest }) {
  return (
    <Card title="La necesidad">
      <ResourceChips types={request.types} side="seeking" />
      <p className="mt-4 whitespace-pre-line leading-relaxed text-neutral-800">{request.description}</p>

      <dl className="mt-6 grid gap-4 border-t border-neutral-100 pt-5 sm:grid-cols-2">
        <DataPoint label="Personas afectadas">
          {request.affectedPeople}
          {(request.hasMinors || request.hasElderly) && (
            <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">
              {[request.hasMinors && 'menores', request.hasElderly && 'adultos mayores']
                .filter(Boolean)
                .join(' y ')}
            </span>
          )}
        </DataPoint>
        <DataPoint label="Ubicación">
          {request.municipality}, {request.department}
          {request.zone && <span className="block text-neutral-500">{request.zone}</span>}
        </DataPoint>
        {request.addressReference && <DataPoint label="Cómo llegar">{request.addressReference}</DataPoint>}
        <DataPoint label="Pide para">
          {request.isForSomeoneElse ? 'Otra persona' : 'Sí mismo'}
        </DataPoint>
      </dl>
    </Card>
  );
}
