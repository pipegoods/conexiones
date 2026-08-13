import Link from 'next/link';

import { Encabezado } from '@/components/Encabezado';
import { PieDePagina } from '@/components/PieDePagina';
import { RECURSOS, type TipoRecurso } from '@/lib/catalogos';
import { obtenerCifras } from '@/lib/cifras';

/** Las cifras se recalculan cada minuto: suficiente para sentirse vivo sin castigar la base. */
export const revalidate = 60;

const NECESIDADES_DESTACADAS: TipoRecurso[] = [
  'transporte',
  'alimentos',
  'alojamiento',
  'herramientas',
  'salud',
  'apoyo_psicologico',
  'informacion',
  'profesion',
];

const APORTES_DESTACADOS: TipoRecurso[] = [
  'tiempo',
  'profesion',
  'transporte',
  'herramientas',
  'espacio',
  'alimentos',
  'conocimientos',
  'contactos',
];

const burbujas = [
  { emoji: '👥', arriba: '4%', izquierda: '46%', demora: '0s' },
  { emoji: '🚚', arriba: '17%', izquierda: '86%', demora: '0.8s' },
  { emoji: '🛠️', arriba: '52%', izquierda: '92%', demora: '1.6s' },
  { emoji: '🏠', arriba: '58%', izquierda: '10%', demora: '2.4s' },
  { emoji: '❤️', arriba: '82%', izquierda: '38%', demora: '3.2s' },
];

const pasos = [
  {
    numero: '01',
    titulo: 'CUÉNTANOS',
    texto: 'Cuéntanos qué necesitas o qué puedes aportar.',
    fondo: 'bg-violet-50',
    icono: <IconoFormulario className="h-8 w-8 text-marca-morado" />,
  },
  {
    numero: '02',
    titulo: 'ENCONTRAMOS',
    texto: 'Buscamos a las personas, profesionales, empresas u organizaciones adecuadas.',
    fondo: 'bg-pink-50',
    icono: <IconoLupa className="h-8 w-8 text-marca-rosa" />,
  },
  {
    numero: '03',
    titulo: 'CONECTAMOS',
    texto: 'Ponemos en contacto a quien necesita con quien puede ayudar.',
    fondo: 'bg-teal-50',
    icono: <IconoPersonas className="h-8 w-8 text-marca-cian" />,
  },
];

const flujo = [
  { texto: 'Necesidad', color: 'text-marca-morado' },
  { texto: 'Capacidad', color: 'text-marca-rosa' },
  { texto: 'Conexión', color: 'text-marca-cian' },
  { texto: 'Ayuda', color: 'text-marca-verde' },
];

const preguntasFrecuentes = [
  {
    p: '¿Cuánto cuesta usar Conexiones?',
    r: 'Nada. Ni para quien pide ayuda ni para quien la ofrece. Nunca te vamos a pedir dinero ni datos bancarios: si alguien lo hace en nuestro nombre, es una estafa.',
  },
  {
    p: '¿Qué pasa con mis datos?',
    r: 'Tus datos personales solo los ve el equipo interno de Conexiones y, si aceptas una conexión, la persona con la que te vamos a conectar. No hay listados públicos con nombres, teléfonos ni direcciones.',
  },
  {
    p: '¿Cómo verifican que una solicitud es real?',
    r: 'Alguien del equipo se comunica por WhatsApp y confirma que la persona existe, que la necesidad existe y que está en el lugar indicado. Solo después de eso buscamos quién puede ayudar.',
  },
  {
    p: '¿Cuánto me demoro en recibir respuesta?',
    r: 'Depende del volumen y de la urgencia que marques. Priorizamos las emergencias. Si es una situación de riesgo vital, llama al 123: nosotros no somos un servicio de emergencia.',
  },
  {
    p: 'No tengo dinero, ¿igual puedo ayudar?',
    r: 'Sí, y de hecho es lo que más falta hace. Un vehículo, unas herramientas, un oficio, un espacio o unas horas de tu tiempo suelen resolver más que una donación.',
  },
];

