import Link from 'next/link';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { RESOURCES, type ResourceType } from '@/lib/catalogs';
import { getStats } from '@/lib/stats';

/** Statistics refresh every minute: responsive enough without overloading the database. */
export const revalidate = 60;

const FEATURED_NEEDS: ResourceType[] = [
  'transport',
  'food',
  'accommodation',
  'tools',
  'health',
  'psychological_support',
  'information',
  'profession',
];

const FEATURED_CONTRIBUTIONS: ResourceType[] = [
  'time',
  'profession',
  'transport',
  'tools',
  'space',
  'food',
  'knowledge',
  'contacts',
];

const bubbles = [
  { emoji: '👥', top: '4%', left: '46%', delay: '0s' },
  { emoji: '🚚', top: '17%', left: '86%', delay: '0.8s' },
  { emoji: '🛠️', top: '52%', left: '92%', delay: '1.6s' },
  { emoji: '🏠', top: '58%', left: '10%', delay: '2.4s' },
  { emoji: '❤️', top: '82%', left: '38%', delay: '3.2s' },
];

const steps = [
  {
    number: '01',
    title: 'CUÉNTANOS',
    text: 'Cuéntanos qué necesitas o qué puedes aportar.',
    background: 'bg-violet-50',
    icon: <FormIcon className="h-8 w-8 text-marca-morado" />,
  },
  {
    number: '02',
    title: 'ENCONTRAMOS',
    text: 'Buscamos a las personas, profesionales, empresas u organizaciones adecuadas.',
    background: 'bg-pink-50',
    icon: <MagnifyingGlassIcon className="h-8 w-8 text-marca-rosa" />,
  },
  {
    number: '03',
    title: 'CONECTAMOS',
    text: 'Ponemos en contacto a quien necesita con quien puede ayudar.',
    background: 'bg-teal-50',
    icon: <PeopleIcon className="h-8 w-8 text-marca-cian" />,
  },
];

const flow = [
  { text: 'Necesidad', color: 'text-marca-morado' },
  { text: 'Capacidad', color: 'text-marca-rosa' },
  { text: 'Conexión', color: 'text-marca-cian' },
  { text: 'Ayuda', color: 'text-marca-verde' },
];

const frequentlyAskedQuestions = [
  {
    question: '¿Cuánto cuesta usar Conexiones?',
    answer:
      'Nada. Ni para quien pide ayuda ni para quien la ofrece. Nunca te vamos a pedir dinero ni datos bancarios: si alguien lo hace en nuestro nombre, es una estafa.',
  },
  {
    question: '¿Qué pasa con mis datos?',
    answer:
      'Tus datos personales solo los ve el equipo interno de Conexiones y, si aceptas una conexión, la persona con la que te vamos a conectar. No hay listados públicos con nombres, teléfonos ni direcciones.',
  },
  {
    question: '¿Cómo verifican que una solicitud es real?',
    answer:
      'Alguien del equipo se comunica por WhatsApp y confirma que la persona existe, que la necesidad existe y que está en el lugar indicado. Solo después de eso buscamos quién puede ayudar.',
  },
  {
    question: '¿Cuánto me demoro en recibir respuesta?',
    answer:
      'Depende del volumen y de la urgencia que marques. Priorizamos las emergencias. Si es una situación de riesgo vital, llama al 123: nosotros no somos un servicio de emergencia.',
  },
  {
    question: 'No tengo dinero, ¿igual puedo ayudar?',
    answer:
      'Sí, y de hecho es lo que más falta hace. Un vehículo, unas herramientas, un oficio, un espacio o unas horas de tu tiempo suelen resolver más que una donación.',
  },
];

export default async function Home() {
  const stats = await getStats();

  return (
    <>
      <Header />
      <main>
        <Hero />
        <HowItWorks />
        <TwoSides />
        <LiveStats stats={stats} />
        <AboutUs />
        <FAQ />
        <FinalCallToAction />
      </main>
      <Footer />
    </>
  );
}

/* ------------------------------------------------------------------ Hero --- */

