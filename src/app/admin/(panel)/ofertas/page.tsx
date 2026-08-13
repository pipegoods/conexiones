import Link from 'next/link';

import { ChipsRecursos, Fecha, InsigniaOferta, Tarjeta, Vacio } from '@/components/admin/Piezas';
import {
  DISPONIBILIDAD_LABEL,
  ESTADOS_OFERTA,
  ESTADO_OFERTA_META,
  RADIO_LABEL,
  type Disponibilidad,
  type EstadoOferta,
} from '@/lib/catalogos';
import { listarOfertas } from '@/lib/consultas';
import { formatearTelefono } from '@/lib/validaciones';
import { folioOferta } from '@/lib/whatsapp';

export const dynamic = 'force-dynamic';

type Props = {
  searchParams: Promise<{ estado?: string; q?: string; pagina?: string }>;
};

export default async function Ofertas({ searchParams }: Props) {
  const params = await searchParams;
  const estado = ESTADOS_OFERTA.includes(params.estado as EstadoOferta)
    ? (params.estado as EstadoOferta)
    : undefined;
  const busqueda = params.q ?? '';
  const pagina = Math.max(1, Number(params.pagina) || 1);

  const { filas, total, paginas } = await listarOfertas({ estado, busqueda, pagina });

  const enlaceFiltro = (e?: EstadoOferta) => {
    const sp = new URLSearchParams();
    if (e) sp.set('estado', e);
    if (busqueda) sp.set('q', busqueda);
    const query = sp.toString();
    return `/admin/ofertas${query ? `?${query}` : ''}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Voluntarios</h1>
        <p className="mt-1 text-sm text-neutral-500">
          {total} {total === 1 ? 'persona registrada' : 'personas registradas'} con algo para aportar.
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
            Todos
          </Link>
          {ESTADOS_OFERTA.map((e) => (
            <Link
              key={e}
              href={enlaceFiltro(e)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                estado === e ? 'bg-tinta text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              <span aria-hidden="true">{ESTADO_OFERTA_META[e].emoji}</span> {ESTADO_OFERTA_META[e].label}
            </Link>
          ))}
        </div>

        <form method="get" className="mt-4 flex gap-2">
          {estado && <input type="hidden" name="estado" value={estado} />}
          <input
            type="search"
            name="q"
            defaultValue={busqueda}
            placeholder="Buscar por nombre, teléfono, municipio, oficio u organización…"
            aria-label="Buscar voluntarios"
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
        <Vacio>No hay voluntarios con esos criterios.</Vacio>
      ) : (
        <ul className="space-y-3">
          {filas.map((o) => (
            <li key={o.id}>
              <Link
                href={`/admin/ofertas/${o.id}`}
                className="block rounded-2xl bg-white p-5 ring-1 ring-neutral-200 transition hover:ring-marca-morado"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-mono text-sm font-bold text-neutral-400">{folioOferta(o.numero)}</span>
                  <InsigniaOferta estado={o.estado} />
                  <span className="font-bold text-tinta">{o.nombre}</span>
                  {o.organizacion && <span className="text-sm text-neutral-500">({o.organizacion})</span>}
                  <span className="ml-auto text-sm text-neutral-400">
                    <Fecha valor={o.creadoEn} />
                  </span>
                </div>

                <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-neutral-700">{o.descripcion}</p>

                <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-neutral-500">
                  <span className="font-mono">{formatearTelefono(o.telefono)}</span>
                  <span>
                    📍 {o.municipio} · {RADIO_LABEL[o.radioKm]}
                  </span>
                  <span>
                    🕒{' '}
                    {(o.disponibilidad as Disponibilidad[]).map((d) => DISPONIBILIDAD_LABEL[d]).join(', ')}
                  </span>
                </div>

                <div className="mt-3">
                  <ChipsRecursos tipos={o.tipos} lado="ofrezco" />
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
                href={`/admin/ofertas?${sp.toString()}`}
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
