import type { Metadata } from 'next';
import Link from 'next/link';

import { Encabezado } from '@/components/Encabezado';
import { PieDePagina } from '@/components/PieDePagina';
import {
  enlaceEquipo,
  folioOferta,
  folioSolicitud,
  mensajeBienvenidaOferta,
  mensajeBienvenidaSolicitud,
} from '@/lib/whatsapp';

export const metadata: Metadata = {
  title: 'Registro recibido',
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<{ tipo?: string; numero?: string }>;
};

export default async function Gracias({ searchParams }: Props) {
  const { tipo, numero } = await searchParams;
  const esOferta = tipo === 'oferta';
  const n = Number(numero);
  const folio = Number.isFinite(n) && n > 0 ? (esOferta ? folioOferta(n) : folioSolicitud(n)) : null;

  const whatsapp = folio
    ? enlaceEquipo(esOferta ? mensajeBienvenidaOferta(n) : mensajeBienvenidaSolicitud(n))
    : null;

  const pasos = esOferta
    ? [
        'Guardamos lo que puedes aportar y en qué zona te mueves.',
        'Cuando llegue una necesidad verificada que encaje contigo, te escribimos por WhatsApp.',
        'Tú decides si puedes o no. Decir que no está bien: preferimos eso a un compromiso que no se cumple.',
        'Si aceptas, te pasamos el contacto directo de la persona para que se coordinen.',
      ]
    : [
        'Alguien del equipo te va a escribir por WhatsApp para confirmar que la solicitud es real.',
        'Una vez verificada, buscamos a la persona indicada para lo que necesitas.',
        'Cuando la encontremos, te pasamos su contacto y le pasamos el tuyo.',
        'Al final te preguntamos si sí recibiste la ayuda, para cerrar el caso.',
      ];

  return (
    <>
      <Encabezado />
      <main className="bg-nube">
        <div className="mx-auto max-w-2xl px-5 py-16">
          <div className="rounded-3xl bg-white p-8 text-center shadow-xl ring-1 ring-neutral-100 sm:p-12">
            <div
              className={`mx-auto grid h-20 w-20 place-items-center rounded-full text-4xl ${
                esOferta ? 'bg-emerald-50' : 'bg-pink-50'
              }`}
            >
              <span aria-hidden="true">{esOferta ? '🤝' : '💌'}</span>
            </div>

            <h1 className="mt-6 text-3xl font-extrabold tracking-tight">
              {esOferta ? '¡Gracias por ponerte a disposición!' : 'Recibimos tu solicitud'}
            </h1>

            {folio && (
              <p className="mt-4 inline-block rounded-full bg-neutral-100 px-4 py-2 font-mono text-sm font-bold text-tinta">
                {folio}
              </p>
            )}

            <p className="mt-4 leading-relaxed text-neutral-600">
              {esOferta
                ? 'Ya haces parte de la red. Guarda este código: es tu referencia si necesitas actualizar o retirar tu registro.'
                : 'Guarda este código. Es la referencia de tu caso cuando hablemos contigo por WhatsApp.'}
            </p>

            <ol className="mt-9 space-y-4 text-left">
              {pasos.map((paso, i) => (
                <li key={paso} className="flex gap-4">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-violet-100 text-sm font-bold text-marca-morado">
                    {i + 1}
                  </span>
                  <span className="text-sm leading-relaxed text-neutral-700">{paso}</span>
                </li>
              ))}
            </ol>

            {whatsapp && (
              <a
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-9 inline-block rounded-2xl bg-[#25D366] px-7 py-4 font-bold text-white shadow-lg transition hover:brightness-105"
              >
                Escribirnos por WhatsApp
              </a>
            )}

            <p className="mt-8 text-sm text-neutral-500">
              {esOferta ? (
                <>
                  ¿También necesitas algo?{' '}
                  <Link href="/necesito-ayuda" className="font-semibold text-marca-morado hover:underline">
                    Cuéntanos aquí
                  </Link>
                  .
                </>
              ) : (
                <>
                  ¿Conoces a alguien que pueda ayudar?{' '}
                  <Link href="/quiero-ayudar" className="font-semibold text-marca-morado hover:underline">
                    Pásale este enlace
                  </Link>
                  .
                </>
              )}
            </p>
          </div>

          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-relaxed text-amber-900">
            <strong className="font-bold">Cuidado con las estafas.</strong> Conexiones nunca te va a pedir dinero,
            datos bancarios ni códigos de verificación. Si alguien lo hace en nuestro nombre, no le respondas y
            avísanos.
          </div>
        </div>
      </main>
      <PieDePagina />
    </>
  );
}
