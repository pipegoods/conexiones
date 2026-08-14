'use server';

import { and, eq, gt } from 'drizzle-orm';
import { redirect } from 'next/navigation';

import { db, events, offers, requests } from '@/db';
import type { Availability, ResourceType } from '@/lib/catalogs';
import { checkPhoneSubmitLimit, runFormGuards } from '@/lib/form-guard';
import { findOpenOfferByPhone, findOpenRequestByPhone } from '@/lib/queries';
import { errorsByField, offerSchema, requestSchema } from '@/lib/validations';

export type FormState = {
  errors?: Record<string, string>;
  /** General error not associated with a field, such as an unavailable database. */
  message?: string;
};

const isChecked = (fd: FormData, field: string) => fd.get(field) === 'on';
const text = (fd: FormData, field: string) => String(fd.get(field) ?? '').trim();

/** Time window in which a second submission from the same phone is a duplicate click. */
const DUPLICATE_WINDOW_MS = 10 * 60 * 1000;

function formFailureMessage(): string {
  return 'No pudimos guardar tu registro. Revisa tu conexión e inténtalo otra vez. Si sigue fallando, escríbenos por WhatsApp.';
}

/* ----------------------------------------------------- Help requests -- */

export async function submitRequest(
  _previous: FormState,
  fd: FormData,
): Promise<FormState> {
  const guard = runFormGuards(fd);
  if (!guard.ok) return { message: guard.message };

  const parsed = requestSchema.safeParse({
    name: text(fd, 'name'),
    phone: text(fd, 'phone'),
    isForSomeoneElse: isChecked(fd, 'isForSomeoneElse'),
    affectedPeople: text(fd, 'affectedPeople') || '1',
    hasMinors: isChecked(fd, 'hasMinors'),
    hasElderly: isChecked(fd, 'hasElderly'),
    types: fd.getAll('types').map(String),
    description: text(fd, 'description'),
    urgency: text(fd, 'urgency'),
    department: text(fd, 'department'),
    municipality: text(fd, 'municipality'),
    zone: text(fd, 'zone'),
    addressReference: text(fd, 'addressReference'),
    acceptsDataUse: isChecked(fd, 'acceptsDataUse'),
    acceptsWhatsapp: true,
  });

  if (!parsed.success) {
    return { errors: errorsByField(parsed.error) };
  }

  const data = parsed.data;

  const phoneLimit = await checkPhoneSubmitLimit(data.phone);
  if (!phoneLimit.ok) return { message: phoneLimit.message };

  let number: number;

  try {
    const openCase = await findOpenRequestByPhone(data.phone);

    if (openCase) {
      number = openCase.number;
    } else {
      const [recent] = await db
        .select({ number: requests.number })
        .from(requests)
        .where(
          and(
            eq(requests.phone, data.phone),
            gt(requests.createdAt, new Date(Date.now() - DUPLICATE_WINDOW_MS)),
          ),
        )
        .limit(1);

      if (recent) {
        number = recent.number;
      } else {
        number = await db.transaction(async (tx) => {
          const [row] = await tx
            .insert(requests)
            .values({
              name: data.name,
              phone: data.phone,
              isForSomeoneElse: data.isForSomeoneElse,
              affectedPeople: data.affectedPeople,
              hasMinors: data.hasMinors,
              hasElderly: data.hasElderly,
              types: data.types as ResourceType[],
              description: data.description,
              urgency: data.urgency,
              department: data.department,
              municipality: data.municipality,
              zone: data.zone || null,
              addressReference: data.addressReference || null,
              acceptsDataUse: data.acceptsDataUse,
              acceptsWhatsapp: data.acceptsWhatsapp,
            })
            .returning({ id: requests.id, number: requests.number });

          await tx.insert(events).values({
            entityType: 'request',
            entityId: row.id,
            newStatus: 'received',
            action: 'created',
            note: 'Registrada desde el formulario público.',
            actorName: 'Formulario público',
          });

          return row.number;
        });
      }
    }
  } catch (error) {
    console.error('[submitRequest]', error);
    return { message: formFailureMessage() };
  }

  redirect(`/gracias?tipo=solicitud&numero=${number}`);
}

/* ------------------------------------------------------------- Offers -- */

export async function submitOffer(
  _previous: FormState,
  fd: FormData,
): Promise<FormState> {
  const guard = runFormGuards(fd);
  if (!guard.ok) return { message: guard.message };

  const parsed = offerSchema.safeParse({
    name: text(fd, 'name'),
    phone: text(fd, 'phone'),
    email: text(fd, 'email'),
    organization: text(fd, 'organization'),
    types: fd.getAll('types').map(String),
    description: text(fd, 'description'),
    department: text(fd, 'department'),
    municipality: text(fd, 'municipality'),
    zone: text(fd, 'zone'),
    radiusKm: text(fd, 'radiusKm') || '10',
    availability: fd.getAll('availability').map(String),
    availabilityNote: text(fd, 'availabilityNote'),
    acceptsDataUse: isChecked(fd, 'acceptsDataUse'),
    acceptsWhatsapp: true,
  });

  if (!parsed.success) {
    return { errors: errorsByField(parsed.error) };
  }

  const data = parsed.data;

  const phoneLimit = await checkPhoneSubmitLimit(data.phone);
  if (!phoneLimit.ok) return { message: phoneLimit.message };

  let number: number;

  try {
    const openOffer = await findOpenOfferByPhone(data.phone);

    if (openOffer) {
      number = openOffer.number;
    } else {
      number = await db.transaction(async (tx) => {
        const values = {
          name: data.name,
          phone: data.phone,
          email: data.email || null,
          organization: data.organization || null,
          types: data.types as ResourceType[],
          description: data.description,
          department: data.department,
          municipality: data.municipality,
          zone: data.zone || null,
          radiusKm: data.radiusKm,
          availability: data.availability as Availability[],
          availabilityNote: data.availabilityNote || null,
          acceptsDataUse: data.acceptsDataUse,
          acceptsWhatsapp: data.acceptsWhatsapp,
        };

        const [row] = await tx
          .insert(offers)
          .values(values)
          .onConflictDoUpdate({
            target: offers.phone,
            set: { ...values, updatedAt: new Date() },
          })
          .returning({ id: offers.id, number: offers.number });

        await tx.insert(events).values({
          entityType: 'offer',
          entityId: row.id,
          newStatus: 'new',
          action: 'registered',
          note: 'Registrada desde el formulario público.',
          actorName: 'Formulario público',
        });

        return row.number;
      });
    }
  } catch (error) {
    console.error('[submitOffer]', error);
    return { message: formFailureMessage() };
  }

  redirect(`/gracias?tipo=oferta&numero=${number}`);
}
