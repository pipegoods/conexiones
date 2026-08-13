import Link from 'next/link';

import { proponerConexion } from '@/app/admin/acciones';
import { BotonWhatsapp } from '@/components/admin/BotonWhatsapp';
import { Tarjeta, Vacio } from '@/components/admin/Piezas';
import { DISPONIBILIDAD_LABEL, RADIO_LABEL } from '@/lib/catalogos';
import { calidadDelMatch, type Sugerencia } from '@/lib/matching';
import { folioOferta, enlaceWhatsapp, mensajePropuestaVoluntario } from '@/lib/whatsapp';
import type { Solicitud } from '@/db/schema';

export function SugerenciasVoluntario({
  solicitud,
  sugerencias,
}: {
  solicitud: Solicitud;
  sugerencias: Sugerencia[];
}) {
  return (
    <Tarjeta titulo={`Voluntarios sugeridos (${sugerencias.length})`}>
      <p className="mb-4 text-sm text-neutral-500">
        El sistema los ordena por qué tanto encajan. La decisión es tuya: revisa las advertencias antes de proponer.
      </p>

      {sugerencias.length === 0 ? (
        <Vacio>
          Todavía no hay voluntarios que encajen con esta necesidad en esta zona. Puedes buscar
          manualmente en
          <Link href="/admin/ofertas" className="font-semibold underline">
            Voluntarios
          </Link>
          .
        </Vacio>
      ) : (
        <ul className="space-y-4">
          {sugerencias.map(({ oferta, score, razones, advertencias }) => {
            const calidad = calidadDelMatch(score);
            return (
              <li key={oferta.id} className="rounded-2xl border border-neutral-200 p-5">
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${calidad.clase}`}>
                    {calidad.label} · {score}/100
                  </span>
                  <Link
                    href={`/admin/ofertas/${oferta.id}`}
                    className="font-bold text-tinta hover:text-marca-morado hover:underline"
                  >
                    {oferta.nombre}
                  </Link>
                  {oferta.organizacion && (
                    <span className="text-sm text-neutral-500">({oferta.organizacion})</span>
                  )}
                  <span className="font-mono text-xs text-neutral-400">{folioOferta(oferta.numero)}</span>
                </div>

                <p className="mt-3 text-sm leading-relaxed text-neutral-700">{oferta.descripcion}</p>

                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-neutral-500">
                  <span>
                    📍 {oferta.municipio} · {RADIO_LABEL[oferta.radioKm]}
                  </span>
                  <span>
                    🕒 {oferta.disponibilidad.map((d) => DISPONIBILIDAD_LABEL[d]).join(', ')}
                  </span>
                </div>

                <ul className="mt-3 space-y-1">
                  {razones.map((r) => (
                    <li key={r} className="flex gap-2 text-sm text-emerald-700">
                      <span aria-hidden="true">✓</span>
                      {r}
                    </li>
                  ))}
                  {advertencias.map((a) => (
                    <li key={a} className="flex gap-2 text-sm text-amber-700">
                      <span aria-hidden="true">!</span>
                      {a}
                    </li>
                  ))}
                </ul>

                <div className="mt-4 flex flex-wrap gap-2">
                  <BotonWhatsapp
                    enlace={enlaceWhatsapp(oferta.telefono, mensajePropuestaVoluntario(oferta, solicitud))}
                    entidad="oferta"
                    entidadId={oferta.id}
                    detalle={`Se le propuso la solicitud ${solicitud.id}.`}
                  >
                    Proponerle por WhatsApp
                  </BotonWhatsapp>

                  <form action={proponerConexion}>
                    <input type="hidden" name="solicitudId" value={solicitud.id} />
                    <input type="hidden" name="ofertaId" value={oferta.id} />
                    <input type="hidden" name="score" value={score} />
                    <input type="hidden" name="razones" value={razones.join(' · ')} />
                    <button
                      type="submit"
                      className="rounded-xl bg-tinta px-4 py-2.5 text-sm font-bold text-white transition hover:brightness-125"
                    >
                      Registrar la propuesta
                    </button>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Tarjeta>
  );
}