export default async function Inicio() {
  const cifras = await obtenerCifras();

  return (
    <>
      <Encabezado />
      <main>
        <Portada />
        <ComoFunciona />
        <DosLados />
        <RedEnTiempoReal cifras={cifras} />
        <SobreNosotros />
        <Preguntas />
        <LlamadoFinal />
      </main>
      <PieDePagina />
    </>
  );
}

/* ---------------------------------------------------------------- Portada --- */

function Portada() {
  return (
    <section className="relative overflow-hidden bg-linear-to-b from-white to-nube">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 lg:grid-cols-[1.05fr_1fr] lg:py-24">
        <div>
          <h1 className="text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
            Cuando algo ocurre,
            <br />
            <span className="texto-gradiente">todos nos conectamos.</span>
          </h1>

          <p className="mt-6 max-w-lg text-lg leading-relaxed text-neutral-600">
            Conectamos necesidades reales con personas que tienen algo para aportar: tiempo, conocimiento,
            recursos, herramientas o capacidades.
          </p>

          <div className="mt-9 flex flex-col gap-4 sm:flex-row">
            <TarjetaAccion
              href="/necesito-ayuda"
              titulo="NECESITO AYUDA"
              descripcion="Solicita la ayuda que tú o alguien más necesita."
              clase="from-marca-coral to-marca-rosa shadow-marca-rosa/30"
            />
            <TarjetaAccion
              href="/quiero-ayudar"
              titulo="QUIERO AYUDAR"
              descripcion="Pon a disposición lo que sabes hacer, tienes o puedes ofrecer."
              clase="from-marca-verde-claro to-marca-cian shadow-marca-verde/30"
            />
          </div>

          <p className="mt-8 flex items-start gap-3 text-sm text-neutral-600">
            <IconoEscudo className="mt-0.5 h-5 w-5 shrink-0 text-marca-morado" />
            <span>
              <strong className="font-bold text-tinta">Gratuito, seguro y transparente.</strong>
              <br />
              Verificamos las solicitudes antes de conectarlas.
            </span>
          </p>
        </div>

        <CintaDecorativa />
      </div>
    </section>
  );
}

function TarjetaAccion({
  href,
  titulo,
  descripcion,
  clase,
}: {
  href: string;
  titulo: string;
  descripcion: string;
  clase: string;
}) {
  return (
    <Link
      href={href}
      className={`group relative flex-1 overflow-hidden rounded-2xl bg-linear-to-br ${clase} p-6 text-white shadow-xl transition hover:brightness-105 active:scale-[0.99]`}
    >
      <IconoCorazonManos className="h-9 w-9 opacity-95" />
      <p className="mt-4 text-base font-extrabold tracking-wide">{titulo}</p>
      <p className="mt-1.5 max-w-[16rem] text-sm leading-snug text-white/85">{descripcion}</p>
      <span
        aria-hidden="true"
        className="absolute bottom-5 right-5 text-xl transition group-hover:translate-x-1"
      >
        →
      </span>
    </Link>
  );
}

/** La cinta del hero: el gradiente de marca uniendo iconos sueltos. Puramente decorativa. */
function CintaDecorativa() {
  return (
    <div className="relative hidden aspect-square w-full lg:block" aria-hidden="true">
      <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id="cinta" x1="0" y1="0.3" x2="1" y2="0.7">
            <stop offset="0%" stopColor="var(--color-marca-rosa)" />
            <stop offset="45%" stopColor="var(--color-marca-morado)" />
            <stop offset="100%" stopColor="var(--color-marca-cian)" />
          </linearGradient>
        </defs>

        <circle cx="215" cy="195" r="150" fill="none" stroke="#e6dcf7" strokeWidth="1" strokeDasharray="3 6" />
        <circle cx="215" cy="195" r="105" fill="none" stroke="#efe7fb" strokeWidth="1" strokeDasharray="3 6" />

        <path
          d="M -20 150 C 90 60, 150 300, 250 230 S 380 90, 430 130"
          fill="none"
          stroke="url(#cinta)"
          strokeWidth="34"
          strokeLinecap="round"
          opacity="0.95"
        />

        {[
          [150, 105],
          [300, 285],
          [355, 155],
        ].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="4" fill="var(--color-marca-morado)" opacity="0.5" />
        ))}
      </svg>

      {burbujas.map((b) => (
        <span
          key={b.emoji}
          className="absolute grid h-16 w-16 animate-flotar place-items-center rounded-full bg-white text-2xl shadow-lg shadow-marca-morado/10 ring-1 ring-neutral-100"
          style={{ top: b.arriba, left: b.izquierda, animationDelay: b.demora }}
        >
          {b.emoji}
        </span>
      ))}
    </div>
  );
}

