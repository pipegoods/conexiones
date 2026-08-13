import type { Metadata } from 'next';

import { Encabezado } from '@/components/Encabezado';
import { PieDePagina } from '@/components/PieDePagina';

export const metadata: Metadata = {
  title: 'Política de privacidad',
  description: 'Cómo Conexiones trata, protege y elimina los datos personales de quienes usan la plataforma.',
};

/**
 * Borrador operativo, no concepto jurídico. Antes de salir a producción esto
 * tiene que revisarlo un abogado: la Ley 1581 de 2012 exige aviso de privacidad
 * y política de tratamiento formales, y aquí se manejan datos sensibles.
 */
export default function Privacidad() {
  return (
    <>
      <Encabezado />
      <main className="bg-nube py-14">
        <article className="mx-auto max-w-3xl rounded-3xl bg-white p-8 ring-1 ring-neutral-100 sm:p-12">
          <h1 className="text-3xl font-extrabold tracking-tight">Política de privacidad</h1>
          <p className="mt-2 text-sm text-neutral-500">
            Tratamiento de datos personales conforme a la Ley 1581 de 2012 y el Decreto 1377 de 2013.
          </p>

          <div className="mt-8 space-y-7 leading-relaxed text-neutral-700">
            <Bloque titulo="Qué datos recogemos">
              <p>
                Cuando pides ayuda: tu nombre, tu número de WhatsApp, tu municipio y zona, un punto de referencia,
                cuántas personas están afectadas, si hay menores o adultos mayores, y la descripción de lo que
                necesitas.
              </p>
              <p className="mt-2">
                Cuando ofreces ayuda: tu nombre, tu número de WhatsApp, tu correo y organización si los das, tu
                municipio, hasta dónde te desplazas, tu disponibilidad y qué puedes aportar.
              </p>
            </Bloque>

            <Bloque titulo="Para qué los usamos">
              <p>
                Únicamente para verificar que la solicitud es real y para conectar a quien necesita algo con quien
                puede aportarlo. No los usamos para publicidad, no los vendemos y no los compartimos con terceros
                distintos de la persona con la que te conectamos.
              </p>
            </Bloque>

            <Bloque titulo="Quién los ve">
              <p>
                El equipo interno de Conexiones que opera el panel de verificación. Si aceptas una conexión,
                también la persona específica con la que te vamos a conectar, y solo los datos necesarios para que
                se coordinen.
              </p>
              <p className="mt-2 font-semibold text-tinta">
                No existe ningún listado público con nombres, teléfonos ni direcciones. Las únicas cifras
                públicas son conteos agregados.
              </p>
            </Bloque>

            <Bloque titulo="Cuánto tiempo los guardamos">
              <p>
                Mientras el caso esté abierto y hasta 12 meses después de cerrarlo, para poder rendir cuentas de lo
                que hicimos. Pasado ese tiempo se eliminan o se anonimizan.
              </p>
            </Bloque>

            <Bloque titulo="Tus derechos">
              <p>
                Puedes pedirnos en cualquier momento conocer, actualizar, rectificar o suprimir tus datos, y
                revocar la autorización que nos diste. Escríbenos por WhatsApp con tu código de caso y lo hacemos.
              </p>
            </Bloque>

            <Bloque titulo="Seguridad">
              <p>
                Los datos viajan cifrados y se almacenan en una base de datos con acceso restringido. El panel
                interno exige usuario y contraseña, y cada acción queda registrada con el nombre de quien la hizo.
              </p>
            </Bloque>

            <Bloque titulo="Estafas">
              <p>
                Conexiones nunca te va a pedir dinero, datos bancarios ni códigos de verificación. Si alguien lo
                hace en nuestro nombre, no respondas y avísanos.
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
