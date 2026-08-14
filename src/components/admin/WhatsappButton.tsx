'use client';

import { useTransition } from 'react';

import { logWhatsappContact } from '@/app/admin/actions';

/**
 * Opens a WhatsApp chat with the message prefilled and records that someone
 * opened it in the activity log.
 *
 * `window.open` intentionally comes before await: after an asynchronous call,
 * the browser treats it as a popup and blocks it.
 */
export function WhatsappButton({
  link,
  entityType,
  entityId,
  detail,
  children,
  variant = 'primary',
}: {
  link: string;
  entityType: 'request' | 'offer';
  entityId: string;
  detail: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}) {
  const [pending, start] = useTransition();

  const className =
    variant === 'primary'
      ? 'bg-[#25D366] text-white hover:brightness-105'
      : 'bg-white text-[#128C7E] ring-1 ring-[#25D366]/40 hover:bg-emerald-50';

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        window.open(link, '_blank', 'noopener,noreferrer');
        start(async () => {
          const fd = new FormData();
          fd.set('entityType', entityType);
          fd.set('entityId', entityId);
          fd.set('detail', detail);
          await logWhatsappContact(fd);
        });
      }}
      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition disabled:opacity-60 ${className}`}
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
        <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2Zm5.5 14.1c-.2.6-1.2 1.2-1.7 1.2-.5.1-1 .1-1.6-.1-.4-.1-.9-.3-1.5-.6-2.6-1.1-4.3-3.7-4.4-3.9-.1-.2-1-1.4-1-2.6s.6-1.8.9-2.1c.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2 0 .4-.1.5l-.3.4-.3.3c-.1.1-.2.3-.1.5.1.2.6 1 1.3 1.6.9.8 1.6 1 1.8 1.1.2.1.4.1.5-.1l.7-.8c.2-.2.3-.2.5-.1l1.8.9c.2.1.4.2.4.3.1.1.1.6-.1 1.2Z" />
      </svg>
      {pending ? 'Abriendo…' : children}
    </button>
  );
}
