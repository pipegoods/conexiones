import { Tarjeta, ChipsRecursos, Dato } from '@/components/admin/Piezas';
import type { Solicitud } from '@/db/schema';

export function DatosSolicitud({ solicitud }: { solicitud: Solicitud }) {
  return (
    <Tarjeta titulo="La necesidad">
      <ChipsRecursos tipos={solicitud.tipos} lado="necesito" />
      <p className="mt-4 whitespace-pre-line leading-relaxed text-neutral-800">{solicitud.descripcion}</p>

      <dl className="mt-6 grid gap-4 border-t border-neutral-100 pt-5 sm:grid-cols-2">
        <Dato etiqueta="Personas afectadas">
          {solicitud.personasAfectadas}
          {(solicitud.tieneMenores || solicitud.tieneAdultosMayores) && (
            <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">
              {[solicitud.tieneMenores && 'menores', solicitud.tieneAdultosMayores && 'adultos mayores']
                .filter(Boolean)
                .join(' y ')}
            </span>
          )}
        </Dato>
        <Dato etiqueta="Ubicación">
          {solicitud.municipio}, {solicitud.departamento}
          {solicitud.zona && <span className="block text-neutral-500">{solicitud.zona}</span>}
        </Dato>
        {solicitud.referenciaDireccion && <Dato etiqueta="Cómo llegar">{solicitud.referenciaDireccion}</Dato>}
        <Dato etiqueta="Pide para">
          {solicitud.esParaOtraPersona ? 'Otra persona' : 'Sí mismo'}
        </Dato>
      </dl>
    </Tarjeta>
  );
}