import { RESOURCES, type ResourceType } from './catalogs';
import { formatPhone } from './validations';
import type { Offer, HelpRequest } from '@/db/schema';

/**
 * WhatsApp templates for manual operations (v1).
 *
 * There is no bot yet: the operator opens a panel chat with the message already
 * written. Once Meta approves the Cloud API, these messages become bot templates
 * without changing the workflow.
 */

export function requestCode(number: number): string {
  return `S-${String(number).padStart(4, '0')}`;
}

export function offerCode(number: number): string {
  return `A-${String(number).padStart(4, '0')}`;
}

/** Builds a wa.me link from a phone number without plus signs or spaces. */
export function whatsappLink(phoneE164: string, message: string): string {
  const number = phoneE164.replace(/\D/g, '');
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

function resourceList(types: readonly ResourceType[]): string {
  return types.map((t) => RESOURCES[t].internal.toLowerCase()).join(', ');
}

function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name;
}

/** Level 0 → 1: first contact to verify that the request is real. */
export function verificationMessage(s: HelpRequest): string {
  return [
    `Hola ${firstName(s.name)}, te escribimos de *Conexiones*.`,
    ``,
    `Recibimos tu solicitud ${requestCode(s.number)} sobre: ${resourceList(s.types)}.`,
    ``,
    `Para poder conectarte con alguien que pueda ayudarte necesitamos confirmar tres cosas:`,
    `1. ¿Sigues necesitando esta ayuda?`,
    `2. ¿La dirección en ${s.municipality}${s.zone ? `, ${s.zone}` : ''} es correcta?`,
    `3. ¿Hay alguna otra cosa urgente que no nos contaste?`,
    ``,
    `Conexiones es una iniciativa ciudadana gratuita. Nunca te vamos a pedir dinero ni datos bancarios.`,
  ].join('\n');
}

/** Level 2 → 3: present the request to the volunteer. */
export function volunteerProposalMessage(o: Offer, s: HelpRequest): string {
  return [
    `Hola ${firstName(o.name)}, te escribimos de *Conexiones*.`,
    ``,
    `Te registraste diciendo que puedes aportar: ${resourceList(o.types)}.`,
    ``,
    `Tenemos una necesidad *ya verificada* que encaja con lo tuyo:`,
    `• Qué necesitan: ${resourceList(s.types)}`,
    `• Dónde: ${s.municipality}${s.zone ? `, ${s.zone}` : ''}`,
    `• Cuántas personas: ${s.affectedPeople}`,
    `• Situación: ${s.description}`,
    ``,
    `¿Puedes ayudar con esto? Respóndenos *SÍ* o *NO* y te pasamos el contacto directo.`,
  ].join('\n');
}

/** Level 3: the volunteer accepted, so share contact details with both sides. */
export function introductionMessageForRequester(s: HelpRequest, o: Offer): string {
  return [
    `¡Buenas noticias, ${firstName(s.name)}!`,
    ``,
    `Encontramos a alguien que puede ayudarte con tu solicitud ${requestCode(s.number)}:`,
    ``,
    `• Nombre: ${o.name}${o.organization ? ` (${o.organization})` : ''}`,
    `• Teléfono: ${formatPhone(o.phone)}`,
    `• Puede aportar: ${o.description}`,
    ``,
    `Ya le pasamos tus datos también para que se coordinen.`,
    ``,
    `Cuando recibas la ayuda, escríbenos *RECIBIDO* para cerrar el caso.`,
  ].join('\n');
}

export function introductionMessageForVolunteer(o: Offer, s: HelpRequest): string {
  return [
    `¡Gracias por aceptar, ${firstName(o.name)}!`,
    ``,
    `Este es el contacto de la persona que necesita tu ayuda:`,
    ``,
    `• Nombre: ${s.name}`,
    `• Teléfono: ${formatPhone(s.phone)}`,
    `• Dónde: ${s.municipality}${s.zone ? `, ${s.zone}` : ''}${s.addressReference ? ` — ${s.addressReference}` : ''}`,
    `• Qué necesita: ${s.description}`,
    ``,
    `Cuando terminen, escríbenos para cerrar el caso ${requestCode(s.number)}.`,
  ].join('\n');
}

/** Level 3 → 4: confirmation that the help was delivered. */
export function closingMessage(s: HelpRequest): string {
  return [
    `Hola ${firstName(s.name)}, somos *Conexiones*.`,
    ``,
    `Queremos confirmar el caso ${requestCode(s.number)}:`,
    `¿Recibiste la ayuda que necesitabas?`,
    ``,
    `Respóndenos *SÍ* o *NO*. Si algo no salió bien, cuéntanos qué pasó y lo retomamos.`,
  ].join('\n');
}

/** Automatic confirmation shown immediately after a form submission. */
export function requestWelcomeMessage(number: number): string {
  return [
    `Hola, acabo de registrar la solicitud ${requestCode(number)} en Conexiones.`,
    `Quedo pendiente de la verificación.`,
  ].join('\n');
}

export function offerWelcomeMessage(number: number): string {
  return [
    `Hola, acabo de registrarme como voluntario en Conexiones con el código ${offerCode(number)}.`,
    `Quedo atento por si me necesitan.`,
  ].join('\n');
}

/** Team number used when a citizen needs to contact us. */
export function teamLink(message: string): string | null {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_TEAM;
  if (!number) return null;
  return whatsappLink(number, message);
}
