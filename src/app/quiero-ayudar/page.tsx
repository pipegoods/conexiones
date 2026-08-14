import type { Metadata } from 'next';

import { FormShell } from '@/components/form/Shell';

import { OfferForm } from './OfferForm';

export const metadata: Metadata = {
  title: 'Quiero ayudar',
  description:
    'Pon a disposición lo que sabes hacer, tienes o puedes ofrecer: tiempo, profesión, vehículo, herramientas o espacio. No necesitas dinero para hacer la diferencia.',
};

export default function OfferHelpPage() {
  return (
    <FormShell
      title="Quiero ayudar"
      subtitle="Pon a disposición lo que sabes hacer, tienes o puedes ofrecer. Te escribimos solo cuando haya un caso verificado que encaje contigo."
      accent="green"
    >
      <OfferForm />
    </FormShell>
  );
}
