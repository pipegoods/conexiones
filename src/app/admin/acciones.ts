'use server';

import { eq, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { conexiones, db, eventos, ofertas, solicitudes, usuarios } from '@/db';
import { cerrarSesion, iniciarSesion, requerirSesion } from '@/lib/auth';
import {
  ESTADO_SOLICITUD_META,
  TRANSICIONES_OFERTA,
  TRANSICIONES_SOLICITUD,
  type EstadoConexion,
  type EstadoOferta,
  type EstadoSolicitud,
} from '@/lib/catalogos';
import { verificarPassword } from '@/lib/password';
import type { Sesion } from '@/lib/sesion';
import { esquemaLogin } from '@/lib/validaciones';

export type EstadoLogin = { error?: string };

const texto = (fd: FormData, campo: string) => String(fd.get(campo) ?? '').trim();

/* -------------------------------------------------------------- Sesión --- */

// react-doctor-disable-next-line server-auth-actions
export async function entrar(_previo: EstadoLogin, fd: FormData): Promise<EstadoLogin> {
  const analisis = esquemaLogin.safeParse({
    email: texto(fd, 'email'),
    password: String(fd.get('password') ?? ''),
  });

  if (!analisis.success) return { error: 'Revisa el correo y la contraseña.' };

  const destino = texto(fd, 'siguiente') || '/admin';
  let sesion: Sesion;

  try {
    const [usuario] = await db
      .select()
      .from(usuarios)
      .where(sql`lower(${usuarios.email}) = ${analisis.data.email}`)
      .limit(1);

    // Mismo mensaje para "no existe" y "contraseña mala": no le confirmamos a
    // nadie qué correos están registrados en el panel.
    const generico = { error: 'Correo o contraseña incorrectos.' };
    if (!usuario || !usuario.activo) return generico;

    const correcta = await verificarPassword(analisis.data.password, usuario.passwordHash);
    if (!correcta) return generico;

    await db.update(usuarios).set({ ultimoAccesoEn: new Date() }).where(eq(usuarios.id, usuario.id));

    sesion = {
      usuarioId: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
    };
  } catch (error) {
    console.error('[entrar]', error);
    return { error: 'No pudimos validar tus datos. ¿Está configurada la base de datos?' };
  }

  await iniciarSesion(sesion);
  redirect(destino.startsWith('/admin') ? destino : '/admin');
}

export async function salir() {
  await cerrarSesion();
  redirect('/admin/login');
}

/* -------------------------------------------------------- Solicitudes --- */

export async function cambiarEstadoSolicitud(fd: FormData) {
  const sesion = await requerirSesion();
  const id = texto(fd, 'id');
  const nuevo = texto(fd, 'estado') as EstadoSolicitud;
  const nota = texto(fd, 'nota');

  const [actual] = await db.select().from(solicitudes).where(eq(solicitudes.id, id)).limit(1);
  if (!actual) throw new Error('Esa solicitud no existe.');

  if (!TRANSICIONES_SOLICITUD[actual.estado].includes(nuevo)) {
    throw new Error(
      `No se puede pasar de "${ESTADO_SOLICITUD_META[actual.estado].label}" a "${ESTADO_SOLICITUD_META[nuevo].label}".`,
    );
  }

  // Cada nivel deja su marca de tiempo: de ahí salen las métricas de respuesta.
  const marcas: Partial<Record<EstadoSolicitud, Partial<typeof solicitudes.$inferInsert>>> = {
    contactada: { contactadoEn: new Date() },
    verificada: { verificadoEn: new Date() },
    conectada: { conectadoEn: new Date() },
    resuelta: { resueltoEn: new Date() },
  };

  await db.transaction(async (tx) => {
    await tx
      .update(solicitudes)
      .set({
        estado: nuevo,
        actualizadoEn: new Date(),
        motivoDescarte: nuevo === 'descartada' ? nota || 'Sin motivo registrado' : actual.motivoDescarte,
        ...(marcas[nuevo] ?? {}),
      })
      .where(eq(solicitudes.id, id));

    await tx.insert(eventos).values({
      entidad: 'solicitud',
      entidadId: id,
      estadoAnterior: actual.estado,
      estadoNuevo: nuevo,
      accion: 'cambio_estado',
      nota: nota || null,
      actorId: sesion.usuarioId,
      actorNombre: sesion.nombre,
    });
  });

  revalidatePath('/admin', 'layout');
}

export async function guardarNotasSolicitud(fd: FormData) {
  const sesion = await requerirSesion();
  const id = texto(fd, 'id');
  const notas = texto(fd, 'notasInternas');

  await db.transaction(async (tx) => {
    await tx
      .update(solicitudes)
      .set({ notasInternas: notas || null, actualizadoEn: new Date() })
      .where(eq(solicitudes.id, id));

    await tx.insert(eventos).values({
      entidad: 'solicitud',
      entidadId: id,
      accion: 'nota_interna',
      nota: notas || '(nota borrada)',
      actorId: sesion.usuarioId,
      actorNombre: sesion.nombre,
    });
  });

  revalidatePath(`/admin/solicitudes/${id}`);
}

/* ------------------------------------------------------------ Ofertas --- */

export async function cambiarEstadoOferta(fd: FormData) {
  const sesion = await requerirSesion();
  const id = texto(fd, 'id');
  const nuevo = texto(fd, 'estado') as EstadoOferta;
  const nota = texto(fd, 'nota');

  const [actual] = await db.select().from(ofertas).where(eq(ofertas.id, id)).limit(1);
  if (!actual) throw new Error('Ese voluntario no existe.');

  if (!TRANSICIONES_OFERTA[actual.estado].includes(nuevo)) {
    throw new Error(`No se puede pasar de "${actual.estado}" a "${nuevo}".`);
  }

  await db.transaction(async (tx) => {
    await tx
      .update(ofertas)
      .set({
        estado: nuevo,
        actualizadoEn: new Date(),
        ...(nuevo === 'verificada' ? { verificadoEn: new Date() } : {}),
      })
      .where(eq(ofertas.id, id));

    await tx.insert(eventos).values({
      entidad: 'oferta',
      entidadId: id,
      estadoAnterior: actual.estado,
      estadoNuevo: nuevo,
      accion: 'cambio_estado',
      nota: nota || null,
      actorId: sesion.usuarioId,
      actorNombre: sesion.nombre,
    });
  });

  revalidatePath('/admin', 'layout');
}

/* ---------------------------------------------------------- Conexiones --- */

/** El operador acepta una sugerencia del sistema: queda propuesta, pendiente de que el voluntario diga sí. */
export async function proponerConexion(fd: FormData) {
  const sesion = await requerirSesion();
  const solicitudId = texto(fd, 'solicitudId');
  const ofertaId = texto(fd, 'ofertaId');
  const score = Number(texto(fd, 'score')) || 0;
  const razones = texto(fd, 'razones');

  const [solicitud] = await db.select().from(solicitudes).where(eq(solicitudes.id, solicitudId)).limit(1);
  if (!solicitud) throw new Error('Esa solicitud no existe.');

  // Regla dura del PRD: nadie se conecta antes de estar verificado.
  if (!['verificada', 'conectada'].includes(solicitud.estado)) {
    throw new Error('Solo se pueden conectar solicitudes ya verificadas (nivel 2 en adelante).');
  }

  await db.transaction(async (tx) => {
    const [conexion] = await tx
      .insert(conexiones)
      .values({
        solicitudId,
        ofertaId,
        score,
        razones: razones || null,
        estado: 'propuesta',
        creadoPor: sesion.usuarioId,
      })
      .onConflictDoNothing({ target: [conexiones.solicitudId, conexiones.ofertaId] })
      .returning({ id: conexiones.id });

    if (!conexion) return; // ya existía: no duplicamos ni ensuciamos la bitácora

    await tx.insert(eventos).values({
      entidad: 'conexion',
      entidadId: conexion.id,
      estadoNuevo: 'propuesta',
      accion: 'propuesta',
      nota: `Propuesta para la solicitud, puntaje ${score}.`,
      actorId: sesion.usuarioId,
      actorNombre: sesion.nombre,
    });

    await tx.insert(eventos).values({
      entidad: 'solicitud',
      entidadId: solicitudId,
      accion: 'conexion_propuesta',
      nota: `Se propuso un voluntario (puntaje ${score}).`,
      actorId: sesion.usuarioId,
      actorNombre: sesion.nombre,
    });
  });

  revalidatePath(`/admin/solicitudes/${solicitudId}`);
}

/**
 * Avanza una conexión y arrastra la solicitud con ella, que es lo que hace que
 * los cinco niveles del PRD no se desincronicen: aceptar = nivel 3, confirmar =
 * nivel 4.
 */
export async function actualizarConexion(fd: FormData) {
  const sesion = await requerirSesion();
  const id = texto(fd, 'id');
  const nuevo = texto(fd, 'estado') as EstadoConexion;
  const nota = texto(fd, 'nota');

  const [conexion] = await db.select().from(conexiones).where(eq(conexiones.id, id)).limit(1);
  if (!conexion) throw new Error('Esa conexión no existe.');

  await db.transaction(async (tx) => {
    await tx
      .update(conexiones)
      .set({
        estado: nuevo,
        nota: nota || conexion.nota,
        ...(nuevo === 'confirmada' ? { confirmadoEn: new Date() } : {}),
      })
      .where(eq(conexiones.id, id));

    await tx.insert(eventos).values({
      entidad: 'conexion',
      entidadId: id,
      estadoAnterior: conexion.estado,
      estadoNuevo: nuevo,
      accion: 'cambio_estado',
      nota: nota || null,
      actorId: sesion.usuarioId,
      actorNombre: sesion.nombre,
    });

    const [solicitud] = await tx
      .select()
      .from(solicitudes)
      .where(eq(solicitudes.id, conexion.solicitudId))
      .limit(1);
    if (!solicitud) return;

    if (nuevo === 'aceptada' && solicitud.estado === 'verificada') {
      await tx
        .update(solicitudes)
        .set({ estado: 'conectada', conectadoEn: new Date(), actualizadoEn: new Date() })
        .where(eq(solicitudes.id, solicitud.id));

      await tx.insert(eventos).values({
        entidad: 'solicitud',
        entidadId: solicitud.id,
        estadoAnterior: solicitud.estado,
        estadoNuevo: 'conectada',
        accion: 'cambio_estado',
        nota: 'El voluntario aceptó la conexión.',
        actorId: sesion.usuarioId,
        actorNombre: sesion.nombre,
      });
    }

    if (nuevo === 'confirmada' && solicitud.estado !== 'resuelta') {
      await tx
        .update(solicitudes)
        .set({ estado: 'resuelta', resueltoEn: new Date(), actualizadoEn: new Date() })
        .where(eq(solicitudes.id, solicitud.id));

      await tx.insert(eventos).values({
        entidad: 'solicitud',
        entidadId: solicitud.id,
        estadoAnterior: solicitud.estado,
        estadoNuevo: 'resuelta',
        accion: 'cambio_estado',
        nota: 'La persona confirmó que recibió la ayuda.',
        actorId: sesion.usuarioId,
        actorNombre: sesion.nombre,
      });
    }
  });

  revalidatePath('/admin', 'layout');
}

/** Marca en la bitácora que se abrió el chat de WhatsApp, para no perder el rastro de quién escribió. */
export async function registrarContactoWhatsapp(fd: FormData) {
  const sesion = await requerirSesion();
  const entidad = texto(fd, 'entidad');
  const entidadId = texto(fd, 'entidadId');
  const detalle = texto(fd, 'detalle');

  await db.insert(eventos).values({
    entidad,
    entidadId,
    accion: 'whatsapp_abierto',
    nota: detalle || 'Se abrió el chat de WhatsApp desde el panel.',
    actorId: sesion.usuarioId,
    actorNombre: sesion.nombre,
  });

  revalidatePath(`/admin/${entidad === 'oferta' ? 'ofertas' : 'solicitudes'}/${entidadId}`);
}
