import { FormShell } from '@/components/form/Shell';
import { publicPageMetadata } from '@/lib/site';

import { RequestForm } from './RequestForm';

export const metadata = publicPageMetadata(
  'Necesito ayuda',
  'Cuéntanos qué necesitas. Verificamos tu solicitud y buscamos a alguien que pueda ayudarte. Gratuito y confidencial.',
  '/necesito-ayuda',
);

export default function RequestHelpPage() {
  return (
    <FormShell
      title="Necesito ayuda"
      subtitle="Cuéntanos qué necesitas. Verificamos tu solicitud y buscamos a la persona indicada para ayudarte."
      accent="pink"
    >
      <RequestForm />
    </FormShell>
  );
}
