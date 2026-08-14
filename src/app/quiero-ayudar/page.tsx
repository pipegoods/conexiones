import { FormShell } from '@/components/form/Shell';
import { publicPageMetadata } from '@/lib/site';

import { OfferForm } from './OfferForm';

export const metadata = publicPageMetadata(
  'Quiero ayudar',
  'Pon a disposición lo que sabes hacer, tienes o puedes ofrecer: tiempo, profesión, vehículo, herramientas o espacio. No necesitas dinero para hacer la diferencia.',
  '/quiero-ayudar',
);

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
