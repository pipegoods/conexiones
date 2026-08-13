import { BotonWhatsapp } from '@/components/admin/BotonWhatsapp';
import { Tarjeta } from '@/components/admin/Piezas';
import { formatearTelefono } from '@/lib/validaciones';
import {
  enlaceWhatsapp,
  folioSolicitud,
  mensajeCierre,
  mensajeVerificacion,
} from '@/lib/whatsapp';
import type { Solicitud } from '@/db/schema';

export function ContactoSolicitud({ solicitud }: { solicitud: Solicitud }) {
  return (
    <Tarjeta titulo="Contacto">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-lg font-bold text-tinta">{solicitud.nombre}</p>
          <p className="mt-0.5 font-mono text-sm text-neutral-600">{formatearTelefono(solicitud.telefono)}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {solicitud.estado === 'recibida' && (
            <BotonWhatsapp
              enlace={enlaceWhatsapp(solicitud.telefono, mensajeVerificacion(solicitud))}
              entidad="solicitud"
              entidadId={solicitud.id}
              detalle="Se envió el mensaje de verificación."
            >
              Escribir para verificar
            </BotonWhatsapp>
          )}
          {solicitud.estado === 'conectada' && (
            <BotonWhatsapp
              enlace={enlaceWhatsapp(solicitud.telefono, mensajeCierre(solicitud))}
              entidad="solicitud"
              entidadId={solicitud.id}
              detalle="Se envió el mensaje de cierre."
            >
              Preguntar si ya recibió la ayuda
            </BotonWhatsapp>
          )}
          <BotonWhatsapp
            enlace={enlaceWhatsapp(
              solicitud.telefono,
              `Hola ${solicitud.nombre.split(' ')[0]}, te escribimos de *Conexiones* por tu solicitud ${folioSolicitud(solicitud.numero)}.`,
            )}
            entidad="solicitud"
            entidadId={solicitud.id}
            detalle="Se abrió un chat libre."
            variante="secundario"
          >
            Chat libre
          </BotonWhatsapp>
        </div>
      </div>

      {!solicitud.aceptaWhatsapp && (
        <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
          Esta persona no autorizó el contacto por WhatsApp.
        </p>
      )}
    </Tarjeta>
  );
}
