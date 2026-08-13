'use server';

import { and, eq, gt } from 'drizzle-orm';
import { redirect } from 'next/navigation';

import { db, eventos, ofertas, solicitudes } from '@/db';
import type { Disponibilidad, TipoRecurso } from '@/lib/catalogos';
import { erroresPorCampo, esquemaOferta, esquemaSolicitud } from '@/lib/validaciones';

export type EstadoFormulario = {
  errores?: Record<string, string>;
  /** Error general que no pertenece a ningún campo (base caída, etc.). */
  mensaje?: string;
};

const marcado = (fd: FormData, campo: string) => fd.get(campo) === 'on';
const texto = (fd: FormData, campo: string) => String(fd.get(campo) ?? '');

/** Ventana en la que un segundo envío del mismo teléfono se considera doble clic. */
const VENTANA_DUPLICADOS_MS = 10 * 60 * 1000;

/* ------------------------------------------------- NECESITO AYUDA -------- */

export async function registrarSolicitud(
  _previo: EstadoFormulario,
  fd: FormData,
): Promise<EstadoFormulario> {
  const analisis = esquemaSolicitud.safeParse({
    nombre: texto(fd, 'nombre'),
    telefono: texto(fd, 'telefono'),
    esParaOtraPersona: marcado(fd, 'esParaOtraPersona'),
    personasAfectadas: texto(fd, 'personasAfectadas') || '1',
    tieneMenores: marcado(fd, 'tieneMenores'),
    tieneAdultosMayores: marcado(fd, 'tieneAdultosMayores'),
    tipos: fd.getAll('tipos').map(String),
    descripcion: texto(fd, 'descripcion'),
    urgencia: texto(fd, 'urgencia'),
    departamento: texto(fd, 'departamento'),
    municipio: texto(fd, 'municipio'),
    zona: texto(fd, 'zona'),
    referenciaDireccion: texto(fd, 'referenciaDireccion'),
    aceptaDatos: marcado(fd, 'aceptaDatos'),
    aceptaWhatsapp: true,
  });

  if (!analisis.success) {
    return { errores: erroresPorCampo(analisis.error) };
  }

  const datos = analisis.data;
  let numero: number;

  try {
    // Doble clic o reenvío del formulario: devolvemos la solicitud que ya existe
    // en vez de duplicar el caso y hacerle perder tiempo al equipo.
    const [reciente] = await db
      .select({ numero: solicitudes.numero })
      .from(solicitudes)
      .where(
        and(
          eq(solicitudes.telefono, datos.telefono),
          gt(solicitudes.creadoEn, new Date(Date.now() - VENTANA_DUPLICADOS_MS)),
        ),
      )
      .limit(1);

    if (reciente) {
      numero = reciente.numero;
    } else {
      numero = await db.transaction(async (tx) => {
        const [fila] = await tx
          .insert(solicitudes)
          .values({
            nombre: datos.nombre,
            telefono: datos.telefono,
            esParaOtraPersona: datos.esParaOtraPersona,
            personasAfectadas: datos.personasAfectadas,
            tieneMenores: datos.tieneMenores,
            tieneAdultosMayores: datos.tieneAdultosMayores,
            tipos: datos.tipos as TipoRecurso[],
            descripcion: datos.descripcion,
            urgencia: datos.urgencia,
            departamento: datos.departamento,
            municipio: datos.municipio,
            zona: datos.zona || null,
            referenciaDireccion: datos.referenciaDireccion || null,
            aceptaDatos: datos.aceptaDatos,
            aceptaWhatsapp: datos.aceptaWhatsapp,
          })
          .returning({ id: solicitudes.id, numero: solicitudes.numero });

        await tx.insert(eventos).values({
          entidad: 'solicitud',
          entidadId: fila.id,
          estadoNuevo: 'recibida',
          accion: 'creada',
          nota: 'Registrada desde el formulario público.',
          actorNombre: 'Formulario público',
        });

        return fila.numero;
      });
    }
  } catch (error) {
    console.error('[registrarSolicitud]', error);
    return {
      mensaje:
        'No pudimos guardar tu solicitud. Inténtalo otra vez en un momento, o escríbenos directamente por WhatsApp.',
    };
  }

  // redirect() lanza una excepción interna de Next: tiene que ir fuera del try.
  redirect(`/gracias?tipo=solicitud&numero=${numero}`);
}

/* -------------------------------------------------- QUIERO AYUDAR -------- */

export async function registrarOferta(
  _previo: EstadoFormulario,
  fd: FormData,
): Promise<EstadoFormulario> {
  const analisis = esquemaOferta.safeParse({
    nombre: texto(fd, 'nombre'),
    telefono: texto(fd, 'telefono'),
    email: texto(fd, 'email'),
    organizacion: texto(fd, 'organizacion'),
    tipos: fd.getAll('tipos').map(String),
    descripcion: texto(fd, 'descripcion'),
    departamento: texto(fd, 'departamento'),
    municipio: texto(fd, 'municipio'),
    zona: texto(fd, 'zona'),
    radioKm: texto(fd, 'radioKm') || '10',
    disponibilidad: fd.getAll('disponibilidad').map(String),
    notaDisponibilidad: texto(fd, 'notaDisponibilidad'),
    aceptaDatos: marcado(fd, 'aceptaDatos'),
    aceptaWhatsapp: true,
  });

  if (!analisis.success) {
    return { errores: erroresPorCampo(analisis.error) };
  }

  const datos = analisis.data;
  let numero: number;

  try {
    numero = await db.transaction(async (tx) => {
      const valores = {
        nombre: datos.nombre,
        telefono: datos.telefono,
        email: datos.email || null,
        organizacion: datos.organizacion || null,
        tipos: datos.tipos as TipoRecurso[],
        descripcion: datos.descripcion,
        departamento: datos.departamento,
        municipio: datos.municipio,
        zona: datos.zona || null,
        radioKm: datos.radioKm,
        disponibilidad: datos.disponibilidad as Disponibilidad[],
        notaDisponibilidad: datos.notaDisponibilidad || null,
        aceptaDatos: datos.aceptaDatos,
        aceptaWhatsapp: datos.aceptaWhatsapp,
      };

      // Si alguien se vuelve a registrar con el mismo teléfono, actualizamos su
      // capacidad en vez de crear un voluntario duplicado. La gente cambia lo
      // que puede aportar de un día para otro.
      const [fila] = await tx
        .insert(ofertas)
        .values(valores)
        .onConflictDoUpdate({
          target: ofertas.telefono,
          set: { ...valores, actualizadoEn: new Date() },
        })
        .returning({ id: ofertas.id, numero: ofertas.numero });

      await tx.insert(eventos).values({
        entidad: 'oferta',
        entidadId: fila.id,
        estadoNuevo: 'nueva',
        accion: 'registrada',
        nota: 'Registrada desde el formulario público.',
        actorNombre: 'Formulario público',
      });

      return fila.numero;
    });
  } catch (error) {
    console.error('[registrarOferta]', error);
    return {
      mensaje:
        'No pudimos guardar tu registro. Inténtalo otra vez en un momento, o escríbenos directamente por WhatsApp.',
    };
  }

  redirect(`/gracias?tipo=oferta&numero=${numero}`);
}
