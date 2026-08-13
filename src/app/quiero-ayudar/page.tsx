import type { Metadata } from 'next';

import { CascaronFormulario } from '@/components/formulario/Cascaron';

import { FormularioOferta } from './Formulario';

export const metadata: Metadata = {
  title: 'Quiero ayudar',
  description:
    'Pon a disposición lo que sabes hacer, tienes o puedes ofrecer: tiempo, profesión, vehículo, herramientas o espacio. No necesitas dinero para hacer la diferencia.',
};

export default function QuieroAyudar() {
  return (
    <CascaronFormulario
      titulo="Quiero ayudar"
      bajada="Pon a disposición lo que sabes hacer, tienes o puedes ofrecer. Te escribimos solo cuando haya un caso verificado que encaje contigo."
      acento="verde"
    >
      <FormularioOferta />
    </CascaronFormulario>
  );
}