function Hero() {
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
            <ActionCard
              href="/necesito-ayuda"
              title="NECESITO AYUDA"
              description="Solicita la ayuda que tú o alguien más necesita."
              className="from-marca-coral to-marca-rosa shadow-marca-rosa/30"
            />
            <ActionCard
              href="/quiero-ayudar"
              title="QUIERO AYUDAR"
              description="Pon a disposición lo que sabes hacer, tienes o puedes ofrecer."
              className="from-marca-verde-claro to-marca-cian shadow-marca-verde/30"
            />
          </div>

          <p className="mt-8 flex items-start gap-3 text-sm text-neutral-600">
            <ShieldIcon className="mt-0.5 h-5 w-5 shrink-0 text-marca-morado" />
            <span>
              <strong className="font-bold text-tinta">Gratuito, seguro y transparente.</strong>
              <br />
              Verificamos las solicitudes antes de conectarlas.
            </span>
          </p>
        </div>

        <DecorativeRibbon />
      </div>
    </section>
  );
}

function ActionCard({
  href,
  title,
  description,
  className,
}: {
  href: string;
  title: string;
  description: string;
  className: string;
}) {
  return (
    <Link
      href={href}
      className={`group relative flex-1 overflow-hidden rounded-2xl bg-linear-to-br ${className} p-6 text-white shadow-xl transition hover:brightness-105 active:scale-[0.99]`}
    >
      <HeartHandsIcon className="h-9 w-9 opacity-95" />
      <p className="mt-4 text-base font-extrabold tracking-wide">{title}</p>
      <p className="mt-1.5 max-w-[16rem] text-sm leading-snug text-white/85">{description}</p>
      <span
        aria-hidden="true"
        className="absolute bottom-5 right-5 text-xl transition group-hover:translate-x-1"
      >
        →
      </span>
    </Link>
  );
}

