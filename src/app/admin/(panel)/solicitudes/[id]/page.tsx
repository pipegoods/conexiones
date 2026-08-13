import Link from 'next/link';
import { notFound } from 'next/navigation';

import { cambiarEstadoSolicitud } from '@/app/admin/acciones';
import { ConexionesSolicitud } from '@/components/admin/ConexionesSolicitud';
import { ContactoSolicitud } from '@/components/admin/ContactoSolicitud';
import { DatosSolicitud } from '@/components/admin/DatosSolicitud';
import { HistoriaBitacora } from '@/components/admin/HistoriaBitacora';
import { NotasInternas } from '@/components/admin/NotasInternas';
import { Fecha, Tarjeta, Vacio } from '@/components/admin/Piezas';
import { SugerenciasVoluntario } from '@/components/admin/SugerenciasVoluntario';
import { ESTADO_SOLICITUD_META, TRANSICIONES_SOLICITUD } from '@/lib/catalogos';
import { obtenerSolicitud, sugerenciasPara } from '@/lib/consultas';

export const dynamic = 'force-dynamic';

export default async function DetalleSolicitud({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const datos = await obtenerSolicitud(id);
  if (!datos) notFound();

  const { solicitud: s, conexiones: vinculos, bitacora } = datos;
  const transiciones = TRANSICIONES_SOLICITUD[s.estado];

  // Solo tiene sentido buscar candidatos cuando ya verificamos que el caso es real.
  const sugerencias = ['verificada', 'conectada'].includes(s.estado) ? await sugerenciasPara(s) : [];

  return (
    <div className="space-y-6">
      <Link href="/admin/solicitudes" className="text-sm font-semibold text-neutral-500 hover:text-marca-morado">
        ← Volver a solicitudes
      </Link>

      <DatosSolicitud solicitud={s} />

      <HistoriaBitacora bitacora={bitacora} />

      <ContactoSolicitud solicitud={s} />

      {/* -------------------------------------------------- Sugerencias -- */}
      {['verificada', 'conectada'].includes(s.estado) && (
        <SugerenciasVoluntario solicitud={s} sugerencias={sugerencias} />
      )}

      {/* -------------------------------------------------- Conexiones -- */}
      <ConexionesSolicitud solicitud={s} vinculos={vinculos} />

      {/* ------------------------------------------------------ Columna -- */}
      <div className="space-y-6">
        <Tarjeta titulo="Mover de nivel">
          {transiciones.length === 0 ? (
            <Vacio>Este caso está cerrado.</Vacio>
          ) : (
            <form action={cambiarEstadoSolicitud} className="space-y-3">
              <input type="hidden" name="id" value={s.id} />
              <label className="block text-sm font-semibold text-neutral-600">
                Nota (queda en la bitácora)
                <textarea
                  name="nota"
                  rows={2}
                  placeholder="Ejemplo: hablé con ella, confirmó la dirección y que son 4 personas."
                  className="mt-1.5 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm"
                />
              </label>

              <div className="flex flex-col gap-2">
                {transiciones.map((t) => {
                  const m = ESTADO_SOLICITUD_META[t];
                  return (
                    <button
                      key={t}
                      type="submit"
                      name="estado"
                      value={t}
                      className={`rounded-xl px-4 py-3 text-left text-sm font-bold transition hover:brightness-95 ${
                        t === 'descartada'
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
        </Tarjeta>

        <Tarjeta titulo="Línea de tiempo">
          <ol className="space-y-3 text-sm">
            <Hito etiqueta="Recibida" valor={s.creadoEn} />
            <Hito etiqueta="Contactada" valor={s.contactadoEn} />
            <Hito etiqueta="Verificada" valor={s.verificadoEn} />
            <Hito etiqueta="Conectada" valor={s.conectadoEn} />
            <Hito etiqueta="Resuelta" valor={s.resueltoEn} />
          </ol>
        </Tarjeta>

        <NotasInternas id={s.id} notasInternas={s.notasInternas ?? ''} />
      </div>
    </div>
  );
}

function Hito({ etiqueta, valor }: { etiqueta: string; valor: Date | null }) {
  return (
    <li className="flex items-center justify-between gap-3">
      <span className={valor ? 'font-semibold text-tinta' : 'text-neutral-400'}>{etiqueta}</span>
      <span className="text-neutral-500">
        <Fecha valor={valor} />
      </span>
    </li>
  );
}