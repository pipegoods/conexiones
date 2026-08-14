'use server';

import { eq, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { connections, db, events, offers, requests, users } from '@/db';
import { endSession, requireSession, startSession } from '@/lib/auth';
import {
  OFFER_TRANSITIONS,
  REQUEST_STATUS_META,
  REQUEST_TRANSITIONS,
  type ConnectionStatus,
  type OfferStatus,
  type RequestStatus,
} from '@/lib/catalogs';
import { verifyPassword } from '@/lib/password';
import type { Session } from '@/lib/session';
import { loginSchema } from '@/lib/validations';

export type LoginState = { error?: string };

const text = (fd: FormData, field: string) => String(fd.get(field) ?? '').trim();

/* ------------------------------------------------------------- Session -- */

// react-doctor-disable-next-line server-auth-actions
export async function logIn(_previous: LoginState, fd: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: text(fd, 'email'),
    password: String(fd.get('password') ?? ''),
  });

  if (!parsed.success) return { error: 'Revisa el correo y la contraseña.' };

  const destination = text(fd, 'next') || '/admin';
  let session: Session;

  try {
    const [user] = await db
      .select()
      .from(users)
      .where(sql`lower(${users.email}) = ${parsed.data.email}`)
      .limit(1);

    // Use the same response for an unknown account and bad password to avoid
    // revealing which email addresses are registered in the panel.
    const generic = { error: 'Correo o contraseña incorrectos.' };
    if (!user || !user.active) return generic;

    const isValid = await verifyPassword(parsed.data.password, user.passwordHash);
    if (!isValid) return generic;

    await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id));

    session = {
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  } catch (error) {
    console.error('[logIn]', error);
    return { error: 'No pudimos validar tus datos. ¿Está configurada la base de datos?' };
  }

  await startSession(session);
  redirect(destination.startsWith('/admin') ? destination : '/admin');
}

export async function logOut() {
  await endSession();
  redirect('/admin/login');
}

/* ------------------------------------------------------------ Requests -- */

export async function updateRequestStatus(fd: FormData) {
  const session = await requireSession();
  const id = text(fd, 'id');
  const newStatus = text(fd, 'status') as RequestStatus;
  const note = text(fd, 'note');

  const [current] = await db.select().from(requests).where(eq(requests.id, id)).limit(1);
  if (!current) throw new Error('Esa solicitud no existe.');

  if (!REQUEST_TRANSITIONS[current.status].includes(newStatus)) {
    throw new Error(
      `No se puede pasar de "${REQUEST_STATUS_META[current.status].label}" a "${REQUEST_STATUS_META[newStatus].label}".`,
    );
  }

  // Each level records its timestamp, which feeds the response metrics.
  const timestamps: Partial<Record<RequestStatus, Partial<typeof requests.$inferInsert>>> = {
    contacted: { contactedAt: new Date() },
    verified: { verifiedAt: new Date() },
    connected: { connectedAt: new Date() },
    resolved: { resolvedAt: new Date() },
  };

  await db.transaction(async (tx) => {
    await tx
      .update(requests)
      .set({
        status: newStatus,
        updatedAt: new Date(),
        discardReason: newStatus === 'discarded' ? note || 'Sin motivo registrado' : current.discardReason,
        ...(timestamps[newStatus] ?? {}),
      })
      .where(eq(requests.id, id));

    await tx.insert(events).values({
      entityType: 'request',
      entityId: id,
      previousStatus: current.status,
      newStatus,
      action: 'status_changed',
      note: note || null,
      actorId: session.userId,
      actorName: session.name,
    });
  });

  revalidatePath('/admin', 'layout');
}

export async function saveRequestNotes(fd: FormData) {
  const session = await requireSession();
  const id = text(fd, 'id');
  const notes = text(fd, 'internalNotes');

  await db.transaction(async (tx) => {
    await tx
      .update(requests)
      .set({ internalNotes: notes || null, updatedAt: new Date() })
      .where(eq(requests.id, id));

    await tx.insert(events).values({
      entityType: 'request',
      entityId: id,
      action: 'internal_note',
      note: notes || '(nota borrada)',
      actorId: session.userId,
      actorName: session.name,
    });
  });

  revalidatePath(`/admin/solicitudes/${id}`);
}

/* -------------------------------------------------------------- Offers -- */

export async function updateOfferStatus(fd: FormData) {
  const session = await requireSession();
  const id = text(fd, 'id');
  const newStatus = text(fd, 'status') as OfferStatus;
  const note = text(fd, 'note');

  const [current] = await db.select().from(offers).where(eq(offers.id, id)).limit(1);
  if (!current) throw new Error('Ese voluntario no existe.');

  if (!OFFER_TRANSITIONS[current.status].includes(newStatus)) {
    throw new Error(`No se puede pasar de "${current.status}" a "${newStatus}".`);
  }

  await db.transaction(async (tx) => {
    await tx
      .update(offers)
      .set({
        status: newStatus,
        updatedAt: new Date(),
        ...(newStatus === 'verified' ? { verifiedAt: new Date() } : {}),
      })
      .where(eq(offers.id, id));

    await tx.insert(events).values({
      entityType: 'offer',
      entityId: id,
      previousStatus: current.status,
      newStatus,
      action: 'status_changed',
      note: note || null,
      actorId: session.userId,
      actorName: session.name,
    });
  });

  revalidatePath('/admin', 'layout');
}

