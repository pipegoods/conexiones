import Link from 'next/link';

import { ChipsRecursos, HaceCuanto, InsigniaSolicitud, InsigniaUrgencia, Tarjeta, Vacio } from '@/components/admin/Piezas';
import { ESTADOS_SOLICITUD, ESTADO_SOLICITUD_META } from '@/lib/catalogos';
import { listarSolicitudes, obtenerResumen } from '@/lib/consultas';

export const dynamic = 'force-dynamic';

export default async function Resumen() {
  const [resumen, pendientes] = await Promise.all([
    obtenerResumen(),
    listarSolicitudes({ pagina: 1 }),
  ]);

  const embudo = ESTADOS_SOLICITUD.filter((e) => e !== 'descartada');
  const maximo = Math.max(1, ...embudo.map((e) => resumen.porEstado[e]));

  const porAtender = pendientes.filas.filter((s) => ['recibida', 'contactada', 'verificada'].includes(s.estado));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Resumen de la red</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Cada solicitud avanza por cinco niveles. Lo que está arriba y sin moverse es lo que hay que empujar.
          </p>
        </div>
      </div>

      {resumen.urgentesSinAtender > 0 && (
        <div className="rounded-2xl border border-red-300 bg-red-50 p-5">
          <p className="font-bold text-red-800">
            {resumen.urgentesSinAtender}{' '}
            {resumen.urgentesSinAtender === 1 ? 'emergencia sin atender' : 'emergencias sin atender'}
          </p>
          <p className="mt-1 text-sm text-red-700">
            Marcadas como “es una emergencia, ahora mismo” y todavía sin verificar.{' '}
            <Link href="/admin/solicitudes?estado=recibida" className="font-semibold underline">
              Ver la bandeja
            </Link>
          </p>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <Tarjeta titulo="Embudo de verificación">
          <ul className="space-y-3">
            {embudo.map((estado) => {
              const meta = ESTADO_SOLICITUD_META[estado];
              const valor = resumen.porEstado[estado];
              return (
                <li key={estado}>
                  <Link
                    href={`/admin/solicitudes?estado=${estado}`}
                    className="group flex items-center gap-4 rounded-xl p-2 transition hover:bg-neutral-50"
                  >
                    <span className="w-8 shrink-0 text-sm font-bold text-neutral-400">N{meta.nivel}</span>
                    <span className="w-44 shrink-0 text-sm font-semibold text-tinta">
                      <span aria-hidden="true">{meta.emoji}</span> {meta.label}
                    </span>
                    <span className="h-3 flex-1 overflow-hidden rounded-full bg-neutral-100">
                      <span
                        className="block h-full rounded-full bg-linear-to-r from-marca-rosa to-marca-morado transition-colors"
                        style={{ width: `${Math.round((valor / maximo) * 100)}%` }}
                      />
                    </span>
                    <span className="w-12 shrink-0 text-right text-lg font-extrabold tabular-nums">{valor}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          {resumen.porEstado.descartada > 0 && (
            <p className="mt-4 border-t border-neutral-100 pt-4 text-sm text-neutral-500">
              Además hay{' '}
              <Link href="/admin/solicitudes?estado=descartada" className="font-semibold underline">
                {resumen.porEstado.descartada} descartadas
              </Link>{' '}
              (duplicadas, no verificables o fuera de alcance).
            </p>
          )}
        </Tarjeta>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
          <Tarjeta>
            <p className="text-sm text-neutral-500">Voluntarios disponibles</p>
            <p className="mt-1 text-4xl font-extrabold tabular-nums">{resumen.voluntariosActivos}</p>
            {resumen.voluntariosSinVerificar > 0 && (
              <p className="mt-2 text-sm text-amber-700">
                <Link href="/admin/ofertas?estado=nueva" className="font-semibold underline">
                  {resumen.voluntariosSinVerificar} sin verificar
                </Link>
              </p>
            )}
          </Tarjeta>

          <Tarjeta>
            <p className="text-sm text-neutral-500">Conexiones abiertas</p>
            <p className="mt-1 text-4xl font-extrabold tabular-nums">{resumen.conexionesAbiertas}</p>
            <p className="mt-2 text-sm text-neutral-500">Propuestas o aceptadas, esperando confirmación.</p>
          </Tarjeta>

          <Tarjeta>
            <p className="text-sm text-neutral-500">Tiempo mediano hasta verificar</p>
            <p className="mt-1 text-4xl font-extrabold tabular-nums">
              {resumen.tiempoMedianoVerificacionHoras == null
                ? '—'
                : resumen.tiempoMedianoVerificacionHoras < 1
                  ? `${Math.round(resumen.tiempoMedianoVerificacionHoras * 60)} min`
                  : `${resumen.tiempoMedianoVerificacionHoras.toFixed(1)} h`}
            </p>
            <p className="mt-2 text-sm text-neutral-500">Desde que llega la solicitud hasta el nivel 2.</p>
          </Tarjeta>
        </div>
      </div>

      <Tarjeta
        titulo="Lo que hay que atender ahora"
        accion={
          <Link href="/admin/solicitudes" className="text-sm font-semibold text-marca-morado hover:underline">
            Ver todas →
          </Link>
        }
      >
        {porAtender.length === 0 ? (
          <Vacio>No hay nada pendiente. Buen trabajo.</Vacio>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {porAtender.slice(0, 8).map((s) => (
              <li key={s.id}>
                <Link
                  href={`/admin/solicitudes/${s.id}`}
                  className="flex flex-wrap items-center gap-3 py-3.5 transition hover:bg-neutral-50"
                >
                  <span className="font-mono text-sm font-bold text-neutral-400">
                    S-{String(s.numero).padStart(4, '0')}
                  </span>
                  <InsigniaSolicitud estado={s.estado} />
                  <InsigniaUrgencia urgencia={s.urgencia} />
                  <span className="text-sm font-semibold text-tinta">{s.municipio}</span>
                  <span className="min-w-0 flex-1 truncate text-sm text-neutral-500">{s.descripcion}</span>
                  <HaceCuanto valor={s.creadoEn} />
                </Link>
                <div className="pb-3 pl-1">
                  <ChipsRecursos tipos={s.tipos} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Tarjeta>
    </div>
  );
}
