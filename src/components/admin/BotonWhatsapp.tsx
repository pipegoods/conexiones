'use client';

import { useTransition } from 'react';

import { registrarContactoWhatsapp } from '@/app/admin/acciones';

/**
 * Abre el chat de WhatsApp con el mensaje ya escrito y deja constancia en la
 * bitácora de que alguien lo abrió.
 *
 * El `window.open` va ANTES del await a propósito: si se abre después de una
 * llamada asíncrona, el navegador lo trata como popup y lo bloquea.
 */
export function BotonWhatsapp({
  enlace,
  entidad,
  entidadId,
  detalle,
  children,
  variante = 'principal',
}: {
  enlace: string;
  entidad: 'solicitud' | 'oferta';
  entidadId: string;
  detalle: string;
  children: React.ReactNode;
  variante?: 'principal' | 'secundario';
}) {
  const [pendiente, iniciar] = useTransition();

  const clase =
    variante === 'principal'
      ? 'bg-[#25D366] text-white hover:brightness-105'
      : 'bg-white text-[#128C7E] ring-1 ring-[#25D366]/40 hover:bg-emerald-50';

  return (
    <button
      type="button"
      disabled={pendiente}
      onClick={() => {
        window.open(enlace, '_blank', 'noopener,noreferrer');
        iniciar(async () => {
          const fd = new FormData();
          fd.set('entidad', entidad);
          fd.set('entidadId', entidadId);
          fd.set('detalle', detalle);
          await registrarContactoWhatsapp(fd);
        });
      }}
      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition disabled:opacity-60 ${clase}`}
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
        <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2Zm5.5 14.1c-.2.6-1.2 1.2-1.7 1.2-.5.1-1 .1-1.6-.1-.4-.1-.9-.3-1.5-.6-2.6-1.1-4.3-3.7-4.4-3.9-.1-.2-1-1.4-1-2.6s.6-1.8.9-2.1c.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2 0 .4-.1.5l-.3.4-.3.3c-.1.1-.2.3-.1.5.1.2.6 1 1.3 1.6.9.8 1.6 1 1.8 1.1.2.1.4.1.5-.1l.7-.8c.2-.2.3-.2.5-.1l1.8.9c.2.1.4.2.4.3.1.1.1.6-.1 1.2Z" />
      </svg>
      {pendiente ? 'Abriendo…' : children}
    </button>
  );
}
