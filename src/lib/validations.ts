import { z } from 'zod';

import {
  DEPARTMENTS,
  AVAILABILITIES,
  RADIUS_OPTIONS_KM,
  RESOURCE_TYPES,
  URGENCIES,
} from './catalogs';

/**
 * Normalizes a Colombian phone number to E.164 (+57XXXXXXXXXX).
 * Accepts common user input formats and returns null for invalid mobile numbers.
 */
export function normalizePhone(value: string): string | null {
  const digits = value.replace(/\D/g, '');
  const withoutCountryCode = digits.startsWith('57') && digits.length === 12 ? digits.slice(2) : digits;

  // Colombian mobile: 10 digits beginning with 3.
  if (/^3\d{9}$/.test(withoutCountryCode)) return `+57${withoutCountryCode}`;

  // Landline with a national prefix; accepted even though WhatsApp may not work.
  if (/^[1-8]\d{9}$/.test(withoutCountryCode)) return `+57${withoutCountryCode}`;

  return null;
}

/** Formats +573001234567 as "300 123 4567" for display in the admin panel. */
export function formatPhone(e164: string): string {
  const n = e164.replace(/^\+57/, '');
  if (n.length !== 10) return e164;
  return `${n.slice(0, 3)} ${n.slice(3, 6)} ${n.slice(6)}`;
}

const phone = z
  .string()
  .trim()
  .min(1, 'Necesitamos un número para poder contactarte.')
  .transform((v, ctx) => {
    const normalized = normalizePhone(v);
    if (!normalized) {
      ctx.addIssue({
        code: 'custom',
        message: 'Ese número no parece válido. Escríbelo como 300 123 4567.',
      });
      return z.NEVER;
    }
    return normalized;
  });

const name = z
  .string()
  .trim()
  .min(3, 'Escribe al menos tu nombre y un apellido.')
  .max(120, 'Ese nombre es demasiado largo.');

const types = z
  .array(z.enum(RESOURCE_TYPES))
  .min(1, 'Selecciona al menos una opción.')
  .max(8, 'Selecciona máximo 8 opciones para que el cruce sea preciso.');

const department = z.enum(DEPARTMENTS, { message: 'Selecciona un departamento.' });

const municipality = z
  .string()
  .trim()
  .min(2, 'Escribe el municipio.')
  .max(80, 'Ese nombre de municipio es demasiado largo.');

const acceptsDataUse = z
  .boolean()
  .refine((v) => v === true, 'Necesitamos tu autorización para tratar tus datos y poder ayudarte.');

export const requestSchema = z.object({
  name,
  phone,
  isForSomeoneElse: z.boolean().default(false),
  affectedPeople: z.coerce
    .number()
    .int()
    .min(1, 'Debe ser al menos 1 persona.')
    .max(500, 'Si son más de 500 personas, contáctanos directamente por WhatsApp.'),
  hasMinors: z.boolean().default(false),
  hasElderly: z.boolean().default(false),
  types,
  description: z
    .string()
    .trim()
    .min(20, 'Cuéntanos un poco más: entre más claro, más rápido encontramos a quien pueda ayudar.')
    .max(1500, 'Resume un poco más, por favor.'),
  urgency: z.enum(URGENCIES, { message: 'Selecciona qué tan urgente es.' }),
  department,
  municipality,
  zone: z.string().trim().max(120).optional().or(z.literal('')),
  addressReference: z.string().trim().max(300).optional().or(z.literal('')),
  acceptsDataUse,
  acceptsWhatsapp: z.boolean().default(true),
});

export const offerSchema = z.object({
  name,
  phone,
  email: z.string().trim().email('Ese correo no parece válido.').optional().or(z.literal('')),
  organization: z.string().trim().max(160).optional().or(z.literal('')),
  types,
  description: z
    .string()
    .trim()
    .min(20, 'Sé concreto: "Soy carpintero y puedo reparar puertas y techos" vale mucho más que "quiero ayudar".')
    .max(1500, 'Resume un poco más, por favor.'),
  department,
  municipality,
  zone: z.string().trim().max(120).optional().or(z.literal('')),
  radiusKm: z.coerce
    .number()
    .int()
    .refine((v) => (RADIUS_OPTIONS_KM as readonly number[]).includes(v), 'Selecciona hasta dónde puedes desplazarte.'),
  availability: z
    .array(z.enum(AVAILABILITIES))
    .min(1, 'Selecciona al menos un momento en el que puedas.'),
  availabilityNote: z.string().trim().max(300).optional().or(z.literal('')),
  acceptsDataUse,
  acceptsWhatsapp: z.boolean().default(true),
});

export type RequestData = z.output<typeof requestSchema>;
export type OfferData = z.output<typeof offerSchema>;

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Escribe un correo válido.'),
  password: z.string().min(1, 'Escribe tu contraseña.'),
});

/** Converts Zod errors into a field-to-first-message map for forms. */
export function errorsByField(error: z.ZodError): Record<string, string> {
  const output: Record<string, string> = {};
  for (const issue of error.issues) {
    const field = issue.path.join('.') || '_';
    if (!output[field]) output[field] = issue.message;
  }
  return output;
}
