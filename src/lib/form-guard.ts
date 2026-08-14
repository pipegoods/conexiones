import 'server-only';

import { and, count, eq, gt } from 'drizzle-orm';
import { headers } from 'next/headers';

import { db, offers, requests } from '@/db';

/** Minimum seconds between page load and submit — blocks instant bot posts. */
export const MIN_FORM_SECONDS = 3;

/** Max public submissions per phone in a rolling window. */
export const PHONE_SUBMIT_LIMIT = 5;
export const PHONE_SUBMIT_WINDOW_MS = 24 * 60 * 60 * 1000;

export type FormGuardResult = { ok: true } | { ok: false; message: string };

function text(fd: FormData, field: string): string {
  return String(fd.get(field) ?? '').trim();
}

/** Hidden field bots tend to fill; must stay empty. */
export function checkHoneypot(fd: FormData): FormGuardResult {
  if (text(fd, 'company')) {
    return { ok: false, message: 'No pudimos procesar el formulario. Inténtalo de nuevo.' };
  }
  return { ok: true };
}

/** Reject forms submitted faster than a human could reasonably complete them. */
export function checkFormTiming(fd: FormData): FormGuardResult {
  const startedAt = Number(text(fd, 'formStartedAt'));
  if (!Number.isFinite(startedAt) || startedAt <= 0) {
    return { ok: true };
  }

  const elapsedSeconds = (Date.now() - startedAt) / 1000;
  if (elapsedSeconds < MIN_FORM_SECONDS) {
    return {
      ok: false,
      message: 'El envío fue demasiado rápido. Revisa los datos e inténtalo otra vez.',
    };
  }

  return { ok: true };
}

export function runFormGuards(fd: FormData): FormGuardResult {
  const checks = [checkHoneypot(fd), checkFormTiming(fd)];
  return checks.find((result) => !result.ok) ?? { ok: true };
}

/** Limits repeated submissions from the same WhatsApp number. */
export async function checkPhoneSubmitLimit(phone: string): Promise<FormGuardResult> {
  const since = new Date(Date.now() - PHONE_SUBMIT_WINDOW_MS);

  const [[requestCount], [offerCount]] = await Promise.all([
    db
      .select({ n: count() })
      .from(requests)
      .where(and(eq(requests.phone, phone), gt(requests.createdAt, since))),
    db
      .select({ n: count() })
      .from(offers)
      .where(and(eq(offers.phone, phone), gt(offers.updatedAt, since))),
  ]);

  const total = (requestCount?.n ?? 0) + (offerCount?.n ?? 0);
  if (total >= PHONE_SUBMIT_LIMIT) {
    return {
      ok: false,
      message:
        'Este número ya envió varios registros hoy. Si necesitas actualizar algo, escríbenos por WhatsApp.',
    };
  }

  return { ok: true };
}

/** Best-effort client IP for logging; not used as sole rate-limit key. */
export async function clientIp(): Promise<string | null> {
  const headerStore = await headers();
  const forwarded = headerStore.get('x-forwarded-for');
  if (!forwarded) return null;
  return forwarded.split(',')[0]?.trim() ?? null;
}
