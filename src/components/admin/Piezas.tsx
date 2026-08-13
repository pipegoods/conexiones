import {
  ESTADO_CONEXION_META,
  ESTADO_OFERTA_META,
  ESTADO_SOLICITUD_META,
  RECURSOS,
  URGENCIA_LABEL,
  type EstadoConexion,
  type EstadoOferta,
  type EstadoSolicitud,
  type TipoRecurso,
  type Urgencia,
} from '@/lib/catalogos';

export function InsigniaSolicitud({ estado }: { estado: EstadoSolicitud }) {
  const meta = ESTADO_SOLICITUD_META[estado];
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold ring-1 ${meta.clase}`}
      title={meta.descripcion}
    >
      <span aria-hidden="true">{meta.emoji}</span>
      {meta.nivel >= 0 && <span className="opacity-60">N{meta.nivel}</span>}
      {meta.label}
    </span>
  );
}

export function InsigniaOferta({ estado }: { estado: EstadoOferta }) {
  const meta = ESTADO_OFERTA_META[estado];
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold ring-1 ${meta.clase}`}
    >
      <span aria-hidden="true">{meta.emoji}</span>
      {meta.label}
    </span>
  );
}

export function InsigniaConexion({ estado }: { estado: EstadoConexion }) {
  const meta = ESTADO_CONEXION_META[estado];
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ring-1 ${meta.clase}`}>
      {meta.label}
    </span>
  );
}

const CLASES_URGENCIA: Record<Urgencia, string> = {
  inmediata: 'bg-red-100 text-red-800 ring-red-300',
  hoy: 'bg-orange-100 text-orange-800 ring-orange-300',
  esta_semana: 'bg-amber-50 text-amber-800 ring-amber-200',
  sin_prisa: 'bg-neutral-100 text-neutral-600 ring-neutral-300',
};

export function InsigniaUrgencia({ urgencia }: { urgencia: Urgencia }) {
  return (
    <span className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold ring-1 ${CLASES_URGENCIA[urgencia]}`}>
      {URGENCIA_LABEL[urgencia]}
    </span>
  );
}

export function ChipsRecursos({
  tipos,
  lado = 'panel',
}: {
  tipos: readonly TipoRecurso[];
  lado?: 'panel' | 'necesito' | 'ofrezco';
}) {
  return (
    <ul className="flex flex-wrap gap-1.5">
      {tipos.map((t) => (
        <li
          key={t}
          className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-700"
        >
          <span aria-hidden="true">{RECURSOS[t].emoji}</span>
          {RECURSOS[t][lado]}
        </li>
      ))}
    </ul>
  );
}

const FORMATO_FECHA = new Intl.DateTimeFormat('es-CO', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'America/Bogota',
});

export function Fecha({ valor }: { valor: Date | null }) {
  if (!valor) return <span className="text-neutral-400">—</span>;
  return (
    <time dateTime={valor.toISOString()} title={valor.toLocaleString('es-CO')}>
      {FORMATO_FECHA.format(valor)}
    </time>
  );
}

export { HaceCuanto } from './HaceCuanto';

export function Tarjeta({
  titulo,
  accion,
  children,
}: {
  titulo?: string;
  accion?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-white p-6 ring-1 ring-neutral-200">
      {(titulo || accion) && (
        <div className="mb-4 flex items-center justify-between gap-4">
          {titulo && <h2 className="font-extrabold tracking-tight text-tinta">{titulo}</h2>}
          {accion}
        </div>
      )}
      {children}
    </section>
  );
}

export function Vacio({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed border-neutral-300 p-8 text-center text-sm text-neutral-500">
      {children}
    </p>
  );
}


export function Dato({ etiqueta, children }: { etiqueta: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase tracking-wide text-neutral-400">{etiqueta}</dt>
      <dd className="mt-1 text-sm text-neutral-800">{children}</dd>
    </div>
  );
}
