import Link from 'next/link';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

/** Shared shell for both form pages. */
export function FormShell({
  title,
  subtitle,
  accent,
  children,
}: {
  title: React.ReactNode;
  subtitle: string;
  accent: 'pink' | 'green';
  children: React.ReactNode;
}) {
  const franja =
    accent === 'green' ? 'from-marca-verde-claro to-marca-cian' : 'from-marca-coral to-marca-rosa';

  return (
    <>
      <Header />
      <main className="bg-nube pb-20">
        <div className={`bg-linear-to-r ${franja} px-5 py-8 text-white sm:py-12`}>
          <div className="mx-auto max-w-2xl">
            <Link href="/" className="text-sm font-semibold text-white/80 transition hover:text-white">
              ← Volver al inicio
            </Link>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h1>
            <p className="mt-2 max-w-xl text-white/90">{subtitle}</p>
          </div>
        </div>

        <div className="mx-auto max-w-2xl px-5">
          <div className="-mt-8 rounded-3xl bg-white p-6 shadow-xl ring-1 ring-neutral-100 sm:p-9">
            {children}
          </div>

          <p className="mt-6 text-center text-sm text-neutral-500">
            Tus datos solo los ve el equipo de Conexiones y, si aceptas, la persona con la que te conectemos.
            Nunca los publicamos.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}

/** Section divider for a long form. */
export function FormSection({
  step,
  title,
  description,
  children,
}: {
  step: number;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-neutral-100 pt-8 first:border-0 first:pt-0">
      <h2 className="flex items-center gap-3 text-lg font-extrabold tracking-tight text-tinta">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-violet-100 text-sm font-bold text-marca-morado">
          {step}
        </span>
        {title}
      </h2>
      {description && <p className="mt-1.5 pl-10 text-sm text-neutral-500">{description}</p>}
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  );
}

export function EmergencyNotice() {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
      <p className="text-sm leading-relaxed text-amber-900">
        <strong className="font-bold">Si hay riesgo para la vida, llama al 123 primero.</strong> Conexiones no
        es un servicio de emergencia: somos vecinos organizándonos para lo que viene después.
      </p>
    </div>
  );
}
