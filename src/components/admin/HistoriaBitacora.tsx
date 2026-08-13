import { Tarjeta, Vacio, Fecha } from '@/components/admin/Piezas';
import type { Evento } from '@/db/schema';

export function HistoriaBitacora({ bitacora }: { bitacora: Evento[] }) {
  return (
    <Tarjeta titulo={`Bitácora (${bitacora.length})`}>
      {bitacora.length === 0 ? (
        <Vacio>Sin movimientos.</Vacio>
      ) : (
        <ol className="space-y-4">
          {bitacora.map((e) => (
            <li key={e.id} className="border-l-2 border-neutral-200 pl-4 text-sm">
              <p className="font-semibold text-tinta">
                {e.estadoAnterior && e.estadoNuevo
                  ? `${e.estadoAnterior} → ${e.estadoNuevo}`
                  : e.accion.replace(/_/g, ' ')}
              </p>
              {e.nota && <p className="mt-1 text-neutral-600">{e.nota}</p>}
              <p className="mt-1 text-xs text-neutral-400">
                {e.actorNombre ?? 'Sistema'} · <Fecha valor={e.creadoEn} />
              </p>
            </li>
          ))}
        </ol>
      )}
    </Tarjeta>
  );
}