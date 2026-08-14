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
  AVAILABILITIES,
  CONNECTION_STATUSES,
  OFFER_STATUSES,
  REQUEST_STATUSES,
  ROLES,
  RESOURCE_TYPES,
  URGENCIES,
} from '@/lib/catalogs';

export const resourceTypeEnum = pgEnum('resource_type', RESOURCE_TYPES);
export const urgencyEnum = pgEnum('urgency', URGENCIES);
export const availabilityEnum = pgEnum('availability', AVAILABILITIES);
export const requestStatusEnum = pgEnum('request_status', REQUEST_STATUSES);
export const offerStatusEnum = pgEnum('offer_status', OFFER_STATUSES);
export const connectionStatusEnum = pgEnum('connection_status', CONNECTION_STATUSES);
export const roleEnum = pgEnum('role', ROLES);

/**
 * A concrete help need reported by a person. Personal data from this table is
 * never exposed on the public web.
 */
export const requests = pgTable(
  'requests',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    /** Human-readable WhatsApp reference, such as "solicitud S-0042". */
    number: serial('number').notNull(),

    // Person
    name: text('name').notNull(),
    phone: text('phone').notNull(),
    isForSomeoneElse: boolean('is_for_someone_else').notNull().default(false),
    affectedPeople: integer('affected_people').notNull().default(1),
    hasMinors: boolean('has_minors').notNull().default(false),
    hasElderly: boolean('has_elderly').notNull().default(false),

    // Need
    types: resourceTypeEnum('types').array().notNull(),
    description: text('description').notNull(),
    urgency: urgencyEnum('urgency').notNull(),

    // Location
    department: text('department').notNull(),
    municipality: text('municipality').notNull(),
    zone: text('zone'),
    addressReference: text('address_reference'),
    lat: doublePrecision('lat'),
    lng: doublePrecision('lng'),

    // Traceability
    status: requestStatusEnum('status').notNull().default('received'),
    internalNotes: text('internal_notes'),
    discardReason: text('discard_reason'),

    // Consent (Habeas Data Law 1581 of 2012)
    acceptsDataUse: boolean('accepts_data_use').notNull(),
    acceptsWhatsapp: boolean('accepts_whatsapp').notNull().default(true),

    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    contactedAt: timestamp('contacted_at', { withTimezone: true }),
    verifiedAt: timestamp('verified_at', { withTimezone: true }),
    connectedAt: timestamp('connected_at', { withTimezone: true }),
    resolvedAt: timestamp('resolved_at', { withTimezone: true }),
  },
  (t) => [
    index('requests_status_idx').on(t.status),
    index('requests_municipality_idx').on(t.municipality),
    index('requests_created_idx').on(t.createdAt),
    index('requests_phone_idx').on(t.phone),
  ],
);

/**
 * A capability offered by a volunteer. It is not necessarily a donation: it
 * can be something the person can do or lend.
 */
export const offers = pgTable(
  'offers',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    number: serial('number').notNull(),

    // Person
    name: text('name').notNull(),
    phone: text('phone').notNull(),
    email: text('email'),
    organization: text('organization'),

    // Offered capability
    types: resourceTypeEnum('types').array().notNull(),
    /** "Soy carpintero y puedo reparar puertas, ventanas y techos." */
    description: text('description').notNull(),

    // Travel location and radius
    department: text('department').notNull(),
    municipality: text('municipality').notNull(),
    zone: text('zone'),
    radiusKm: integer('radius_km').notNull().default(10),
    lat: doublePrecision('lat'),
    lng: doublePrecision('lng'),

    // Availability
    availability: availabilityEnum('availability').array().notNull(),
    availabilityNote: text('availability_note'),

    status: offerStatusEnum('status').notNull().default('new'),
    internalNotes: text('internal_notes'),

    acceptsDataUse: boolean('accepts_data_use').notNull(),
    acceptsWhatsapp: boolean('accepts_whatsapp').notNull().default(true),

    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    verifiedAt: timestamp('verified_at', { withTimezone: true }),
  },
  (t) => [
    index('offers_status_idx').on(t.status),
    index('offers_municipality_idx').on(t.municipality),
    index('offers_created_idx').on(t.createdAt),
    uniqueIndex('offers_phone_idx').on(t.phone),
  ],
);

/** Links a request with an offer; the system proposes it and a person confirms it. */
export const connections = pgTable(
  'connections',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    requestId: uuid('request_id')
      .notNull()
      .references(() => requests.id, { onDelete: 'cascade' }),
    offerId: uuid('offer_id')
      .notNull()
      .references(() => offers.id, { onDelete: 'cascade' }),
    status: connectionStatusEnum('status').notNull().default('proposed'),
    /** Score from 0 to 100 calculated by the suggestion engine when proposed. */
    score: integer('score').notNull().default(0),
    /** Why the system suggested this match, in operator-readable text. */
    reasons: text('reasons'),
    note: text('note'),
    createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    confirmedAt: timestamp('confirmed_at', { withTimezone: true }),
  },
  (t) => [
    uniqueIndex('connections_pair_idx').on(t.requestId, t.offerId),
    index('connections_request_idx').on(t.requestId),
    index('connections_offer_idx').on(t.offerId),
  ],
);

/** Immutable log of who changed what and when; the basis for traceability and statistics. */
export const events = pgTable(
  'events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    entityType: text('entity_type').notNull(), // 'request' | 'offer' | 'connection'
    entityId: uuid('entity_id').notNull(),
    previousStatus: text('previous_status'),
    newStatus: text('new_status'),
    action: text('action').notNull(),
    note: text('note'),
    actorId: uuid('actor_id').references(() => users.id, { onDelete: 'set null' }),
    actorName: text('actor_name'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('events_entity_idx').on(t.entityType, t.entityId), index('events_created_idx').on(t.createdAt)],
);

/** Conexiones internal team. Citizens have no accounts; they only leave a phone number. */
export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: text('email').notNull(),
    name: text('name').notNull(),
    passwordHash: text('password_hash').notNull(),
    role: roleEnum('role').notNull().default('operator'),
    active: boolean('active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
  },
  (t) => [uniqueIndex('users_email_idx').on(sql`lower(${t.email})`)],
);

export type HelpRequest = typeof requests.$inferSelect;
export type NewHelpRequest = typeof requests.$inferInsert;
export type Offer = typeof offers.$inferSelect;
export type NewOffer = typeof offers.$inferInsert;
export type Connection = typeof connections.$inferSelect;
export type LogEvent = typeof events.$inferSelect;
export type User = typeof users.$inferSelect;
