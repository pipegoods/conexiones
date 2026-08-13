import type { Metadata } from 'next';

import { Encabezado } from '@/components/Encabezado';
import { PieDePagina } from '@/components/PieDePagina';

export const metadata: Metadata = {
  title: 'Términos y condiciones',
  description: 'Qué es y qué no es Conexiones, y las reglas de uso de la plataforma.',
};

/** Borrador operativo, no concepto jurídico. Debe revisarlo un abogado antes de producción. */
export default function Terminos() {
  return (
    <>
      <Encabezado />
      <main className="bg-nube py-14">
        <article className="mx-auto max-w-3xl rounded-3xl bg-white p-8 ring-1 ring-neutral-100 sm:p-12">
          <h1 className="text-3xl font-extrabold tracking-tight">Términos y condiciones</h1>

          <div className="mt-8 space-y-7 leading-relaxed text-neutral-700">
            <Bloque titulo="Qué es Conexiones">
              <p>
                Una iniciativa ciudadana independiente y gratuita que conecta a personas que necesitan ayuda con
                personas que pueden aportar algo. Somos un puente, no un proveedor de servicios.
              </p>
            </Bloque>

            <Bloque titulo="Qué no es Conexiones">
              <p>
                No somos un organismo de emergencia y no reemplazamos a la Defensa Civil, los bomberos, la Cruz
                Roja, la UNGRD ni a ninguna autoridad.{' '}
                <strong className="font-bold text-tinta">
                  Ante riesgo para la vida, llama al 123 y sigue las instrucciones de las autoridades.
                </strong>
              </p>
            </Bloque>

            <Bloque titulo="Verificación y responsabilidad">
              <p>
                Verificamos las solicitudes por WhatsApp antes de conectarlas: confirmamos que la persona existe,
                que la necesidad existe y que está donde dice. Esa verificación reduce el riesgo, pero no lo
                elimina.
              </p>
              <p className="mt-2">
                Cuando conectamos a dos personas, el acuerdo es entre ellas. Conexiones no es parte de ese acuerdo
                y no responde por su cumplimiento, por la calidad de lo entregado ni por lo que ocurra durante la
                ayuda. Usa tu criterio: reúnete en lugares seguros y no entregues dinero por adelantado.
              </p>
            </Bloque>

            <Bloque titulo="Uso correcto">
              <p>Al usar la plataforma te comprometes a:</p>
              <ul className="mt-2 list-inside list-disc space-y-1">
                <li>Dar información veraz.</li>
                <li>No pedir ayuda que no necesitas, para no quitarle el turno a quien sí.</li>
                <li>No usar los datos de contacto que recibes para nada distinto de coordinar la ayuda.</li>
                <li>No cobrar por lo que ofreciste como aporte.</li>
              </ul>
              <p className="mt-2">
                Podemos descartar solicitudes y desactivar registros que incumplan estas reglas o que no logremos
                verificar.
              </p>
            </Bloque>

            <Bloque titulo="Gratuidad">
              <p>
                Usar Conexiones no cuesta nada, ni para quien pide ni para quien ayuda. Nunca pedimos dinero, datos
                bancarios ni códigos de verificación.
              </p>
            </Bloque>
          </div>
        </article>
      </main>
      <PieDePagina />
    </>
  );
}

function Bloque({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-extrabold tracking-tight text-tinta">{titulo}</h2>
      <div className="mt-2">{children}</div>
    </section>
  );
}
