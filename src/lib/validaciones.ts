import { z } from 'zod';

import {
  DEPARTAMENTOS,
  DISPONIBILIDADES,
  RADIOS_KM,
  TIPOS_RECURSO,
  URGENCIAS,
} from './catalogos';

/**
 * Normaliza un teléfono colombiano a E.164 (+57XXXXXXXXXX).
 * Acepta lo que la gente realmente escribe: "300 123 4567", "(300)1234567",
 * "+57 300 123 4567", "57 300 123 4567".
 * Devuelve null si no es un móvil colombiano válido.
 */
export function normalizarTelefono(valor: string): string | null {
  const digitos = valor.replace(/\D/g, '');
  const sinIndicativo = digitos.startsWith('57') && digitos.length === 12 ? digitos.slice(2) : digitos;

  // Móvil colombiano: 10 dígitos empezando por 3.
  if (/^3\d{9}$/.test(sinIndicativo)) return `+57${sinIndicativo}`;

  // Fijo con indicativo nacional (ej. 6012345678) — lo aceptamos, aunque WhatsApp no funcione.
  if (/^[1-8]\d{9}$/.test(sinIndicativo)) return `+57${sinIndicativo}`;

  return null;
}

/** Formatea +573001234567 como "300 123 4567" para leerlo en el panel. */
export function formatearTelefono(e164: string): string {
  const n = e164.replace(/^\+57/, '');
  if (n.length !== 10) return e164;
  return `${n.slice(0, 3)} ${n.slice(3, 6)} ${n.slice(6)}`;
}

const telefono = z
  .string()
  .trim()
  .min(1, 'Necesitamos un número para poder contactarte.')
  .transform((v, ctx) => {
    const normalizado = normalizarTelefono(v);
    if (!normalizado) {
      ctx.addIssue({
        code: 'custom',
        message: 'Ese número no parece válido. Escríbelo como 300 123 4567.',
      });
      return z.NEVER;
    }
    return normalizado;
  });

const nombre = z
  .string()
  .trim()
  .min(3, 'Escribe al menos tu nombre y un apellido.')
  .max(120, 'Ese nombre es demasiado largo.');

const tipos = z
  .array(z.enum(TIPOS_RECURSO))
  .min(1, 'Selecciona al menos una opción.')
  .max(8, 'Selecciona máximo 8 opciones para que el cruce sea preciso.');

const departamento = z.enum(DEPARTAMENTOS, { message: 'Selecciona un departamento.' });

const municipio = z
  .string()
  .trim()
  .min(2, 'Escribe el municipio.')
  .max(80, 'Ese nombre de municipio es demasiado largo.');

const aceptaDatos = z
  .boolean()
  .refine((v) => v === true, 'Necesitamos tu autorización para tratar tus datos y poder ayudarte.');

export const esquemaSolicitud = z.object({
  nombre,
  telefono,
  esParaOtraPersona: z.boolean().default(false),
  personasAfectadas: z.coerce
    .number()
    .int()
    .min(1, 'Debe ser al menos 1 persona.')
    .max(500, 'Si son más de 500 personas, contáctanos directamente por WhatsApp.'),
  tieneMenores: z.boolean().default(false),
  tieneAdultosMayores: z.boolean().default(false),
  tipos,
  descripcion: z
    .string()
    .trim()
    .min(20, 'Cuéntanos un poco más: entre más claro, más rápido encontramos a quien pueda ayudar.')
    .max(1500, 'Resume un poco más, por favor.'),
  urgencia: z.enum(URGENCIAS, { message: 'Selecciona qué tan urgente es.' }),
  departamento,
  municipio,
  zona: z.string().trim().max(120).optional().or(z.literal('')),
  referenciaDireccion: z.string().trim().max(300).optional().or(z.literal('')),
  aceptaDatos,
  aceptaWhatsapp: z.boolean().default(true),
});

export const esquemaOferta = z.object({
  nombre,
  telefono,
  email: z.string().trim().email('Ese correo no parece válido.').optional().or(z.literal('')),
  organizacion: z.string().trim().max(160).optional().or(z.literal('')),
  tipos,
  descripcion: z
    .string()
    .trim()
    .min(20, 'Sé concreto: "Soy carpintero y puedo reparar puertas y techos" vale mucho más que "quiero ayudar".')
    .max(1500, 'Resume un poco más, por favor.'),
  departamento,
  municipio,
  zona: z.string().trim().max(120).optional().or(z.literal('')),
  radioKm: z.coerce
    .number()
    .int()
    .refine((v) => (RADIOS_KM as readonly number[]).includes(v), 'Selecciona hasta dónde puedes desplazarte.'),
  disponibilidad: z
    .array(z.enum(DISPONIBILIDADES))
    .min(1, 'Selecciona al menos un momento en el que puedas.'),
  notaDisponibilidad: z.string().trim().max(300).optional().or(z.literal('')),
  aceptaDatos,
  aceptaWhatsapp: z.boolean().default(true),
});

export type DatosSolicitud = z.output<typeof esquemaSolicitud>;
export type DatosOferta = z.output<typeof esquemaOferta>;

export const esquemaLogin = z.object({
  email: z.string().trim().toLowerCase().email('Escribe un correo válido.'),
  password: z.string().min(1, 'Escribe tu contraseña.'),
});

/** Convierte los errores de Zod en un mapa campo -> primer mensaje, listo para pintar en el form. */
export function erroresPorCampo(error: z.ZodError): Record<string, string> {
  const salida: Record<string, string> = {};
  for (const issue of error.issues) {
    const campo = issue.path.join('.') || '_';
    if (!salida[campo]) salida[campo] = issue.message;
  }
  return salida;
}