/* ------------------------------------------------------- Cómo funciona --- */

function ComoFunciona() {
  return (
    <section id="como-funciona" className="bg-nube py-6">
      <div className="mx-auto max-w-6xl px-5">
        <div className="rounded-3xl bg-white/70 px-6 py-14 ring-1 ring-neutral-100">
          <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-marca-morado">
            Cómo funciona
          </p>
          <h2 className="mt-3 text-center text-4xl font-extrabold tracking-tight">
            Tres pasos simples. Un <span className="texto-gradiente">impacto real.</span>
          </h2>

          <ol className="mt-12 grid gap-10 md:grid-cols-3">
            {pasos.map((p) => (
              <li key={p.numero} className="text-center">
                <div className={`mx-auto grid h-20 w-20 place-items-center rounded-full ${p.fondo}`}>
                  {p.icono}
                </div>
                <p className="mt-5 text-sm font-extrabold tracking-wide text-tinta">
                  {p.numero}. {p.titulo}
                </p>
                <p className="mx-auto mt-2 max-w-[17rem] text-sm leading-relaxed text-neutral-600">{p.texto}</p>
              </li>
            ))}
          </ol>

          <div className="mt-12 flex justify-center">
            <div className="flex flex-wrap items-center justify-center gap-2 rounded-full bg-white px-6 py-3 shadow-sm ring-1 ring-neutral-100">
              {flujo.map((f, i) => (
                <span key={f.texto} className="flex items-center gap-2">
                  <span className={`text-sm font-bold ${f.color}`}>{f.texto}</span>
                  {i < flujo.length - 1 && (
                    <span aria-hidden="true" className="text-neutral-300">
                      →
                    </span>
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ Dos lados --- */

function DosLados() {
  return (
    <section className="bg-nube py-6">
      <div className="mx-auto grid max-w-6xl gap-6 px-5 lg:grid-cols-2">
        <PanelLado
          etiqueta="¿Qué puedes encontrar?"
          claseEtiqueta="bg-violet-100 text-marca-morado"
          titulo={
            <>
              Lo que <span className="text-marca-morado">necesitas</span>,<br />
              cuando lo necesitas.
            </>
          }
          tipos={NECESIDADES_DESTACADAS}
          lado="necesito"
        />
        <PanelLado
          etiqueta="¿Qué puedes aportar?"
          claseEtiqueta="bg-teal-100 text-teal-700"
          titulo={
            <>
              No necesitas tener dinero
              <br />
              para <span className="text-marca-verde">hacer la diferencia.</span>
            </>
          }
          tipos={APORTES_DESTACADOS}
          lado="ofrezco"
        />
      </div>
    </section>
  );
}

function PanelLado({
  etiqueta,
  claseEtiqueta,
  titulo,
  tipos,
  lado,
}: {
  etiqueta: string;
  claseEtiqueta: string;
  titulo: React.ReactNode;
  tipos: TipoRecurso[];
  lado: 'necesito' | 'ofrezco';
}) {
  return (
    <div className="rounded-3xl bg-white p-8 ring-1 ring-neutral-100">
      <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${claseEtiqueta}`}>
        {etiqueta}
      </span>
      <h2 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight">{titulo}</h2>

      <ul className="mt-7 grid grid-cols-2 gap-2.5">
        {tipos.map((t) => (
          <li
            key={t}
            className="flex items-center gap-2.5 rounded-xl bg-neutral-50 px-3.5 py-3 text-sm font-medium text-neutral-700"
          >
            <span aria-hidden="true">{RECURSOS[t].emoji}</span>
            {RECURSOS[t][lado]}
          </li>
        ))}
      </ul>

      <p className="mt-5 text-center text-sm text-neutral-400">••• Y más...</p>
    </div>
  );
}

/* ------------------------------------------------------ Cifras públicas --- */

function RedEnTiempoReal({
  cifras,
}: {
  cifras: { recibidas: number; verificadas: number; conectadas: number; resueltas: number };
}) {
  const tarjetas = [
    { valor: cifras.recibidas, texto: 'Necesidades recibidas', emoji: '👥', fondo: 'bg-violet-50' },
    { valor: cifras.verificadas, texto: 'Necesidades verificadas', emoji: '🛡️', fondo: 'bg-pink-50' },
    { valor: cifras.conectadas, texto: 'Ayudas conectadas', emoji: '🤝', fondo: 'bg-sky-50' },
    { valor: cifras.resueltas, texto: 'Necesidades resueltas', emoji: '💚', fondo: 'bg-emerald-50' },
  ];

  return (
    <section id="transparencia" className="bg-nube py-6">
      <div className="mx-auto max-w-6xl px-5">
        <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-marca-morado">
          La red en tiempo real
        </p>

        <dl className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {tarjetas.map((t) => (
            <div key={t.texto} className="flex items-center gap-4 rounded-2xl bg-white p-6 ring-1 ring-neutral-100">
              <span className={`grid h-14 w-14 shrink-0 place-items-center rounded-full text-2xl ${t.fondo}`}>
                <span aria-hidden="true">{t.emoji}</span>
              </span>
              <div>
                <dd className="text-4xl font-extrabold tracking-tight tabular-nums">{t.valor}</dd>
                <dt className="mt-0.5 text-sm text-neutral-500">{t.texto}</dt>
              </div>
            </div>
          ))}
        </dl>

        <p className="mt-5 text-center text-sm text-neutral-500">
          Los números se actualizan continuamente con la información real de la red.
        </p>
      </div>
    </section>
  );
}

/* -------------------------------------------------------- Sobre / FAQ --- */

function SobreNosotros() {
  return (
    <section id="sobre-nosotros" className="bg-nube py-6">
      <div className="mx-auto max-w-6xl px-5">
        <div className="grid gap-8 rounded-3xl bg-white p-10 ring-1 ring-neutral-100 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight">
              Sobre <span className="texto-gradiente">Conexiones</span>
            </h2>
            <p className="mt-5 leading-relaxed text-neutral-600">
              Después de una emergencia sobra la voluntad de ayudar y falta la información. Hay quien tiene una
              camioneta parada y quien necesita mover materiales. Hay un carpintero desocupado y una familia con la
              puerta destrozada. El problema casi nunca es la falta de gente buena: es que nadie sabe quién tiene
              qué.
            </p>
            <p className="mt-4 leading-relaxed text-neutral-600">
              Conexiones existe para cerrar esa distancia. Preguntamos qué necesitas y qué puedes poner a
              disposición, verificamos que cada solicitud sea real, y ponemos a las dos personas en contacto.
            </p>
          </div>

          <div className="rounded-2xl bg-nube p-7">
            <h3 className="font-bold text-tinta">Nuestros compromisos</h3>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-neutral-600">
              {[
                'Nunca cobramos, ni a quien pide ni a quien ayuda.',
                'No publicamos datos personales de nadie en internet.',
                'Verificamos cada solicitud antes de conectarla.',
                'Publicamos nuestras cifras completas, incluidas las que no nos favorecen.',
                'No reemplazamos a los organismos oficiales de emergencia.',
              ].map((c) => (
                <li key={c} className="flex gap-2.5">
                  <span aria-hidden="true" className="text-marca-verde">
                    ✓
                  </span>
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function Preguntas() {
  return (
    <section id="preguntas" className="bg-nube py-6">
      <div className="mx-auto max-w-3xl px-5 py-10">
        <h2 className="text-center text-3xl font-extrabold tracking-tight">Preguntas frecuentes</h2>
        <div className="mt-8 space-y-3">
          {preguntasFrecuentes.map((f) => (
            <details key={f.p} className="group rounded-2xl bg-white p-5 ring-1 ring-neutral-100">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold text-tinta">
                {f.p}
                <span aria-hidden="true" className="text-marca-morado transition group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-neutral-600">{f.r}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------- Llamado final --- */

function LlamadoFinal() {
  return (
    <section id="contacto" className="bg-nube pb-16 pt-6">
      <div className="mx-auto max-w-6xl px-5">
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-tinta via-tinta-suave to-tinta px-6 py-14 text-center">
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-25"
            style={{
              backgroundImage: 'radial-gradient(circle, #a78bfa 1px, transparent 1px)',
              backgroundSize: '22px 22px',
            }}
          />
          <div className="relative">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              ¿Qué quieres hacer hoy?
            </h2>
            <p className="mt-2 text-white/70">Tu acción puede ser el punto de cambio para alguien.</p>

            <div className="mt-9 flex flex-col items-stretch justify-center gap-4 sm:flex-row">
              <Link
                href="/necesito-ayuda"
                className="group flex items-center gap-3 rounded-2xl bg-linear-to-br from-marca-coral to-marca-rosa px-8 py-5 text-left text-white shadow-lg transition hover:brightness-110"
              >
                <IconoCorazonManos className="h-7 w-7" />
                <span>
                  <span className="block text-sm font-extrabold tracking-wide">NECESITO AYUDA</span>
                  <span className="block text-sm text-white/80">Pedir ayuda</span>
                </span>
                <span aria-hidden="true" className="ml-3 transition group-hover:translate-x-1">
                  →
                </span>
              </Link>

              <Link
                href="/quiero-ayudar"
                className="group flex items-center gap-3 rounded-2xl bg-linear-to-br from-marca-verde-claro to-marca-cian px-8 py-5 text-left text-white shadow-lg transition hover:brightness-110"
              >
                <IconoCorazonManos className="h-7 w-7" />
                <span>
                  <span className="block text-sm font-extrabold tracking-wide">QUIERO AYUDAR</span>
                  <span className="block text-sm text-white/80">Ofrecer mi ayuda</span>
                </span>
                <span aria-hidden="true" className="ml-3 transition group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------- Iconos --- */

function IconoCorazonManos({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={className} aria-hidden="true">
      <path
        d="M12 20s-6.5-4-6.5-8.5A3.5 3.5 0 0 1 12 9a3.5 3.5 0 0 1 6.5 2.5C18.5 16 12 20 12 20Z"
        strokeLinejoin="round"
      />
      <path d="M3 14v5m18-5v5M3 19c2 1.5 5 2.5 9 2.5s7-1 9-2.5" strokeLinecap="round" />
    </svg>
  );
}

function IconoEscudo({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
      <path d="M12 3l7 3v5.5c0 4.5-3 8-7 9.5-4-1.5-7-5-7-9.5V6l7-3Z" strokeLinejoin="round" />
      <path d="m9 12 2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconoFormulario({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={className} aria-hidden="true">
      <path d="M5 4h9l5 5v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" strokeLinejoin="round" />
      <path d="M14 4v5h5M8 13h6M8 17h4" strokeLinecap="round" />
    </svg>
  );
}

function IconoLupa({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={className} aria-hidden="true">
      <circle cx="11" cy="11" r="6" />
      <path d="m20 20-4.5-4.5" strokeLinecap="round" />
      <path d="M11 8.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z" />
    </svg>
  );
}

function IconoPersonas({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={className} aria-hidden="true">
      <circle cx="9" cy="9" r="3" />
      <circle cx="17" cy="10.5" r="2.2" />
      <path d="M3 19c0-3 2.7-4.5 6-4.5s6 1.5 6 4.5M16 15c3 0 5 1.3 5 4" strokeLinecap="round" />
    </svg>
  );
}
