import { RECURSOS, type TipoRecurso } from './catalogos';
import { formatearTelefono } from './validaciones';
import type { Oferta, Solicitud } from '@/db/schema';

/**
 * Plantillas de WhatsApp para la operación manual (v1).
 *
 * Todavía no hay bot: el operador abre el chat desde el panel con el mensaje ya
 * escrito y solo presiona enviar. Cuando Meta apruebe la Cloud API, estos mismos
 * textos se convierten en las plantillas del bot sin reescribir el flujo.
 */

export function folioSolicitud(numero: number): string {
  return `S-${String(numero).padStart(4, '0')}`;
}

export function folioOferta(numero: number): string {
  return `A-${String(numero).padStart(4, '0')}`;
}

/** Arma el enlace wa.me. El teléfono va sin "+" ni espacios. */
export function enlaceWhatsapp(telefonoE164: string, mensaje: string): string {
  const numero = telefonoE164.replace(/\D/g, '');
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
}

function listaRecursos(tipos: readonly TipoRecurso[]): string {
  return tipos.map((t) => RECURSOS[t].panel.toLowerCase()).join(', ');
}

function primerNombre(nombre: string): string {
  return nombre.trim().split(/\s+/)[0] ?? nombre;
}

/** Nivel 0 → 1: primer contacto para verificar que la solicitud es real. */
export function mensajeVerificacion(s: Solicitud): string {
  return [
    `Hola ${primerNombre(s.nombre)}, te escribimos de *Conexiones*.`,
    ``,
    `Recibimos tu solicitud ${folioSolicitud(s.numero)} sobre: ${listaRecursos(s.tipos)}.`,
    ``,
    `Para poder conectarte con alguien que pueda ayudarte necesitamos confirmar tres cosas:`,
    `1. ¿Sigues necesitando esta ayuda?`,
    `2. ¿La dirección en ${s.municipio}${s.zona ? `, ${s.zona}` : ''} es correcta?`,
    `3. ¿Hay alguna otra cosa urgente que no nos contaste?`,
    ``,
    `Conexiones es una iniciativa ciudadana gratuita. Nunca te vamos a pedir dinero ni datos bancarios.`,
  ].join('\n');
}

/** Nivel 2 → 3: le presentamos la necesidad al voluntario. */
export function mensajePropuestaVoluntario(o: Oferta, s: Solicitud): string {
  return [
    `Hola ${primerNombre(o.nombre)}, te escribimos de *Conexiones*.`,
    ``,
    `Te registraste diciendo que puedes aportar: ${listaRecursos(o.tipos)}.`,
    ``,
    `Tenemos una necesidad *ya verificada* que encaja con lo tuyo:`,
    `• Qué necesitan: ${listaRecursos(s.tipos)}`,
    `• Dónde: ${s.municipio}${s.zona ? `, ${s.zona}` : ''}`,
    `• Cuántas personas: ${s.personasAfectadas}`,
    `• Situación: ${s.descripcion}`,
    ``,
    `¿Puedes ayudar con esto? Respóndenos *SÍ* o *NO* y te pasamos el contacto directo.`,
  ].join('\n');
}

/** Nivel 3: el voluntario aceptó, le pasamos el contacto a cada lado. */
export function mensajePresentacionASolicitante(s: Solicitud, o: Oferta): string {
  return [
    `¡Buenas noticias, ${primerNombre(s.nombre)}!`,
    ``,
    `Encontramos a alguien que puede ayudarte con tu solicitud ${folioSolicitud(s.numero)}:`,
    ``,
    `• Nombre: ${o.nombre}${o.organizacion ? ` (${o.organizacion})` : ''}`,
    `• Teléfono: ${formatearTelefono(o.telefono)}`,
    `• Puede aportar: ${o.descripcion}`,
    ``,
    `Ya le pasamos tus datos también para que se coordinen.`,
    ``,
    `Cuando recibas la ayuda, escríbenos *RECIBIDO* para cerrar el caso.`,
  ].join('\n');
}

export function mensajePresentacionAVoluntario(o: Oferta, s: Solicitud): string {
  return [
    `¡Gracias por aceptar, ${primerNombre(o.nombre)}!`,
    ``,
    `Este es el contacto de la persona que necesita tu ayuda:`,
    ``,
    `• Nombre: ${s.nombre}`,
    `• Teléfono: ${formatearTelefono(s.telefono)}`,
    `• Dónde: ${s.municipio}${s.zona ? `, ${s.zona}` : ''}${s.referenciaDireccion ? ` — ${s.referenciaDireccion}` : ''}`,
    `• Qué necesita: ${s.descripcion}`,
    ``,
    `Cuando terminen, escríbenos para cerrar el caso ${folioSolicitud(s.numero)}.`,
  ].join('\n');
}

/** Nivel 3 → 4: confirmación de que la ayuda sí llegó. */
export function mensajeCierre(s: Solicitud): string {
  return [
    `Hola ${primerNombre(s.nombre)}, somos *Conexiones*.`,
    ``,
    `Queremos confirmar el caso ${folioSolicitud(s.numero)}:`,
    `¿Recibiste la ayuda que necesitabas?`,
    ``,
    `Respóndenos *SÍ* o *NO*. Si algo no salió bien, cuéntanos qué pasó y lo retomamos.`,
  ].join('\n');
}

/** Confirmación automática que ve la persona apenas envía el formulario. */
export function mensajeBienvenidaSolicitud(numero: number): string {
  return [
    `Hola, acabo de registrar la solicitud ${folioSolicitud(numero)} en Conexiones.`,
    `Quedo pendiente de la verificación.`,
  ].join('\n');
}

export function mensajeBienvenidaOferta(numero: number): string {
  return [
    `Hola, acabo de registrarme como voluntario en Conexiones con el código ${folioOferta(numero)}.`,
    `Quedo atento por si me necesitan.`,
  ].join('\n');
}

/** Número del equipo, para que el ciudadano nos escriba a nosotros. */
export function enlaceEquipo(mensaje: string): string | null {
  const numero = process.env.NEXT_PUBLIC_WHATSAPP_EQUIPO;
  if (!numero) return null;
  return enlaceWhatsapp(numero, mensaje);
}
