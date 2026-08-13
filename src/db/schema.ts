import { sql } from 'drizzle-orm';
import {
  boolean,
  doublePrecision,
  index,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

import {
  DISPONIBILIDADES,
  ESTADOS_CONEXION,
  ESTADOS_OFERTA,
  ESTADOS_SOLICITUD,
  ROLES,
  TIPOS_RECURSO,
  URGENCIAS,
} from '@/lib/catalogos';

export const tipoRecursoEnum = pgEnum('tipo_recurso', TIPOS_RECURSO);
export const urgenciaEnum = pgEnum('urgencia', URGENCIAS);
export const disponibilidadEnum = pgEnum('disponibilidad', DISPONIBILIDADES);
export const estadoSolicitudEnum = pgEnum('estado_solicitud', ESTADOS_SOLICITUD);
export const estadoOfertaEnum = pgEnum('estado_oferta', ESTADOS_OFERTA);
export const estadoConexionEnum = pgEnum('estado_conexion', ESTADOS_CONEXION);
export const rolEnum = pgEnum('rol', ROLES);

/**
 * NECESITO AYUDA — una necesidad concreta reportada por una persona.
 * Los datos personales de esta tabla nunca salen a la web pública.
 */
export const solicitudes = pgTable(
  'solicitudes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    /** Consecutivo legible para hablar por WhatsApp: "solicitud S-0042". */
    numero: serial('numero').notNull(),

    // Quién
    nombre: text('nombre').notNull(),
    telefono: text('telefono').notNull(),
    esParaOtraPersona: boolean('es_para_otra_persona').notNull().default(false),
    personasAfectadas: integer('personas_afectadas').notNull().default(1),
    tieneMenores: boolean('tiene_menores').notNull().default(false),
    tieneAdultosMayores: boolean('tiene_adultos_mayores').notNull().default(false),

    // Qué
    tipos: tipoRecursoEnum('tipos').array().notNull(),
    descripcion: text('descripcion').notNull(),
    urgencia: urgenciaEnum('urgencia').notNull(),

    // Dónde
    departamento: text('departamento').notNull(),
    municipio: text('municipio').notNull(),
    zona: text('zona'),
    referenciaDireccion: text('referencia_direccion'),
    lat: doublePrecision('lat'),
    lng: doublePrecision('lng'),

    // Trazabilidad
    estado: estadoSolicitudEnum('estado').notNull().default('recibida'),
    notasInternas: text('notas_internas'),
    motivoDescarte: text('motivo_descarte'),

    // Consentimiento (habeas data, Ley 1581 de 2012)
    aceptaDatos: boolean('acepta_datos').notNull(),
    aceptaWhatsapp: boolean('acepta_whatsapp').notNull().default(true),

    creadoEn: timestamp('creado_en', { withTimezone: true }).notNull().defaultNow(),
    actualizadoEn: timestamp('actualizado_en', { withTimezone: true }).notNull().defaultNow(),
    contactadoEn: timestamp('contactado_en', { withTimezone: true }),
    verificadoEn: timestamp('verificado_en', { withTimezone: true }),
    conectadoEn: timestamp('conectado_en', { withTimezone: true }),
    resueltoEn: timestamp('resuelto_en', { withTimezone: true }),
  },
  (t) => [
    index('solicitudes_estado_idx').on(t.estado),
    index('solicitudes_municipio_idx').on(t.municipio),
    index('solicitudes_creado_idx').on(t.creadoEn),
    index('solicitudes_telefono_idx').on(t.telefono),
  ],
);

/**
 * QUIERO AYUDAR — una capacidad puesta a disposición.
 * Ojo: no es "una donación", es algo que la persona puede hacer o prestar.
 */
