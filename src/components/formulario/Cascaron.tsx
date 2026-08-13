import Link from 'next/link';

import { Encabezado } from '@/components/Encabezado';
import { PieDePagina } from '@/components/PieDePagina';

/** Envoltorio común de las dos páginas de formulario. */
export function CascaronFormulario({
  titulo,
  bajada,
  acento,
  children,
}: {
  titulo: React.ReactNode;
  bajada: string;
  acento: 'rosa' | 'verde';
  children: React.ReactNode;
}) {
  const franja =
    acento === 'verde' ? 'from-marca-verde-claro to-marca-cian' : 'from-marca-coral to-marca-rosa';

  return (
    <>
      <Encabezado />
      <main className="bg-nube pb-20">
        <div className={`bg-linear-to-r ${franja} px-5 py-12 text-white`}>
          <div className="mx-auto max-w-2xl">
            <Link href="/" className="text-sm font-semibold text-white/80 transition hover:text-white">
              ← Volver al inicio
            </Link>
            <h1 className="mt-3 text-4xl font-extrabold tracking-tight">{titulo}</h1>
            <p className="mt-2 max-w-xl text-white/90">{bajada}</p>
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
      <PieDePagina />
    </>
  );
}

/** Separador de secciones dentro de un formulario largo. */
export function Seccion({
  numero,
  titulo,
  descripcion,
  children,
}: {
  numero: number;
  titulo: string;
  descripcion?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-neutral-100 pt-8 first:border-0 first:pt-0">
      <h2 className="flex items-center gap-3 text-lg font-extrabold tracking-tight text-tinta">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-violet-100 text-sm font-bold text-marca-morado">
          {numero}
        </span>
        {titulo}
      </h2>
      {descripcion && <p className="mt-1.5 pl-10 text-sm text-neutral-500">{descripcion}</p>}
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  );
}

export function AvisoEmergencia() {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
      <p className="text-sm leading-relaxed text-amber-900">
        <strong className="font-bold">Si hay riesgo para la vida, llama al 123 primero.</strong> Conexiones no
        es un servicio de emergencia: somos vecinos organizándonos para lo que viene después.
      </p>
    </div>
  );
}
