import Link from 'next/link';

import { actualizarConexion } from '@/app/admin/acciones';
import { BotonWhatsapp } from '@/components/admin/BotonWhatsapp';
import { Fecha, InsigniaConexion, Tarjeta, Vacio } from '@/components/admin/Piezas';
import { formatearTelefono } from '@/lib/validaciones';
import {
  enlaceWhatsapp,
  folioSolicitud,
  mensajePresentacionASolicitante,
  mensajePresentacionAVoluntario,
} from '@/lib/whatsapp';
import type { Conexion, Oferta, Solicitud } from '@/db/schema';

export function ConexionesSolicitud({
  solicitud,
  vinculos,
}: {
  solicitud: Solicitud;
  vinculos: { conexion: Conexion; oferta: Oferta }[];
}) {
  return (
    <Tarjeta titulo={`Conexiones de este caso (${vinculos.length})`}>
      {vinculos.length === 0 ? (
        <Vacio>Todavía no hay ningún voluntario vinculado a esta solicitud.</Vacio>
      ) : (
        <ul className="space-y-4">
          {vinculos.map(({ conexion, oferta }) => (
            <li key={conexion.id} className="rounded-2xl border border-neutral-200 p-5">
              <div className="flex flex-wrap items-center gap-3">
                <InsigniaConexion estado={conexion.estado} />
                <Link
                  href={`/admin/ofertas/${oferta.id}`}
                  className="font-bold text-tinta hover:text-marca-morado hover:underline"
                >
                  {oferta.nombre}
                </Link>
                <span className="font-mono text-sm text-neutral-600">{formatearTelefono(oferta.telefono)}</span>
                <span className="ml-auto text-xs text-neutral-400">
                  puntaje {conexion.score} · <Fecha valor={conexion.creadoEn} />
                </span>
              </div>

              {conexion.razones && (
                <p className="mt-2 text-xs text-neutral-500">Por qué se propuso: {conexion.razones}</p>
              )}

              {conexion.estado === 'aceptada' && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <BotonWhatsapp
                    enlace={enlaceWhatsapp(solicitud.telefono, mensajePresentacionASolicitante(solicitud, oferta))}
                    entidad="solicitud"
                    entidadId={solicitud.id}
                    detalle={`Se le pasó el contacto de ${oferta.nombre}.`}
                  >
                    Pasarle el contacto a {solicitud.nombre.split(' ')[0]}
                  </BotonWhatsapp>
                  <BotonWhatsapp
                    enlace={enlaceWhatsapp(oferta.telefono, mensajePresentacionAVoluntario(oferta, solicitud))}
                    entidad="oferta"
                    entidadId={oferta.id}
                    detalle={`Se le pasó el contacto de la solicitud ${folioSolicitud(solicitud.numero)}.`}
                    variante="secundario"
                  >
                    Pasarle el contacto a {oferta.nombre.split(' ')[0]}
                  </BotonWhatsapp>
                </div>
              )}

              <form action={actualizarConexion} className="mt-4 border-t border-neutral-100 pt-4">
                <input type="hidden" name="id" value={conexion.id} />
                <label className="block text-sm font-semibold text-neutral-600">
                  Nota
                  <input
                    type="text"
                    name="nota"
                    placeholder="Opcional: anota el contexto de esta conexión."
                    className="mt-1.5 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
                  />
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {conexion.estado === 'propuesta' && (
                    <>
                      <BotonEstado valor="aceptada" tono="verde">
                        El voluntario aceptó
                      </BotonEstado>
                      <BotonEstado valor="rechazada">No pudo</BotonEstado>
                    </>
                  )}
                  {conexion.estado === 'aceptada' && (
                    <>
                      <BotonEstado valor="confirmada" tono="verde">
                        La ayuda llegó (cierra el caso)
                      </BotonEstado>
                      <BotonEstado valor="cancelada">Se cayó</BotonEstado>
                    </>
                  )}
                  {['rechazada', 'cancelada'].includes(conexion.estado) && (
                    <BotonEstado valor="propuesta">Reabrir la propuesta</BotonEstado>
                  )}
                </div>
              </form>
            </li>
          ))}
        </ul>
      )}
    </Tarjeta>
  );
}

function BotonEstado({
  valor,
  tono,
  children,
}: {
  valor: string;
  tono?: 'verde';
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      name="estado"
      value={valor}
      className={`rounded-xl px-4 py-2 text-sm font-bold transition hover:brightness-95 ${
        tono === 'verde' ? 'bg-emerald-600 text-white' : 'bg-neutral-100 text-neutral-700'
      }`}
    >
      {children}
    </button>
  );
}
