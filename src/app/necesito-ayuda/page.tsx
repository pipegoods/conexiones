import type { Metadata } from 'next';

import { FormShell } from '@/components/form/Shell';

import { RequestForm } from './RequestForm';

export const metadata: Metadata = {
  title: 'Necesito ayuda',
  description:
    'Cuéntanos qué necesitas. Verificamos tu solicitud y buscamos a alguien que pueda ayudarte. Gratuito y confidencial.',
};

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
