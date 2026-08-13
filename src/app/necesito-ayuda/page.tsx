import type { Metadata } from 'next';

import { CascaronFormulario } from '@/components/formulario/Cascaron';

import { FormularioSolicitud } from './Formulario';

export const metadata: Metadata = {
  title: 'Necesito ayuda',
  description:
    'Cuéntanos qué necesitas. Verificamos tu solicitud y buscamos a alguien que pueda ayudarte. Gratuito y confidencial.',
};

export default function NecesitoAyuda() {
  return (
    <CascaronFormulario
      titulo="Necesito ayuda"
      bajada="Cuéntanos qué necesitas. Verificamos tu solicitud y buscamos a la persona indicada para ayudarte."
      acento="rosa"
    >
      <FormularioSolicitud />
    </CascaronFormulario>
  );
}