/* --------------------------------------------------------- Connections -- */

/** An operator accepts a system suggestion; it remains proposed until the volunteer agrees. */
export async function proposeConnection(fd: FormData) {
  const session = await requireSession();
  const requestId = text(fd, 'requestId');
  const offerId = text(fd, 'offerId');
  const score = Number(text(fd, 'score')) || 0;
  const reasons = text(fd, 'reasons');

  const [request] = await db.select().from(requests).where(eq(requests.id, requestId)).limit(1);
  if (!request) throw new Error('Esa solicitud no existe.');

  // PRD hard rule: no request can connect before it is verified.
  if (!['verified', 'connected'].includes(request.status)) {
    throw new Error('Solo se pueden conectar solicitudes ya verificadas (nivel 2 en adelante).');
  }

  await db.transaction(async (tx) => {
    const [connection] = await tx
      .insert(connections)
      .values({
        requestId,
        offerId,
        score,
        reasons: reasons || null,
        status: 'proposed',
        createdBy: session.userId,
      })
      .onConflictDoNothing({ target: [connections.requestId, connections.offerId] })
      .returning({ id: connections.id });

    if (!connection) return; // Already existed; avoid duplicates and log noise.

    await tx.insert(events).values({
      entityType: 'connection',
      entityId: connection.id,
      newStatus: 'proposed',
      action: 'proposed',
      note: `Propuesta para la solicitud, puntaje ${score}.`,
      actorId: session.userId,
      actorName: session.name,
    });

    await tx.insert(events).values({
      entityType: 'request',
      entityId: requestId,
      action: 'connection_proposed',
      note: `Se propuso un voluntario (puntaje ${score}).`,
      actorId: session.userId,
      actorName: session.name,
    });
  });

  revalidatePath(`/admin/solicitudes/${requestId}`);
}

/**
 * Advances a connection and the linked request together, keeping the five PRD
 * levels synchronized: accepted = level 3 and confirmed = level 4.
 */
export async function updateConnection(fd: FormData) {
  const session = await requireSession();
  const id = text(fd, 'id');
  const newStatus = text(fd, 'status') as ConnectionStatus;
  const note = text(fd, 'note');

  const [connection] = await db.select().from(connections).where(eq(connections.id, id)).limit(1);
  if (!connection) throw new Error('Esa conexión no existe.');

  await db.transaction(async (tx) => {
    await tx
      .update(connections)
      .set({
        status: newStatus,
        note: note || connection.note,
        ...(newStatus === 'confirmed' ? { confirmedAt: new Date() } : {}),
      })
      .where(eq(connections.id, id));

    await tx.insert(events).values({
      entityType: 'connection',
      entityId: id,
      previousStatus: connection.status,
      newStatus,
      action: 'status_changed',
      note: note || null,
      actorId: session.userId,
      actorName: session.name,
    });

    const [request] = await tx
      .select()
      .from(requests)
      .where(eq(requests.id, connection.requestId))
      .limit(1);
    if (!request) return;

    if (newStatus === 'accepted' && request.status === 'verified') {
      await tx
        .update(requests)
        .set({ status: 'connected', connectedAt: new Date(), updatedAt: new Date() })
        .where(eq(requests.id, request.id));

      await tx.insert(events).values({
        entityType: 'request',
        entityId: request.id,
        previousStatus: request.status,
        newStatus: 'connected',
        action: 'status_changed',
        note: 'El voluntario aceptó la conexión.',
        actorId: session.userId,
        actorName: session.name,
      });
    }

    if (newStatus === 'confirmed' && request.status !== 'resolved') {
      await tx
        .update(requests)
        .set({ status: 'resolved', resolvedAt: new Date(), updatedAt: new Date() })
        .where(eq(requests.id, request.id));

      await tx.insert(events).values({
        entityType: 'request',
        entityId: request.id,
        previousStatus: request.status,
        newStatus: 'resolved',
        action: 'status_changed',
        note: 'La persona confirmó que recibió la ayuda.',
        actorId: session.userId,
        actorName: session.name,
      });
    }
  });

  revalidatePath('/admin', 'layout');
}

/** Logs that a WhatsApp chat was opened so the sender remains traceable. */
export async function logWhatsappContact(fd: FormData) {
  const session = await requireSession();
  const entityType = text(fd, 'entityType');
  const entityId = text(fd, 'entityId');
  const detail = text(fd, 'detail');

  await db.insert(events).values({
    entityType,
    entityId,
    action: 'whatsapp_opened',
    note: detail || 'Se abrió el chat de WhatsApp desde el panel.',
    actorId: session.userId,
    actorName: session.name,
  });

  revalidatePath(`/admin/${entityType === 'offer' ? 'ofertas' : 'solicitudes'}/${entityId}`);
}
