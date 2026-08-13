import Link from 'next/link';

import {
  ChipsRecursos,
  Fecha,
  HaceCuanto,
  InsigniaSolicitud,
  InsigniaUrgencia,
  Tarjeta,
  Vacio,
} from '@/components/admin/Piezas';
import { ESTADOS_SOLICITUD, ESTADO_SOLICITUD_META, type EstadoSolicitud } from '@/lib/catalogos';
import { listarSolicitudes } from '@/lib/consultas';
import { folioSolicitud } from '@/lib/whatsapp';

export const dynamic = 'force-dynamic';

type Props = {
  searchParams: Promise<{ estado?: string; q?: string; pagina?: string }>;
};

export default async function Solicitudes({ searchParams }: Props) {
  const params = await searchParams;
  const estado = ESTADOS_SOLICITUD.includes(params.estado as EstadoSolicitud)
    ? (params.estado as EstadoSolicitud)
    : undefined;
  const busqueda = params.q ?? '';
  const pagina = Math.max(1, Number(params.pagina) || 1);

  const { filas, total, paginas } = await listarSolicitudes({ estado, busqueda, pagina });

  const enlaceFiltro = (e?: EstadoSolicitud) => {
    const sp = new URLSearchParams();
    if (e) sp.set('estado', e);
    if (busqueda) sp.set('q', busqueda);
    const query = sp.toString();
    return `/admin/solicitudes${query ? `?${query}` : ''}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Solicitudes</h1>
        <p className="mt-1 text-sm text-neutral-500">
          {total} {total === 1 ? 'solicitud' : 'solicitudes'}
          {estado ? ` en estado “${ESTADO_SOLICITUD_META[estado].label}”` : ''}.
        </p>
      </div>

      <Tarjeta>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={enlaceFiltro()}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              !estado ? 'bg-tinta text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            Todas
          </Link>
          {ESTADOS_SOLICITUD.map((e) => (
            <Link
              key={e}
              href={enlaceFiltro(e)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                estado === e ? 'bg-tinta text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              <span aria-hidden="true">{ESTADO_SOLICITUD_META[e].emoji}</span> {ESTADO_SOLICITUD_META[e].label}
            </Link>
          ))}
        </div>

        <form method="get" className="mt-4 flex gap-2">
          {estado && <input type="hidden" name="estado" value={estado} />}
          <input
            type="search"
            name="q"
            defaultValue={busqueda}
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
      </Tarjeta>

      {filas.length === 0 ? (
        <Vacio>No hay solicitudes con esos criterios.</Vacio>
      ) : (
        <ul className="space-y-3">
          {filas.map((s) => (
            <li key={s.id}>
              <Link
                href={`/admin/solicitudes/${s.id}`}
                className="block rounded-2xl bg-white p-5 ring-1 ring-neutral-200 transition hover:ring-marca-morado"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-mono text-sm font-bold text-neutral-400">{folioSolicitud(s.numero)}</span>
                  <InsigniaSolicitud estado={s.estado} />
                  <InsigniaUrgencia urgencia={s.urgencia} />
                  <span className="ml-auto text-sm">
                    <HaceCuanto valor={s.creadoEn} /> · <Fecha valor={s.creadoEn} />
                  </span>
                </div>

                <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-neutral-700">{s.descripcion}</p>

                <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-neutral-500">
                  <span className="font-semibold text-tinta">{s.nombre}</span>
                  <span>
                    📍 {s.municipio}
                    {s.zona ? `, ${s.zona}` : ''}
                  </span>
                  <span>
                    👥 {s.personasAfectadas} {s.personasAfectadas === 1 ? 'persona' : 'personas'}
                  </span>
                  {s.tieneMenores && <span className="text-amber-700">Hay menores</span>}
                  {s.tieneAdultosMayores && <span className="text-amber-700">Hay adultos mayores</span>}
                </div>

                <div className="mt-3">
                  <ChipsRecursos tipos={s.tipos} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {paginas > 1 && (
        <nav className="flex justify-center gap-2" aria-label="Paginación">
          {Array.from({ length: paginas }, (_, i) => i + 1).map((p) => {
            const sp = new URLSearchParams();
            if (estado) sp.set('estado', estado);
            if (busqueda) sp.set('q', busqueda);
            sp.set('pagina', String(p));
            return (
              <Link
                key={p}
                href={`/admin/solicitudes?${sp.toString()}`}
                aria-current={p === pagina ? 'page' : undefined}
                className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                  p === pagina ? 'bg-tinta text-white' : 'bg-white text-neutral-600 ring-1 ring-neutral-200'
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