/** Hero ribbon: the brand gradient joins separate icons. Purely decorative. */
function DecorativeRibbon() {
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

      {bubbles.map((b) => (
        <span
          key={b.emoji}
          className="absolute grid h-16 w-16 animate-flotar place-items-center rounded-full bg-white text-2xl shadow-lg shadow-marca-morado/10 ring-1 ring-neutral-100"
          style={{ top: b.top, left: b.left, animationDelay: b.delay }}
        >
          {b.emoji}
        </span>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------- How it works -- */

function HowItWorks() {
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
            {steps.map((s) => (
              <li key={s.number} className="text-center">
                <div className={`mx-auto grid h-20 w-20 place-items-center rounded-full ${s.background}`}>
                  {s.icon}
                </div>
                <p className="mt-5 text-sm font-extrabold tracking-wide text-tinta">
                  {s.number}. {s.title}
                </p>
                <p className="mx-auto mt-2 max-w-[17rem] text-sm leading-relaxed text-neutral-600">{s.text}</p>
              </li>
            ))}
          </ol>

          <div className="mt-12 flex justify-center">
            <div className="flex flex-wrap items-center justify-center gap-2 rounded-full bg-white px-6 py-3 shadow-sm ring-1 ring-neutral-100">
              {flow.map((f, i) => (
                <span key={f.text} className="flex items-center gap-2">
                  <span className={`text-sm font-bold ${f.color}`}>{f.text}</span>
                  {i < flow.length - 1 && (
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

/* ------------------------------------------------------------ Two sides -- */

function TwoSides() {
  return (
    <section className="bg-nube py-6">
      <div className="mx-auto grid max-w-6xl gap-6 px-5 lg:grid-cols-2">
        <SidePanel
          label="¿Qué puedes encontrar?"
          labelClassName="bg-violet-100 text-marca-morado"
          title={
            <>
              Lo que <span className="text-marca-morado">necesitas</span>,<br />
              cuando lo necesitas.
            </>
          }
          types={FEATURED_NEEDS}
          side="seeking"
        />
        <SidePanel
          label="¿Qué puedes aportar?"
          labelClassName="bg-teal-100 text-teal-700"
          title={
            <>
              No necesitas tener dinero
              <br />
              para <span className="text-marca-verde">hacer la diferencia.</span>
            </>
          }
          types={FEATURED_CONTRIBUTIONS}
          side="offering"
        />
      </div>
    </section>
  );
}

function SidePanel({
  label,
  labelClassName,
  title,
  types,
  side,
}: {
  label: string;
  labelClassName: string;
  title: React.ReactNode;
  types: ResourceType[];
  side: 'seeking' | 'offering';
}) {
  return (
    <div className="rounded-3xl bg-white p-8 ring-1 ring-neutral-100">
      <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${labelClassName}`}>
        {label}
      </span>
      <h2 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight">{title}</h2>

      <ul className="mt-7 grid grid-cols-2 gap-2.5">
        {types.map((t) => (
          <li
            key={t}
            className="flex items-center gap-2.5 rounded-xl bg-neutral-50 px-3.5 py-3 text-sm font-medium text-neutral-700"
          >
            <span aria-hidden="true">{RESOURCES[t].emoji}</span>
            {RESOURCES[t][side]}
          </li>
        ))}
      </ul>

      <p className="mt-5 text-center text-sm text-neutral-400">••• Y más...</p>
    </div>
  );
}

/* ---------------------------------------------------- Public statistics -- */

function LiveStats({
  stats,
}: {
  stats: { received: number; verified: number; connected: number; resolved: number };
}) {
  const cards = [
    { value: stats.received, text: 'Necesidades recibidas', emoji: '👥', background: 'bg-violet-50' },
    { value: stats.verified, text: 'Necesidades verificadas', emoji: '🛡️', background: 'bg-pink-50' },
    { value: stats.connected, text: 'Ayudas conectadas', emoji: '🤝', background: 'bg-sky-50' },
    { value: stats.resolved, text: 'Necesidades resueltas', emoji: '💚', background: 'bg-emerald-50' },
  ];

  return (
    <section id="transparencia" className="bg-nube py-6">
      <div className="mx-auto max-w-6xl px-5">
        <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-marca-morado">
          La red en tiempo real
        </p>

        <dl className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c) => (
            <div key={c.text} className="flex items-center gap-4 rounded-2xl bg-white p-6 ring-1 ring-neutral-100">
              <span className={`grid h-14 w-14 shrink-0 place-items-center rounded-full text-2xl ${c.background}`}>
                <span aria-hidden="true">{c.emoji}</span>
              </span>
              <div>
                <dd className="text-4xl font-extrabold tracking-tight tabular-nums">{c.value}</dd>
                <dt className="mt-0.5 text-sm text-neutral-500">{c.text}</dt>
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

/* ---------------------------------------------------------- About / FAQ -- */

function AboutUs() {
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

function FAQ() {
  return (
    <section id="preguntas" className="bg-nube py-6">
      <div className="mx-auto max-w-3xl px-5 py-10">
        <h2 className="text-center text-3xl font-extrabold tracking-tight">Preguntas frecuentes</h2>
        <div className="mt-8 space-y-3">
          {frequentlyAskedQuestions.map((f) => (
            <details key={f.question} className="group rounded-2xl bg-white p-5 ring-1 ring-neutral-100">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold text-tinta">
                {f.question}
                <span aria-hidden="true" className="text-marca-morado transition group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-neutral-600">{f.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------- Final call -- */

function FinalCallToAction() {
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
                <HeartHandsIcon className="h-7 w-7" />
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
                <HeartHandsIcon className="h-7 w-7" />
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

/* ------------------------------------------------------------------- Icons -- */

function HeartHandsIcon({ className = '' }: { className?: string }) {
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

function ShieldIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
      <path d="M12 3l7 3v5.5c0 4.5-3 8-7 9.5-4-1.5-7-5-7-9.5V6l7-3Z" strokeLinejoin="round" />
      <path d="m9 12 2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FormIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={className} aria-hidden="true">
      <path d="M5 4h9l5 5v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" strokeLinejoin="round" />
      <path d="M14 4v5h5M8 13h6M8 17h4" strokeLinecap="round" />
    </svg>
  );
}

function MagnifyingGlassIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={className} aria-hidden="true">
      <circle cx="11" cy="11" r="6" />
      <path d="m20 20-4.5-4.5" strokeLinecap="round" />
      <path d="M11 8.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z" />
    </svg>
  );
}

function PeopleIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={className} aria-hidden="true">
      <circle cx="9" cy="9" r="3" />
      <circle cx="17" cy="10.5" r="2.2" />
      <path d="M3 19c0-3 2.7-4.5 6-4.5s6 1.5 6 4.5M16 15c3 0 5 1.3 5 4" strokeLinecap="round" />
    </svg>
  );
}
