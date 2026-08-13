import Link from 'next/link';
import { notFound } from 'next/navigation';

import { cambiarEstadoOferta } from '@/app/admin/acciones';
import { BotonWhatsapp } from '@/components/admin/BotonWhatsapp';
import {
  ChipsRecursos,
  Fecha,
  InsigniaConexion,
  InsigniaOferta,
  InsigniaSolicitud,
  Tarjeta,
  Vacio,
} from '@/components/admin/Piezas';
import {
  DISPONIBILIDAD_LABEL,
  ESTADO_OFERTA_META,
  RADIO_LABEL,
  TRANSICIONES_OFERTA,
  type Disponibilidad,
} from '@/lib/catalogos';
import { obtenerOferta } from '@/lib/consultas';
import { formatearTelefono } from '@/lib/validaciones';
import { enlaceWhatsapp, folioOferta, folioSolicitud } from '@/lib/whatsapp';

export const dynamic = 'force-dynamic';

export default async function DetalleOferta({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const datos = await obtenerOferta(id);
  if (!datos) notFound();

  const { oferta: o, conexiones: vinculos, bitacora } = datos;
  const transiciones = TRANSICIONES_OFERTA[o.estado];

  const mensajeVerificar = [
    `Hola ${o.nombre.split(' ')[0]}, te escribimos de *Conexiones*.`,
    ``,
    `Gracias por registrarte (${folioOferta(o.numero)}). Queremos confirmar tu información antes de proponerte casos:`,
    `1. ¿Sigues disponible?`,
    `2. ¿Confirmas que puedes aportar: ${o.descripcion}?`,
    `3. ¿Sigues en ${o.municipio}?`,
  ].join('\n');

  return (
    <div className="space-y-6">
      <Link href="/admin/ofertas" className="text-sm font-semibold text-neutral-500 hover:text-marca-morado">
        ← Volver a voluntarios
      </Link>

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-mono text-2xl font-extrabold tracking-tight">{folioOferta(o.numero)}</h1>
        <InsigniaOferta estado={o.estado} />
        <span className="ml-auto text-sm text-neutral-500">
          Registrado <Fecha valor={o.creadoEn} />
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <Tarjeta titulo="Qué pone a disposición">
            <ChipsRecursos tipos={o.tipos} lado="ofrezco" />
            <p className="mt-4 whitespace-pre-line leading-relaxed text-neutral-800">{o.descripcion}</p>

            <dl className="mt-6 grid gap-4 border-t border-neutral-100 pt-5 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-bold uppercase tracking-wide text-neutral-400">Se desplaza</dt>
                <dd className="mt-1 text-sm text-neutral-800">{RADIO_LABEL[o.radioKm]}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-wide text-neutral-400">Ubicación</dt>
                <dd className="mt-1 text-sm text-neutral-800">
                  {o.municipio}, {o.departamento}
                  {o.zona && <span className="block text-neutral-500">{o.zona}</span>}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-wide text-neutral-400">Disponibilidad</dt>
                <dd className="mt-1 text-sm text-neutral-800">
                  {(o.disponibilidad as Disponibilidad[]).map((d) => DISPONIBILIDAD_LABEL[d]).join(', ')}
                  {o.notaDisponibilidad && (
                    <span className="block text-neutral-500">{o.notaDisponibilidad}</span>
                  )}
                </dd>
              </div>
              {o.organizacion && (
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wide text-neutral-400">Organización</dt>
                  <dd className="mt-1 text-sm text-neutral-800">{o.organizacion}</dd>
                </div>
              )}
            </dl>
          </Tarjeta>

          <Tarjeta titulo="Contacto">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-lg font-bold text-tinta">{o.nombre}</p>
                <p className="mt-0.5 font-mono text-sm text-neutral-600">{formatearTelefono(o.telefono)}</p>
                {o.email && <p className="mt-0.5 text-sm text-neutral-500">{o.email}</p>}
              </div>

              <BotonWhatsapp
                enlace={enlaceWhatsapp(o.telefono, mensajeVerificar)}
                entidad="oferta"
                entidadId={o.id}
                detalle="Se envió el mensaje de verificación al voluntario."
              >
                {o.estado === 'nueva' ? 'Escribir para verificar' : 'Escribir'}
              </BotonWhatsapp>
            </div>
          </Tarjeta>

          <Tarjeta titulo={`Casos en los que ha participado (${vinculos.length})`}>
            {vinculos.length === 0 ? (
              <Vacio>Todavía no le hemos propuesto ningún caso.</Vacio>
            ) : (
              <ul className="space-y-3">
                {vinculos.map(({ conexion, solicitud }) => (
                  <li key={conexion.id}>
                    <Link
                      href={`/admin/solicitudes/${solicitud.id}`}
                      className="flex flex-wrap items-center gap-3 rounded-xl border border-neutral-200 p-4 transition hover:border-marca-morado"
                    >
                      <span className="font-mono text-sm font-bold text-neutral-400">
                        {folioSolicitud(solicitud.numero)}
                      </span>
                      <InsigniaConexion estado={conexion.estado} />
                      <InsigniaSolicitud estado={solicitud.estado} />
                      <span className="min-w-0 flex-1 truncate text-sm text-neutral-600">
                        {solicitud.descripcion}
                      </span>
                      <span className="text-xs text-neutral-400">
                        <Fecha valor={conexion.creadoEn} />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Tarjeta>
        </div>

        <div className="space-y-6">
          <Tarjeta titulo="Estado del voluntario">
            {transiciones.length === 0 ? (
              <Vacio>Sin acciones disponibles.</Vacio>
            ) : (
              <form action={cambiarEstadoOferta} className="space-y-3">
                <input type="hidden" name="id" value={o.id} />
                <label className="block text-sm font-semibold text-neutral-600">
                  Nota (queda en la bitácora)
                  <textarea
                    name="nota"
                    rows={2}
                    className="mt-1.5 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm"
                  />
                </label>

                <div className="flex flex-col gap-2">
                  {transiciones.map((t) => (
                    <button
                      key={t}
                      type="submit"
                      name="estado"
                      value={t}
                      className={`rounded-xl px-4 py-3 text-left text-sm font-bold transition hover:brightness-95 ${
                        t === 'verificada'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-neutral-100 text-neutral-700'
                      }`}
                    >
                      <span aria-hidden="true">{ESTADO_OFERTA_META[t].emoji}</span> Marcar como{' '}
                      {ESTADO_OFERTA_META[t].label}
                    </button>
                  ))}
                </div>
              </form>
            )}
          </Tarjeta>

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
        </div>
      </div>
    </div>
  );
}