export const ofertas = pgTable(
  'ofertas',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    numero: serial('numero').notNull(),

    // Quién
    nombre: text('nombre').notNull(),
    telefono: text('telefono').notNull(),
    email: text('email'),
    organizacion: text('organizacion'),

    // Qué pone a disposición
    tipos: tipoRecursoEnum('tipos').array().notNull(),
    /** "Soy carpintero y puedo reparar puertas, ventanas y techos." */
    descripcion: text('descripcion').notNull(),

    // Dónde y hasta dónde se puede mover
    departamento: text('departamento').notNull(),
    municipio: text('municipio').notNull(),
    zona: text('zona'),
    radioKm: integer('radio_km').notNull().default(10),
    lat: doublePrecision('lat'),
    lng: doublePrecision('lng'),

    // Cuándo
    disponibilidad: disponibilidadEnum('disponibilidad').array().notNull(),
    notaDisponibilidad: text('nota_disponibilidad'),

    estado: estadoOfertaEnum('estado').notNull().default('nueva'),
    notasInternas: text('notas_internas'),

    aceptaDatos: boolean('acepta_datos').notNull(),
    aceptaWhatsapp: boolean('acepta_whatsapp').notNull().default(true),

    creadoEn: timestamp('creado_en', { withTimezone: true }).notNull().defaultNow(),
    actualizadoEn: timestamp('actualizado_en', { withTimezone: true }).notNull().defaultNow(),
    verificadoEn: timestamp('verificado_en', { withTimezone: true }),
  },
  (t) => [
    index('ofertas_estado_idx').on(t.estado),
    index('ofertas_municipio_idx').on(t.municipio),
    index('ofertas_creado_idx').on(t.creadoEn),
    uniqueIndex('ofertas_telefono_idx').on(t.telefono),
  ],
);

/** El match: une una necesidad con una capacidad. Lo propone el sistema, lo confirma una persona. */
export const conexiones = pgTable(
  'conexiones',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    solicitudId: uuid('solicitud_id')
      .notNull()
      .references(() => solicitudes.id, { onDelete: 'cascade' }),
    ofertaId: uuid('oferta_id')
      .notNull()
      .references(() => ofertas.id, { onDelete: 'cascade' }),
    estado: estadoConexionEnum('estado').notNull().default('propuesta'),
    /** Puntaje 0-100 calculado por el motor de sugerencias al momento de proponer. */
    score: integer('score').notNull().default(0),
    /** Por qué el sistema sugirió este cruce, en texto legible para el operador. */
    razones: text('razones'),
    nota: text('nota'),
    creadoPor: uuid('creado_por').references(() => usuarios.id, { onDelete: 'set null' }),
    creadoEn: timestamp('creado_en', { withTimezone: true }).notNull().defaultNow(),
    confirmadoEn: timestamp('confirmado_en', { withTimezone: true }),
  },
  (t) => [
    uniqueIndex('conexiones_par_idx').on(t.solicitudId, t.ofertaId),
    index('conexiones_solicitud_idx').on(t.solicitudId),
    index('conexiones_oferta_idx').on(t.ofertaId),
  ],
);

/** Bitácora inmutable: quién cambió qué y cuándo. Es la base de la trazabilidad y de las cifras. */
export const eventos = pgTable(
  'eventos',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    entidad: text('entidad').notNull(), // 'solicitud' | 'oferta' | 'conexion'
    entidadId: uuid('entidad_id').notNull(),
    estadoAnterior: text('estado_anterior'),
    estadoNuevo: text('estado_nuevo'),
    accion: text('accion').notNull(),
    nota: text('nota'),
    actorId: uuid('actor_id').references(() => usuarios.id, { onDelete: 'set null' }),
    actorNombre: text('actor_nombre'),
    creadoEn: timestamp('creado_en', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('eventos_entidad_idx').on(t.entidad, t.entidadId), index('eventos_creado_idx').on(t.creadoEn)],
);

/** Equipo interno de Conexiones. No hay cuentas para ciudadanos: ellos solo dejan su teléfono. */
export const usuarios = pgTable(
  'usuarios',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: text('email').notNull(),
    nombre: text('nombre').notNull(),
    passwordHash: text('password_hash').notNull(),
    rol: rolEnum('rol').notNull().default('operador'),
    activo: boolean('activo').notNull().default(true),
    creadoEn: timestamp('creado_en', { withTimezone: true }).notNull().defaultNow(),
    ultimoAccesoEn: timestamp('ultimo_acceso_en', { withTimezone: true }),
  },
  (t) => [uniqueIndex('usuarios_email_idx').on(sql`lower(${t.email})`)],
);

export type Solicitud = typeof solicitudes.$inferSelect;
export type NuevaSolicitud = typeof solicitudes.$inferInsert;
export type Oferta = typeof ofertas.$inferSelect;
export type NuevaOferta = typeof ofertas.$inferInsert;
export type Conexion = typeof conexiones.$inferSelect;
export type Evento = typeof eventos.$inferSelect;
export type Usuario = typeof usuarios.$inferSelect;
