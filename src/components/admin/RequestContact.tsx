import { WhatsappButton } from '@/components/admin/WhatsappButton';
import { Card } from '@/components/admin/Primitives';
import { formatPhone } from '@/lib/validations';
import {
  whatsappLink,
  requestCode,
  closingMessage,
  verificationMessage,
} from '@/lib/whatsapp';
import type { HelpRequest } from '@/db/schema';

export function RequestContact({ request }: { request: HelpRequest }) {
  return (
    <Card title="Contacto">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-lg font-bold text-tinta">{request.name}</p>
          <p className="mt-0.5 font-mono text-sm text-neutral-600">{formatPhone(request.phone)}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {request.status === 'received' && (
            <WhatsappButton
              link={whatsappLink(request.phone, verificationMessage(request))}
              entityType="request"
              entityId={request.id}
              detail="Se envió el mensaje de verificación."
            >
              Escribir para verificar
            </WhatsappButton>
          )}
          {request.status === 'connected' && (
            <WhatsappButton
              link={whatsappLink(request.phone, closingMessage(request))}
              entityType="request"
              entityId={request.id}
              detail="Se envió el mensaje de cierre."
            >
              Preguntar si ya recibió la ayuda
            </WhatsappButton>
          )}
          <WhatsappButton
            link={whatsappLink(
              request.phone,
              `Hola ${request.name.split(' ')[0]}, te escribimos de *Conexiones* por tu solicitud ${requestCode(request.number)}.`,
            )}
            entityType="request"
            entityId={request.id}
            detail="Se abrió un chat libre."
            variant="secondary"
          >
            Chat libre
          </WhatsappButton>
        </div>
      </div>

      {!request.acceptsWhatsapp && (
        <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
          Esta persona no autorizó el contacto por WhatsApp.
        </p>
      )}
    </Card>
  );
}
